import moment from 'moment';
import { UserModel } from '../models';

// type BatchInfo = {
//   id: string;
//   messageCount: number;
// };

// export const convertBatchId = (
//   batchInfo: BatchInfo,
//   type: 'increase' | 'decrease',
// ) => {
//   return `${batchInfo.id.slice(0, 10)}-${String(
//     type === 'increase'
//       ? Number(batchInfo.id.slice(-2)) + 1
//       : Number(batchInfo.id.slice(-2)) - 1,
//   ).padStart(2, '0')}`;
// };

export const convertTimeStampFirestore = (timestamp: any) => {
  const dataTime = timestamp?.seconds * 1000 + timestamp?.nanoseconds / 1e6;

  return {
    dataTime,
    timeAgo: (now?: number) => moment(dataTime).from(now ?? Date.now(), true),
  };
};
export const convertInfoUserFromID = (
  id: string,
  users: UserModel[],
): UserModel | undefined => {
  const index = users.findIndex(_ => _.id === id);
  if (index === -1) return;
  return users[index];
};
