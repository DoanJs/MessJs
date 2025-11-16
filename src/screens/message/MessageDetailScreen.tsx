import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';
import {
  Call,
  EmojiNormal,
  Image,
  Microphone2,
  SearchNormal1,
  Send2,
  Setting2,
  Video,
} from 'iconsax-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
} from 'react-native';
import 'react-native-get-random-values';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../firebase.config';
import {
  Container,
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
import { ReadStatusModel } from '../../models';
import { useChatStore, useUserStore } from '../../zustand';

const MessageDetailScreen = ({ route }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const { type, friend, chatRoom, members } = route.params;
  const [value, setValue] = useState('');
  const [lastBatchId, setLastBatchId] = useState<string | null>(null);
  const { messagesByRoom, pendingMessages } = useChatStore();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
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
  // Kích hoạt hook realtime
  useChatRoomSync(chatRoom?.id, user?.id as string, isAtBottom);

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
  // scroll xuống dưới cùng khi vào phòng chat
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
        setIsAtBottom(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []); // ❗ chỉ chạy 1 lần, không để [messages.length]
  // Scroll khi có tin mới nhưng chỉ khi user đang ở đáy
  useEffect(() => {
    if (messages.length === 0 || !user) return;

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
  useEffect(() => {
    if (!chatRoom || !lastBatchId) return;

    // 🔥 Đăng ký lắng nghe realtime
    const unsubscribe = onSnapshot(
      q_messagesASC({ chatRoomId: chatRoom.id, batchId: lastBatchId }),
      snapshot => {
        const msgs = snapshot.docs.map((doc: any) => {
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
        // ⚡ nối thêm tin nhắn mới, tránh mất tin batch cũ
        setMessagesForRoom(chatRoom.id, msgs);
      },
    );

    // 🧹 Hủy đăng ký khi batchId đổi hoặc component unmount
    return () => {
      unsubscribe();
    };
  }, [chatRoom, lastBatchId]); // <– dependency quan trọng

  const handleSendMessage = async () => {
    if (user) {
      const messageId = uuidv4();
      // ------------------------------------
      let chatRoomId = '';

      if (type === 'private' && friend) {
        chatRoomId = makeContactId(user?.id as string, friend.id);
      } else {
        chatRoomId = chatRoom.id;
      }

      // Thêm tin nhắn ở local
      addPendingMessage(chatRoomId, {
        id: messageId,
        senderId: user?.id,
        type: 'text',
        text: value,
        mediaURL: '',
        createAt: serverTimestamp(),
        status: 'pending',
      });
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
              type: 'text',
              text: value,
              mediaURL: '',
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
              createdBy: user?.id,
              createAt: serverTimestamp(),
              lastMessageId: messageId,
              lastMessageText: value,
              lastMessageAt: serverTimestamp(),
              lastSenderId: user?.id,

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
              type: 'text',
              text: value,
              mediaURL: '',
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
      // ------------------------------------

      // if (type === 'private' && friend) {
      //   const id = makeContactId(user?.id as string, friend.id);
      //   // Thêm tin nhắn ở local
      //   addPendingMessage(id, {
      //     id: messageId,
      //     senderId: user?.id,
      //     type: 'text',
      //     text: value,
      //     mediaURL: '',
      //     createAt: serverTimestamp(),
      //     status: 'pending',
      //   });
      //   // Xử lý phía firebase
      //   try {
      //     const docSnap = await getDoc(doc(db, 'chatRooms', id));

      //     if (docSnap.exists()) {
      //       //check xem batch nay qua ngay moi hoac day chua
      //       const docSnapBatch = await getDoc(
      //         doc(db, `chatRooms/${id}/batches`, docSnap.data()?.lastBatchId),
      //       );
      //       let batchInfo = {
      //         id: docSnapBatch.id,
      //         messageCount: docSnapBatch.data()?.messageCount,
      //       };
      //       if (shouldCreateNewBatch(batchInfo)) {
      //         // Tạo batchInfo (chứa batchId) tiếp theo
      //         batchInfo = createNewBatch(batchInfo);
      //         // Tạo batch mới
      //         await setDoc(
      //           doc(db, `chatRooms/${id}/batches`, batchInfo.id),
      //           {
      //             id: batchInfo.id,
      //             messageCount: 0,
      //             preBatchId: docSnapBatch.id || null,
      //             nextBatchId: null,
      //           },
      //           { merge: true },
      //         );
      //         // update lại nextBatchId cho batch cũ
      //         await updateDoc(
      //           doc(db, `chatRooms/${id}/batches`, docSnapBatch.id),
      //           {
      //             nextBatchId: batchInfo.id,
      //           },
      //         );
      //       }

      //       // Thêm tin nhắn vào subCollection messages
      //       await setDoc(
      //         doc(
      //           db,
      //           `chatRooms/${id}/batches/${batchInfo.id}/messages`,
      //           messageId,
      //         ),
      //         {
      //           senderId: user.id,
      //           type: 'text',
      //           text: value,
      //           mediaURL: '',
      //           status: 'sent',
      //           createAt: serverTimestamp(),
      //         },
      //         { merge: true },
      //       );

      //       // Cập nhật trạng thái
      //       updatePendingStatus(id, messageId, 'sent');
      //       // // Xoá khỏi persist vì Firestore sẽ gửi về qua onSnapshot
      //       removePendingMessage(id, messageId);

      //       // // cho update tren server bang CF
      //       // // Update lại số thông tin cần thiết trong chatRoomId để hiện thị ngoài badge room
      //       // await updateDoc(doc(db, `chatRooms`, id), {
      //       //   lastMessageText: value,
      //       //   lastMessageAt: serverTimestamp(),
      //       //   lastSenderId: user?.id,
      //       //   lastBatchId: batchInfo.id,
      //       // });
      //     } else {
      //       const batchInfo = createNewBatch(null);

      //       await setDoc(
      //         doc(db, 'chatRooms', id),
      //         {
      //           type: 'private',
      //           name: '',
      //           avatarURL: '',
      //           description: '',
      //           createdBy: user?.id,
      //           createAt: serverTimestamp(),
      //           lastMessageId: messageId,
      //           lastMessageText: value,
      //           lastMessageAt: serverTimestamp(),
      //           lastSenderId: user?.id,

      //           lastBatchId: batchInfo.id,
      //           memberCount: 2,
      //           memberIds: [user.id, friend.id],
      //         },
      //         { merge: true },
      //       );

      //       // Tạo members subcollection cho batch/id
      //       const members = [
      //         {
      //           id: user.id,
      //           role: 'admin',
      //           joinedAt: serverTimestamp(),
      //           nickName: user?.displayName,
      //         },
      //         {
      //           id: friend?.id,
      //           role: 'member',
      //           joinedAt: serverTimestamp(),
      //           nickName: friend?.displayName,
      //         },
      //       ];

      //       const promiseMember = members.map(_ => {
      //         setDoc(doc(db, `chatRooms/${id}/members`, _.id), _, {
      //           merge: true,
      //         });
      //         // Thêm readStatus subcollection cho chatRoom
      //         setDoc(
      //           doc(db, `chatRooms/${id}/readStatus`, _.id),
      //           {
      //             lastReadMessageId: _.id === user.id ? messageId : null,
      //             lastReadAt: _.id === user.id ? serverTimestamp() : null,
      //           },
      //           {
      //             merge: true,
      //           },
      //         );
      //         // // Thêm unreadCounts subcollection cho chatRoom bằng CF rồi
      //       });
      //       await Promise.all(promiseMember);

      //       // Tạo batch đầu tiên
      //       await setDoc(
      //         doc(db, `chatRooms/${id}/batches`, batchInfo.id),
      //         {
      //           id: batchInfo.id,
      //           messageCount: 0,
      //           preBatchId: null,
      //           nextBatchId: null,
      //         },
      //         { merge: true },
      //       );

      //       // Tạo messages subcollection cho batch/id
      //       await setDoc(
      //         doc(
      //           db,
      //           `chatRooms/${id}/batches/${batchInfo.id}/messages`,
      //           messageId,
      //         ),
      //         {
      //           senderId: user?.id,
      //           type: 'text',
      //           text: value,
      //           mediaURL: '',
      //           status: 'sent',
      //           createAt: serverTimestamp(),
      //         },
      //         { merge: true },
      //       );

      //       // Cập nhật trạng thái
      //       updatePendingStatus(id, messageId, 'sent');
      //       // // Xoá khỏi persist vì Firestore sẽ gửi về qua onSnapshot
      //       removePendingMessage(id, messageId);
      //     }
      //   } catch (error) {
      //     updatePendingStatus(id, messageId, 'failed');
      //     console.log(error);
      //   }
      // } else {
      //   // Thêm tin nhắn ở local
      //   addPendingMessage(chatRoom.id, {
      //     id: messageId,
      //     senderId: user?.id,
      //     type: 'text',
      //     text: value,
      //     mediaURL: '',
      //     createAt: serverTimestamp(),
      //     status: 'pending',
      //   });

      //   try {
      //     //check xem batch nay qua ngay moi hoac day chua
      //     const docSnapBatch = await getDoc(
      //       doc(db, `chatRooms/${chatRoom.id}/batches`, lastBatchId as string),
      //     );
      //     let batchInfo = {
      //       id: docSnapBatch.id,
      //       messageCount: docSnapBatch.data()?.messageCount,
      //     };

      //     if (shouldCreateNewBatch(batchInfo)) {
      //       // Tạo batchInfo (chứa batchId) tiếp theo
      //       batchInfo = createNewBatch(batchInfo);
      //       // Tạo batch mới
      //       await setDoc(
      //         doc(db, `chatRooms/${chatRoom.id}/batches`, batchInfo.id),
      //         {
      //           id: batchInfo.id,
      //           messageCount: 0,
      //           preBatchId: docSnapBatch.id,
      //           nextBatchId: null,
      //         },
      //         { merge: true },
      //       );
      //       // update lại nextBatchId cho batch cũ
      //       await updateDoc(
      //         doc(db, `chatRooms/${chatRoom.id}/batches`, docSnapBatch.id),
      //         {
      //           nextBatchId: batchInfo.id,
      //         },
      //       );
      //     }

      //     // Thêm tin nhắn vào subCollection messages
      //     await setDoc(
      //       doc(
      //         db,
      //         `chatRooms/${chatRoom.id}/batches/${batchInfo.id}/messages`,
      //         messageId,
      //       ),
      //       {
      //         senderId: user?.id,
      //         type: 'text',
      //         text: value,
      //         mediaURL: '',
      //         status: 'sent',
      //         createAt: serverTimestamp(),
      //       },
      //       { merge: true },
      //     );

      //     // Cập nhật trạng thái
      //     updatePendingStatus(chatRoom.id, messageId, 'sent');
      //     // // Xoá khỏi persist vì Firestore sẽ gửi về qua onSnapshot
      //     removePendingMessage(chatRoom.id, messageId);
      //   } catch (error) {
      //     updatePendingStatus(chatRoom.id, messageId, 'failed');
      //     console.log(error);
      //   }
      // }

      setValue('');
      // ⬇️ Sau khi gửi xong, cuộn xuống dưới cùng
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    console.log('FlatList dang scroll');
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;

    const distanceFromBottom =
      contentSize.height - (layoutMeasurement.height + contentOffset.y);

    const atBottom = distanceFromBottom < 120;

    setIsAtBottom(atBottom); // ngưỡng 20px
    if (atBottom) {
      setHasNewMessage(false); // đang ở đáy thì ẩn nút
    }
  };
  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
    setHasNewMessage(false);
    setIsAtBottom(true);
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
              paddingBottom: insets.bottom + 80,
            }}
            data={messages}
            renderItem={({ item, index }) => (
              <MessageContentComponent
                showBlockTime={shouldShowBlockTime(messages[index - 1], item)}
                shouldShowSmallTime={shouldShowSmallTime(
                  messages[index - 1],
                  item,
                  messages[index + 1],
                  index,
                  messages.length,
                )}
                isEndOfTimeBlock={isEndOfTimeBlock(messages[index + 1], item)}
                msg={item}
                messages={messages}
                type={chatRoom.type}
                readStatus={readStatus}
                members={members}
              />
            )}
            ref={flatListRef}
            onScroll={handleScroll}
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
            <EmojiNormal
              size={sizes.extraTitle}
              color={colors.background}
              variant="Bold"
            />
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
                  size={sizes.extraTitle}
                  color={colors.background}
                  variant="Bold"
                />
                <SpaceComponent width={16} />
                <Image
                  size={sizes.extraTitle}
                  color={colors.background}
                  variant="Bold"
                />
              </>
            ) : (
              <Send2
                size={sizes.extraTitle}
                color={colors.background}
                variant="Bold"
                onPress={handleSendMessage}
              />
            )}
          </RowComponent>
        </SectionComponent>
      </Container>
    </SafeAreaView>
  );
};

export default MessageDetailScreen;
