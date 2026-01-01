import { navigationRef } from './navigationRef';

export const handleNotificationNavigate = (remoteMessage: any) => {
  if (!remoteMessage?.data) return;

  const { type, roomId } = remoteMessage.data;

  // Ví dụ chat
  if (type === 'chat' && roomId) {
    // ⚠️ kiểm tra navigation đã sẵn sàng
    if (navigationRef.isReady()) {
      navigationRef.navigate('MessageDetailScreen', { roomId });
    }
  }
};
