import {
  collection,
  doc,
  onSnapshot,
  query,
} from '@react-native-firebase/firestore';
import { Add, ScanBarcode, SearchNormal1 } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
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
import { q_chatRoomsWithMember } from '../../constants/firebase/query';
import { sizes } from '../../constants/sizes';
import { FriendShipModel, UserModel } from '../../models';
import {
  useBadgeStore,
  useChatRoomStore,
  useUsersStore,
  useUserStore,
} from '../../zustand';

const MessageScreen = () => {
  const insets = useSafeAreaInsets();
  const userCurrent = auth.currentUser;
  const { setUser } = useUserStore();
  const { setUsers } = useUsersStore();
  const [isVisibleAddRoom, setIsVisibleAddRoom] = useState(false);
  const { badges, setBadges } = useBadgeStore();
  const { chatRooms, setChatRooms } = useChatRoomStore();
  const [friendShips, setFriendShips] = useState<FriendShipModel[]>([]);

  useEffect(() => {
    if (!userCurrent) return;
    // Lắng nghe realtime

    const unsubChatRooms = onSnapshot(
      q_chatRoomsWithMember(userCurrent.uid),
      snapshot => {
        const data = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChatRooms(
          data.sort((a: any, b: any) => b.lastMessageAt - a.lastMessageAt),
        );
      },
      error => {
        console.error('Error listening chatRooms:', error);
      },
    );
    const unsubUsers = onSnapshot(
      query(collection(db, 'users')),
      snapshot => {
        const data = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(data);
      },
      error => {
        console.error('Error listening users:', error);
      },
    );
    const unsubUser = onSnapshot(
      doc(db, 'users', userCurrent.uid),
      snap => {
        if (snap.exists()) {
          setUser({
            id: snap.id,
            ...snap.data(),
          } as UserModel);
        }
      },
      error => {
        console.error('Error listening user:', error);
      },
    );

    // Cleanup listener khi component unmount
    return () => {
      unsubChatRooms();
      unsubUsers();
      unsubUser();
    };
  }, [userCurrent]);

  useEffect(() => {
    if (!chatRooms.length) return;

    const unsubList: any[] = [];

    // Lắng nghe từng unreadCount của user trong mỗi room
    chatRooms.forEach((room: any) => {
      const unreadRef = doc(
        db,
        `chatRooms/${room.id}/unreadCounts/${userCurrent?.uid}`,
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
  }, [chatRooms, userCurrent]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['bottom']}
    >
      <Container
        bg={colors.primaryLight}
        title={
          <RowComponent styles={{ flex: 1 }} onPress={() => { }}>
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
              onPress={() => { }}
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
            data={chatRooms}
            renderItem={({ item: chatRoom }) => (
              <MessageItemComponent
                chatRoom={chatRoom}
                count={badges[chatRoom.id]} //truyền count vào để show ngoài badge
              />
            )}
          />
        </SectionComponent>
      </Container>

      <AddRoomModal
        visible={isVisibleAddRoom}
        onChange={val => { }}
        onClose={() => setIsVisibleAddRoom(false)}
      />
    </SafeAreaView>
  );
};

export default MessageScreen;
