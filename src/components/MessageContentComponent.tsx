import React from 'react';
import { View } from 'react-native';
import {
  AvatarComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '.';
import { colors } from '../constants/colors';
import { MessageModel } from '../models';
import { useUserStore } from '../zustand';

interface Props {
  msg: MessageModel;
}

const MessageContentComponent = (props: Props) => {
  const { user } = useUserStore();
  const { msg } = props;
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
            styles={{ textAlign: 'justify' }}
          />
        </RowComponent>
        <SpaceComponent height={8} />
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
