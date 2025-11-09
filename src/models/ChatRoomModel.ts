import { BatchModel, ReadStatusModel, TimeAtModel, UserModel } from '.';

export interface ChatRoomModel {
  id: string;
  type: string;
  name: string;
  avatarURL: string;
  description: string;
  createdBy: string;
  createAt: TimeAtModel;
  lastMessageText: string;
  lastMessageAt: TimeAtModel;
  lastSenderId: string;

  lastBatchId: string;
  memberCount: number;
  memberIds: string[];

  members?: UserModel[]
  batches?: BatchModel[];
  readStatus?: ReadStatusModel[];
}
