import React from 'react';
import { StyleProp, TextStyle, View } from 'react-native';
import { RowComponent, SpaceComponent, TextComponent } from '.';
import { colors } from '../constants/colors';
import { fontFamillies } from '../constants/fontFamilies';

interface Props {
  value: boolean | string;
  makeDefault?: string;
  title: string;
  titleStyles?: StyleProp<TextStyle>;
  onPress: (val: boolean) => void;
}

const CheckedButtonComponent = (props: Props) => {
  const { value, makeDefault, title, titleStyles, onPress } = props;
  return (
    <RowComponent onPress={() => onPress(!value)}>
      <View
        style={{
          height: 18,
          width: 32,
          borderRadius: 20,
          borderWidth: 1,
          borderColor:
            (typeof value === 'boolean' && value) || value === makeDefault
              ? colors.primary
              : colors.text,
          flexDirection: 'row',
          justifyContent:
            (typeof value === 'boolean' && value) || value === makeDefault
              ? 'flex-end'
              : 'flex-start',
          backgroundColor:
            (typeof value === 'boolean' && value) || value === makeDefault
              ? colors.primary
              : colors.text,
        }}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 100,
            borderWidth: 1,
            borderColor:
              (typeof value === 'boolean' && value) || value === makeDefault
                ? colors.primary
                : colors.text,
            backgroundColor: colors.background,
          }}
        />
      </View>
      <SpaceComponent width={10} />
      <TextComponent
        text={title}
        color={colors.text}
        font={fontFamillies.poppinsMedium}
        styles={titleStyles}
      />
    </RowComponent>
  );
};

export default CheckedButtonComponent;
