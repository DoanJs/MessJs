import React from 'react';
import { View } from 'react-native';
import {
  AvatarComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '.';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';
import { MessageModel, UserModel } from '../models';
import { useUsersStore, useUserStore } from '../zustand';
import { convertInfoUserFromID } from '../constants/convertData';

interface Props {
  msg: MessageModel;
  messages: MessageModel[];
  type: string
}

const MessageContentComponent = (props: Props) => {
  const { user } = useUserStore();
  const { users } = useUsersStore();
  const { msg, messages, type } = props;

  // Tìm tin cuối cùng (cuối danh sách) mà người gửi là chính bạn
  const lastSentByUser = [...messages]
    .reverse()
    .find(m => m.senderId === user?.id && m.status === 'sent');

  // Tìm tin hiển thị avatar đối với 2 tin liên tiếp
  const showAvatar = () => {
    const index = messages.findIndex(_ => _.id === msg.id);
    const nextMessage = messages[index + 1];
    const isShow = !nextMessage || nextMessage.senderId !== msg.senderId;

    return isShow;
  };
  const showDisplayName = () => {
    const index = messages.findIndex(_ => _.id === msg.id);
    const nextMessage = messages[index - 1];
    const isShow = !nextMessage || nextMessage.senderId !== msg.senderId;

    return isShow;
  };

  return (
    <RowComponent
      justify={user?.id === msg.senderId ? 'flex-end' : 'flex-start'}
      styles={{ alignItems: showAvatar() ? 'center' : 'flex-start' }}
    >
      {user?.id !== msg.senderId && (
        <>
          {showAvatar() ? (
            <AvatarComponent
              size={26}
              uri={convertInfoUserFromID(msg.senderId, users)?.photoURL}
            />
          ) : (
            <SpaceComponent height={26} width={26} />
          )}
          <SpaceComponent width={10} />
        </>
      )}
      <View
        style={{
          maxWidth: '70%',
        }}
      >
        {type === 'group' && user?.id !== msg.senderId && showDisplayName() && (
          <RowComponent justify="flex-start" styles={{ width: '100%' }}>
            <TextComponent
              text={
                convertInfoUserFromID(msg.senderId, users)
                  ?.displayName as string
              }
              size={sizes.smallText}
              color="coral"
            />
          </RowComponent>
        )}
        <RowComponent
          styles={{
            flexDirection: 'column',
            backgroundColor:
              user?.id !== msg.senderId
                ? colors.gray + '80'
                : colors.primaryBold,
            padding: 10,
            borderRadius: 10,
          }}
        >
          <TextComponent
            text={msg.text}
            styles={{
              textAlign: 'justify',
              color:
                user?.id !== msg.senderId ? colors.text : colors.background,
            }}
          />
        </RowComponent>
        <RowComponent justify="flex-end">
          {(msg.status === 'failed' ||
            msg.status === 'pending' ||
            (msg.status === 'sent' && msg.id === lastSentByUser?.id)) && (
            <TextComponent
              text={
                msg.status === 'failed'
                  ? '❌ Lỗi gửi'
                  : msg.status === 'pending'
                  ? 'Đang gửi'
                  : 'Đã gửi'
              }
              size={sizes.extraComment}
            />
          )}
        </RowComponent>
        <SpaceComponent height={4} />
        {/* <RowComponent
          styles={{
            flexDirection: 'column',
            backgroundColor:
              user?.id !== msg.senderId
                ? colors.gray + '80'
                : colors.primaryBold,
            padding: 10,
            borderRadius: 10,
          }}
        >
          <TextComponent
            text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime, enim earum eius accusantium ullam quasi quam! Omnis ipsa provident a qui deleniti reiciendis ut atque adipisci, doloribus dicta corrupti enim."
            styles={{ textAlign: 'justify' }}
          />
        </RowComponent> */}
      </View>
    </RowComponent>
  );
};

export default MessageContentComponent;
