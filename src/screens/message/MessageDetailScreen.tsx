import {
  collection,
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
import {
  Call,
  CloseSquare,
  EmojiNormal,
  Image,
  Logout,
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
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmojiPopup } from 'react-native-emoji-popup';
import EmojiSelector from 'react-native-emoji-selector';
import 'react-native-get-random-values';
import { Asset } from 'react-native-image-picker';
import ImageViewing from 'react-native-image-viewing';
import Sound, { RecordBackType } from 'react-native-nitro-sound';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../firebase.config';
import {
  ButtonComponent,
  Container,
  GlobalPopover,
  InputComponent,
  MessageContentComponent,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  SpinnerComponent,
  TextComponent,
} from '../../components';
import {
  ActionModal,
  ForwardUserModal,
  LeaveRoomModal,
} from '../../components/modals';
import {
  createNewBatch,
  shouldCreateNewBatch,
} from '../../constants/checkNewBatch';
import { colors } from '../../constants/colors';
import { convertInfoUserFromID } from '../../constants/convertData';
import {
  q_chatRoomId,
  q_messagesASC,
  q_readStatus,
} from '../../constants/firebase/query';
import { fontFamillies } from '../../constants/fontFamilies';
import {
  compress,
  createVideoThumbnail,
  extractFileKey,
  getUploadUrl,
  handleAddEmoji,
  handleDeleteMsg,
  handleRecallMsg,
  leaveGroup,
  loadMessagesFromBatchIds,
  mimeToExt,
  pickImage,
  preloadSignedUrls,
  requestAudioPermission,
  unblockUser,
  uploadBinaryToR2S3,
} from '../../constants/functions';
import {
  delay,
  isEndOfTimeBlock,
  shouldShowBlockTime,
  shouldShowSmallTime,
} from '../../constants/handleTimeData';
import { makeContactId } from '../../constants/makeContactId';
import { sizes } from '../../constants/sizes';
import { useChatRoom } from '../../hooks/useChatRoom';
import { useChatRoomSync } from '../../hooks/useChatRoomSync';
import { useFriendState } from '../../hooks/useFriendState';
import { MessageModel, MsgReplyModel, ReadStatusModel } from '../../models';
import {
  useBlockStore,
  useChatStore,
  useUsersStore,
  useUserStore,
} from '../../zustand';

const MessageDetailScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const { users } = useUsersStore();
  const { type, friend, chatRoomId } = route.params;
  const { room } = useChatRoom(chatRoomId);
  // Kích hoạt hook realtime
  const [isAtBottom, setIsAtBottom] = useState(true);
  useChatRoomSync(chatRoomId, user?.id as string, isAtBottom);

  const [members, setMembers] = useState(route.params.members);
  const [value, setValue] = useState('');
  const [lastBatchId, setLastBatchId] = useState<string | null>(null);
  const { messagesByRoom, pendingMessages } = useChatStore();
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<any>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [isRecord, setIsRecord] = useState(false);
  const [duration, setDuration] = useState(0);
  const messages = [
    ...(messagesByRoom[chatRoomId] || []),
    ...(pendingMessages[chatRoomId] || []),
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
  const [showPicker, setShowPicker] = useState(false);
  const [msgReply, setMsgReply] = useState<MsgReplyModel | null>(null);
  const [msgForward, setMsgForward] = useState<any>(null);
  const [visibleForwardUser, setVisibleForwardUser] = useState(false);
  const userBlockByMe = useBlockStore(s => s.blockedByMe);
  const userBlockMe = useBlockStore(s => s.blockedMe);
  const [loadingUnblock, setLoadingUnblock] = useState(false);
  const friendState = useFriendState(friend?.id as string);
  const [infoModal, setInfoModal] = useState({
    visibleModal: false,
    status: '',
    friend: null,
  });
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  //Lắng nghe xem người khác chặn mình
  useEffect(() => {
    if (!user?.id || !friend?.id) return;

    // 2️⃣ Người khác chặn mình
    const unsubBlockedMe = onSnapshot(
      doc(db, `blocks/${friend.id}/blocked/${user.id}`),
      snap => {
        const map: Record<string, true> = {};

        if (snap.exists()) {
          map[friend.id] = true;
        }

        useBlockStore.getState().setBlockedMe(map);
      },
    );

    // Cleanup listener khi component unmount
    return () => {
      unsubBlockedMe();
    };
  }, [user?.id, friend?.id]);

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
    // Scroll khi có tin mới nhưng chỉ khi user đang ở đáy
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

  const handleReplyStatus = (msg: MessageModel) => {
    if (!msg.replyTo) return false;
    const replyMsg = messages.find(
      _ => _.id === msg.replyTo?.messageId,
    ) as MessageModel;
    const replyStatus: boolean =
      (replyMsg && replyMsg.deleted) ||
      (userMessageState &&
        userMessageState[replyMsg?.id] &&
        userMessageState[replyMsg.id].deleted);

    return replyStatus;
  };

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
        chatRoomId,
        hiddenMsg:
          userMessageState && userMessageState[msg.id]
            ? userMessageState[msg.id].deleted
            : false,
        replyStatus: handleReplyStatus(msg),
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
        chatRoomId={chatRoomId}
        type={type}
        onLongPress={onLongPressMessage}
      />
    ),
    [lastSentByUser, readersByMessageId, members, type],
  );

  useEffect(() => {
    // setLastBatchId
    if (!chatRoomId) return;

    let cancelled = false; // <– flag để tránh setState sau khi unmount hoặc đổi phòng

    const getCurrentBatch = async () => {
      try {
        const snapshot = await getDoc(q_chatRoomId(chatRoomId));

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
  }, [chatRoomId]);

  // Lắng nghe thay đổi lastBatchId trong chatRoom
  useEffect(() => {
    if (!chatRoomId) return;

    const unsubRoom = onSnapshot(q_chatRoomId(chatRoomId), snap => {
      const data = snap.data();
      if (!data) return;

      if (data.lastBatchId && data.lastBatchId !== lastBatchId) {
        console.log('🔄 Chuyển batch:', data.lastBatchId);
        setLastBatchId(prev =>
          prev !== data.lastBatchId ? data.lastBatchId : prev,
        ); // tự động chuyển sang batch mới
      }
    });
    const unsubReadStatus = onSnapshot(q_readStatus(chatRoomId), snapshot => {
      const data: Record<string, ReadStatusModel> = {};
      snapshot.forEach((doc: any) => (data[doc.id] = doc.data()));
      setReadStatus(data);
    });

    return () => {
      unsubRoom();
      unsubReadStatus();
    };
  }, [chatRoomId]);

  // load 3 batch đầu tiên vào ---> dạng prepend (false)
  useEffect(() => {
    if (!chatRoomId) return;

    let isMounted = true; // flag để cleanup

    const load3Batch = async () => {
      try {
        // 1. Lấy batch ASC rồi reverse + slice
        const q_batches = query(
          collection(db, `chatRooms/${chatRoomId}/batches`),
          orderBy(documentId(), 'asc'),
        );

        const snap = await getDocs(q_batches);

        if (!isMounted) return; // ❗ nếu unmount thì dừng luôn

        const batchIds = snap.docs.map((d: any) => d.data().id).reverse();
        setAllBatchIds(batchIds);
        setLoadedCount(3);
        const top3 = batchIds.slice(0, 3);

        if (top3.length === 0) {
          if (isMounted) setMessagesForRoom(chatRoomId, [], true);
          return;
        }

        // 2. Load message của top3 batch (song song)
        let messages = await loadMessagesFromBatchIds(chatRoomId, top3);
        if (!isMounted) return; // ❗ kiểm tra lại trước khi setState
        messages = await preloadSignedUrls(messages);

        setMessagesForRoom(chatRoomId, messages, true);
      } catch (err) {
        console.log('load3Batch error', err);
      }
    };

    load3Batch();

    return () => {
      isMounted = false;
    };
  }, [chatRoomId]);

  // listen myReaction
  useEffect(() => {
    if (!chatRoomId || !user) return;

    const userMessageStateRef = collection(
      db,
      `chatRooms/${chatRoomId}/userMessageState/${user.id}/messages`,
    );

    const unsub = onSnapshot(userMessageStateRef, docSnap => {
      let state: any = {};
      docSnap.forEach((doc: any) => {
        state[doc.id] = doc.data(); // messageId → { deleted: true }
      });
      setUserMessageState(state);
    });

    return () => {
      unsub();
    };
  }, [chatRoomId, user]);

  //listen new message in current Batch
  useEffect(() => {
    if (!chatRoomId || !lastBatchId) return;

    // 🔥 Đăng ký lắng nghe realtime
    const unsubscribe = onSnapshot(
      q_messagesASC({ chatRoomId, batchId: lastBatchId }),
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
        // 1️⃣ cập nhật messages chính
        setMessagesForRoom(chatRoomId, msgs, false);
        // 2️⃣ 🔥 CLEANUP PENDING Ở ĐÂY
        msgs.forEach((m: any) => {
          removePendingMessage(chatRoomId, m.id);
        });
      },
    );

    // 🧹 Hủy đăng ký khi batchId đổi hoặc component unmount
    return () => {
      unsubscribe();
    };
  }, [chatRoomId, lastBatchId]);

  useEffect(() => {
    //loadMoreBatches when atTop
    if (isAtTop) {
      loadMoreBatches();
    }
  }, [isAtTop]);

  // Other

  const loadMoreBatches = async () => {
    if (loadedCount >= allBatchIds.length) return; // hết batch

    const next = allBatchIds.slice(loadedCount, loadedCount + 2);
    console.log(next);
    setIsPrepending(true);
    let moreMessages = await loadMessagesFromBatchIds(chatRoomId, next);
    moreMessages = await preloadSignedUrls(moreMessages);

    setMessagesForRoom(chatRoomId, moreMessages, true);

    // ĐỢI render xong rồi mới tắt prepend
    setTimeout(() => {
      setIsPrepending(false);
    }, 0);
    setLoadedCount(prev => prev + next.length);
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
      let roomId = '';

      if (type === 'private' && friend) {
        roomId = makeContactId(user.id as string, friend.id);
      } else {
        roomId = chatRoomId;
      }

      const text = typeMsg === 'text' ? value : '';
      const mediaURL =
        typeMsg === 'image' || typeMsg == 'video' || typeMsg == 'audio'
          ? (key as string)
          : '';
      const thumbKey = typeMsg === 'video' ? (thumbnaiKey as string) : '';

      // Thêm tin nhắn ở local
      // if (!['image', 'video', 'audio'].includes(typeMsg)) {
      //   addPendingMessage(roomId, {
      //     id: messageId,
      //     senderId: user.id,
      //     type: 'text',
      //     text,
      //     mediaURL: '',
      //     localURL: '',
      //     batchId: '',
      //     reactionCounts: {},
      //     deleted: false,
      //     deletedAt: null,
      //     deletedBy: null,

      //     replyTo: msgReply,
      //     forwardedFrom: msgForward,

      //     thumbKey: '',
      //     duration: 0,
      //     height: 0,
      //     width: 0,

      //     createAt: serverTimestamp(),
      //     status: 'pending',
      //   });
      // }
      addPendingMessage(roomId, {
        id: messageId,
        senderId: user.id,
        type: typeMsg,
        text,
        mediaURL,
        localURL: '',
        batchId: '',
        reactionCounts: {},
        deleted: false,
        deletedAt: null,
        deletedBy: null,

        replyTo: msgReply,
        forwardedFrom: msgForward,

        thumbKey,
        duration: 0,
        height: 0,
        width: 0,

        createAt: Date.now(),
        status: 'pending',
      });
      // Xử lý phía firebase
      try {
        const docSnap = await getDoc(doc(db, 'chatRooms', roomId));

        if (docSnap.exists()) {
          const docSnapBatch = await getDoc(
            doc(db, `chatRooms/${roomId}/batches`, docSnap.data()?.lastBatchId),
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
              doc(db, `chatRooms/${roomId}/batches`, batchInfo.id),
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
              doc(db, `chatRooms/${roomId}/batches`, docSnapBatch.id),
              {
                nextBatchId: batchInfo.id,
              },
            );
          }

          // Thêm tin nhắn vào subCollection messages
          await setDoc(
            doc(
              db,
              `chatRooms/${roomId}/batches/${batchInfo.id}/messages`,
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
              deletedAt: null,
              deletedBy: null,
              replyTo: msgReply,
              forwardedFrom: msgForward,

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
          updatePendingStatus(roomId, messageId, 'sent');
          // // Xoá khỏi persist vì Firestore sẽ gửi về qua onSnapshot
          // removePendingMessage(roomId, messageId);
        } else {
          const batchInfo = createNewBatch(null);

          await setDoc(
            doc(db, 'chatRooms', roomId),
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
            setDoc(doc(db, `chatRooms/${roomId}/members`, _.id), _, {
              merge: true,
            });
            // Thêm readStatus subcollection cho chatRoom
            setDoc(
              doc(db, `chatRooms/${roomId}/readStatus`, _.id),
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
            doc(db, `chatRooms/${roomId}/batches`, batchInfo.id),
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
              `chatRooms/${roomId}/batches/${batchInfo.id}/messages`,
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
              deletedAt: null,
              deletedBy: null,
              replyTo: msgReply,
              forwardedFrom: msgForward,

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
          updatePendingStatus(roomId, messageId, 'sent');
          // // Xoá khỏi persist vì Firestore sẽ gửi về qua onSnapshot
          // removePendingMessage(roomId, messageId);
        }
      } catch (error) {
        updatePendingStatus(roomId, messageId, 'failed');
        console.log(error);
      }
      setValue('');
      setMsgReply(null);
      // ⬇️ Sau khi gửi xong, cuộn xuống dưới cùng
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };
  const handleForwardMsg = async ({
    chatRoomId,
    friend,
    type,
    data,
  }: {
    chatRoomId: string;
    friend: any;
    type: string;
    data: any;
  }) => {
    if (user) {
      const messageId = uuidv4();

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
              type: data.type,
              text: data.text,
              localURL: data.localURL ?? '',
              mediaURL: data.mediaURL ? extractFileKey(data.mediaURL) : '',

              batchId: batchInfo.id,
              reactionCounts: {},
              deleted: false,
              deletedAt: null,
              deletedBy: null,
              replyTo: null,

              forwardedFrom: {
                messageId: data.id,
                senderId: data.senderId,
              },

              thumbKey: data.thumbKey ?? '',
              duration: data.duration ?? 0,
              height: data.height ?? 0,
              width: data.width ?? 0,

              status: 'sent',
              createAt: serverTimestamp(),
            },
            { merge: true },
          );
        } else {
          const batchInfo = createNewBatch(null);

          await setDoc(
            doc(db, 'chatRooms', chatRoomId),
            {
              type,
              name: '',
              avatarURL: '',
              description: '',
              createdBy: user.id,
              createAt: serverTimestamp(),
              lastMessageId: messageId,
              lastMessageText: data.text,
              lastMessageAt: serverTimestamp(),
              lastSenderId: user.id,

              lastBatchId: batchInfo.id,
              memberCount: 2,
              memberIds: [user.id, friend?.id],
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
              senderId: user.id,
              type: data.type,
              text: data.text,
              localURL: data.localURL ?? '',
              mediaURL: data.mediaURL ? extractFileKey(data.mediaURL) : '',

              batchId: batchInfo.id,
              reactionCounts: {},
              deleted: false,
              deletedAt: null,
              deletedBy: null,
              replyTo: null,

              forwardedFrom: {
                messageId,
                senderId: data.senderId,
              },

              thumbKey: data.thumbKey,
              duration: data.duration ?? 0,
              height: data.height ?? 0,
              width: data.width ?? 0,

              status: 'sent',
              createAt: serverTimestamp(),
            },
            { merge: true },
          );
        }
      } catch (error) {
        console.log(error);
      }
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
  const handleInitialScroll = async () => {
    await delay(500); // đợi layout ổn định

    flatListRef.current?.scrollToEnd({ animated: false });
    setIsAtBottom(true);

    await delay(3000); // đủ thời gian để scroll chạy xong thật sự
    setInitialLoad(false);
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

          let roomId = '';

          if (type === 'private' && friend) {
            roomId = makeContactId(user?.id as string, friend.id);
          } else {
            roomId = chatRoomId;
          }

          addPendingMessage(roomId, {
            id: messId,
            senderId: user?.id as string,
            type: typeMsg,
            text: '',
            mediaURL: '',
            localURL: asset.uri,
            batchId: '',
            reactionCounts: {},
            deleted: false,
            deletedAt: null,
            deletedBy: null,
            replyTo: msgReply,
            forwardedFrom: msgForward,

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
                chatRoomId,
                messId,
              );
            await uploadBinaryToR2S3(thumbUploadUrl, thumb.path, thumb.mime);
            thumbKey = thumbFileKey;
          }

          const { fileKey, uploadUrl } = await getUploadUrl(
            ext,
            asset.type,
            false,
            chatRoomId,
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

  // Recording

  const handleOpenRecord = async () => {
    setIsRecord(true);
    setValue('Chuẩn bị ghi');
    await onStartRecord();
  };
  const onStartRecord = async () => {
    const ok = await requestAudioPermission();
    if (!ok) return;
    // Set up recording progress listener
    Sound.addRecordBackListener((e: RecordBackType) => {
      console.log('Recording progress:', e.currentPosition, e.currentMetering);
      const timeRecord = `${Math.floor(e.currentPosition / 1000)},${e.currentPosition - Math.floor(e.currentPosition / 1000) * 1000
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
      let roomId = '';

      if (type === 'private' && friend) {
        roomId = makeContactId(user?.id as string, friend.id);
      } else {
        roomId = chatRoomId;
      }

      addPendingMessage(roomId, {
        id: messId,
        senderId: user?.id as string,
        type: 'audio',
        text: '',
        mediaURL: '',
        localURL: result,
        batchId: '',
        reactionCounts: {},
        deleted: false,
        deletedAt: null,
        deletedBy: null,
        replyTo: msgReply,
        forwardedFrom: msgForward,

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
        chatRoomId,
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
  const handleUnblock = async () => {
    setLoadingUnblock(true);

    try {
      await unblockUser(friend.id);
      setLoadingUnblock(false);
    } catch (error) {
      setLoadingUnblock(false);
      console.log(error);
    }
  };
  const leaveRoom = async () => {
    try {
      await leaveGroup(chatRoomId);

      navigation.navigate('Main');
    } catch (error) {
      console.log(error);
    }
  };

  if (!chatRoomId) return <SpinnerComponent loading={true} />;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.primaryLight }}
      edges={['bottom']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        // keyboardVerticalOffset={0}
        keyboardVerticalOffset={insets.top + 56} // 56 = height header
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
              onPress={() =>
                navigation.navigate('RoomSettingScreen', {
                  friend: type === 'private' ? friend : null,
                  chatRoomId,
                })
              }
            >
              <TextComponent
                text={type === 'private' ? friend?.displayName : room?.name}
                color={colors.background}
                size={sizes.bigText}
                font={fontFamillies.poppinsBold}
                numberOfLine={1}
              />
              {type === 'group' && (
                <TextComponent
                  text={`${room?.memberCount} thành viên`}
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
                onPress={() =>
                  navigation.navigate('SearchMsgScreen', {
                    type,
                    friend: type === 'private' ? friend : null,
                    chatRoom: room,
                    members,
                  })
                }
              />
              {type === 'private' && (
                <>
                  <SpaceComponent width={16} />
                  <Call
                    size={sizes.bigTitle}
                    color={colors.background}
                    onPress={() => { }}
                  />
                </>
              )}
              <SpaceComponent width={16} />
              <Video
                size={sizes.bigTitle}
                color={colors.background}
                onPress={() => { }}
                variant="Bold"
              />
              <SpaceComponent width={16} />
              {type === 'group' ? (
                <Logout
                  size={sizes.bigTitle}
                  color={colors.background}
                  onPress={() => setShowLeaveModal(true)}
                  variant="Bold"
                />
              ) : (
                <Setting2
                  size={sizes.bigTitle}
                  color={colors.background}
                  onPress={() =>
                    setInfoModal({
                      visibleModal: true,
                      status: friendState,
                      friend,
                    })
                  }
                  variant="Bold"
                />
              )}
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
                // paddingBottom: initialLoad ? 0 : insets.bottom + 80,
                paddingBottom: initialLoad ? 0 : insets.bottom + 80,
              }}
              data={enhancedMessages}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              // extraData={lastSentByUser}
              ref={flatListRef}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              maintainVisibleContentPosition={
                enhancedMessages.length === 0
                  ? undefined
                  : {
                    minIndexForVisible: 0,
                    // autoscrollToTopThreshold: 20,
                  }
              }
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

          {msgReply && (
            <SectionComponent
              styles={{
                padding: 10,
                backgroundColor: colors.gray,
              }}
            >
              <RowComponent
                justify="space-between"
                styles={{ alignItems: 'flex-start' }}
              >
                <View
                  style={{
                    width: '80%',
                  }}
                >
                  <TextComponent
                    text={`Đang trả lời ${msgReply.senderId === user?.id
                      ? 'chính bạn'
                      : convertInfoUserFromID(msgReply.senderId, users)
                        ?.displayName
                      }`}
                  />
                  <TextComponent
                    numberOfLine={1}
                    text={msgReply.text}
                    color={colors.gray3}
                  />
                </View>
                <CloseSquare
                  onPress={() => setMsgReply(null)}
                  size={sizes.extraTitle}
                  color={colors.textBold}
                  variant="Bold"
                />
              </RowComponent>
            </SectionComponent>
          )}

          <SectionComponent
            styles={{
              padding: 10,
            }}
          >
            {userBlockByMe[friend?.id] || userBlockMe[friend?.id] ? (
              <View>
                <TextComponent
                  text={`${userBlockByMe[friend.id]
                    ? 'Bạn đã chặn ' + friend.displayName
                    : friend.displayName + ' đã chặn bạn'
                    }`}
                  textAlign="center"
                  color={colors.red}
                  styles={{
                    fontStyle: 'italic',
                  }}
                />
                <SpaceComponent height={10} />
                {userBlockByMe[friend.id] && (
                  <ButtonComponent
                    text="Bỏ chặn"
                    textStyles={{ color: colors.red }}
                    onPress={handleUnblock}
                    styles={{ backgroundColor: colors.background }}
                    isLoading={loadingUnblock}
                  />
                )}
              </View>
            ) : (
              <RowComponent>
                {isRecord ? (
                  <Trash
                    onPress={() => onStopRecord('remove')}
                    size={sizes.extraTitle}
                    color={colors.background}
                    variant="Bold"
                  />
                ) : Platform.OS === 'ios' ? (
                  <EmojiNormal
                    onPress={() => setShowPicker(!showPicker)}
                    size={sizes.extraTitle}
                    color={colors.background}
                    variant="Bold"
                  />
                ) : (
                  <EmojiPopup
                    onEmojiSelected={emoji => setValue(m => m + emoji)}
                  >
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
                    // paddingHorizontal: 10,
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
            )}
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
            onDelete={(message: MessageModel) =>
              handleDeleteMsg({
                message,
                chatRoomId: room?.id as string,
                userId: user?.id as string,
                closePopover,
              })
            }
            onReply={(message: MessageModel) => {
              setMsgReply({
                messageId: message.id,
                senderId: message.senderId,
                type: message.type,
                text:
                  message.type === 'text' ? message.text : `[${message.type}]`,
              });
              closePopover();
            }}
            onReact={(message: MessageModel) => {
              // setTimeout(() => setVisibleForwardUser(true), 1000);
              setVisibleForwardUser(true);
              setMsgForward(message);
              setTimeout(() => closePopover(), 1000);
            }}
            onRecall={(message: MessageModel) =>
              handleRecallMsg({
                message,
                chatRoomId: room?.id as string,
                userId: user?.id as string,
                closePopover,
              })
            }
            onEmoji={async ({
              emoji,
              message,
            }: {
              emoji: string;
              message: MessageModel;
            }) =>
              handleAddEmoji({
                emoji,
                message,
                chatRoomId: room?.id as string,
                userId: user?.id as string,
                closePopover,
              })
            }
          />
        </Container>
      </KeyboardAvoidingView>

      {showPicker && (
        <EmojiSelector
          onEmojiSelected={emoji => {
            setValue(prev => prev + emoji);
            setShowPicker(false);
          }}
        />
      )}

      <ForwardUserModal
        visible={visibleForwardUser}
        users={users}
        onClose={() => setVisibleForwardUser(false)}
        onSelectUser={val => {
          handleForwardMsg({
            chatRoomId: val.chatRoomId,
            type: val.type,
            friend: val.friend,
            data: msgForward,
          });
        }}
      />
      <ActionModal
        visible={infoModal.visibleModal}
        setInfoModal={setInfoModal}
        infoModal={infoModal}
        onClose={() => setInfoModal({ ...infoModal, visibleModal: false })}
      />
      <LeaveRoomModal
        visible={showLeaveModal}
        roomName={room?.name}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={leaveRoom}
      />
    </SafeAreaView>
  );
};

export default MessageDetailScreen;
