import Video from 'react-native-video';
import { View } from 'react-native';

export default function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Video
        source={{ uri: videoUrl }}
        style={{ width: 200, height: 150 }}
        controls // bật nút play/pause
        resizeMode="contain"
      />
    </View>
  );
}
