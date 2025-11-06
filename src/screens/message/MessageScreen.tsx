import { onSnapshot } from '@react-native-firebase/firestore';
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
import { AddRoomModal } from '../../components/modals';
import { colors } from '../../constants/colors';
import { getDocData } from '../../constants/firebase/getDocData';
import { getDocsData } from '../../constants/firebase/getDocsData';
import { q_chatRoomsWithMember } from '../../constants/firebase/query';
import { sizes } from '../../constants/sizes';
import { useUsersStore, useUserStore } from '../../zustand';

const MessageScreen = () => {
  const insets = useSafeAreaInsets();
  const userServer = auth.currentUser;
  const { setUser } = useUserStore();
  const { setUsers } = useUsersStore();
  const [rooms, setRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // loading khi kéo xuống
  const [isVisibleAddRoom, setIsVisibleAddRoom] = useState(false);

  useEffect(() => {
    if (!userServer) return;
    // Gộp phần setUser trong zustand ở đây luôn
    getDocData({
      id: userServer.uid,
      nameCollect: 'users',
      setData: setUser,
    });

    getDocsData({
      nameCollect: 'users',
      setData: setUsers,
    });
    // Lắng nghe realtime
    const unsubscribe = onSnapshot(
      q_chatRoomsWithMember(userServer.uid),
      snapshot => {
        const data = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRooms(
          data.sort((a: any, b: any) => b.lastMessageAt - a.lastMessageAt),
        );
      },
      error => {
        console.error('Error listening chatRooms:', error);
      },
    );

    // Cleanup listener khi component unmount
    return () => unsubscribe();
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
              onPress={() => setIsVisibleAddRoom(true)}
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
            data={rooms}
            renderItem={({ item: chatRoom }) => (
              <MessageItemComponent chatRoom={chatRoom} />
            )}
          />
        </SectionComponent>
      </Container>

      <AddRoomModal
        visible={isVisibleAddRoom}
        onChange={val => {}}
        onClose={() => setIsVisibleAddRoom(false)}
      />
    </SafeAreaView>
  );
};

export default MessageScreen;
