import { Profile2User } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityLoadingComponent,
  FriendItemComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import { ActionModal } from '../../components/modals';
import { colors } from '../../constants/colors';
import { sizes } from '../../constants/sizes';
import { useFriendShipStore, useUsersStore, useUserStore } from '../../zustand';

const ContactPrivate = () => {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const { users } = useUsersStore();
  const [type, setType] = useState('Tất cả');
  const [friends, setFriends] = useState(
    users.filter(_ => _.email !== user?.email), //them field phai la friend, con chua la frien thi thoi
  );
  const { friendShips } = useFriendShipStore();

  const [infoModal, setInfoModal] = useState({
    visibleModal: false,
    status: '',
    fromUser: false,
    friend: null,
  });

  console.log(friendShips)
  if (!user) return <ActivityLoadingComponent />;
  return (
    <View>
      <RowComponent>
        <View
          style={{
            backgroundColor: colors.primaryDark,
            padding: 4,
            borderRadius: 10,
          }}
        >
          <Profile2User
            variant="Bold"
            size={sizes.title}
            color={colors.textBold}
          />
        </View>
        <SpaceComponent width={16} />
        <TextComponent text="Lời mời kết bạn" />
        <SpaceComponent width={6} />
        <TextComponent text="(17)" color={colors.gray3} />
      </RowComponent>

      <SpaceComponent height={10} />

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
            quantity: friendShips.length,
          },
          {
            title: 'Bạn mới',
            quantity: 0,
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

      <FlatList
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
        data={friendShips}
        renderItem={({ item }) => (
          <FriendItemComponent friend={item} setInfoModal={setInfoModal} />
        )}
        ListFooterComponent={<View style={{ height: insets.bottom + 100 }} />}
      />

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
