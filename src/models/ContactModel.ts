import { TimeAtModel } from '.';

export interface ContactModel {
  id: string; //dung makeContactId function
  userA: string;
  userB: string;
  status: string; // "accepted" | "pending" | "blocked"
  creatAt: TimeAtModel;
  lastContactAt: TimeAtModel;
}
