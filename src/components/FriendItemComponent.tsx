import { serverTimestamp } from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { More } from 'iconsax-react-native';
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
import useFriendRequestStore from '../zustand/useFriendRequestStore';

interface Props {
  friend: UserModel;
  setInfoModal: any;
}

const FriendItemComponent = (props: Props) => {
  const { friend, setInfoModal } = props;
  const navigation: any = useNavigation();
  const { user } = useUserStore();
  const { friendRequests } = useFriendRequestStore();
  const friendRequest = friendRequests.find(
    _ => _.id === makeContactId(user?.id as string, friend.id),
  );

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
            id: makeContactId(user?.id as string, friend.id),
          },
          members: [],
        });
      });
    } catch (error) {
      console.log(error);
    }
  };
  const showStatus = () => {
    if (!friendRequest || !user) return 'Người lạ';

    let result = '';
    const status = friendRequest.status;
    const fromUser = friendRequest.from === user.id;

    switch (status) {
      case 'pending':
        if (fromUser) {
          result = 'Bạn đã gửi kết bạn';
        } else {
          result = 'Có yêu cầu kết bạn';
        }
        break;

      case 'denied':
        if (fromUser) {
          result = 'Bạn đã chặn';
        } else {
          result = 'Đã chặn bạn';
        }
        break;

      case 'accepted':
        result = 'Bạn bè';
        break;

      default:
        result = 'Kết bạn';
        break;
    }

    return result;
  };

  return (
    <RowComponent justify="space-between" styles={{ marginVertical: 10 }}>
      <RowComponent onPress={onNavigateDetail} styles={{ flex: 1 }}>
        <AvatarComponent size={sizes.header} uri={friend.photoURL} />
        <SpaceComponent width={10} />
        <TextComponent text={friend.displayName} numberOfLine={1} />
      </RowComponent>
      <RowComponent styles={{ paddingHorizontal: 10 }}>
        <TextComponent
          text={showStatus()}
          styles={{ fontStyle: 'italic' }}
          color={
            friendRequest?.status === 'denied' ? colors.red : colors.textBold
          }
        />
        <SpaceComponent width={20} />
        <More
          size={sizes.title}
          variant="Bold"
          color={colors.textBold}
          onPress={() =>
            setInfoModal({
              visibleModal: true,
              status: friendRequest?.status,
              fromUser: friendRequest?.from === user?.id,
              friend,
            })
          }
        />
      </RowComponent>
    </RowComponent>
  );
};

export default FriendItemComponent;
