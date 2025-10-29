import { TimeAtModel } from ".";

export interface ReadStatusModel {
  id: string;
  lastReadMessageId: string;
  lastReadAt: TimeAtModel;
}
