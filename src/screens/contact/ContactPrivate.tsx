import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityLoadingComponent,
  FriendItemComponent,
  RowComponent,
  SpaceComponent,
  TextComponent
} from '../../components';
import { ActionModal } from '../../components/modals';
import { colors } from '../../constants/colors';
import { useFriendRequestStore, useFriendShipStore, usePendingRequestUsersStore, useUserStore } from '../../zustand';

const ContactPrivate = () => {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const [type, setType] = useState('Tất cả');
  const friendList = useFriendShipStore(s => s.friendList);
  const friendRequests = useFriendRequestStore(s => s.friendRequests);
  const [infoModal, setInfoModal] = useState({
    visibleModal: false,
    status: '',
    fromUser: false,
    friend: null,
  });
  const users = usePendingRequestUsersStore(s => s.users);
  const pendingList = Object.keys(friendRequests).map(uid => ({
    user: users[uid],
    status: friendRequests[uid],
  }));

  if (!user) return <ActivityLoadingComponent />;
  return (
    <View>
      <RowComponent
        justify="space-around"
        styles={{
          borderBottomWidth: 1,
          borderBottomColor: colors.gray2,
          paddingBottom: 10,
        }}
      >
        {[
          {
            title: 'Tất cả',
            quantity: friendList.length,
          },
          {
            title: 'Lời mời kết bạn',
            quantity: Object.values(friendRequests)
              .filter(v => v === 'pending_in')
              .length
          },
        ].map((_, index) => (
          <RowComponent
            key={index}
            styles={{
              backgroundColor:
                type === _.title ? colors.gray2 : colors.background,
              padding: 10,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: colors.gray2,
            }}
            onPress={() => setType(_.title)}
          >
            <TextComponent text={_.title} />
            <SpaceComponent width={6} />
            <TextComponent text={`${_.quantity}`} />
          </RowComponent>
        ))}
      </RowComponent>

      <SpaceComponent height={10} />
      {
        type === 'Tất cả' &&
        <FlatList
          contentContainerStyle={{
            paddingBottom: insets.bottom + 80,
          }}
          showsVerticalScrollIndicator={false}
          data={friendList}
          renderItem={({ item }) => (
            <FriendItemComponent friend={item} setInfoModal={setInfoModal} />
          )}
          ListFooterComponent={<View style={{ height: insets.bottom + 100 }} />}
        />
      }
      {
        type === 'Lời mời kết bạn' &&
        <FlatList
          contentContainerStyle={{
            paddingBottom: insets.bottom + 80,
          }}
          showsVerticalScrollIndicator={false}
          data={pendingList.filter(s =>s.status === 'pending_in')}
          renderItem={({ item }) => (
            <FriendItemComponent friend={item.user} setInfoModal={setInfoModal} />
          )}
          ListFooterComponent={<View style={{ height: insets.bottom + 100 }} />}
        />
      }

      <ActionModal
        visible={infoModal.visibleModal}
        setInfoModal={setInfoModal}
        infoModal={infoModal}
        onClose={() => setInfoModal({ ...infoModal, visibleModal: false })}
      />
    </View>
  );
};

export default ContactPrivate;
