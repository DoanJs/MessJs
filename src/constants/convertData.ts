import moment from 'moment';

type BatchInfo = {
  id: string;
  messageCount: number;
};

export const convertBatchId = (
  batchInfo: BatchInfo,
  type: 'increase' | 'decrease',
) => {
  return `${batchInfo.id.slice(0, 10)}-${String(
    type === 'increase'
      ? Number(batchInfo.id.slice(-2)) + 1
      : Number(batchInfo.id.slice(-2)) - 1,
  ).padStart(2, '0')}`;
};

export const convertTimeStampFirestore = (timestamp: any) => {
  const dataTime = timestamp?.seconds * 1000 + timestamp?.nanoseconds / 1e6;

  return {
    timeAgo: (now?: number) => moment(dataTime).from(now ?? Date.now(), true),
  };
};
