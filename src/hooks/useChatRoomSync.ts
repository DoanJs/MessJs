import { useEffect, useRef } from 'react';
import { db } from '../../firebase.config';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, Unsubscribe } from '@react-native-firebase/firestore';

// Hàm update chung
const updateReadAndUnread = async (
  roomId: string,
  userId: string,
  lastMessageId: string,
) => {
  if (!roomId || !userId || !lastMessageId) return;

  const readRef = doc(db, `chatRooms/${roomId}/readStatus/${userId}`);
  const unreadRef = doc(db, `chatRooms/${roomId}/unreadCounts/${userId}`);

  // Gộp cập nhật song song
  await Promise.all([
    setDoc(
      readRef,
      {
        lastReadMessageId: lastMessageId,
        lastReadAt: serverTimestamp(),
      },
      { merge: true },
    ),
    setDoc(unreadRef, { count: 0 }, { merge: true }),
  ]);
};

// Hook chính
export const useChatRoomSync = (
  roomId: string,
  userId: string,
  isAtBottom: boolean,
) => {
  const unsubRoomRef = useRef<Unsubscribe | null>(null)

  useEffect(() => {
    if (!roomId || !userId) return;

    // --- 1️⃣ Khi user vào phòng: reset ngay unread + update read ---
    (async () => {
      const roomSnap = await getDoc(doc(db, 'chatRooms', roomId));
      const lastMessageId = roomSnap.data()?.lastMessageId;
      if (lastMessageId) {
        await updateReadAndUnread(roomId, userId, lastMessageId);
      }
    })();

    // --- 2️⃣ Theo dõi realtime lastMessage để auto reset ---
    const roomRef = doc(db, 'chatRooms', roomId);
    unsubRoomRef.current = onSnapshot(roomRef, async (snap) => {
      const data = snap.data();
      const lastMessageId = data?.lastMessageId;

      if (lastMessageId && isAtBottom) {
        await updateReadAndUnread(roomId, userId, lastMessageId);
      }
    });

    // --- 3️⃣ Cleanup khi rời phòng ---
    return () => {
      if (unsubRoomRef.current) unsubRoomRef.current();
    };
  }, [roomId, userId, isAtBottom]);
};
