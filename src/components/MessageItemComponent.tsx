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
import { colors } from '../constants/colors';
import { convertTimeStampFirestore } from '../constants/convertData';
import { getDocData } from '../constants/firebase/getDocData';
import { makeContactId } from '../constants/makeContactId';
import { sizes } from '../constants/sizes';
import { UserModel } from '../models';
import { ChatRoomModel } from '../models/ChatRoomModel';
import { useUserStore } from '../zustand';

interface Props {
  chatRoom: ChatRoomModel;
}
const MessageItemComponent = (props: Props) => {
  const navigation: any = useNavigation();
  const { chatRoom } = props;
  const { user } = useUserStore();
  const [friend, setFriend] = useState<UserModel>();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);


  useEffect(() => {
    if (chatRoom) {
      const friendId = chatRoom.memberIds.filter(_ => _ !== user?.id)[0];
      if (friendId) {
        getDocData({
          nameCollect: 'users',
          id: friendId,
          setData: setFriend,
        });
      }
    }
  }, [chatRoom]);

  if (!friend || !user) return <ActivityLoadingComponent />;
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
          friend,
          chatRoomId: makeContactId(user.id, friend.id),
        })
      }
    >
      {chatRoom.type === 'group' ? (
        <AvatarGroupComponent />
      ) : (
        <AvatarComponent uri={friend.photoURL} />
      )}
      <SpaceComponent width={16} />
      <RowComponent
        styles={{
          flexDirection: 'column',
          flex: 1,
          alignItems: 'flex-start',
        }}
      >
        <TextComponent text={`${friend.displayName}`} size={sizes.bigText} />
        <TextComponent
          text={chatRoom.lastMessageText}
          color={colors.gray3}
          numberOfLine={1}
        />
      </RowComponent>
      <SpaceComponent width={10} />
      <TextComponent
        text={`${convertTimeStampFirestore(chatRoom.lastMessageAt).timeAgo(now)}`}
        color={colors.gray3}
        size={sizes.smallText}
      />
    </RowComponent>
  );
};

export default MessageItemComponent;
