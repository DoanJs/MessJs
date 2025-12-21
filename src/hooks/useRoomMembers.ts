// import {
//   collection,
//   onSnapshot,
//   orderBy,
//   query,
// } from '@react-native-firebase/firestore';
// import { useEffect, useState } from 'react';
// import { db } from '../../firebase.config';

// export const useRoomMembers = (roomId: string) => {
//   const [members, setMembers] = useState<any[]>([]);

//   useEffect(() => {
//     if (!roomId) return;

//     const unsub = onSnapshot(
//       query(
//         collection(db, 'chatRooms', roomId, 'members'),
//         orderBy('joinedAt', 'asc'),
//       ),
//       snap => {
//         setMembers(
//           snap.docs.map((d: any) => ({
//             id: d.id,
//             ...d.data(),
//           })),
//         );
//       },
//     );

//     return unsub;
//   }, [roomId]);

//   return members.sort((a, b) => {
//     if (a.role === b.role) return 0;
//     if (a.role === 'admin') return -1;
//     return 1;
//   });
// };
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from '@react-native-firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { auth, db } from '../../firebase.config';

type GroupRole = 'owner' | 'admin' | 'member';

export const useRoomMembers = (roomId: string) => {
  const [members, setMembers] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<GroupRole | null>(null);

  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!roomId || !currentUserId) return;

    const unsub = onSnapshot(
      query(
        collection(db, 'chatRooms', roomId, 'members'),
        orderBy('joinedAt', 'asc'),
      ),
      snap => {
        const list: any[] = [];
        let role: GroupRole | null = null;

        snap.docs.forEach((doc: any) => {
          const data = doc.data() as any;

          list.push({
            ...data,
            id: doc.id,
          });

          if (doc.id === currentUserId) {
            role = data.role;
          }
        });

        setMembers(list);
        setUserRole(role);
      },
    );

    return unsub;
  }, [roomId, currentUserId]);

  // Sort: owner -> admin -> member
  // const sortedMembers = useMemo(() => {
  //   return members.sort((a, b) => {
  //     if (a.role === b.role) return 0;
  //     if (a.role === 'owner') return -1;
  //     return 1;
  //   });
  // }, [members]);
  const sortedMembers = useMemo(() => {
    const priority: any = {
      owner: 0,
      admin: 1,
      member: 2,
    };

    return [...members].sort((a, b) => priority[a.role] - priority[b.role]);
  }, [members]);

  return {
    members: sortedMembers,
    userRole,
  };
};
