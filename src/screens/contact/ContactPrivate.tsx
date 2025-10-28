import { Profile2User } from 'iconsax-react-native';
import React, { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FriendItemComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import { colors } from '../../constants/colors';
import { sizes } from '../../constants/sizes';

const ContactPrivate = () => {
  const [type, setType] = useState('Tất cả');
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false); // loading khi kéo xuống

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
            quantity: 300,
          },
          {
            title: 'Bạn mới',
            quantity: 3,
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
        data={Array.from({ length: 20 })}
        renderItem={({ item }) => <FriendItemComponent />}
        ListFooterComponent={<View style={{ height: insets.bottom + 100 }} />}
      />
    </View>
  );
};

export default ContactPrivate;
