import RNFS from 'react-native-fs';
import { launchImageLibrary } from 'react-native-image-picker';

const pickImage = async () => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    quality: 0.9,
  });

  if (result.didCancel || !result.assets || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];

  const uri = asset.uri; // file:///...
  // const fileName = asset.fileName ?? `image_${Date.now()}.jpg`;
  // const ext = fileName.split('.').pop() || 'jpg';
  // Convert file to base64
  const base64 = await RNFS.readFile(uri as string, 'base64');

  return { asset: { ...asset, base64 } };
};
export default pickImage;
