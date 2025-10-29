import {
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from '@react-native-firebase/firestore';
import { db } from '../../../firebase.config';

export const deleteDocData = async ({
  nameCollect,
  id,
  metaDoc,
}: {
  nameCollect: string;
  id: string;
  metaDoc: string;
}) => {
  await deleteDoc(doc(db, nameCollect, id));
  await updateDoc(doc(db, 'Meta', metaDoc), {
    lastUpdated: serverTimestamp(),
  });
};
