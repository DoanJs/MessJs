import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../firebase.config';

export const useRoomMembers = (roomId: string) => {
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const unsub = onSnapshot(
      query(
        collection(db, 'chatRooms', roomId, 'members'),
        orderBy('joinedAt', 'asc'),
      ),
      snap => {
        setMembers(
          snap.docs.map((d: any) => ({
            id: d.id,
            ...d.data(),
          })),
        );
      },
    );

    return unsub;
  }, [roomId]);

  return members.sort((a, b) => {
    if (a.role === b.role) return 0;
    if (a.role === 'admin') return -1;
    return 1;
  });
};
