import {
  arrayUnion,
  doc,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';
import { db } from '../../firebase.config';

export const saveFcmToken = async (userId: string, token: string) => {
  if (!userId || !token) return;

  const ref = doc(db, 'users', userId);

  await setDoc(
    ref,
    {
      fcmTokens: arrayUnion(token),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};
