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
import { useBadgeStore, useChatRoomStore } from '../../zustand';
import { useNavigation } from '@react-navigation/native';

const ContactGroup = () => {
  const navigation: any = useNavigation()
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false); // loading khi kéo xuống
  const { chatRooms } = useChatRoomStore();
  const { badges } = useBadgeStore();
  const chatGroups = chatRooms.filter(_ => _.type === 'group') ?? [];

  const onRefresh = () => {
    setRefreshing(true);
    try {
      // if (userCurrent) {
      //   getDocsData({
      //     nameCollect: 'chatRooms',
      //     condition: [where('memberIds', 'array-contains', userCurrent.uid)],
      //     setData: setChatRooms,
      //   });
      // }
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
        onPress={() => navigation.navigate('AddGroupScreen')}
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
          text={`Nhóm đang tham gia (${chatGroups.length})`}
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
        data={chatGroups}
        renderItem={({ item }) => (
          <MessageItemComponent chatRoom={item} count={badges[item.id]} />
        )}
        ListFooterComponent={<View style={{ height: insets.bottom + 100 }} />}
      />
    </View>
  );
};

export default ContactGroup;
