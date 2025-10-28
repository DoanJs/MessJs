import React from 'react';
import { View } from 'react-native';
import {
  AvatarComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '.';
import { colors } from '../constants/colors';

interface Props {
  position: 'left' | 'right';
}

const MessageContentComponent = (props: Props) => {
  const { position } = props;
  return (
    <RowComponent
      justify={position === 'left' ? 'flex-start' : 'flex-end'}
      styles={{ alignItems: 'flex-start', marginBottom: 10 }}
    >
      {position === 'left' && (
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
              position === 'left' ? colors.gray + '80' : colors.primaryBold,
            padding: 10,
            borderRadius: 10,
          }}
        >
          <TextComponent
            text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime, enim earum eius accusantium ullam quasi quam! Omnis ipsa provident a qui deleniti reiciendis ut atque adipisci, doloribus dicta corrupti enim."
            styles={{ textAlign: 'justify' }}
          />
        </RowComponent>
        <SpaceComponent height={4} />
        <RowComponent
          styles={{
            flexDirection: 'column',
            backgroundColor:
              position === 'left' ? colors.gray + '80' : colors.primaryBold,
            padding: 10,
            borderRadius: 10,
          }}
        >
          <TextComponent
            text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime, enim earum eius accusantium ullam quasi quam! Omnis ipsa provident a qui deleniti reiciendis ut atque adipisci, doloribus dicta corrupti enim."
            styles={{ textAlign: 'justify' }}
          />
        </RowComponent>
      </View>
    </RowComponent>
  );
};

export default MessageContentComponent;
