import { Add, ScanBarcode, SearchNormal1 } from 'iconsax-react-native';
import React, { useState } from 'react';
import { FlatList, RefreshControl, ScrollView } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  Container,
  MessageItemComponent,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import { colors } from '../../constants/colors';
import { sizes } from '../../constants/sizes';

const MessageScreen = () => {
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['bottom']}
    >
      <Container
        bg={colors.primaryLight}
        title={
          <RowComponent styles={{ flex: 1 }} onPress={() => {}}>
            <SearchNormal1 size={sizes.bigTitle} color={colors.background} />
            <SpaceComponent width={16} />
            <TextComponent text="Tìm kiếm" color={colors.background} />
          </RowComponent>
        }
        right={
          <RowComponent>
            <ScanBarcode
              size={sizes.bigTitle}
              color={colors.background}
              onPress={() => {}}
              variant='Bold'
            />
            <SpaceComponent width={16} />
            <Add
              size={sizes.bigTitle}
              color={colors.background}
              onPress={() => {}}
              variant='Bold'
            />
          </RowComponent>
        }
      >
        <SectionComponent
          styles={{
            backgroundColor: colors.background,
            flex: 1,
            paddingTop: 10,
          }}
        >
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
          />
        </SectionComponent>
      </Container>
    </SafeAreaView>
  );
};

export default MessageScreen;
