import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import {
  getInitialNotification,
  onMessage,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { auth, messaging, onAuthStateChanged } from './firebase.config';
import { navigate, navigationRef } from './navigationRef';
import { getRoomMembers, getUserById } from './src/constants/functions';
import { AuthNavigator, MainNavigator } from './src/router';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(false);

  // đăng ký notifee
  useEffect(() => {
    if (Platform.OS === 'android') {
      notifee.createChannel({
        id: 'default',
        name: 'Default',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    }
  }, []);

  // ================= 3 LISTENER 4 STATUS =================
  // Khi app đang mở
  useEffect(() => {
    const unsub = onMessage(messaging, async remoteMessage => {
      console.log('📩 Foreground message:', remoteMessage);

      const { title, body } = remoteMessage.notification || {};
      // 👉 Tự show notification
      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId: 'default',
          pressAction: { id: 'default' },
        },
        data: remoteMessage.data, // ⭐ rất quan trọng
      });
    });

    return unsub;
  }, []);
  useEffect(() => {
    return notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        const { type, roomType, chatRoomId, targetId } =
          detail.notification?.data || {};

        if (type === 'chat') {
          handleNavigateMessageDetail({ type, roomType, chatRoomId, targetId });
        }
      }
    });
  }, []);

  // Khi app chạy nền
  useEffect(() => {
    const unsub = onNotificationOpenedApp(messaging, remoteMessage => {
      if (!remoteMessage) return;

      console.log('🔔 Opened from background:', remoteMessage);
      const { type, roomType, chatRoomId, targetId } =
        remoteMessage?.data || {};

      if (type === 'chat') {
        handleNavigateMessageDetail({ type, roomType, chatRoomId, targetId });
      }
    });

    return unsub;
  }, []);

  // Khi app killed
  useEffect(() => {
    getInitialNotification(messaging).then(remoteMessage => {
      if (!remoteMessage) return;
      console.log('🚀 Opened from quit state:', remoteMessage);

      const { type, roomType, chatRoomId, targetId } =
        remoteMessage?.data || {};

      if (type === 'chat') {
        // Delay nhỏ để NavigationContainer sẵn sàng
        setTimeout(() => {
          handleNavigateMessageDetail({ type, roomType, chatRoomId, targetId });
        }, 500);
      }
    });
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user) {
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }
    });
  }, [isLoading]);

  const handleNavigateMessageDetail = async (data: any) => {
    if (!data || data.type !== 'chat') return;

    const { chatRoomId, roomType, targetId } = data;

    let friend = null;

    if (roomType === 'private') {
      friend = await getUserById(targetId);
    }

    const members = await getRoomMembers(chatRoomId);

    navigate('MessageDetailScreen', {
      type: roomType,
      friend,
      chatRoomId,
      members,
    });
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <NavigationContainer ref={navigationRef}>
          {isLoading ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
