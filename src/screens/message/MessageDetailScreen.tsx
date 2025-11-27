import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';
import { httpsCallable } from '@react-native-firebase/functions';
import {
  Call,
  EmojiNormal,
  Image,
  Microphone2,
  SearchNormal1,
  Send2,
  Setting2,
  Trash,
  Video,
} from 'iconsax-react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { Video as VideoCompressor } from 'react-native-compressor';
import { createThumbnail } from 'react-native-create-thumbnail';
import { EmojiPopup } from 'react-native-emoji-popup';
import RNFS from 'react-native-fs';
import 'react-native-get-random-values';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import ImageViewing from 'react-native-image-viewing';
import Sound, { RecordBackType } from 'react-native-nitro-sound';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';
import { db, functions } from '../../../firebase.config';
import {
  Container,
  GlobalPopover,
  InputComponent,
  MessageContentComponent,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import {
  createNewBatch,
  shouldCreateNewBatch,
} from '../../constants/checkNewBatch';
import { colors } from '../../constants/colors';
import {
  q_chatRoomId,
  q_messagesASC,
  q_readStatus,
} from '../../constants/firebase/query';
import { fontFamillies } from '../../constants/fontFamilies';
import {
  isEndOfTimeBlock,
  shouldShowBlockTime,
  shouldShowSmallTime,
} from '../../constants/handleTimeData';
import { makeContactId } from '../../constants/makeContactId';
import { sizes } from '../../constants/sizes';
import { useChatRoomSync } from '../../hooks/useChatRoomSync';
import { MessageModel, ReadStatusModel } from '../../models';
import { useChatStore, useUsersStore, useUserStore } from '../../zustand';

const MessageDetailScreen = ({ route }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const { users } = useUsersStore();
  const { type, friend, chatRoom } = route.params;
  const [members, setMembers] = useState(route.params.members);
  const [value, setValue] = useState('');
  const [lastBatchId, setLastBatchId] = useState<string | null>(null);
  const { messagesByRoom, pendingMessages } = useChatStore();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<any>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [isRecord, setIsRecord] = useState(false);
  const [duration, setDuration] = useState(0);
  const messages = [
    ...(messagesByRoom[chatRoom.id] || []),
    ...(pendingMessages[chatRoom.id] || []),
  ];

  const flatListRef = useRef<FlatList>(null);
  const {
    addPendingMessage,
    updatePendingStatus,
    removePendingMessage,
    setMessagesForRoom,
  } = useChatStore.getState();
  const [readStatus, setReadStatus] = useState<Record<string, ReadStatusModel>>(
    {},
  );
  const [allBatchIds, setAllBatchIds] = useState<string[]>([]); // toàn bộ batch theo DESC (newest -> oldest)
  const [loadedCount, setLoadedCount] = useState(3); // đã load bao nhiêu batch (3 batch đầu)
  const [isAtTop, setIsAtTop] = useState(false);
  const [isPrepending, setIsPrepending] = useState(false);
  const [popover, setPopover] = useState({
    visible: false,
    rect: null,
    message: null,
  });
  const [userMessageState, setUserMessageState] = useState<any>();

  // Kích hoạt hook realtime
  useChatRoomSync(chatRoom?.id, user?.id as string, isAtBottom);

  const onLongPressMessage = ({ msg, rect }: any) => {
    setPopover({ visible: true, rect, message: msg });
  };

  const closePopover = () => {
    setPopover(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    setMembers(route.params.members);
  }, []);

  useEffect(() => {
    if (!chatRoom) return;

    let cancelled = false; // <– flag để tránh setState sau khi unmount hoặc đổi phòng

    const getCurrentBatch = async () => {
      try {
        const snapshot = await getDoc(q_chatRoomId(chatRoom.id));

        if (!cancelled && snapshot.exists()) {
          setLastBatchId(snapshot.data()?.lastBatchId || null);
        }
      } catch (error) {
        console.error('Lỗi khi lấy batch hiện tại:', error);
      }
    };

    getCurrentBatch();

    return () => {
      cancelled = true; // <– khi chatRoom đổi hoặc component unmount
    };
  }, [chatRoom]);
  // Scroll khi có tin mới nhưng chỉ khi user đang ở đáy
  useEffect(() => {
    if (messages.length === 0 || !user) return;

    // Nếu là prepend → bỏ qua
    if (isPrepending) return;

    const lastMsg = messages[messages.length - 1];
    const isFromMe = lastMsg.senderId === user.id;

    // Nếu tin mới là của mình → scroll & không hiện nút
    if (isFromMe) {
      flatListRef.current?.scrollToEnd({ animated: true });
      setHasNewMessage(false);
      return;
    }

    // Tin NHƯỢNG TỪ NGƯỜI KHÁC
    if (!isAtBottom) {
      setHasNewMessage(true);
    } else {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);
  //
  const enhancedMessages = useMemo(() => {
    return messages.map((msg, index) => {
      const prev = messages[index - 1];
      const next = messages[index + 1];

      return {
        ...msg,
        showBlockTime: shouldShowBlockTime(prev, msg),
        showSmallTime: shouldShowSmallTime(
          prev,
          msg,
          next,
          index,
          messages.length,
        ),
        endOfTimeBlock: isEndOfTimeBlock(next, msg),
        showAvatar: !next || next.senderId !== msg.senderId,
        showDisplayName: !prev || prev.senderId !== msg.senderId,
        onImagePressForItem: () => openViewer(msg.id),
        chatRoomId: chatRoom.id,
        hiddenMsg: userMessageState[msg.id] && userMessageState[msg.id].deleted
      };
    });
  }, [messages]);

  const lastSentByUser = useMemo(() => {
    if (!messages || !user?.id) return undefined;
    return [...messages]
      .reverse()
      .find(
        m =>
          m.senderId === user.id &&
          (m.status === 'sent' || m.status === 'pending'),
      );
  }, [messages, user?.id]);

  const messageIndexMap = useMemo(() => {
    const map: Record<string, number> = {};
    messages.forEach((m, i) => {
      map[m.id] = i;
    });
    return map;
  }, [messages]);

  const readersByMessageId = useMemo(() => {
    const result: Record<string, string[]> = {};

    Object.keys(readStatus).forEach(userId => {
      if (userId === user?.id) return; // 🔑 bỏ người gửi / chính bạn

      const lastId = readStatus[userId]?.lastReadMessageId;
      const lastIdx = messageIndexMap[lastId];
      if (lastIdx == null) return;

      // user đã đọc đến message index = lastIdx
      const msg = messages[lastIdx];
      if (!msg) return;

      if (!result[msg.id]) result[msg.id] = [];
      result[msg.id].push(userId);
    });

    return result;
  }, [readStatus, messageIndexMap]);

  // Lắng nghe thay đổi lastBatchId trong chatRoom
  useEffect(() => {
    if (!chatRoom) return;

    const unsubRoom = onSnapshot(q_chatRoomId(chatRoom.id), snap => {
      const data = snap.data();
      if (!data) return;

      if (data.lastBatchId && data.lastBatchId !== lastBatchId) {
        console.log('🔄 Chuyển batch:', data.lastBatchId);
        setLastBatchId(prev =>
          prev !== data.lastBatchId ? data.lastBatchId : prev,
        ); // tự động chuyển sang batch mới
      }
    });
    const unsubReadStatus = onSnapshot(q_readStatus(chatRoom.id), snapshot => {
      const data: Record<string, ReadStatusModel> = {};
      snapshot.forEach((doc: any) => (data[doc.id] = doc.data()));
      setReadStatus(data);
    });

    // cleanup cả hai listener
    return () => {
      unsubRoom();
      unsubReadStatus();
    };
  }, [chatRoom]);

  // load 3 batch đầu tiên vào ---> dạng prepend (false)
  useEffect(() => {
    if (!chatRoom) return;

    let isMounted = true; // flag để cleanup

    const load3Batch = async () => {
      try {
        // 1. Lấy batch ASC rồi reverse + slice
        const q_batches = query(
          collection(db, `chatRooms/${chatRoom.id}/batches`),
          orderBy(documentId(), 'asc'),
        );

        const snap = await getDocs(q_batches);

        if (!isMounted) return; // ❗ nếu unmount thì dừng luôn

        const batchIds = snap.docs.map((d: any) => d.data().id).reverse();
        setAllBatchIds(batchIds);
        setLoadedCount(3);
        const top3 = batchIds.slice(0, 3);

        if (top3.length === 0) {
          if (isMounted) setMessagesForRoom(chatRoom.id, [], true);
          return;
        }

        // 2. Load message của top3 batch (song song)
        let messages = await loadMessagesFromBatchIds(chatRoom.id, top3);
        if (!isMounted) return; // ❗ kiểm tra lại trước khi setState
        messages = await preloadSignedUrls(messages);

        setMessagesForRoom(chatRoom.id, messages, true);
      } catch (err) {
        console.log('load3Batch error', err);
      }
    };

    load3Batch();

    return () => {
      // Khi unmount hoặc chatRoom đổi → hủy task
      isMounted = false;
    };
  }, [chatRoom]);

  useEffect(() => {
    if (!chatRoom || !user) return;

    const userMessageStateRef = collection(
      db,
      `chatRooms/${chatRoom.id}/userMessageState/${user.id}/messages`,
    );

    // listen myReaction
    const unsub = onSnapshot(userMessageStateRef, docSnap => {
      let state: any = {};
      docSnap.forEach((doc: any) => {
        state[doc.id] = doc.data(); // messageId → { deleted: true }
      });
      setUserMessageState(state);
    });

    // cleanup
    return () => {
      unsub();
    };
  }, [chatRoom, user]);


  useEffect(() => {
    if (!chatRoom || !lastBatchId) return;

    // 🔥 Đăng ký lắng nghe realtime
    const unsubscribe = onSnapshot(
      q_messagesASC({ chatRoomId: chatRoom.id, batchId: lastBatchId }),
      async snapshot => {
        let msgs = snapshot.docs.map((doc: any) => {
          const data = doc.data();

          // convert createAt nếu có
          const createAt = data?.createAt
            ? data.createAt // nếu là Timestamp
            : new Date(); // fallback khi chưa có

          return {
            id: doc.id,
            ...data,
            createAt,
          };
        });
        msgs = await preloadSignedUrls(msgs);
        // ⚡ nối thêm tin nhắn mới, tránh mất tin batch cũ ---> dạng prepend (false)
        setMessagesForRoom(chatRoom.id, msgs, false);
      },
    );

    // 🧹 Hủy đăng ký khi batchId đổi hoặc component unmount
    return () => {
      unsubscribe();
    };
  }, [chatRoom, lastBatchId]); // <– dependency quan trọng

  useEffect(() => {
    if (isAtTop) {
      loadMoreBatches();
    }
  }, [isAtTop]);

  // --------------

  // --------------

  const loadMoreBatches = async () => {
    if (loadedCount >= allBatchIds.length) return; // hết batch

    const next = allBatchIds.slice(loadedCount, loadedCount + 2);
    console.log(next);
    setIsPrepending(true);
    let moreMessages = await loadMessagesFromBatchIds(chatRoom.id, next);
    moreMessages = await preloadSignedUrls(moreMessages);

    setMessagesForRoom(chatRoom.id, moreMessages, true);

    // ĐỢI render xong rồi mới tắt prepend
    setTimeout(() => {
      setIsPrepending(false);
    }, 0);
    setLoadedCount(prev => prev + next.length);
  };
  const loadMessagesFromBatchIds = async (
    roomId: string,
    batchIds: string[],
  ) => {
    const allMessages: any = [];

    await Promise.all(
      batchIds.map(async batchId => {
        const q = query(
          collection(db, `chatRooms/${roomId}/batches/${batchId}/messages`),
          orderBy('createAt', 'asc'),
        );

        const snap = await getDocs(q);

        const msgs = snap.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
          createAt: doc.data().createAt ?? new Date(),
        }));

        allMessages.push(...msgs);
      }),
    );

    // sort toàn bộ theo thời gian
    return allMessages.sort((a: any, b: any) => a.createAt - b.createAt);
  };
  const handleSendMessage = async ({
    typeMsg = 'text',
    key,
    messId,
    localURI = '',
    asset,
    thumbnaiKey,
  }: {
    typeMsg?: string;
    key?: string;
    messId?: string;
    localURI?: string;
    asset?: Asset;
    thumbnaiKey?: string;
  }) => {
    if (user) {
      const messageId = messId ?? uuidv4();
      // ------------------------------------
      let chatRoomId = '';

      if (type === 'private' && friend) {
        chatRoomId = makeContactId(user.id as string, friend.id);
      } else {
        chatRoomId = chatRoom.id;
      }

      const text = typeMsg === 'text' ? value : '';
      const mediaURL =
        typeMsg === 'image' || typeMsg == 'video' || typeMsg == 'audio'
          ? (key as string)
          : '';
      const thumbKey = typeMsg === 'video' ? (thumbnaiKey as string) : '';

      // Thêm tin nhắn ở local
      if (!['image', 'video', 'audio'].includes(typeMsg)) {
        addPendingMessage(chatRoomId, {
          id: messageId,
          senderId: user.id,
          type: 'text',
          text,
          mediaURL: '',
          localURL: '',
          batchId: '',
          reactionCounts: {},
          deleted: false,
          deleteAt: null,
          deleteBy: null,

          thumbKey: '',
          duration: 0,
          height: 0,
          width: 0,

          createAt: serverTimestamp(),
          status: 'pending',
        });
      }
      // Xử lý phía firebase
      try {
        const docSnap = await getDoc(doc(db, 'chatRooms', chatRoomId));

        if (docSnap.exists()) {
          const docSnapBatch = await getDoc(
            doc(
              db,
              `chatRooms/${chatRoomId}/batches`,
              docSnap.data()?.lastBatchId,
            ),
          );
          let batchInfo = {
            id: docSnapBatch.id,
            messageCount: docSnapBatch.data()?.messageCount,
          };

          //check xem batch nay qua ngay moi hoac day chua
          if (shouldCreateNewBatch(batchInfo)) {
            // Tạo batchInfo (chứa batchId) tiếp theo
            batchInfo = createNewBatch(batchInfo);
            // Tạo batch mới
            await setDoc(
              doc(db, `chatRooms/${chatRoomId}/batches`, batchInfo.id),
              {
                id: batchInfo.id,
                messageCount: 0,
                preBatchId: docSnapBatch.id || null,
                nextBatchId: null,
              },
              { merge: true },
            );
            // update lại nextBatchId cho batch cũ
            await updateDoc(
              doc(db, `chatRooms/${chatRoomId}/batches`, docSnapBatch.id),
              {
                nextBatchId: batchInfo.id,
              },
            );
          }

          // Thêm tin nhắn vào subCollection messages
          await setDoc(
            doc(
              db,
              `chatRooms/${chatRoomId}/batches/${batchInfo.id}/messages`,
              messageId,
            ),
            {
              senderId: user.id,
              type: typeMsg,
              text,
              localURL: '',
              mediaURL,
              batchId: batchInfo.id,
              reactionCounts: {},
              deleted: false,
              deleteAt: null,
              deleteBy: null,

              thumbKey,
              duration: asset ? (asset.duration as number) : 0,
              height: asset ? (asset.height as number) : 0,
              width: asset ? (asset.width as number) : 0,

              status: 'sent',
              createAt: serverTimestamp(),
            },
            { merge: true },
          );

          // Cập nhật trạng thái
          updatePendingStatus(chatRoomId, messageId, 'sent');
          // // Xoá khỏi persist vì Firestore sẽ gửi về qua onSnapshot
          removePendingMessage(chatRoomId, messageId);
        } else {
          const batchInfo = createNewBatch(null);

          await setDoc(
            doc(db, 'chatRooms', chatRoomId),
            {
              type: 'private',
              name: '',
              avatarURL: '',
              description: '',
              createdBy: user.id,
              createAt: serverTimestamp(),
              lastMessageId: messageId,
              lastMessageText: value,
              lastMessageAt: serverTimestamp(),
              lastSenderId: user.id,

              lastBatchId: batchInfo.id,
              memberCount: 2,
              memberIds: [user.id, friend.id],
            },
            { merge: true },
          );

          // Tạo members subcollection cho batch/id
          const members = [
            {
              id: user.id,
              role: 'admin',
              joinedAt: serverTimestamp(),
              nickName: user.displayName,
              photoURL: user.photoURL,
            },
            {
              id: friend?.id,
              role: 'member',
              joinedAt: serverTimestamp(),
              nickName: friend?.displayName,
              photoURL: friend?.photoURL,
            },
          ];

          const promiseMember = members.map(_ => {
            setDoc(doc(db, `chatRooms/${chatRoomId}/members`, _.id), _, {
              merge: true,
            });
            // Thêm readStatus subcollection cho chatRoom
            setDoc(
              doc(db, `chatRooms/${chatRoomId}/readStatus`, _.id),
              {
                lastReadMessageId: _.id === user.id ? messageId : null,
                lastReadAt: _.id === user.id ? serverTimestamp() : null,
              },
              {
                merge: true,
              },
            );
            // // Thêm unreadCounts subcollection cho chatRoom bằng CF rồi
          });
          await Promise.all(promiseMember);

          // Tạo batch đầu tiên
          await setDoc(
            doc(db, `chatRooms/${chatRoomId}/batches`, batchInfo.id),
            {
              id: batchInfo.id,
              messageCount: 0,
              preBatchId: null,
              nextBatchId: null,
            },
            { merge: true },
          );

          // Tạo messages subcollection cho batch/id
          await setDoc(
            doc(
              db,
              `chatRooms/${chatRoomId}/batches/${batchInfo.id}/messages`,
              messageId,
            ),
            {
              senderId: user?.id,
              type: typeMsg,
              text,
              localURL: '',
              mediaURL,
              batchId: batchInfo.id,
              reactionCounts: {},
              deleted: false,
              deleteAt: null,
              deleteBy: null,

              thumbKey,
              duration: asset ? (asset.duration as number) : 0,
              height: asset ? (asset.height as number) : 0,
              width: asset ? (asset.width as number) : 0,

              status: 'sent',
              createAt: serverTimestamp(),
            },
            { merge: true },
          );

          // Cập nhật trạng thái
          updatePendingStatus(chatRoomId, messageId, 'sent');
          // // Xoá khỏi persist vì Firestore sẽ gửi về qua onSnapshot
          removePendingMessage(chatRoomId, messageId);
        }
      } catch (error) {
        updatePendingStatus(chatRoomId, messageId, 'failed');
        console.log(error);
      }
      setValue('');
      // ⬇️ Sau khi gửi xong, cuộn xuống dưới cùng
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;

    const distanceFromBottom =
      contentSize.height - (layoutMeasurement.height + contentOffset.y);

    const atBottom = distanceFromBottom < 120;

    setIsAtBottom(atBottom); // ngưỡng 20px
    if (atBottom) {
      setHasNewMessage(false); // đang ở đáy thì ẩn nút
    }

    const offsetY = contentOffset.y;
    // offsetY <= 0 nghĩa là chạm top
    if (offsetY <= 0) {
      setIsAtTop(true);
    } else if (isAtTop) {
      setIsAtTop(false);
    }
  };
  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
    setHasNewMessage(false);
    setIsAtBottom(true);
  };
  const delay = (ms: any) => new Promise((res: any) => setTimeout(res, ms));
  const handleInitialScroll = async () => {
    await delay(500); // đợi layout ổn định

    flatListRef.current?.scrollToEnd({ animated: false });
    setIsAtBottom(true);

    await delay(3000); // đủ thời gian để scroll chạy xong thật sự
    setInitialLoad(false);
  };
  const pickImage = async () => {
    const res = await launchImageLibrary({
      mediaType: 'mixed',
      selectionLimit: 0, // chọn nhiều ảnh
    });

    if (res.didCancel || !res.assets) return null;

    return res.assets;
  };
  const getUploadUrl = async (
    fileType: string,
    type: string,
    isThumb: boolean,
    roomId: string,
    messageId: string,
  ) => {
    const callable = httpsCallable(functions, 'getUploadUrl');

    const { uploadUrl, fileKey }: any = (
      await callable({ fileType, type, isThumb, roomId, messageId })
    ).data;

    return { uploadUrl, fileKey };
  };
  const uploadBinaryToR2S3 = async (
    uploadUrl: string,
    fileUri: string,
    mime: string,
  ) => {
    try {
      const filePath = fileUri.replace('file://', '');

      const res = await RNBlobUtil.fetch(
        'PUT',
        uploadUrl,
        { 'Content-Type': mime },
        RNBlobUtil.wrap(filePath),
      );

      return res.info().status === 200;
    } catch (err) {
      console.log('Upload to R2 error:', err);
      return false;
    }
  };
  const mimeToExt = (mime: string) => {
    const ext = mime.split('/')[1];
    if (ext === 'quicktime') return 'mov';
    if (ext === 'mpeg') return 'mp3';
    if (ext === 'x-m4a') return 'm4a';
    return ext;
  };
  const createVideoThumbnail = async (asset: Asset) => {
    try {
      let fileName = asset.fileName || `video_${Date.now()}.mp4`;
      let uri = asset.uri as string;
      let srcPath = uri.replace('file://', '');
      let destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      // --- iOS: Không dùng file tmp ---
      if (Platform.OS === 'ios' && srcPath.includes('/tmp/')) {
        const exist = await RNFS.exists(destPath);
        if (exist) await RNFS.unlink(destPath);

        await RNFS.copyFile(srcPath, destPath);

        srcPath = destPath; // <-- QUAN TRỌNG: dùng absolute path
      }

      // --- Kiểm tra path ---
      const exists = await RNFS.exists(srcPath);
      if (!exists) throw new Error('File not found: ' + srcPath);

      // --- iOS: createThumbnail cần absolutePath, KHÔNG được có file:// ---
      const thumbnail = await createThumbnail({
        url: Platform.OS === 'ios' ? srcPath : uri,
        timeStamp: 1000,
      });

      return { ok: true, ...thumbnail };
    } catch (error) {
      console.log('createVideoThumbnail error:', error);
      return { ok: false, error };
    }
  };

  // Image and Video
  const handleOpenImage = async () => {
    const picked: any = await pickImage();
    if (!picked) return;

    try {
      await Promise.all(
        picked.map(async (asset: any) => {
          const messId = uuidv4();
          const ext = mimeToExt(asset.type);

          let typeMsg = 'image';
          if (asset.type.startsWith('video/')) typeMsg = 'video';
          if (asset.type.startsWith('audio/')) typeMsg = 'audio';

          let chatRoomId = '';

          if (type === 'private' && friend) {
            chatRoomId = makeContactId(user?.id as string, friend.id);
          } else {
            chatRoomId = chatRoom.id;
          }

          addPendingMessage(chatRoomId, {
            id: messId,
            senderId: user?.id as string,
            type: typeMsg,
            text: '',
            mediaURL: '',
            localURL: asset.uri,
            batchId: '',
            reactionCounts: {},
            deleted: false,
            deleteAt: null,
            deleteBy: null,

            thumbKey: '',
            duration:
              asset && typeMsg === 'video' ? (asset.duration as number) : 0,
            height: asset && typeMsg === 'video' ? (asset.height as number) : 0,
            width: asset && typeMsg === 'video' ? (asset.width as number) : 0,

            createAt: serverTimestamp(),
            status: 'pending',
          });

          flatListRef.current?.scrollToEnd({ animated: true });

          let isCompressUri: string = asset.uri;
          let thumbKey: string = '';

          if (typeMsg === 'video') {
            isCompressUri = await compress(asset.uri);
            const thumb: any = await createVideoThumbnail(asset);

            const extThumb = mimeToExt(thumb.mime);
            const { fileKey: thumbFileKey, uploadUrl: thumbUploadUrl } =
              await getUploadUrl(
                extThumb,
                thumb.mime,
                true,
                chatRoom.id,
                messId,
              );
            await uploadBinaryToR2S3(thumbUploadUrl, thumb.path, thumb.mime);
            thumbKey = thumbFileKey;
          }

          const { fileKey, uploadUrl } = await getUploadUrl(
            ext,
            asset.type,
            false,
            chatRoom.id,
            messId,
          );
          await uploadBinaryToR2S3(uploadUrl, isCompressUri, asset.type);

          handleSendMessage({
            typeMsg,
            key: fileKey,
            messId,
            localURI: isCompressUri,
            asset: typeMsg === 'image' ? undefined : asset,
            thumbnaiKey: thumbKey,
          });
        }),
      );
    } catch (err) {
      console.log('Upload error:', err);
    }
  };
  const openViewer = async (messageId: string) => {
    const imageMessages = messages.filter(m => m.type === 'image');
    // const keys = imageMessages.map(_ => _.mediaURL);
    // const promiseItems = imageMessages.map(
    //   async _ => await getSignedUrl(_.mediaURL),
    // );
    // const uris = await Promise.all(promiseItems);
    const keys = imageMessages.map(_ => _.id);
    const uris = imageMessages.map(_ => _.mediaURL);
    const allImages = uris.map(m => ({ uri: m }));
    const index = keys.indexOf(messageId);

    setImageIndex(index);
    setViewerImages(allImages);
    setViewerVisible(true);
  };
  const getSignedUrl = async (fileKey: string) => {
    const getViewUrl = httpsCallable(functions, 'getViewUrl');
    const { data }: any = await getViewUrl({ fileKey });
    return data.viewUrl;
  };
  const compress = async (uri: string) => {
    const compressedUri = await VideoCompressor.compress(uri, {
      compressionMethod: 'auto',
    });
    return compressedUri;
  };
  const handleOpenRecord = async () => {
    setIsRecord(true);
    setValue('Đã ghi');
    await onStartRecord();
  };

  // Recording
  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Audio Recording Permission',
            message:
              'This app needs access to your microphone to record audio.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Recording permission granted');
          return true;
        } else {
          console.log('Recording permission denied');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };
  const onStartRecord = async () => {
    const ok = await requestAudioPermission();
    if (!ok) return;
    // Set up recording progress listener
    Sound.addRecordBackListener((e: RecordBackType) => {
      console.log('Recording progress:', e.currentPosition, e.currentMetering);
      const timeRecord = `${Math.floor(e.currentPosition / 1000)},${
        e.currentPosition - Math.floor(e.currentPosition / 1000) * 1000
      } giây`;
      setValue(`Đã ghi: ${timeRecord}`);
      setDuration(Math.floor(e.currentPosition / 1000)); // giây
      // setRecordSecs(e.currentPosition);
      // setRecordTime(Sound.mmssss(Math.floor(e.currentPosition)));
    });

    const result = await Sound.startRecorder();
    // console.log('Recording started:', result);
  };
  const onStopRecord = async (actionRecord: string) => {
    const result = await Sound.stopRecorder();
    Sound.removeRecordBackListener();

    if (actionRecord === 'send') {
      const messId = uuidv4();
      let chatRoomId = '';

      if (type === 'private' && friend) {
        chatRoomId = makeContactId(user?.id as string, friend.id);
      } else {
        chatRoomId = chatRoom.id;
      }

      addPendingMessage(chatRoomId, {
        id: messId,
        senderId: user?.id as string,
        type: 'audio',
        text: '',
        mediaURL: '',
        localURL: result,
        batchId: '',
        reactionCounts: {},
        deleted: false,
        deleteAt: null,
        deleteBy: null,

        thumbKey: '',
        duration,
        height: 0,
        width: 0,

        createAt: serverTimestamp(),
        status: 'pending',
      });

      flatListRef.current?.scrollToEnd({ animated: true });
      setValue('');

      const { fileKey, uploadUrl } = await getUploadUrl(
        'mp4',
        'audio/mp4',
        false,
        chatRoom.id,
        messId,
      );

      await uploadBinaryToR2S3(uploadUrl, result, 'audio/mp4');

      handleSendMessage({
        typeMsg: 'audio',
        key: fileKey,
        messId,
        localURI: result,
        asset: { duration, height: 0, width: 0 },
        thumbnaiKey: '',
      });
    }

    setIsRecord(false);
    setValue('');
  };

  // Pause/Resume Recording
  // const onPauseRecord = async () => {
  //   await Sound.pauseRecorder();
  //   console.log('Recording paused');
  // };

  // const onResumeRecord = async () => {
  //   await Sound.resumeRecorder();
  //   console.log('Recording resumed');
  // };

  const renderItem = useCallback(
    ({ item }: { item: MessageModel & any }) => (
      <MessageContentComponent
        currentUser={user}
        users={users}
        showBlockTime={item.showBlockTime}
        shouldShowSmallTime={item.showSmallTime}
        isEndOfTimeBlock={item.endOfTimeBlock}
        showAvatar={item.showAvatar}
        showDisplayName={item.showDisplayName}
        lastSentByUser={lastSentByUser}
        readers={readersByMessageId[item.id] ?? []}
        members={members}
        msg={item}
        chatRoomId={chatRoom.id}
        type={chatRoom.type}
        onLongPress={onLongPressMessage}
      />
    ),
    [lastSentByUser, readersByMessageId, members, chatRoom.type],
  );
  const preloadSignedUrls = async (messages: MessageModel[]) => {
    const results = await Promise.all(
      messages.map(async (msg: MessageModel) => {
        if (['image', 'video', 'audio'].includes(msg.type)) {
          if (msg.localURL) {
            // msg.mediaURL = msg.localURL;
            return msg;
          }

          if (msg.mediaURL) {
            const signed = await getSignedUrl(msg.mediaURL);
            msg.mediaURL = signed;
          }
        }
        return msg;
      }),
    );

    return results;
  };
  const handleAddEmoji = async (emoji: string, message: MessageModel) => {
    if (emoji) {
      // --- ADD OR UPDATE REACTION ---
      await setDoc(
        doc(
          db,
          `chatRooms/${chatRoom?.id}/batches/${message?.batchId}/messages/${message?.id}/reactions`,
          user?.id as string,
        ),
        {
          reaction: emoji,
          createAt: serverTimestamp(),
        },
        { merge: true },
      );

      await setDoc(
        doc(
          db,
          `chatRooms/${chatRoom?.id}/userReactions/${user?.id}/reactions`,
          message?.id as string,
        ),
        {
          reaction: emoji,
          batchId: message?.batchId,
          createAt: serverTimestamp(),
          updateAt: serverTimestamp(),
        },
        { merge: true },
      );
    } else {
      // --- REMOVE REACTION ---
      await deleteDoc(
        doc(
          db,
          `chatRooms/${chatRoom?.id}/batches/${message?.batchId}/messages/${message?.id}/reactions`,
          user?.id as string,
        ),
      );

      await deleteDoc(
        doc(
          db,
          `chatRooms/${chatRoom?.id}/userReactions/${user?.id}/reactions`,
          message?.id as string,
        ),
      );
    }

    closePopover();
  };
  const handleDeleteMsg = async (message: MessageModel) => {
    // Tạo batch mới
    await setDoc(
      doc(
        db,
        `chatRooms/${chatRoom.id}/userMessageState/${user?.id}/messages`,
        message.id,
      ),
      {
        deleted: true,
        deletedAt: serverTimestamp(),
      },
      { merge: true },
    );
    closePopover();
  };
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.primaryLight }}
      edges={['bottom']}
    >
      <Container
        bg={colors.primaryLight}
        back
        title={
          <RowComponent
            styles={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
            onPress={() => {}}
          >
            <TextComponent
              text={type === 'private' ? friend?.displayName : chatRoom.name}
              color={colors.background}
              size={sizes.bigText}
              font={fontFamillies.poppinsBold}
            />
            {type === 'group' && (
              <TextComponent
                text={`${chatRoom.memberCount} thành viên`}
                color={colors.background}
                size={sizes.smallText}
              />
            )}
          </RowComponent>
        }
        right={
          <RowComponent>
            <SpaceComponent width={16} />
            <SearchNormal1
              size={sizes.bigTitle}
              color={colors.background}
              onPress={() => {}}
            />
            {type === 'private' && (
              <>
                <SpaceComponent width={16} />
                <Call
                  size={sizes.bigTitle}
                  color={colors.background}
                  onPress={() => {}}
                />
              </>
            )}
            <SpaceComponent width={16} />
            <Video
              size={sizes.bigTitle}
              color={colors.background}
              onPress={() => {}}
              variant="Bold"
            />
            <SpaceComponent width={16} />
            <Setting2
              size={sizes.bigTitle}
              color={colors.background}
              onPress={() => {}}
              variant="Bold"
            />
          </RowComponent>
        }
      >
        <SectionComponent
          styles={{
            backgroundColor: colors.background,
            flex: 1,
            paddingTop: 10,
          }}
        >
          <FlatList
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: initialLoad ? 0 : insets.bottom + 80,
            }}
            data={enhancedMessages}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            // extraData={lastSentByUser}
            ref={flatListRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              // autoscrollToTopThreshold: 20,
            }}
            onContentSizeChange={() => {
              // scroll xuống dưới cùng khi vào phòng chat
              if (initialLoad) {
                // setTimeout(() => {
                //   flatListRef.current?.scrollToEnd({ animated: false });
                //   setIsAtBottom(true);
                //   setTimeout(() => {
                //     setInitialLoad(false);
                //   }, 5000); // 30–50ms là đủ
                // }, 30); // 30–50ms là đủ
                handleInitialScroll();
              }
            }}
            windowSize={12}
            maxToRenderPerBatch={15}
            initialNumToRender={20}
            updateCellsBatchingPeriod={10}
            removeClippedSubviews={true}
          />

          {hasNewMessage && !isAtBottom && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                backgroundColor: '#007AFF',
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 20,
                elevation: 6,
              }}
              onPress={scrollToBottom}
            >
              <TextComponent
                styles={{ color: '#fff', fontWeight: '600' }}
                text="Tin nhắn mới"
              />
            </TouchableOpacity>
          )}
        </SectionComponent>

        <SectionComponent
          styles={{
            padding: 10,
          }}
        >
          <RowComponent>
            {isRecord ? (
              <Trash
                onPress={() => onStopRecord('remove')}
                size={sizes.extraTitle}
                color={colors.background}
                variant="Bold"
              />
            ) : (
              <EmojiPopup onEmojiSelected={emoji => setValue(m => m + emoji)}>
                <EmojiNormal
                  size={sizes.extraTitle}
                  color={colors.background}
                  variant="Bold"
                />
              </EmojiPopup>
            )}
            <SpaceComponent width={16} />
            <InputComponent
              styles={{
                backgroundColor: colors.background,
                paddingHorizontal: 10,
                borderRadius: 5,
                flex: 1,
              }}
              placeholder="Nhập tin nhắn"
              placeholderTextColor={colors.gray2}
              color={colors.background}
              value={value}
              onChangeText={setValue}
              // onSubmitEditing={handleSendMessage}
              multible
              autoFocus={true}
            />
            <SpaceComponent width={16} />
            {value === '' ? (
              <>
                <Microphone2
                  onPress={handleOpenRecord}
                  size={sizes.extraTitle}
                  color={colors.background}
                  variant="Bold"
                />
                <SpaceComponent width={16} />
                <Image
                  onPress={handleOpenImage}
                  size={sizes.extraTitle}
                  color={colors.background}
                  variant="Bold"
                />
              </>
            ) : isRecord ? (
              <Send2
                size={sizes.extraTitle}
                color={colors.background}
                variant="Bold"
                onPress={() => onStopRecord('send')}
              />
            ) : (
              <Send2
                size={sizes.extraTitle}
                color={colors.background}
                variant="Bold"
                onPress={() => handleSendMessage({})}
              />
            )}
          </RowComponent>
        </SectionComponent>

        <ImageViewing
          imageIndex={imageIndex}
          visible={viewerVisible}
          images={viewerImages}
          onRequestClose={() => setViewerVisible(false)}
          animationType="fade"
        />
        <GlobalPopover
          {...popover}
          onClose={closePopover}
          onDelete={(message: MessageModel) => handleDeleteMsg(message)}
          onReply={() => {
            console.log('onReply');
            closePopover();
          }}
          onReact={() => console.log('onReact')}
          onEmoji={async ({
            emoji,
            message,
          }: {
            emoji: string;
            message: MessageModel;
          }) => handleAddEmoji(emoji, message)}
        />
      </Container>
    </SafeAreaView>
  );
};

export default MessageDetailScreen;
