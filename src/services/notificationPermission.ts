import messaging from '@react-native-firebase/messaging';
import { Linking, PermissionsAndroid, Platform } from 'react-native';

export const requestNotificationPermission = async () => {
  try {
    // ================= iOS =================
    if (Platform.OS === 'ios') {
      const status = await messaging().hasPermission();

      if (status === messaging.AuthorizationStatus.NOT_DETERMINED) {
        const authStatus = await messaging().requestPermission();

        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      }

      return (
        status === messaging.AuthorizationStatus.AUTHORIZED ||
        status === messaging.AuthorizationStatus.PROVISIONAL
      );
    }

    // ================= ANDROID =================
    if (Platform.OS === 'android') {
      // Android 13+
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (!granted) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );

          if (result === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
          }

          if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            // 👉 user block vĩnh viễn
            Linking.openSettings();
          }

          return false;
        }

        return true;
      }

      // Android < 13
      return true;
    }

    return false;
  } catch (err) {
    console.error('Request notification permission error:', err);
    return false;
  }
};
