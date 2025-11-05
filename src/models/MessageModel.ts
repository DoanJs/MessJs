import { FieldValue } from '@react-native-firebase/firestore';
import { TimeAtModel } from '.';

export interface MessageModel {
  id: string;
  senderId: string;
  type: string;
  text: string;
  mediaURL: string;
  createAt: TimeAtModel | FieldValue;
  status: string; //"pending" | "sent" | "fail"
}
