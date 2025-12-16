import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';
import { httpsCallable } from '@react-native-firebase/functions';
import { PermissionsAndroid, Platform } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { Video as VideoCompressor } from 'react-native-compressor';
import { createThumbnail } from 'react-native-create-thumbnail';
import RNFS from 'react-native-fs';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import { db, functions } from '../../firebase.config';
import { MessageModel } from '../models';

export const loadMessagesFromBatchIds = async (
  roomId: string,
  batchIds: string[],
) => {
  const allMessages: any = [];

  await Promise.all(
    batchIds.map(async batchId => {
      const q = query(
        collection(db, `chatRooms/${roomId}/batches/${batchId}/messages`),
        orderBy('createAt', 'asc'),
      );

      const snap = await getDocs(q);

      const msgs = snap.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createAt: doc.data().createAt ?? new Date(),
      }));

      allMessages.push(...msgs);
    }),
  );

  // sort toàn bộ theo thời gian
  return allMessages.sort((a: any, b: any) => a.createAt - b.createAt);
};
export const pickImage = async () => {
  const res = await launchImageLibrary({
    mediaType: 'mixed',
    selectionLimit: 0, // chọn nhiều ảnh
  });

  if (res.didCancel || !res.assets) return null;

  return res.assets;
};
export const getUploadUrl = async (
  fileType: string,
  type: string,
  isThumb: boolean,
  roomId: string,
  messageId: string,
) => {
  const callable = httpsCallable(functions, 'getUploadUrl');

  const { uploadUrl, fileKey }: any = (
    await callable({ fileType, type, isThumb, roomId, messageId })
  ).data;

  return { uploadUrl, fileKey };
};
export const sendFriendRequest = async (to: string) => {
  const callable = httpsCallable(functions, 'sendFriendRequest');

  const { result }: any = (await callable({ to })).data;
  return result;
};
export const cancelFriendRequest = async (pairId: string) => {
  const callable = httpsCallable(functions, 'cancelFriendRequest');

  const { result }: any = (await callable({ pairId })).data;
  return result;
};
export const acceptFriendRequest = async (pairId: string) => {
  const callable = httpsCallable(functions, 'acceptFriendRequest');

  const { result }: any = (await callable({ pairId })).data;
  return result;
};
export const declineFriendRequest = async (pairId: string) => {
  const callable = httpsCallable(functions, 'declineFriendRequest');

  const { result }: any = (await callable({ pairId })).data;
  return result;
};
export const unfriend = async (friendId: string) => {
  const callable = httpsCallable(functions, 'unfriend');

  const { result }: any = (await callable({ friendId })).data;
  return result;
};
export const blockUser = async (targetId: string) => {
  const callable = httpsCallable(functions, 'blockUser');

  const { result }: any = (await callable({ targetId })).data;
  return result;
};
export const unblockUser = async (targetId: string) => {
  const callable = httpsCallable(functions, 'unblockUser');

  const { result }: any = (await callable({ targetId })).data;
  return result;
};
export const uploadBinaryToR2S3 = async (
  uploadUrl: string,
  fileUri: string,
  mime: string,
) => {
  try {
    const filePath = fileUri.replace('file://', '');

    const res = await RNBlobUtil.fetch(
      'PUT',
      uploadUrl,
      { 'Content-Type': mime },
      RNBlobUtil.wrap(filePath),
    );

    return res.info().status === 200;
  } catch (err) {
    console.log('Upload to R2 error:', err);
    return false;
  }
};
export const mimeToExt = (mime: string) => {
  const ext = mime.split('/')[1];
  if (ext === 'quicktime') return 'mov';
  if (ext === 'mpeg') return 'mp3';
  if (ext === 'x-m4a') return 'm4a';
  return ext;
};
export const createVideoThumbnail = async (asset: Asset) => {
  try {
    let fileName = asset.fileName || `video_${Date.now()}.mp4`;
    let uri = asset.uri as string;
    let srcPath = uri.replace('file://', '');
    let destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    // --- iOS: Không dùng file tmp ---
    if (Platform.OS === 'ios' && srcPath.includes('/tmp/')) {
      const exist = await RNFS.exists(destPath);
      if (exist) await RNFS.unlink(destPath);

      await RNFS.copyFile(srcPath, destPath);

      srcPath = destPath; // <-- QUAN TRỌNG: dùng absolute path
    }

    // --- Kiểm tra path ---
    const exists = await RNFS.exists(srcPath);
    if (!exists) throw new Error('File not found: ' + srcPath);

    // --- iOS: createThumbnail cần absolutePath, KHÔNG được có file:// ---
    const thumbnail = await createThumbnail({
      url: Platform.OS === 'ios' ? srcPath : uri,
      timeStamp: 1000,
    });

    return { ok: true, ...thumbnail };
  } catch (error) {
    console.log('createVideoThumbnail error:', error);
    return { ok: false, error };
  }
};
export const getSignedUrl = async (fileKey: string) => {
  const getViewUrl = httpsCallable(functions, 'getViewUrl');
  const { data }: any = await getViewUrl({ fileKey });
  return data.viewUrl;
};
export const compress = async (uri: string) => {
  const compressedUri = await VideoCompressor.compress(uri, {
    compressionMethod: 'auto',
  });
  return compressedUri;
};
export const requestAudioPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Audio Recording Permission',
          message: 'This app needs access to your microphone to record audio.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Recording permission granted');
        return true;
      } else {
        console.log('Recording permission denied');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};
export const preloadSignedUrls = async (messages: MessageModel[]) => {
  const results = await Promise.all(
    messages.map(async (msg: MessageModel) => {
      if (['image', 'video', 'audio'].includes(msg.type)) {
        if (msg.localURL) {
          // msg.mediaURL = msg.localURL;
          return msg;
        }

        if (msg.mediaURL) {
          const signed = await getSignedUrl(msg.mediaURL);
          msg.mediaURL = signed;
        }
      }
      return msg;
    }),
  );

  return results;
};
export const handleAddEmoji = async ({
  emoji,
  message,
  chatRoomId,
  userId,
  closePopover,
}: {
  emoji: string;
  message: MessageModel;
  chatRoomId: string;
  userId: string;
  closePopover: () => void;
}) => {
  if (emoji) {
    // --- ADD OR UPDATE REACTION ---
    await setDoc(
      doc(
        db,
        `chatRooms/${chatRoomId}/batches/${message?.batchId}/messages/${message?.id}/reactions`,
        userId,
      ),
      {
        reaction: emoji,
        createAt: serverTimestamp(),
      },
      { merge: true },
    );

    await setDoc(
      doc(
        db,
        `chatRooms/${chatRoomId}/userReactions/${userId}/reactions`,
        message?.id as string,
      ),
      {
        reaction: emoji,
        batchId: message?.batchId,
        createAt: serverTimestamp(),
        updateAt: serverTimestamp(),
      },
      { merge: true },
    );
  } else {
    // --- REMOVE REACTION ---
    await deleteDoc(
      doc(
        db,
        `chatRooms/${chatRoomId}/batches/${message?.batchId}/messages/${message?.id}/reactions`,
        userId,
      ),
    );

    await deleteDoc(
      doc(
        db,
        `chatRooms/${chatRoomId}/userReactions/${userId}/reactions`,
        message?.id as string,
      ),
    );
  }

  closePopover();
};
export const handleDeleteMsg = async ({
  message,
  chatRoomId,
  userId,
  closePopover,
}: {
  message: MessageModel;
  chatRoomId: string;
  userId: string;
  closePopover: () => void;
}) => {
  // thêm trạng thái tin nhắn vào chatRoomId
  await setDoc(
    doc(
      db,
      `chatRooms/${chatRoomId}/userMessageState/${userId}/messages`,
      message.id,
    ),
    {
      deleted: true,
      deletedAt: serverTimestamp(),
    },
    { merge: true },
  );
  closePopover();
};
export const handleRecallMsg = async ({
  message,
  chatRoomId,
  userId,
  closePopover,
}: {
  message: MessageModel;
  chatRoomId: string;
  userId: string;
  closePopover: () => void;
}) => {
  if (userId === message.senderId) {
    await updateDoc(
      doc(
        db,
        `chatRooms/${chatRoomId}/batches/${message.batchId}/messages`,
        message.id,
      ),
      {
        deleted: true,
        deletedAt: serverTimestamp(),
        deletedBy: userId,
      },
    );
    closePopover();
  }
};
export const handleReaction = ({
  reactions,
  reactionCounts,
}: {
  reactions: Record<string, number>;
  reactionCounts: {
    [key: string]: number;
  };
}) => {
  const reactionList = Object.entries(reactionCounts)
    .filter(([emoji, count]) => count > 0)
    .map(([emoji]) => emoji);
  const totalReaction = Object.values(reactions).reduce((sum, n) => sum + n, 0);

  return {
    reactionList,
    totalReaction,
  };
};
export function extractFileKey(signedUrl: string) {
  const url = new URL(signedUrl);
  return url.pathname.substring(1); // bỏ dấu "/" đầu
}
export const chunk = <T,>(arr: T[], size = 10): T[][] => {
  const result: T[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }

  return result;
};
