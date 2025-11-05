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
import { MessageModel } from '../models';
import { useUserStore } from '../zustand';

interface Props {
  msg: MessageModel;
  messages: MessageModel[];
}

const MessageContentComponent = (props: Props) => {
  const { user } = useUserStore();
  const { msg, messages } = props;

  // Tìm tin cuối cùng (cuối danh sách) mà người gửi là chính bạn
  const lastSentByUser = [...messages]
    .reverse()
    .find(m => m.senderId === user?.id && m.status === 'sent');

  return (
    <RowComponent
      justify={user?.id === msg.senderId ? 'flex-end' : 'flex-start'}
      styles={{ alignItems: 'flex-start' }}
    >
      {user?.id !== msg.senderId && (
        <>
          <AvatarComponent size={30} />
          <SpaceComponent width={10} />
        </>
      )}
      <View
        style={{
          maxWidth: '70%',
        }}
      >
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
