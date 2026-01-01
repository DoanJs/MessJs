import { TimeAtModel } from ".";

export interface UserModel {
  id: string;
  displayName: string;
  photoURL: string;
  phoneNumber: string;
  email: string;
  status: string; //"online" | "offline"
  lastOnlineAt: TimeAtModel;
  friendCount: number;
  blockeds: string[];

  fcmTokens: string[];
  mutedRooms: string[]
}
