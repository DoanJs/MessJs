import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { sizes } from '../constants/sizes';

interface Props {
  uri?: string;
  size?: number;
  styles?: StyleProp<ImageStyle>;
}

const AvatarComponent = (props: Props) => {
  const { uri, size, styles } = props;
  return (
    <Image
      style={[
        {
          height: size ?? sizes.bigHeader,
          width: size ?? sizes.bigHeader,
          borderRadius: 100,
          resizeMode: 'cover',
        },
        styles,
      ]}
      source={{
        uri:
          uri ??
          'https://cdn.pixabay.com/photo/2019/10/30/16/19/fox-4589927_1280.jpg',
      }}
    />
  );
};

export default AvatarComponent;
