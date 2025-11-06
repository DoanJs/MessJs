import {
  collection,
  getDocs,
  query,
  where,
} from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
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
import { getDocData } from '../constants/firebase/getDocData';
import { sizes } from '../constants/sizes';
import { UserModel } from '../models';
import { ChatRoomModel } from '../models/ChatRoomModel';

interface Props {
  chatRoom: ChatRoomModel;
}
const MessageItemComponent = (props: Props) => {
  const navigation: any = useNavigation();
  const { chatRoom } = props;
  const userServer = auth.currentUser;
  const [friend, setFriend] = useState<UserModel>();
  const [memberGroup, setMemberGroup] = useState([]);
  const [now, setNow] = useState(Date.now());


  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (chatRoom) {
      const friendId = chatRoom.memberIds.filter(_ => _ !== userServer?.uid)[0];
      if (chatRoom.type === 'private' && friendId) {
        getDocData({
          nameCollect: 'users',
          id: friendId,
          setData: setFriend,
        });
      } else {
        getMemberGroup(chatRoom.memberIds);
      }
    }
  }, [chatRoom]);

  const getMemberGroup = async (memberIds: string[]) => {
    const q = query(collection(db, 'users'), where('id', 'in', memberIds));

    const snapshot = await getDocs(q);
    const users = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setMemberGroup(users);
  };

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
          chatRoom
        })
      }
    >
      {chatRoom.type === 'group' ? (
        <AvatarGroupComponent memberGroup={memberGroup}/>
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
          color={colors.gray3}
          numberOfLine={1}
        />
      </RowComponent>
      <SpaceComponent width={10} />
      <TextComponent
        text={`${convertTimeStampFirestore(chatRoom.lastMessageAt).timeAgo(
          now,
        )}`}
        color={colors.gray3}
        size={sizes.smallText}
      />
    </RowComponent>
  );
};

export default MessageItemComponent;
