import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { SearchComponent, UserForwardComponent } from '..';
import { auth, db } from '../../../firebase.config';
import { UserModel } from '../../models';
import {
  collection,
  getDocs,
  query,
  where,
} from '@react-native-firebase/firestore';

interface Props {
  visible: boolean;
  onClose: () => void;
  users: UserModel[];
  onSelectUser: (val: any) => void;
}

const ForwardUserModal = (props: Props) => {
  const { visible, onClose, users, onSelectUser } = props;
  const [resourceChatRooms, setResourceChatRooms] = useState<any[]>([]);
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const userCurrent = auth.currentUser;

  useEffect(() => {
    if (!userCurrent?.uid) return;

    let isMounted = true; // flag để cleanup

    const loadChatRooms = async () => {
      try {
        // 1. Query chatRooms
        const q_batches = query(
          collection(db, `chatRooms`),
          where('memberIds', 'array-contains', userCurrent.uid),
          where('type', '==', 'group'),
        );

        const snap = await getDocs(q_batches);

        if (!isMounted) return; // ❗ nếu unmount thì dừng luôn

        // Convert rooms
        const resultSnap = snap.docs.map((d: any) => ({
          id: d.id,
          ...d.data(),
        }));

        // 2. Lấy subcollection members của từng room (song song)
        const roomsWithMembers = await Promise.all(
          resultSnap.map(async (room: any) => {
            const membersRef = collection(
              db,
              `chatRooms/${room.id}/members`
            );

            const membersSnap = await getDocs(membersRef);
            const members = membersSnap.docs.map((m: any) => ({
              id: m.id,
              ...m.data(),
            }));

            return {
              ...room,
              members, // <-- thêm vào đây
            };
          })
        );

        if (!isMounted) return; // ❗ kiểm tra lại trước khi setState

        const resultUser = users.filter(_ => _.id !== userCurrent.uid);

        setChatRooms([...roomsWithMembers, ...resultUser]);
        setResourceChatRooms([...roomsWithMembers, ...resultUser]);

        // messages = await preloadSignedUrls(messages);
      } catch (err) {
        console.log('loadChatRooms error', err);
      }
    };

    loadChatRooms();

    return () => {
      isMounted = false;
    };
  }, [userCurrent?.uid]);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={{ justifyContent: 'center', margin: 0 , flex: 1}}
    >
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 15,
          maxHeight: '90%',
          marginHorizontal: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
          Chọn bạn bè/nhóm để chuyển tiếp
        </Text>

        <SearchComponent
          placeholder="Tìm kiếm bạn bè/nhóm"
          onChange={val => setChatRooms(val)}
          arrSource={resourceChatRooms}
          type="chatRoom"
        />
        <FlatList
          data={chatRooms}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <UserForwardComponent item={item} onSelectUser={onSelectUser} />
          )}
        />

        <TouchableOpacity
          onPress={onClose}
          style={{
            marginTop: 15,
            backgroundColor: '#ddd',
            padding: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ textAlign: 'center', fontSize: 16 }}>Đóng</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ForwardUserModal;

// import React from 'react';
// import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
// import { UserForwardComponent } from '..';
// import { auth } from '../../../firebase.config';
// import { UserModel } from '../../models';

// interface Props {
//   visible: boolean
//   onClose: () => void
//   users: UserModel[],
//   onSelectUser: (val: any) => void
// }

// const ForwardUserModal = (props: Props) => {
//   const {
//     visible,
//     onClose,
//     users,
//     onSelectUser
//   } = props
//   const userCurrent = auth.currentUser

//   return (
//     <Modal visible={visible} transparent animationType="slide">
//       <View
//         style={{
//           flex: 1,
//           backgroundColor: 'rgba(0,0,0,0.4)',
//           justifyContent: 'center',
//           padding: 20
//         }}
//       >
//         <View
//           style={{
//             backgroundColor: '#fff',
//             borderRadius: 12,
//             padding: 15,
//             maxHeight: '70%'
//           }}
//         >
//           <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
//             Chọn người để chuyển tiếp
//           </Text>

//           <FlatList
//             data={users.filter((_) => _.id !== userCurrent?.uid)}
//             keyExtractor={item => item.id}
//             renderItem={({ item }) => <UserForwardComponent item={item} onSelectUser={onSelectUser} />}
//           />

//           <TouchableOpacity
//             onPress={onClose}
//             style={{
//               marginTop: 15,
//               backgroundColor: '#ddd',
//               padding: 12,
//               borderRadius: 8
//             }}
//           >
//             <Text style={{ textAlign: 'center', fontSize: 16 }}>Đóng</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default ForwardUserModal;
