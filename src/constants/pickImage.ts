import RNFS from 'react-native-fs';
import { launchImageLibrary } from 'react-native-image-picker';

const pickImage = async () => {
  const result = await launchImageLibrary({
    mediaType: 'mixed',
    selectionLimit: 0,
    quality: 0.9,
  });

  if (result.didCancel || !result.assets) {
    return null;
  }

  const assets = result.assets;
  let res: any = [];
  const promiseItems = assets.map(async asset => {
    const uri = asset.uri; // file:///...
    const base64 = await RNFS.readFile(uri as string, 'base64');
    res.push({ ...asset, base64 });
  });

  await Promise.all(promiseItems);

  return res;
  // const fileName = asset.fileName ?? `image_${Date.now()}.jpg`;
  // const ext = fileName.split('.').pop() || 'jpg';
  // Convert file to base64

  // return { asset: { ...asset, base64 } };
};
export default pickImage;
