import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
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
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
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
import { fontFamillies } from '../../constants/fontFamilies';
import { makeContactId } from '../../constants/makeContactId';
import { sizes } from '../../constants/sizes';
import { useUserStore } from '../../zustand';

const MessageDetailScreen = ({ route }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const { type, friend, chatRoomId } = route.params;
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastBatchId, setLastBatchId] = useState<string | null>(null);
  const [messages, setMessages] = useState([]);

  const [loadingOld, setLoadingOld] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (chatRoomId) {
      getCurrentBatch();
    }
  }, [chatRoomId]);

  // 🧩 Lắng nghe thay đổi lastBatchId trong chatRoom
  useEffect(() => {
    if (!chatRoomId) return;
    const chatRoomRef = doc(db, 'chatRooms', chatRoomId);

    const unsubRoom = onSnapshot(chatRoomRef, snap => {
      const data = snap.data();
      if (!data) return;

      if (data.lastBatchId && data.lastBatchId !== lastBatchId) {
        console.log('🔄 Chuyển batch:', data.lastBatchId);
        setLastBatchId(data.lastBatchId); // tự động chuyển sang batch mới
      }
    });

    return () => unsubRoom();
  }, [chatRoomId, lastBatchId]);

  useEffect(() => {
    if (!chatRoomId || !lastBatchId) return;

    const messagesRef = collection(
      db,
      'chatRooms',
      chatRoomId,
      'batches',
      lastBatchId,
      'messages',
    );

    const q = query(messagesRef, orderBy('createAt', 'asc'));

    // 🔥 Đăng ký lắng nghe realtime
    const unsubscribe = onSnapshot(q, snapshot => {
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
      // setMessages(msgs);
      // ⚡ nối thêm tin nhắn mới, tránh mất tin batch cũ
      setMessages((prevMessages): any => {
        // 1️⃣ Lấy danh sách id hiện có
        const existingIds = prevMessages.map((m: any) => m.id);

        // 2️⃣ Lọc ra những tin nhắn mới chưa có trong danh sách
        const newMessages = msgs.filter(
          (m: any) => !existingIds.includes(m.id),
        );

        // 3️⃣ Ghép hai mảng lại
        const allMessages = [...prevMessages, ...newMessages];

        // 4️⃣ Sắp xếp lại theo thời gian
        allMessages.sort((a, b) => a.createdAt - b.createdAt);

        // 5️⃣ Trả về mảng mới để React cập nhật state
        return allMessages;
      });
    });

    console.log('Listening to batch:', lastBatchId);

    // 🧹 Hủy đăng ký khi batchId đổi hoặc component unmount
    return () => {
      console.log('Unsubscribed from batch:', lastBatchId);
      unsubscribe();
    };
  }, [chatRoomId, lastBatchId]); // <– dependency quan trọng

  const getCurrentBatch = async () => {
    const snapshot = await getDoc(doc(db, 'chatRooms', chatRoomId));

    if (snapshot.exists()) {
      setLastBatchId(snapshot.data()?.lastBatchId);
    }
  };

  const handleSendMessage = async () => {
    setIsLoading(true);
    const id = makeContactId(user?.id as string, friend.id);

    if (type === 'private') {
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
            batchInfo = createNewBatch(batchInfo);
            // Tạo batch tiep theo
            await setDoc(
              doc(db, `chatRooms/${id}/batches`, batchInfo.id),
              {
                id: batchInfo.id,
                messageCount: 0,
                preBatchId: `${batchInfo.id.slice(0, 10)}-${String(
                  Number(batchInfo.id.slice(-2)) - 1,
                ).padStart(2, '0')}`,
                nextBatchId: null,
              },
              { merge: true },
            );

            await updateDoc(
              doc(
                db,
                `chatRooms/${id}/batches`,
                `${batchInfo.id.slice(0, 10)}-${String(
                  Number(batchInfo.id.slice(-2)) - 1,
                ).padStart(2, '0')}`,
              ),
              {
                nextBatchId: batchInfo.id,
              },
            );
          }

          await addDoc(
            collection(db, `chatRooms/${id}/batches/${batchInfo.id}/messages`),
            {
              senderId: user?.id,
              type: 'text',
              text: value,
              mediaURL: '',
              createAt: serverTimestamp(),
              status: 'pending',
            },
          );

          await updateDoc(doc(db, `chatRooms/${id}/batches`, batchInfo.id), {
            messageCount: increment(1),
          });

          await updateDoc(doc(db, `chatRooms`, id), {
            lastMessageText: value,
            lastMessageAt: serverTimestamp(),
            lastSenderId: user?.id,
            lastBatchId: batchInfo.id,
          });
        } else {
          const batchInfo = createNewBatch(null);

          setDoc(
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
              memberCount: 2,
              lastBatchId: batchInfo.id,
              // readStatus: ,
            },
            { merge: true },
          ).then(() => {
            // Tạo members
            const members = [
              {
                id: user?.id,
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
            Promise.all(promiseMember);

            // Tạo batch đầu tiên

            setDoc(
              doc(db, `chatRooms/${id}/batches`, batchInfo.id),
              {
                id: batchInfo.id,
                messageCount: 1,
                preBatchId: null,
                nextBatchId: `${batchInfo.id.slice(0, 10)}-${String(
                  Number(batchInfo.id.slice(-2)) + 1,
                ).padStart(2, '0')}`,
              },
              { merge: true },
            ).then(() => {
              addDoc(
                collection(
                  db,
                  `chatRooms/${id}/batches/${batchInfo.id}/messages`,
                ),
                {
                  senderId: user?.id,
                  type: 'text',
                  text: value,
                  mediaURL: '',
                  createAt: serverTimestamp(),
                  status: 'pending',
                },
              );
            });
          });
        }

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      }
    } else {
      console.log('group');
    }

    setValue('');
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
            renderItem={({ item }) => <MessageContentComponent msg={item} />}
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

      <SpinnerComponent loading={isLoading} />
    </SafeAreaView>
  );
};

export default MessageDetailScreen;
