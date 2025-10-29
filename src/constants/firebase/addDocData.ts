import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from '@react-native-firebase/firestore';
import { db } from '../../../firebase.config';

export const addDocData = async ({
  nameCollect,
  value,
  metaDoc,
}: {
  nameCollect: string;
  value: any;
  metaDoc: string;
}) => {
  const result = await addDoc(collection(db, nameCollect), value);
  await updateDoc(doc(db, 'Meta', metaDoc), {
    lastUpdated: serverTimestamp(),
  });

  return result;
};
