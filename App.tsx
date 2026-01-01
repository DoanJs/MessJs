import notifee, { AndroidImportance } from '@notifee/react-native';
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
import { navigationRef } from './navigationRef';
import { AuthNavigator, MainNavigator } from './src/router';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(false);

  // ================= 3 LISTENER 4 STATUS =================
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
      });
    });

    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onNotificationOpenedApp(messaging, remoteMessage => {
      console.log('🔔 Opened from background:', remoteMessage);
      //  handleNavigate(remoteMessage);
    });

    return unsub;
  }, []);

  useEffect(() => {
    getInitialNotification(messaging).then(remoteMessage => {
      if (remoteMessage) {
        console.log('🚀 Opened from quit state:', remoteMessage);
        // handleNavigate(remoteMessage);
      }
    });
  }, []);

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

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user) {
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }
    });
  }, [isLoading]);

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
