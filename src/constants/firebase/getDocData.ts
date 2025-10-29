import { doc, getDoc } from '@react-native-firebase/firestore';
import { SetStateAction } from 'react';
import { db } from '../../../firebase.config';

export const getDocData = async ({
  id,
  nameCollect,
  setData,
}: {
  id: string;
  nameCollect: string;
  setData: SetStateAction<any>;
  conditions?: any;
}) => {
  const q = doc(db, nameCollect, id);

  const docSnap = await getDoc(q);
  if (docSnap.exists()) {
    setData({
      ...docSnap.data(),
      id: docSnap.id,
    });
  } else {
    console.log(`getDoc data error`);
  }
};
