import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Video from 'react-native-video';
import { colors } from '../constants/colors';
import { PauseCircle, Play, PlayCircle } from 'iconsax-react-native';
import { sizes } from '../constants/sizes';

interface Props {
  url: string;
  audioStyles?: StyleProp<ViewStyle>;
}

export default function AudioPlayerComponent(props: Props) {
  const { url, audioStyles } = props;
  const playerRef = useRef(null);
  const [paused, setPaused] = useState(true);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const onLoad = (data: any) => {
    setDuration(data.duration);
  };

  const onProgress = (data: any) => {
    setProgress(data.currentTime);
  };

  const formatTime = (s: number) => {
    if (!s) return '00:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' + sec : sec}`;
  };

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <View style={[styles.container, audioStyles]}>
      {/* Hidden audio player */}
      <Video
        ref={playerRef}
        source={{ uri: url }}
        paused={paused}
        // audioOnly
        onLoad={onLoad}
        onProgress={onProgress}
        onEnd={() => {
          setPaused(true);
          setProgress(0);
        }}
        style={{ height: 0, width: 0 }}
      />

      {/* UI */}
      <TouchableOpacity
        onPress={() => setPaused(!paused)}
        style={styles.button}
      >
        {paused ? (
          <PlayCircle
            size={sizes.smallHeader}
            color={colors.textBold}
            variant="Bold"
          />
        ) : (
          <PauseCircle
            size={sizes.smallHeader}
            color={colors.textBold}
            variant="Bold"
          />
        )}
      </TouchableOpacity>

      <Text style={styles.time}>{formatTime(progress)}</Text>

      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>

      <Text style={styles.time}>{formatTime(duration)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    width: 200,
  },
  button: { marginRight: 6 },
  time: {
    fontSize: 11,
    color: '#444',
    marginHorizontal: 4,
    width: 40,
    textAlign: 'center',
  },
  bar: {
    flex: 1,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 6,
  },
  fill: {
    height: 4,
    backgroundColor: colors.textBold,
  },
});
