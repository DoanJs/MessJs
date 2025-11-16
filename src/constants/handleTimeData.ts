import moment from 'moment';
import 'moment/locale/vi';
import { MessageModel } from '../models';
import { convertTimeStampFirestore } from './convertData';
moment.locale('vi');

/**
 * Xác định xem có cần hiển thị block thời gian giữa hai tin nhắn hay không.
 * - Trả về true nếu:
 *    + Tin hiện tại là tin đầu tiên, hoặc
 *    + Hai tin cách nhau > 15 phút
 */
export const shouldShowBlockTime = (
  prevMessage?: MessageModel,
  currentMessage?: MessageModel,
  intervalMinutes = 15,
): boolean => {
  if (!currentMessage) return false;
  if (!prevMessage) return true;

  const prev = convertTimeStampFirestore(prevMessage.createAt);
  const curr = convertTimeStampFirestore(currentMessage.createAt);

  if (!prev?.dataTime || !curr?.dataTime) return false;

  const diffMs = curr.dataTime - prev.dataTime;
  return diffMs >= intervalMinutes * 60 * 1000;
};

export const isEndOfTimeBlock = (
  nextMsg: MessageModel,
  currentMsg: MessageModel,
) => {
  // kiểm tra có sang block thời gian mới không
  return !nextMsg || hasTimeBlockBetween(currentMsg, nextMsg); // khác ngày hoặc cách >= 15 phút
};
/**
 * Format thời gian block tin nhắn:
 *  - 14:10 Hôm nay
 *  - 21:10 Hôm qua
 *  - 14:10 06/11
 *  - 14:10 06/11/2024  (nếu khác năm)
 */
export const formatMessageBlockTime = (timestamp: any): string => {
  if (!timestamp) return '';

  // Firestore Timestamp
  let timeMs: number;
  if (timestamp?.seconds) {
    timeMs = timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1e6);
  } else if (timestamp instanceof Date) {
    timeMs = timestamp.getTime();
  } else if (typeof timestamp === 'number') {
    timeMs = timestamp;
  } else {
    const parsed = moment(timestamp);
    if (!parsed.isValid()) return '';
    timeMs = parsed.valueOf();
  }

  const date = moment(timeMs);
  const now = moment();

  const timePart = date.format('HH:mm');
  const isToday = date.isSame(now, 'day');
  const isYesterday = date.isSame(now.clone().subtract(1, 'day'), 'day');
  const isSameYear = date.isSame(now, 'year');

  if (isToday) return `${timePart} Hôm nay`;
  if (isYesterday) return `${timePart} Hôm qua`;

  // Nếu khác năm → thêm năm đầy đủ
  const datePart = isSameYear
    ? date.format('DD/MM')
    : date.format('DD/MM/YYYY');

  return `${timePart} ${datePart}`;
};

/**
 * Lấy mili-giây từ createAt / createdAt (Firestore Timestamp, Date, hoặc number)
 */
export const toMs = (t: any): number => {
  if (!t) return 0;
  if (typeof t?.seconds === 'number')
    return t.seconds * 1000 + Math.floor((t.nanoseconds ?? 0) / 1e6);
  if (t instanceof Date) return t.getTime();
  if (typeof t === 'number') return t;
  const m = moment(t);
  return m.isValid() ? m.valueOf() : 0;
};

/**
 * Kiểm tra có block thời gian (ngắt cụm) giữa 2 tin không
 * @param a Tin nhắn trước
 * @param b Tin nhắn sau
 * @param intervalMinutes Khoảng phút để coi là block (mặc định 15)
 */
export const hasTimeBlockBetween = (
  a: any,
  b: any,
  intervalMinutes = 15,
): boolean => {
  if (!a || !b) return true;
  const aMs = toMs(a.createAt ?? a.createAt);
  const bMs = toMs(b.createAt ?? b.createAt);
  if (!aMs || !bMs) return true;

  const aDay = moment(aMs);
  const bDay = moment(bMs);
  if (!aDay.isSame(bDay, 'day')) return true;

  const diffMin = Math.abs(bMs - aMs) / (60 * 1000);
  return diffMin >= intervalMinutes;
};

/**
 * Xác định có hiển thị thời gian nhỏ dưới tin nhắn không
 * @param prev Tin nhắn trước
 * @param current Tin hiện tại
 * @param next Tin nhắn sau
 * @param index Vị trí tin nhắn hiện tại
 * @param total Tổng số tin nhắn
 * @param intervalMinutes Khoảng phút chia block
 */
export const shouldShowSmallTime = (
  prev: any,
  current: any,
  next: any,
  index: number,
  total: number,
  intervalMinutes = 15,
): boolean => {
  if (!current) return false;

  const sameSenderPrev =
    !!prev &&
    prev.senderId === current.senderId &&
    !hasTimeBlockBetween(prev, current, intervalMinutes);

  const sameSenderNext =
    !!next &&
    next.senderId === current.senderId &&
    !hasTimeBlockBetween(current, next, intervalMinutes);

  const isLastOfGroup = sameSenderPrev && !sameSenderNext;
  const isIsolated = !sameSenderPrev && !sameSenderNext;
  const isLastMessage = index === total - 1;

  // ✅ Nếu là tin cuối cùng toàn danh sách và không bị isolated → vẫn hiển thị
  if (isLastMessage && !isIsolated) return true;

  return isLastOfGroup && !isIsolated;
};
