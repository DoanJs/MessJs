import { StyleProp, View, ViewStyle } from 'react-native';
import Video from 'react-native-video';

export default function VideoPlayer({
  videoUrl,
  styles,
}: {
  videoUrl: string;
  styles?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 10,
        overflow: 'hidden',
        width: 200,
        height: 150,
      }}
    >
      <Video
        source={{ uri: videoUrl }}
        style={[{ width: 200, height: 150 }, styles]}
        controls // bật nút play/pause
        resizeMode="contain"
        paused={true}
      />
    </View>
  );
}
