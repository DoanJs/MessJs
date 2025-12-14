import {
  doc,
  onSnapshot,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { More } from 'iconsax-react-native';
import React, { useEffect } from 'react';
import {
  AvatarComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '.';
import { db } from '../../firebase.config';
import { colors } from '../constants/colors';
import { setDocData } from '../constants/firebase/setDocData';
import { makeContactId } from '../constants/makeContactId';
import { sizes } from '../constants/sizes';
import { useFriendState } from '../hooks/useFriendState';
import { UserModel } from '../models';
import { useBlockStore, useFriendShipStore, useUserStore } from '../zustand';

interface Props {
  friend: UserModel;
  setInfoModal: any;
}

const FriendItemComponent = (props: Props) => {
  const { friend, setInfoModal } = props;
  const navigation: any = useNavigation();
  const { user } = useUserStore();
  const friendState = useFriendState(friend.id as string);
  const setBlockedMe = useBlockStore(s => s.setBlockedMe);  

  useEffect(() => {
    if (!user?.id || !friend.id) return;

    // 2️⃣ Người khác chặn mình
    const unsubBlockedMe = onSnapshot(
      doc(db, `blocks/${friend.id}/blocked/${user.id}`),
      snap => {
        const map: Record<string, true> = {};

        if (snap.exists()) {
          map[friend.id] = true;
        }

        setBlockedMe(map);
      },
    );

    // Cleanup listener khi component unmount
    return () => {
      unsubBlockedMe();
    };
  }, [user?.id]);

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
    if (!user) return 'Người lạ';

    let result = '';

    switch (friendState) {
      case 'blocked_me':
        result = 'Đã chặn bạn';
        break;
      case 'blocked_by_me':
        result = 'Bạn đã chặn';
        break;
      case 'pending_in':
        result = 'Có yêu cầu kết bạn';
        break;
      case 'pending_out':
        result = 'Bạn đã gửi kết bạn';
        break;
      case 'friend':
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
            friendState === 'blocked_by_me' || friendState === 'blocked_me'
              ? colors.red
              : colors.textBold
          }
        />
        <SpaceComponent width={10} />
        <More
          size={sizes.title}
          variant="Bold"
          color={colors.textBold}
          onPress={() =>
            setInfoModal({
              visibleModal: true,
              status: friendState,
              fromUser: 'friendRequest?.from === user?.id',
              friend,
            })
          }
        />
      </RowComponent>
    </RowComponent>
  );
};

export default FriendItemComponent;
