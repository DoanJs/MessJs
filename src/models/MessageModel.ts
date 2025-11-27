import { FieldValue } from '@react-native-firebase/firestore';
import { TimeAtModel } from '.';

export interface MessageModel {
  id: string;
  senderId: string;
  type: string;
  text: string;
  localURL: string;
  mediaURL: string;
  thumbKey: string
  duration: number
  width: number
  height: number
  createAt: TimeAtModel | FieldValue;
  status: string; //"pending" | "sent" | "fail"
  batchId: string;
  reactionCounts: Record<string, number>

  deleted: boolean
  deleteAt: TimeAtModel | FieldValue | null;
  deleteBy: string | null
}