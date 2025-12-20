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

export const useChatRoom = (roomId: string) => {
  const [room, setRoom] = useState<any>(null);
  const [myRole, setMyRole] = useState<'admin' | 'member' | null>(null);

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!roomId || !uid) return;

    // 🔹 listen room
    const unsubRoom = onSnapshot(doc(db, 'chatRooms', roomId), snap => {
      if (!snap.exists()) return;
      setRoom({ id: snap.id, ...snap.data() });
    });

    // 🔹 listen member của chính mình
    const unsubMember = onSnapshot(
      doc(db, 'chatRooms', roomId, 'members', uid),
      snap => {
        if (!snap.exists()) {
          setMyRole(null);
          return;
        }
        setMyRole(snap.data()?.role ?? null);
      },
    );

    return () => {
      unsubRoom();
      unsubMember();
    };
  }, [roomId, uid]);

  return {
    room,
    myRole,
    isAdmin: myRole === 'admin',
    isMember: myRole !== null,
  };
};
