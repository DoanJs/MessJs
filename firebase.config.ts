// import notifee, { AndroidImportance } from '@notifee/react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp } from '@react-native-firebase/app';
import {
  createUserWithEmailAndPassword,
  FirebaseAuthTypes,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';
import {
  arrayUnion,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';
// import {
//   AuthorizationStatus,
//   getInitialNotification,
//   getMessaging,
//   getToken,
//   onMessage,
//   requestPermission,
// } from '@react-native-firebase/messaging';
import {
  GoogleSignin,
  SignInResponse,
} from '@react-native-google-signin/google-signin';
// import { Linking, PermissionsAndroid, Platform } from 'react-native';
// import Logo from './src/assets/images/logo.png';

const auth = getAuth();
const db = getFirestore();
const app = getApp();
// const messaging = getMessaging(app);

GoogleSignin.configure({
  webClientId:
    '465303174037-nh9lg3upnppj6ncrnch1i19avilm5v4f.apps.googleusercontent.com',
});

const signInWithGoogle = async () => {
  // B1: clear session cũ
  // await GoogleSignin.signOut();
  // await GoogleSignin.revokeAccess();
  // await signOut(auth);

  // // B2: đảm bảo Google Play Services ok
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  // Step 1 - Google sign in (OAuth)
  const userInfo: SignInResponse = await GoogleSignin.signIn();

  // Step 2 - Create a Google credential with the token
  const googleCredential = GoogleAuthProvider.credential(
    userInfo.data?.idToken,
  );

  // Step 3 - Sign-in the user to Firebase with the credential
  return signInWithCredential(auth, googleCredential);
};

// /**
//  * Xin quyền nhận thông báo (Android 13+ và iOS)
//  */
// const requestUserPermission = async () => {
//   if (Platform.OS === 'ios') {
//     const authStatus = await requestPermission(messaging);
//     return (
//       authStatus === AuthorizationStatus.AUTHORIZED ||
//       authStatus === AuthorizationStatus.PROVISIONAL
//     );
//   }

//   if (Platform.OS === 'android' && Platform.Version >= 33) {
//     const granted = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//     );
//     return granted === PermissionsAndroid.RESULTS.GRANTED;
//   }

//   return true;
// };

// /**
//  * Lấy FCM Token của thiết bị
//  */
// const getFCMToken = async () => {
//   // const fcmtoken = await AsyncStorage.getItem('fcmtoken');
//   // console.log(fcmtoken);
//   // if (!fcmtoken) {
//   //   const token = await getToken(messaging);
//   //   if (token) {
//   //     await AsyncStorage.setItem('fcmtoken', token);
//   //     updateToken(token);
//   //   }
//   //   return token;
//   // }
//   let fcmtoken = await AsyncStorage.getItem('fcmtoken');
//   console.log(fcmtoken);
//   if (!fcmtoken) {
//     fcmtoken = await getToken(messaging);
//   }

//   await AsyncStorage.setItem('fcmtoken', fcmtoken);
//   updateToken(fcmtoken);
//   return fcmtoken;
// };

// /**
//  * Update FCM Token của thiết bị vào user
//  */
// const updateToken = async (token: string) => {
//   const user = auth.currentUser;

//   const docSnap = await getDoc(doc(db, 'users', user?.uid as string));
//   if (docSnap.exists()) {
//     const data = docSnap.data();

//     if (!data?.tokens || !data?.tokens.includes(token)) {
//       await updateDoc(doc(db, 'users', user?.uid as string), {
//         tokens: arrayUnion(token),
//       });
//       console.log('da update token new')
//     }
//   }
// };

// /**
//  * Lắng nghe notification khi app foreground
//  */
// const listenForegroundMessages = async () => {
//   onMessage(messaging, async remoteMessage => {
//     const { title, body, id, type }: any = remoteMessage.data;
//     // Hiển thị thông báo
//     await notifee.displayNotification({
//       id: String(Date.now()),
//       title: title ?? 'Thông báo',
//       body: body ?? '',
//       data: remoteMessage.data ?? {},
//       android: {
//         channelId: 'default',
//         smallIcon: 'ic_notification_transparent', // 👈 tên file bạn đã đặt
//         color: '#FF0000', // 👈 đổi màu accent (màu nền của icon)
//         importance: AndroidImportance.HIGH, // vẫn giữ
//         largeIcon: Logo, // logo app, hiển thị to bên phải
//         sound: 'default',
//         pressAction: {
//           id: 'default',
//         },
//       },
//     });
//   });
// };
// /**
//  * Khi user click thông báo lúc app đang quit
//  */
// const checkInitialNotification = async () => {
//   const remoteMessage = await getInitialNotification(messaging);
//   if (remoteMessage) {
//     const { data } = remoteMessage;
//     if (data && data.type === 'review') {
//       Linking.openURL(`grocery://product/review/${data.id}`);
//     }
//   }
// };

export {
  auth,
  //   checkInitialNotification,
  createUserWithEmailAndPassword,
  db,
  //   getFCMToken,
  //   listenForegroundMessages,
  //   messaging,
  onAuthStateChanged,
  //   requestUserPermission,
  signInWithEmailAndPassword,
  signInWithGoogle,
  signOut,
};
