import { Profile2User } from 'iconsax-react-native';
import React, { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MessageItemComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import { colors } from '../../constants/colors';
import { fontFamillies } from '../../constants/fontFamilies';
import { sizes } from '../../constants/sizes';

const ContactGroup = () => {
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
      <RowComponent
        styles={{
          paddingBottom: 10,
          borderBottomColor: colors.gray2,
          borderBottomWidth: 1,
        }}
        onPress={() => {}}
      >
        <View
          style={{
            backgroundColor: colors.gray2,
            borderRadius: 100,
            padding: 10,
          }}
        >
          <Profile2User
            size={sizes.title}
            color={colors.textBold}
            variant="Bold"
          />
        </View>
        <SpaceComponent width={10} />
        <TextComponent text="Tạo nhóm" />
      </RowComponent>

      <RowComponent>
        <TextComponent
          text="Nhóm đang tham gia (38)"
          size={sizes.smallText}
          font={fontFamillies.poppinsBold}
        />
      </RowComponent>

      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        data={Array.from({ length: 20 })}
        renderItem={({ item }) => <MessageItemComponent type={'group'} />}
        ListFooterComponent={<View style={{ height: insets.bottom + 100 }} />}
      />
    </View>
  );
};

export default ContactGroup;
