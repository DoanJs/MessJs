import { BatchModel, MemberModel, ReadStatusModel, TimeAtModel } from '.';

export interface ChatRoomModel {
  id: string;
  type: string
  name: string;
  avatarURL: string;
  description: string;
  createdBy: string;
  createAt: TimeAtModel;
  lastMessageText: string;
  lastMessageAt: TimeAtModel;
  lastSenderId: string;
  memberCount: number;
  lastBatchId: string;

  //    membersRef?: CollectionReference<MemberModel>;

  members?: MemberModel[];
  batches?: BatchModel[];
  readStatus?: ReadStatusModel[];
}
