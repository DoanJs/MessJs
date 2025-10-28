import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';
import { fontFamillies } from '../constants/fontFamilies';

interface Props {
  text: string;
  size?: number;
  font?: string;
  flex?: number;
  numberOfLine?: number;
  color?: string;
  textAlign?: 'auto'
  | 'center'
  | 'justify'
  | 'right'
  | 'left';
  type?:
  | 'extraTitle'
  | 'bigTitle'
  | 'title'
  | 'subTitle'
  | 'smallTitle'
  | 'extraText'
  | 'bigText'
  | 'text'
  | 'subText'
  | 'smallText';
  styles?: StyleProp<TextStyle>;
}

const TextComponent = (props: Props) => {
  const { text, size, font, color, flex, styles, numberOfLine, type, textAlign } = props;
  let fontSize: number = sizes.text;
  let fontFamily: string = fontFamillies.poppinsRegular;

  switch (type) {
    case 'extraTitle':
      fontSize = sizes.extraTitle;
      break;
    case 'bigTitle':
      fontSize = sizes.bigTitle;
      break;
    case 'title':
      fontSize = sizes.title;
      break;
    case 'smallTitle':
      fontSize = sizes.smallTitle;
      break;
    case 'subTitle':
      fontSize = sizes.subTitle;
      break;
    case 'extraText':
      fontSize = sizes.extraText;
      break;
    case 'bigText':
      fontSize = sizes.bigText;
      break;
    case 'subText':
      fontSize = sizes.subText;
      break;
    case 'text':
      fontSize = sizes.text;
      break;
    case 'smallText':
      fontSize = sizes.smallText;
      break;

    default:
      fontSize = sizes.text;
      fontFamily = fontFamillies.poppinsRegular;
      break;
  }

  return (
    <Text
      numberOfLines={numberOfLine}
      style={[
        {
          flex: flex,
          fontFamily: font ?? fontFamily,
          fontSize: size ?? fontSize,
          color: color ?? colors.text,
          textAlign: textAlign ?? 'left'
        },
        styles,
      ]}
    >
      {text}
    </Text>
  );
};

export default TextComponent;
