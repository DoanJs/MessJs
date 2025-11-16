import {
  collection,
  getDocs,
  query,
  where,
} from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
  ActivityLoadingComponent,
  AvatarComponent,
  AvatarGroupComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '.';
import { auth, db } from '../../firebase.config';
import { colors } from '../constants/colors';
import { convertTimeStampFirestore } from '../constants/convertData';
import { fontFamillies } from '../constants/fontFamilies';
import { sizes } from '../constants/sizes';
import { UserModel } from '../models';
import { ChatRoomModel } from '../models/ChatRoomModel';

interface Props {
  chatRoom: ChatRoomModel;
  count: number;
}
const MessageItemComponent = (props: Props) => {
  const navigation: any = useNavigation();
  const { chatRoom, count } = props;
  const userServer = auth.currentUser;
  const [friend, setFriend] = useState<UserModel>();
  const [members, setMembers] = useState([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!chatRoom) return;

    let cancelled = false;

    const fetchMembers = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('id', 'in', chatRoom.memberIds),
        );

        const snapshot = await getDocs(q);
        if (cancelled) return;

        const members = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMembers(members);
      } catch (error) {
        console.error('Lỗi lấy thành viên:', error);
      }
    };

    fetchMembers();

    return () => {
      cancelled = true;
    };
  }, [chatRoom]);

  useEffect(() => {
    if (members.length > 0 && chatRoom.type === 'private') {
      setFriend(handleGetFriendPrivate());
    }
  }, [members]);

  const handleGetFriendPrivate = (): any => {
    const index = members.findIndex(
      (member: UserModel) => member.id !== userServer?.uid,
    );
    if (index === -1) return;
    return members[index];
  };

  
  handleGetFriendPrivate()
  if (!userServer) return <ActivityLoadingComponent />;
  return (
    <RowComponent
      styles={{
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray,
      }}
      onPress={() =>
        navigation.navigate('MessageDetailScreen', {
          type: chatRoom.type,
          friend: chatRoom.type === 'private' ? friend : null,
          chatRoom,
          members,
        })
      }
    >
      {chatRoom.type === 'group' ? (
        <AvatarGroupComponent memberGroup={members} />
      ) : (
        <AvatarComponent uri={friend?.photoURL} />
      )}
      <SpaceComponent width={16} />
      <RowComponent
        styles={{
          flexDirection: 'column',
          flex: 1,
          alignItems: 'flex-start',
        }}
      >
        <TextComponent
          text={`${
            chatRoom.type === 'private' ? friend?.displayName : chatRoom.name
          }`}
          size={sizes.bigText}
        />
        <TextComponent
          text={chatRoom.lastMessageText}
          color={count > 0 ? colors.textBold : colors.gray3}
          font={count > 0 ? fontFamillies.poppinsBold : undefined}
          numberOfLine={1}
        />
      </RowComponent>
      <SpaceComponent width={10} />
      <RowComponent
        styles={{
          flexDirection: 'column',
        }}
      >
        <TextComponent
          text={`${convertTimeStampFirestore(chatRoom.lastMessageAt).timeAgo(
            now,
          )}`}
          color={colors.gray3}
          size={sizes.smallText}
        />
        <SpaceComponent height={4} />
        <View
          style={{
            backgroundColor: count > 0 ? colors.red : colors.background,
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <TextComponent
            styles={{ color: 'white', fontWeight: 'bold' }}
            text={`${count < 9 ? count : '9+'}`}
          />
        </View>
      </RowComponent>
    </RowComponent>
  );
};

export default MessageItemComponent;
