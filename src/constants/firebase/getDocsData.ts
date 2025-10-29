import { collection, getDocs, query } from '@react-native-firebase/firestore';
import { SetStateAction } from 'react';
import { db } from '../../../firebase.config';

export const getDocsData = async ({
  nameCollect,
  condition,
  setData,
}: {
  nameCollect: string;
  setData: SetStateAction<any>;
  condition?: any;
}) => {
  const q = condition
    ? query(collection(db, nameCollect), ...condition)
    : query(collection(db, nameCollect));

  const querySnapshot = await getDocs(q);

  const items: any = [];
  querySnapshot.forEach((doc: any) => {
    items.push({
      id: doc.id,
      ...doc.data(),
    });
  });
  setData(items);
};
