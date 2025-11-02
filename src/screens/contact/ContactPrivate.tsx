import { where } from '@react-native-firebase/firestore';
import { Profile2User } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityLoadingComponent,
  FriendItemComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import { colors } from '../../constants/colors';
import { getDocsData } from '../../constants/firebase/getDocsData';
import { sizes } from '../../constants/sizes';
import { useUserStore } from '../../zustand';

const ContactPrivate = () => {
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const [type, setType] = useState('Tất cả');
  const [friends, setFriends] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // loading khi kéo xuống

  useEffect(() => {
    if (user) {
      getDocsData({
        nameCollect: 'users',
        condition: [where('email', '!=', user?.email)],
        setData: setFriends,
      });
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    try {
      // getDocsData({
      //   nameCollect: 'fields',
      //   setData: setFields,
      // });
    } finally {
      setRefreshing(false);
    }
  };

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
            quantity: friends.length,
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        data={friends}
        renderItem={({ item }) => <FriendItemComponent friend={item} />}
        ListFooterComponent={<View style={{ height: insets.bottom + 100 }} />}
      />
    </View>
  );
};

export default ContactPrivate;
