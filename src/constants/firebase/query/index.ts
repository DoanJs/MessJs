import {
  collection,
  doc,
  orderBy,
  query,
  where,
} from '@react-native-firebase/firestore';
import { db } from '../../../../firebase.config';

export const q_chatRoomsWithMember = (id: string) =>
  query(collection(db, 'chatRooms'), where('memberIds', 'array-contains', id));
export const q_chatRoomId = (id: string) => doc(db, 'chatRooms', id);
export const q_messagesASC = ({
  chatRoomId,
  batchId,
}: {
  chatRoomId: string;
  batchId: string;
}) =>
  query(
    collection(db, 'chatRooms', chatRoomId, 'batches', batchId, 'messages'),
    orderBy('createAt', 'asc'),
  );
