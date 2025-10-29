import React, { ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../constants/colors';
import { fontFamillies } from '../constants/fontFamilies';
import TextComponent from './TextComponent';

interface Props {
  disable?: boolean;
  text: string;
  isLoading?: boolean;
  color?: string;
  preffix?: ReactNode;
  suffix?: ReactNode;
  styles?: StyleProp<ViewStyle>;
  textStyles?: StyleProp<TextStyle>;
  onPress: () => void;
}

const ButtonComponent = (props: Props) => {
  const {
    disable,
    text,
    isLoading,
    onPress,
    color,
    preffix,
    suffix,
    styles,
    textStyles,
  } = props;
  const localStyle = StyleSheet.create({
    btnContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: color
        ? color
        : isLoading
        ? colors.background
        : colors.text,
      padding: 10,
      borderRadius: 100,
    },
  });
  return disable ? (
    <View style={[localStyle.btnContainer, styles]}>
      {preffix && preffix}
      <TextComponent
        text={text}
        flex={0}
        styles={[textStyles]}
        font={fontFamillies.poppinsBold}
      />
      {suffix && suffix}
    </View>
  ) : (
    <TouchableOpacity
      disabled={isLoading}
      style={[localStyle.btnContainer, styles]}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <>
          {preffix && preffix}
          <TextComponent
            text={text}
            flex={0}
            styles={[textStyles]}
            font={fontFamillies.poppinsBold}
          />
          {suffix && suffix}
        </>
      )}
    </TouchableOpacity>
  );
};

export default ButtonComponent;
