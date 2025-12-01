import { Send2 } from 'iconsax-react-native';
import React, { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import {
  AvatarComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '.';
import { auth } from '../../firebase.config';
import { TickSvg } from '../assets/vector';
import { colors } from '../constants/colors';
import { makeContactId } from '../constants/makeContactId';
import { sizes } from '../constants/sizes';

interface Props {
  item: any;
  onSelectUser: (val: any) => void;
}

const UserForwardComponent = (props: Props) => {
  const { item, onSelectUser } = props;
  const userCurrent = auth.currentUser;
  const [isloading, setIsloading] = useState(false);
  const [isActive, setIsActive] = useState(false);

  return (
    <RowComponent
      styles={{
        paddingVertical: 12,
        borderBottomWidth: 0.3,
        borderColor: '#ccc',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <AvatarComponent uri={item.photoURL} size={sizes.smallHeader} />
      <SpaceComponent width={10} />
      <TextComponent text={item.displayName ?? item.name} flex={1} />
      {isloading ? (
        <ActivityIndicator />
      ) : isActive ? (
        <TickSvg width={sizes.extraTitle} height={sizes.extraTitle} />
      ) : (
        <Send2
          onPress={async () => {
            setIsloading(true);
            await onSelectUser({
              chatRoomId:
                item.type === 'group'
                  ? item.id
                  : makeContactId(userCurrent?.uid as string, item.id),
              friend: item.type === 'group' ? null : { id: item.id },
              type: item.type ?? 'private',
            });
            setIsloading(false);

            setIsActive(true);
          }}
          size={sizes.extraTitle}
          color={colors.textBold}
          variant="Bold"
        />
      )}
    </RowComponent>
  );
};

export default UserForwardComponent;
