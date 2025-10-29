import React, { ReactNode } from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Shadow } from 'react-native-shadow-2';
import { ButtonComponent } from '.';
import { colors } from '../constants/colors';
import { fontFamillies } from '../constants/fontFamilies';
import { sizes } from '../constants/sizes';

interface Props {
  disable?: boolean;
  onPress: () => void;
  isLoading?: boolean;
  title: string;
  preffix?: ReactNode;
  suffix?: ReactNode;
  titleStyles?: StyleProp<TextStyle>;
  btnStyles?: StyleProp<ViewStyle>;
}
const BtnShadowLinearComponent = (props: Props) => {
  const {
    disable,
    onPress,
    title,
    preffix,
    suffix,
    titleStyles,
    btnStyles,
    isLoading,
  } = props;
  return disable ? (
    <ButtonComponent
      disable
      isLoading={isLoading ?? false}
      color={colors.gray}
      onPress={() => {}}
      text={title}
      textStyles={[
        {
          color: colors.background,
          fontFamily: fontFamillies.poppinsSemiBold,
          fontSize: sizes.bigText,
          marginLeft: 20,
        },
        titleStyles,
      ]}
      styles={[
        {
          flexDirection: 'row',
          justifyContent: 'center',
          borderRadius: 5,
          marginBottom: 16,
        },
        btnStyles,
      ]}
      preffix={preffix ?? undefined}
      suffix={suffix ?? undefined}
    />
  ) : (
    <Shadow
      distance={5}
      startColor={`${colors.primaryLight}d8`}
      endColor={`${colors.primary}10`}
      offset={[0, 4]}
      style={{
        width: '100%',
        marginBottom: 16,
      }}
    >
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={[colors.primaryDark, colors.primary]}
        style={{ borderRadius: 5 }}
      >
        <ButtonComponent
          isLoading={isLoading ?? false}
          color="transparent"
          onPress={onPress}
          text={title}
          textStyles={[
            {
              color: colors.background,
              fontFamily: fontFamillies.poppinsSemiBold,
              fontSize: sizes.bigText,
              marginLeft: 20,
            },
            titleStyles,
          ]}
          styles={[
            {
              flexDirection: 'row',
              justifyContent: 'center',
              borderRadius: 5,
            },
            btnStyles,
          ]}
          preffix={preffix ?? undefined}
          suffix={suffix ?? undefined}
        />
      </LinearGradient>
    </Shadow>
  );
};

export default BtnShadowLinearComponent;
