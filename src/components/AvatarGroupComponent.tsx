import React from 'react';
import { View } from 'react-native';
import { AvatarComponent, TextComponent } from '.';
import { colors } from '../constants/colors';

const AvatarGroupComponent = () => {
  return (
    <View
      style={{
        height: 50,
        width: 50,
        position: 'relative',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        //   left: 10, khi dùng cho 3 người
          zIndex: 1,
        }}
      >
        <AvatarComponent size={26} />
      </View>
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 2,
        }}
      >
        <AvatarComponent size={26} />
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          zIndex: 3,
          height: 26,
          width: 26,
          borderRadius: 100,
          backgroundColor: colors.gray,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TextComponent text="99" color={colors.gray3}/>
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          zIndex: 0,
        }}
      >
        <AvatarComponent size={26} />
      </View>
    </View>
  );
};

export default AvatarGroupComponent;
