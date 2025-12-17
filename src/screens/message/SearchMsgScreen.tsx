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
import { SearchNormal1 } from 'iconsax-react-native';
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
  View
} from 'react-native';
import 'react-native-get-random-values';
import ImageViewing from 'react-native-image-viewing';
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
  SectionComponent,
  SpaceComponent,
  TextComponent
} from '../../components';
import { ForwardUserModal } from '../../components/modals';
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
import {
  countKeywordInText,
  extractFileKey,
  handleAddEmoji,
  handleDeleteMsg,
  handleRecallMsg,
  loadMessagesFromBatchIds,
  preloadSignedUrls,
  unblockUser,
} from '../../constants/functions';
import {
  delay,
  isEndOfTimeBlock,
  shouldShowBlockTime,
  shouldShowSmallTime,
} from '../../constants/handleTimeData';
import { useChatRoomSync } from '../../hooks/useChatRoomSync';
import { MessageModel, ReadStatusModel } from '../../models';
import { useBlockStore, useChatStore, useUsersStore, useUserStore } from '../../zustand';

const SearchMsgScreen = ({ route }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const { users } = useUsersStore();
  const { type, friend, chatRoom } = route.params;
  const [members, setMembers] = useState(route.params.members);
  const [keyword, setKeyword] = useState('');
  const [lastBatchId, setLastBatchId] = useState<string | null>(null);
  const { messagesByRoom, pendingMessages } = useChatStore();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<any>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const messages = [
    ...(messagesByRoom[chatRoom.id] || []),
    ...(pendingMessages[chatRoom.id] || []),
  ];
  const flatListRef = useRef<FlatList>(null);
  const { setMessagesForRoom } = useChatStore.getState();
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
  // const [showPicker, setShowPicker] = useState(false);
  // const [msgReply, setMsgReply] = useState<MsgReplyModel | null>(null);
  const [msgForward, setMsgForward] = useState<any>(null);
  const [visibleForwardUser, setVisibleForwardUser] = useState(false);
  const [messageMatchCount, setMessageMatchCount] = useState(0);
  const [totalMessageMatch, setTotalMessageMatch] = useState(0);
  const userBlockByMe = useBlockStore(s => s.blockedByMe)
  const userBlockMe = useBlockStore(s => s.blockedMe)
  const [loadingUnblock, setLoadingUnblock] = useState(false);

  // Kích hoạt hook realtime
  useChatRoomSync(chatRoom?.id, user?.id as string, isAtBottom);

  useEffect(() => {
    if (!keyword) return;
    const messageText =
      messagesByRoom[chatRoom.id].filter(m => !m.deleted) ?? [];

    const matchedMessages = messageText.filter(m =>
      m.text.toLowerCase().includes(keyword.toLowerCase()),
    );

    const msgCount = matchedMessages.length;
    const totalMatchCount = messageText.reduce((total, m) => {
      return total + countKeywordInText(m.text, keyword);
    }, 0);

    setMessageMatchCount(msgCount);
    setTotalMessageMatch(totalMatchCount);
  }, [keyword]);

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
        chatRoomId: chatRoom.id,
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
        chatRoomId={chatRoom.id}
        type={chatRoom.type}
        onLongPress={onLongPressMessage}
        keyword={keyword}
      />
    ),
    [lastSentByUser, readersByMessageId, members, chatRoom.type],
  );

  useEffect(() => {
    // setLastBatchId
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

  useEffect(() => {
    // Lắng nghe thay đổi lastBatchId trong chatRoom
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

    return () => {
      unsubRoom();
      unsubReadStatus();
    };
  }, [chatRoom]);

  useEffect(() => {
    // load 3 batch đầu tiên vào ---> dạng prepend (false)
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
      isMounted = false;
    };
  }, [chatRoom]);

  useEffect(() => {
    // listen myReaction
    if (!chatRoom || !user) return;

    const userMessageStateRef = collection(
      db,
      `chatRooms/${chatRoom.id}/userMessageState/${user.id}/messages`,
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
  }, [chatRoom, user]);

  useEffect(() => {
    //listen new message in current Batch
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
  }, [chatRoom, lastBatchId]);

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
    let moreMessages = await loadMessagesFromBatchIds(chatRoom.id, next);
    moreMessages = await preloadSignedUrls(moreMessages);

    setMessagesForRoom(chatRoom.id, moreMessages, true);

    // ĐỢI render xong rồi mới tắt prepend
    setTimeout(() => {
      setIsPrepending(false);
    }, 0);
    setLoadedCount(prev => prev + next.length);
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
  const openViewer = async (messageId: string) => {
    const imageMessages = messages.filter(m => m.type === 'image');
    const keys = imageMessages.map(_ => _.id);
    const uris = imageMessages.map(_ => _.mediaURL);
    const allImages = uris.map(m => ({ uri: m }));
    const index = keys.indexOf(messageId);

    setImageIndex(index);
    setViewerImages(allImages);
    setViewerVisible(true);
  };

  const handleUnblock = async () => {
    setLoadingUnblock(true)

    try {
      await unblockUser(friend.id)
      setLoadingUnblock(false)
    } catch (error) {
      setLoadingUnblock(false)
      console.log(error)
    }

  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.primaryLight }}
      edges={['bottom']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <Container
          bg={colors.primaryLight}
          back
          title={
            <InputComponent
              styles={{
                backgroundColor: colors.background,
                paddingHorizontal: 26,
                borderRadius: 5,
                flex: 1,
              }}
              allowClear
              prefix={<SearchNormal1 color={colors.text} size={26} />}
              placeholder="Tìm tin nhắn văn bản"
              placeholderTextColor={colors.gray3}
              color={colors.background}
              value={keyword}
              onChangeText={setKeyword}
            />
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
              ref={flatListRef}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
              }}
              onContentSizeChange={() => {
                if (initialLoad) {
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
            {
              (userBlockByMe[friend?.id] || userBlockMe[friend?.id]) &&
              <View>
                <TextComponent
                  text={`${userBlockByMe[friend.id] ? 'Bạn đã chặn ' + friend.displayName : friend.displayName + ' đã chặn bạn'}`}
                  textAlign='center' color={colors.red} styles={{
                    fontStyle: 'italic'
                  }} />
                <SpaceComponent height={10} />
                {
                  userBlockByMe[friend.id] &&
                  <ButtonComponent
                    text='Bỏ chặn'
                    textStyles={{ color: colors.red }}
                    onPress={handleUnblock}
                    styles={{ backgroundColor: colors.background }}
                    isLoading={loadingUnblock}
                  />
                }
              </View>
            }
            <SpaceComponent height={10}/>
            {keyword !== '' && (
              <TextComponent
                text={`Tìm thấy ${messageMatchCount}/${totalMessageMatch} tin nhắn trùng khớp`}
                color={colors.background}
                textAlign="center"
                styles={{
                  fontStyle: 'italic',
                }}
              />
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
            isSearch={true}
            onClose={closePopover}
            onDelete={(message: MessageModel) =>
              handleDeleteMsg({
                message,
                chatRoomId: chatRoom?.id as string,
                userId: user?.id as string,
                closePopover,
              })
            }
            onReply={undefined}
            onReact={(message: MessageModel) => {
              setVisibleForwardUser(true);
              setMsgForward(message);
              setTimeout(() => closePopover(), 1000);
            }}
            onRecall={(message: MessageModel) =>
              handleRecallMsg({
                message,
                chatRoomId: chatRoom?.id as string,
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
                chatRoomId: chatRoom?.id as string,
                userId: user?.id as string,
                closePopover,
              })
            }
          />
        </Container>
      </KeyboardAvoidingView>

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
    </SafeAreaView>
  );
};

export default SearchMsgScreen;
