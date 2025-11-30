import moment from 'moment';
import { UserModel } from '../models';

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