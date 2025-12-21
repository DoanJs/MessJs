// import { doc, onSnapshot } from "@react-native-firebase/firestore"
// import { useEffect, useState } from "react"
// import { db } from "../../firebase.config"

// // hooks/useChatRoom.ts
// export const useChatRoom = (roomId: string) => {
//   const [room, setRoom] = useState<any>(null)

//   useEffect(() => {
//     if (!roomId) return

//     const unsub = onSnapshot(
//       doc(db, 'chatRooms', roomId),
//       snap => {
//         if (!snap.exists()) return
//         setRoom({ id: snap.id, ...snap.data() })
//       }
//     )

//     return unsub
//   }, [roomId])

//   return room
// }
import { doc, onSnapshot } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../../firebase.config';

type GroupRole = 'owner' | 'admin' | 'member';

export const useChatRoom = (roomId: string) => {
  const [room, setRoom] = useState<any>(null);
  const [myRole, setMyRole] = useState<GroupRole | null>(null);

  const uid = auth.currentUser?.uid;

  // 🔹 listen ROOM (KHÔNG phụ thuộc uid)
  useEffect(() => {
    if (!roomId) return;

    const unsub = onSnapshot(doc(db, 'chatRooms', roomId), snap => {
      if (!snap.exists()) {
        setRoom(null);
        return;
      }

      setRoom({
        id: snap.id,
        ...snap.data(),
      });
    });

    return unsub;
  }, [roomId]);

  // 🔹 listen ROLE (phụ thuộc uid)
  useEffect(() => {
    if (!roomId || !uid) {
      setMyRole(null);
      return;
    }

    const unsub = onSnapshot(
      doc(db, 'chatRooms', roomId, 'members', uid),
      snap => {
        if (!snap.exists()) {
          setMyRole(null);
          return;
        }

        setMyRole(snap.data()?.role ?? null);
      },
    );

    return unsub;
  }, [roomId, uid]);

  return {
    room,
    myRole,
    isOwner: myRole === 'owner',
    isAdmin: myRole === 'admin',
    isMember: myRole !== null,
  };
};
