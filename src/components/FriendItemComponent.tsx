import { Call, Video } from 'iconsax-react-native';
import React from 'react';
import {
  AvatarComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '.';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';

const FriendItemComponent = () => {
  return (
    <RowComponent justify="space-between" styles={{marginVertical: 10}}>
      <RowComponent onPress={() => {}}>
        <AvatarComponent size={sizes.header} />
        <SpaceComponent width={10} />
        <TextComponent text="Nguyen Dang Quang" />
      </RowComponent>
      <RowComponent>
        <Call size={sizes.smallTitle} color={colors.gray3} onPress={() => {}} />
        <SpaceComponent width={16} />
        <Video
          size={sizes.smallTitle}
          color={colors.gray3}
          onPress={() => {}}
        />
      </RowComponent>
    </RowComponent>
  );
};

export default FriendItemComponent;
