import {
  doc,
  getDoc,
  increment,
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
import { FlatList } from 'react-native';
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
  SpinnerComponent,
  TextComponent,
} from '../../components';
import {
  createNewBatch,
  shouldCreateNewBatch,
} from '../../constants/checkNewBatch';
import { colors } from '../../constants/colors';
import { convertBatchId } from '../../constants/convertData';
import { q_chatRoomId, q_messagesASC } from '../../constants/firebase/query';
import { fontFamillies } from '../../constants/fontFamilies';
import { makeContactId } from '../../constants/makeContactId';
import { sizes } from '../../constants/sizes';
import { useChatStore, useUserStore } from '../../zustand';

const MessageDetailScreen = ({ route }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const { type, friend, chatRoomId } = route.params;
  const [value, setValue] = useState('');
  const [lastBatchId, setLastBatchId] = useState<string | null>(null);
  const { messagesByRoom, pendingMessages } = useChatStore();
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

  useEffect(() => {
    if (chatRoomId) {
      getCurrentBatch();
    }
  }, [chatRoomId]);
  // scroll xuống dưới cùng khi vào phòng chat
  useEffect(() => {
    if (messages.length > 0) {
      // đợi 1 chút cho FlatList render xong rồi mới scroll
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages.length]);
  // Lắng nghe thay đổi lastBatchId trong chatRoom
  useEffect(() => {
    if (!chatRoomId) return;

    const unsubRoom = onSnapshot(q_chatRoomId(chatRoomId), snap => {
      const data = snap.data();
      if (!data) return;

      if (data.lastBatchId && data.lastBatchId !== lastBatchId) {
        console.log('🔄 Chuyển batch:', data.lastBatchId);
        setLastBatchId(data.lastBatchId); // tự động chuyển sang batch mới
      }
    });

    return () => unsubRoom();
  }, [chatRoomId]);
  useEffect(() => {
    if (!chatRoomId || !lastBatchId) return;

    // 🔥 Đăng ký lắng nghe realtime
    const unsubscribe = onSnapshot(
      q_messagesASC({ chatRoomId, batchId: lastBatchId }),
      snapshot => {
        const msgs = snapshot.docs.map((doc: any) => {
          const data = doc.data();

          // convert createdAt nếu có
          const createdAt = data.createdAt
            ? data.createdAt.toDate?.() // nếu là Timestamp
            : new Date(); // fallback khi chưa có

          return {
            id: doc.id,
            ...data,
            createdAt,
          };
        });
        // ⚡ nối thêm tin nhắn mới, tránh mất tin batch cũ
        setMessagesForRoom(chatRoomId, msgs);
      },
    );

    // 🧹 Hủy đăng ký khi batchId đổi hoặc component unmount
    return () => {
      unsubscribe();
    };
  }, [chatRoomId, lastBatchId]); // <– dependency quan trọng

  const getCurrentBatch = async () => {
    const snapshot = await getDoc(q_chatRoomId(chatRoomId));

    if (snapshot.exists()) {
      setLastBatchId(snapshot.data()?.lastBatchId);
    }
  };
  const handleSendMessage = async () => {
    if (user && friend) {
      const id = makeContactId(user?.id as string, friend.id);
      const messageId = uuidv4();

      if (type === 'private') {
        // Thêm tin nhắn ở local
        addPendingMessage(id, {
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
          const docSnap = await getDoc(doc(db, 'chatRooms', id));

          if (docSnap.exists()) {
            //check xem batch nay qua ngay moi hoac day chua
            const docSnapBatch = await getDoc(
              doc(db, `chatRooms/${id}/batches`, docSnap.data()?.lastBatchId),
            );
            let batchInfo = {
              id: docSnapBatch.id,
              messageCount: docSnapBatch.data()?.messageCount,
            };

            if (shouldCreateNewBatch(batchInfo)) {
              // Tạo batchInfo (chứa batchId) tiếp theo
              batchInfo = createNewBatch(batchInfo);
              // Tạo batch mới
              await setDoc(
                doc(db, `chatRooms/${id}/batches`, batchInfo.id),
                {
                  id: batchInfo.id,
                  messageCount: 0,
                  preBatchId: convertBatchId(batchInfo, 'decrease'),
                  nextBatchId: null,
                },
                { merge: true },
              );
              // update lại nextBatchId cho batch cũ
              await updateDoc(
                doc(
                  db,
                  `chatRooms/${id}/batches`,
                  convertBatchId(batchInfo, 'decrease'),
                ),
                {
                  nextBatchId: batchInfo.id,
                },
              );
            }

            // Thêm tin nhắn vào subCollection messages
            await setDoc(
              doc(
                db,
                `chatRooms/${id}/batches/${batchInfo.id}/messages`,
                messageId,
              ),
              {
                senderId: user?.id,
                type: 'text',
                text: value,
                mediaURL: '',
                createAt: serverTimestamp(),
                status: 'sent',
              },
              { merge: true },
            );

            // Cập nhật trạng thái
            updatePendingStatus(id, messageId, 'sent');
            // // Xoá khỏi persist vì Firestore sẽ gửi về qua onSnapshot
            removePendingMessage(id, messageId);

            // Update số lượng tin nhắn trong batch (tăng thêm 1 nếu gửi tin nhắn thành công)
            await updateDoc(doc(db, `chatRooms/${id}/batches`, batchInfo.id), {
              messageCount: increment(1),
            });
            // Update lại số thông tin cần thiết trong chatRoomId để hiện thị ngoài room
            await updateDoc(doc(db, `chatRooms`, id), {
              lastMessageText: value,
              lastMessageAt: serverTimestamp(),
              lastSenderId: user?.id,
              lastBatchId: batchInfo.id,
            });
          } else {
            const batchInfo = createNewBatch(null);

            await setDoc(
              doc(db, 'chatRooms', id),
              {
                type: 'private',
                name: '',
                avatarURL: '',
                description: '',
                createdBy: user?.id,
                createAt: serverTimestamp(),
                lastMessageText: value,
                lastMessageAt: serverTimestamp(),
                lastSenderId: user?.id,

                lastBatchId: batchInfo.id,
                memberCount: 2,
                memberIds: [user.id, friend.id],
                // readStatus: ,
              },
              { merge: true },
            );

            // Tạo members subcollection cho batch/id
            const members = [
              {
                id: user.id,
                role: 'admin',
                joinedAt: serverTimestamp(),
                nickName: user?.displayName,
              },
              {
                id: friend?.id,
                role: 'member',
                joinedAt: serverTimestamp(),
                nickName: friend?.displayName,
              },
            ];

            const promiseMember = members.map(_ =>
              setDoc(doc(db, `chatRooms/${id}/members`, _.id), _, {
                merge: true,
              }),
            );
            await Promise.all(promiseMember);

            // Tạo batch đầu tiên
            await setDoc(
              doc(db, `chatRooms/${id}/batches`, batchInfo.id),
              {
                id: batchInfo.id,
                messageCount: 1,
                preBatchId: null,
                nextBatchId: convertBatchId(batchInfo, 'increase'),
              },
              { merge: true },
            );

            // Tạo messages subcollection cho batch/id
            await setDoc(
              doc(
                db,
                `chatRooms/${id}/batches/${batchInfo.id}/messages`,
                messageId,
              ),
              {
                senderId: user?.id,
                type: 'text',
                text: value,
                mediaURL: '',
                createAt: serverTimestamp(),
                status: 'sent',
              },
              { merge: true },
            );

            // Cập nhật trạng thái
            updatePendingStatus(id, messageId, 'sent');
            // // Xoá khỏi persist vì Firestore sẽ gửi về qua onSnapshot
            removePendingMessage(id, messageId);
          }
        } catch (error) {
          updatePendingStatus(id, messageId, 'failed');
          console.log(error);
        }
      } else {
        console.log('group');
      }

      setValue('');
      // ⬇️ Sau khi gửi xong, cuộn xuống dưới cùng
      flatListRef.current?.scrollToEnd({ animated: true });
    }
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
              text={friend.displayName}
              color={colors.background}
              size={sizes.bigText}
              font={fontFamillies.poppinsBold}
            />
            {type === 'group' && (
              <TextComponent
                text="15 thành viên"
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
            renderItem={({ item }) => <MessageContentComponent msg={item} messages={messages}/>}
            ref={flatListRef}
          />
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
              allowClear
              placeholder="Nhập tin nhắn"
              placeholderTextColor={colors.gray2}
              color={colors.background}
              value={value}
              onChange={val => setValue(val)}
              onSubmitEditing={handleSendMessage}
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
