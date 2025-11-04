/**
 * @format
 */
import moment from "moment";
import "moment/locale/vi"; // nạp ngôn ngữ tiếng Việt
moment.locale("vi"); // đặt ngôn ngữ mặc định
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
