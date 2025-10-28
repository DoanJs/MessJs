import React from 'react';
import {
  AvatarComponent,
  AvatarGroupComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '.';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';
import { useNavigation } from '@react-navigation/native';

interface Props {
  type?: string;
}
const MessageItemComponent = (props: Props) => {
  const { type } = props;
  const navigation: any = useNavigation()
  return (
    <RowComponent
      styles={{
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray,
      }}
      onPress={() => navigation.navigate('MessageDetailScreen', {type})}
    >
      {type === 'group' ? <AvatarGroupComponent /> : <AvatarComponent />}
      <SpaceComponent width={16} />
      <RowComponent
        styles={{
          flexDirection: 'column',
          flex: 1,
          alignItems: 'flex-start',
        }}
      >
        <TextComponent text="Js" size={sizes.bigText} />
        <TextComponent
          text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam numquam odio ex autem id iusto distinctio dolore error ea fugit veritatis sed incidunt a minima, facilis culpa quis itaque! Laudantium."
          color={colors.gray3}
          numberOfLine={1}
        />
      </RowComponent>
      <SpaceComponent width={10} />
      <TextComponent
        text="21 giờ"
        color={colors.gray3}
        size={sizes.smallText}
      />
    </RowComponent>
  );
};

export default MessageItemComponent;
