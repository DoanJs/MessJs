import { doc, onSnapshot } from '@react-native-firebase/firestore';
import { Add, ScanBarcode, SearchNormal1 } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { auth, db } from '../../../firebase.config';
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
import { ChatRoomModel } from '../../models/ChatRoomModel';
type BadgeMap = { [roomId: string]: number };

const MessageScreen = () => {
  const insets = useSafeAreaInsets();
  const userServer = auth.currentUser;
  const { setUser } = useUserStore();
  const { setUsers } = useUsersStore();
  const [rooms, setRooms] = useState<ChatRoomModel[]>([]);
  const [refreshing, setRefreshing] = useState(false); // loading khi kéo xuống
  const [isVisibleAddRoom, setIsVisibleAddRoom] = useState(false);
  const [badges, setBadges] = useState<BadgeMap>({}); // { roomId: count }

  useEffect(() => {
    if (!userServer) return;
    let cancelled = false;
    // Gộp phần setUser trong zustand ở đây luôn
    (async () => {
      if (!cancelled)
        getDocData({
          id: userServer.uid,
          nameCollect: 'users',
          setData: setUser,
        });
    })();

    (async () => {
      if (!cancelled)
        getDocsData({
          nameCollect: 'users',
          setData: setUsers,
        });
    })();

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
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [userServer]);

  useEffect(() => {
    if (!rooms.length) return;

    const unsubList: any[] = [];

    // Lắng nghe từng unreadCount của user trong mỗi room
    rooms.forEach((room: any) => {
      const unreadRef = doc(
        db,
        `chatRooms/${room.id}/unreadCounts/${userServer?.uid}`,
      );
      const unsub = onSnapshot(unreadRef, snap => {
        setBadges(prev => ({
          ...prev,
          [room.id]: snap.exists() ? snap.data()?.count || 0 : 0,
        }));
      });
      unsubList.push(unsub);
    });

    // Cleanup tất cả listener khi unmount
    return () => unsubList.forEach(u => u());
  }, [rooms, userServer]);

  console.log(badges)
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
              <MessageItemComponent
                chatRoom={chatRoom}
                count={badges[chatRoom.id]}//truyền count vào để show ngoài badge
              />
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
