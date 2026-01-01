/**
 * @format
 */
import { setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import moment from 'moment';
import 'moment/locale/vi'; // nạp ngôn ngữ tiếng Việt
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { messaging } from './firebase.config';
moment.locale('vi'); // đặt ngôn ngữ mặc định

// Hàm này để xử lý data khi app k chạy nền hoặc đã killed
setBackgroundMessageHandler(messaging, async remoteMessage => {
  console.log('📩 Background message:', remoteMessage);
  // ❌ KHÔNG navigate ở đây
  // ✅ dùng để sync data
});

AppRegistry.registerComponent(appName, () => App);
