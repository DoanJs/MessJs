import { serverTimestamp } from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Call, Video } from 'iconsax-react-native';
import React from 'react';
import {
  AvatarComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '.';
import { colors } from '../constants/colors';
import { setDocData } from '../constants/firebase/setDocData';
import { makeContactId } from '../constants/makeContactId';
import { sizes } from '../constants/sizes';
import { UserModel } from '../models';
import { useUserStore } from '../zustand';

interface Props {
  friend: UserModel;
}

const FriendItemComponent = (props: Props) => {
  const { friend } = props;
  const navigation: any = useNavigation();
  const { user } = useUserStore();

  const onNavigateDetail = () => {
    try {
      setDocData({
        nameCollect: 'contacts',
        id: makeContactId(user?.id as string, friend.id),
        valueUpdate: {
          userA: user?.id,
          userB: friend.id,
          status: 'create',
          createAt: serverTimestamp(),
          lastContactAt: serverTimestamp(),
        },
      }).then(() => {
        navigation.navigate('MessageDetailScreen', {
          type: 'private',
          friend,
          chatRoom: {
            id: makeContactId(user?.id as string, friend.id)
          },
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <RowComponent justify="space-between" styles={{ marginVertical: 10 }}>
      <RowComponent onPress={onNavigateDetail}>
        <AvatarComponent size={sizes.header} uri={friend.photoURL} />
        <SpaceComponent width={10} />
        <TextComponent text={friend.displayName} />
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
