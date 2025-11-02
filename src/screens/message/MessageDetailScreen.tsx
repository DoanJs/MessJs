import {
  addDoc,
  collection,
  doc,
  getDoc,
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
import moment from 'moment';
import React, { useState } from 'react';
import { FlatList } from 'react-native';
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
import { colors } from '../../constants/colors';
import { fontFamillies } from '../../constants/fontFamilies';
import { makeContactId } from '../../constants/makeContactId';
import { sizes } from '../../constants/sizes';
import { useUserStore } from '../../zustand';

const MessageDetailScreen = ({ route }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const { type, friend } = route.params;
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    setIsLoading(true);
    const id = makeContactId(user?.id as string, friend.id);
    try {
      const docSnap = await getDoc(doc(db, 'chatRooms', id));
      if (docSnap.exists()) {
        await addDoc(
          collection(
            db,
            `chatRooms/${id}/batches/${docSnap.data()?.lastBatchId}/messages`,
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

        await updateDoc(doc(db, `chatRooms/${id}/batches`, docSnap.data()?.lastBatchId), {
          batchInfo: {
            count: 2,
            date:  moment().format('YYYY-MM-DD'),
          }
        })
        
        await updateDoc(doc(db, `chatRooms`, id), {
          lastMessageText: value, 
          lastMessageAt: serverTimestamp(),
          lastSenderId: user?.id
        })



      } else {
        const batchId = `${moment().format('YYYY-MM-DD')}-01`;
        const dataChatRoom = {
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
          lastBatchId: batchId,
          // readStatus: ,
        };

        setDoc(doc(db, 'chatRooms', id), dataChatRoom, { merge: true }).then(
          () => {
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
              doc(db, `chatRooms/${id}/batches`, batchId),
              {
                id: batchId,
                batchInfo: {
                  count: 1,
                  date: moment().format('YYYY-MM-DD'),
                },
              },
              { merge: true },
            ).then(() => {
              addDoc(
                collection(db, `chatRooms/${id}/batches/${batchId}/messages`),
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
          },
        );
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }

    setValue('')
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
            data={Array.from({ length: 10 })}
            renderItem={({ item }) => (
              <MessageContentComponent position="left" />
            )}
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
