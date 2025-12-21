import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from '.';
import { AddFriendScreen, AddGroupScreen, MemberRoomScreen, MessageDetailScreen, RoomSettingScreen, SearchMsgScreen, SearchScreen } from '../screens';
import { auth, db } from '../../firebase.config';
import { useEffect } from 'react';
import { collection, getDocs, onSnapshot, query, where } from '@react-native-firebase/firestore';
import { useBlockStore, useFriendRequestStore, useFriendShipStore, usePendingRequestUsersStore } from '../zustand';
import { UserModel } from '../models';
import { chunk } from '../constants/functions';
import MediaRoomScreen from '../screens/message/MediaRoomScreen';

const MainNavigator = () => {
  const Stack = createNativeStackNavigator();
  const userCurrent = auth.currentUser

  useEffect(() => {
    if (!userCurrent?.uid) return;

    // Lắng nghe realtime
    const unsubFrienRequest = onSnapshot(
      query(
        collection(db, 'friendRequests'),
        where('memberIds', 'array-contains', userCurrent.uid),
      ),
      async snapshot => {
        const map: Record<string, 'pending_in' | 'pending_out'> = {};

        snapshot.docs.forEach((doc: any) => {
          const data = doc.data();
          if (data.status !== 'pending') return;

          const otherId = data.from === userCurrent.uid ? data.to : data.from;

          map[otherId] =
            data.from === userCurrent.uid ? 'pending_out' : 'pending_in';
        });

        useFriendRequestStore.getState().setFriendRequests(map);
        // ✅ 2. Sync users song song
        await syncPendingRequestUsers(map);
      },
    );

    const unsubFriendShips = onSnapshot(
      collection(db, `friendShips/${userCurrent.uid}/friends`),
      snapshot => {
        const map: Record<string, true> = {};
        const users: UserModel[] = [];

        snapshot.docs.forEach((doc: any) => {
          map[doc.id] = true;

          users.push({
            ...(doc.data() as UserModel),
          });
        });

        useFriendShipStore.getState().setFriendShips(map);
        useFriendShipStore.getState().setFriendList(users);
      },
    );

    const unsubBlockedByMe = onSnapshot(
      collection(db, `blocks/${userCurrent.uid}/blocked`),
      snapshot => {
        const map: Record<string, true> = {};
        snapshot.docs.forEach((doc: any) => {
          map[doc.id] = true;
        });

        useBlockStore.getState().setBlockedByMe(map);
      },
    );

    return () => {
      unsubBlockedByMe();
      unsubFriendShips()
      unsubFrienRequest()
    };

  }, [userCurrent?.uid]);

  const syncPendingRequestUsers = async (
    map: Record<string, 'pending_in' | 'pending_out'>,
  ) => {
    const ids = Object.keys(map);

    // Không còn pending → clear users
    if (!ids.length) {
      usePendingRequestUsersStore.getState().clear();
      return;
    }

    const chunks = chunk(ids, 10);
    const users: Record<string, UserModel> = {};

    for (const group of chunks) {
      const q = query(
        collection(db, 'users'),
        where('id', 'in', group),
      );

      const snap = await getDocs(q);

      snap.docs.forEach((doc: any) => {
        const user = doc.data() as UserModel;
        users[user.id] = user;
      });
    }

    usePendingRequestUsersStore
      .getState()
      .setUsers(users);
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="MessageDetailScreen" component={MessageDetailScreen} />
      <Stack.Screen name="SearchMsgScreen" component={SearchMsgScreen} />
      <Stack.Screen name="AddGroupScreen" component={AddGroupScreen} />
      <Stack.Screen name="AddFriendScreen" component={AddFriendScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="RoomSettingScreen" component={RoomSettingScreen} />
      <Stack.Screen name="MemberRoomScreen" component={MemberRoomScreen} />
      <Stack.Screen name="MediaRoomScreen" component={MediaRoomScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
