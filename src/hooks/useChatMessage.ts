import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../firebase.config';

/**
 * Lắng nghe realtime tin nhắn trong batch hiện tại của chatRoom
 */
export function useChatMessages(chatRoomId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);

  // 🔹 1. Lắng nghe chatRoom để biết batch hiện tại
  useEffect(() => {
    if (!chatRoomId) return;
    const roomRef = doc(db, 'chatRooms', chatRoomId);

    const unsubRoom = onSnapshot(roomRef, snap => {
      const data = snap.data();
      if (data?.lastBatchId) {
        setBatchId(data.lastBatchId);
      }
    });

    return () => unsubRoom();
  }, [chatRoomId]);

  // 🔹 2. Khi batchId thay đổi → lắng nghe subcollection messages
  useEffect(() => {
    if (!chatRoomId || !batchId) return;

    const messagesRef = collection(
      db,
      'chatRooms',
      chatRoomId,
      'batches',
      batchId,
      'messages',
    );

    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubMessages = onSnapshot(q, snapshot => {
      const newMessages = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(newMessages);
    });

    return () => unsubMessages();
  }, [chatRoomId, batchId]);

  return { messages, batchId };
}
