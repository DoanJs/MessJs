import { Add, ScanBarcode, SearchNormal1 } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { auth } from '../../../firebase.config';
import {
  Container,
  MessageItemComponent,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import { colors } from '../../constants/colors';
import { getDocData } from '../../constants/firebase/getDocData';
import { sizes } from '../../constants/sizes';
import { useUserStore } from '../../zustand';

const MessageScreen = () => {
  const userServer = auth.currentUser;
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false); // loading khi kéo xuống
  const { setUser } = useUserStore();

  useEffect(() => {
    if (userServer) {
      getDocData({
        id: userServer.uid,
        nameCollect: 'users',
        setData: setUser,
      });
    }
  }, [userServer]);


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
              variant="Bold"
            />
            <SpaceComponent width={16} />
            <Add
              size={sizes.bigTitle}
              color={colors.background}
              onPress={() => {}}
              variant="Bold"
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
