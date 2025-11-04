import { useEffect, useState } from 'react';
import { convertTimeStampFirestore } from '../constants/convertData';

export function useFirestoreTimeAgo(timestamp: any) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const { timeAgo } = convertTimeStampFirestore(timestamp);
  return timeAgo();
}
