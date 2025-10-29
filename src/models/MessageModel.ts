import { TimeAtModel } from '.';

export interface MessageModel {
  id: string;
  senderId: string;
  type: string;
  text: string;
  mediaURL: string;
  createAt: TimeAtModel;
  status: string;
}
