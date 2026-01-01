import { useEffect } from 'react';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { arrayUnion, doc, updateDoc } from '@react-native-firebase/firestore';
import { db } from '../../firebase.config';

export function useFCMToken(user: FirebaseAuthTypes.User | null) {
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    /* 1️⃣ Permission */
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) return false;

      await notifee.requestPermission();
      return true;
    };

    /* 2️⃣ Android channel – chỉ cần 1 lần */
    const createAndroidChannel = async () => {
      if (Platform.OS !== 'android') return;
      await notifee.createChannel({
        id: 'chat',
        name: 'Chat messages',
        importance: AndroidImportance.HIGH,
      });
    };

    /* 3️⃣ Lấy & lưu token */
    const getAndSaveToken = async () => {
      const granted = await requestPermission();
      if (!granted) return;

      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
      }

      const token = await messaging().getToken();
      if (!token || !mounted) return;

      const storedToken = await AsyncStorage.getItem('fcmToken');
      if (storedToken === token) return;

      await updateDoc(doc(db, 'users', user.uid), {
        tokens: arrayUnion(token),
      });

      await AsyncStorage.setItem('fcmToken', token);
      console.log('🔥 FCM Token:', token);
    };

    /* 4️⃣ Foreground message */
    const unsubscribeMessage = messaging().onMessage(async (msg) => {
      console.log('📩 Foreground message:', msg);

      await notifee.displayNotification({
        title: msg.notification?.title ?? 'New message',
        body: msg.notification?.body ?? 'You have a new message',
        data: msg.data, // 🔥 rất quan trọng
        android: {
          channelId: 'chat',
          pressAction: { id: 'default' },
        },
      });
    });

    /* 5️⃣ Open từ killed app */
    const checkInitialNotification = async () => {
      const msg = await messaging().getInitialNotification();
      if (msg) {
        console.log('🚀 Open from notification:', msg.data);
        // navigation.navigate('Chat', { chatId: msg.data?.chatId });
      }
    };

    /* 6️⃣ Token refresh */
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      if (!mounted) return;

      await updateDoc(doc(db, 'users', user.uid), {
        tokens: arrayUnion(newToken),
      });

      await AsyncStorage.setItem('fcmToken', newToken);
      console.log('♻️ Token refreshed:', newToken);
    });

    /* RUN */
    createAndroidChannel();
    getAndSaveToken();
    checkInitialNotification();

    return () => {
      mounted = false;
      unsubscribeMessage();
      unsubscribeTokenRefresh();
    };
  }, [user?.uid]);
}
