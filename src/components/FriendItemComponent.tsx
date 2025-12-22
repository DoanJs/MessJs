import {
  doc,
  onSnapshot,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { AddCircle, More } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  AvatarComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '.';
import { db } from '../../firebase.config';
import { colors } from '../constants/colors';
import { setDocData } from '../constants/firebase/setDocData';
import { addMemberToGroup } from '../constants/functions';
import { makeContactId } from '../constants/makeContactId';
import { sizes } from '../constants/sizes';
import { useFriendState } from '../hooks/useFriendState';
import { UserModel } from '../models';
import { useBlockStore, useUserStore } from '../zustand';

interface Props {
  friend: UserModel;
  setInfoModal: any;
  isMember?: boolean | undefined;
  roomId?: string;
  friendRole?: 'owner' | 'admin' | 'member' | null;
  userRole?: 'owner' | 'admin' | 'member' | null;
}

const FriendItemComponent = (props: Props) => {
  const {
    friend,
    setInfoModal,
    isMember = undefined,
    roomId,
    friendRole,
    userRole,
  } = props;
  const navigation: any = useNavigation();
  const { user } = useUserStore();
  const friendState = useFriendState(friend.id as string);
  const [loadingAddMember, setLoadingAddMember] = useState(false);

  //Lắng nghe xem người khác chặn mình
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

        useBlockStore.getState().setBlockedMe(map);
      },
    );

    // Cleanup listener khi component unmount
    return () => {
      unsubBlockedMe();
    };
  }, [user?.id, friend.id]);

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
        if (friend.id === user?.id) {
          navigation.navigate('Main', {
            screen: 'Profile',
          });
        } else {
          navigation.navigate('MessageDetailScreen', {
            type: 'private',
            friend,
            chatRoomId: makeContactId(user?.id as string, friend.id),
            members: [],
          });
        }
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
  const handleAddMemberGroup = async () => {
    setLoadingAddMember(true);
    try {
      await addMemberToGroup({
        roomId: roomId as string,
        targetUid: friend.id,
      });
      setLoadingAddMember(false);
    } catch (error) {
      setLoadingAddMember(false);
      console.log(error);
    }
  };

  return (
    <RowComponent justify="space-between" styles={{ marginVertical: 10 }}>
      <RowComponent onPress={onNavigateDetail} styles={{ flex: 1 }}>
        <AvatarComponent size={sizes.header} uri={friend.photoURL} />
        <SpaceComponent width={10} />
        <View>
          <TextComponent text={friend.displayName} numberOfLine={1} />
          {friendRole && (
            <TextComponent
              text={
                friendRole === 'owner'
                  ? 'Trưởng nhóm'
                  : friendRole === 'admin'
                  ? 'Phó nhóm'
                  : 'Thành viên'
              }
              numberOfLine={1}
              color={colors.textBold}
              size={sizes.smallText}
            />
          )}
        </View>
      </RowComponent>

      {setInfoModal &&
        (user?.id !== friend.id ? (
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
                  friend,

                  friendRole,
                  userRole,
                  roomId,
                })
              }
            />
          </RowComponent>
        ) : (
          <TextComponent
            text="Bạn"
            color={colors.textBold}
            styles={{ fontStyle: 'italic' }}
          />
        ))}
      {isMember !== undefined &&
        (!isMember ? (
          loadingAddMember ? (
            <ActivityIndicator />
          ) : (
            <AddCircle
              size={sizes.title}
              variant="Bold"
              color={colors.textBold}
              onPress={handleAddMemberGroup}
            />
          )
        ) : (
          <TextComponent
            text="Thành viên nhóm"
            color={colors.textBold}
            styles={{
              fontStyle: 'italic',
            }}
          />
        ))}
    </RowComponent>
  );
};

export default FriendItemComponent;
