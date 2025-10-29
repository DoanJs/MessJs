import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  QueryConstraint,
} from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../../firebase.config';
import { storage } from '../localforage';

export function useFirestoreWithMetaCondition<T>({
  key,
  metaDoc,
  id,
  nameCollect,
  condition,
}: {
  key: string;
  metaDoc: string; // ví dụ: "products" | "fields" | targets |...
  id: string | undefined;
  nameCollect: string;
  condition: QueryConstraint[];
}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setData([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadData() {
      const valiConditions = condition.filter(Boolean);
      setLoading(true);

      // 1. Lấy meta từ Firestore
      const metaSnap = await getDoc(doc(db, 'Meta', metaDoc));
      const metaData = metaSnap.exists() ? metaSnap.data() : null;
      const lastUpdated = metaData
        ? metaData?.lastUpdated
          ? metaData?.lastUpdated.toMillis() //chuyển sang minisecond để so sánh
          : metaData[key]?.toMillis() //chuyển sang minisecond để so sánh
        : null;

      // 2. Lấy cache
      const cache: any = await storage.getItem(key);

      // 3. Nếu cache còn mới → dùng luôn Data cũ
      if (cache && lastUpdated && cache.lastUpdated === lastUpdated) {
        if (mounted) {
          setData(cache.data);
          setLoading(false);
        }
        return;
      }

      // 4. Nếu Meta thay đổi → fetch Firestore mới
      const snapshot = await getDocs(
        query(collection(db, nameCollect), ...valiConditions),
      );
      const freshData = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      // 5. Lưu cache kèm lastUpdated
      await storage.setItem(key, {
        data: freshData,
        lastUpdated,
      });

      if (mounted) {
        setData(freshData);
      }

      setLoading(false);
    }

    loadData();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, metaDoc, id]);

  return { data, loading };
}
