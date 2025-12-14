import { TimeAtModel } from './TimeAtModel';

export interface FriendRequestModel {
  id: string;
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'denied' | 'cancelled';
  createdAt: TimeAtModel;
  updatedAt: TimeAtModel;
  memberIds: string[];
  processed: boolean;
}
