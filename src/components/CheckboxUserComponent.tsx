import React, { useState } from 'react';
import { View } from 'react-native';
import {
  AvatarComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '.';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';
import { UserModel } from '../models';

interface Props {
  friend: UserModel;
  memberGroup: any[];
  setMemberGroup: any
}

const CheckboxUserComponent = (props: Props) => {
  const { friend, memberGroup, setMemberGroup } = props;
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckBox = () => {
    const items = [...memberGroup];
    const index = items.findIndex((_: any) => _.id === friend.id);
    if (index === -1) {
        items.push(friend)
    } else {
        items.splice(index, 1);
    }

    setMemberGroup(items)
    setIsChecked(!isChecked);
  };
  return (
    <RowComponent onPress={handleCheckBox} styles={{ marginVertical: 6 }}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 100,
          borderWidth: 1,
          borderColor: colors.gray2,
          backgroundColor: isChecked ? colors.textBold : colors.background,
        }}
      />
      <SpaceComponent width={16} />
      <AvatarComponent size={sizes.smallHeader} uri={friend.photoURL} />
      <SpaceComponent width={10} />
      <View style={{ flex: 1 }}>
        <TextComponent text={friend.displayName} color={colors.text} />
        <TextComponent
          text="6 giờ trước"
          color={colors.gray3}
          size={sizes.smallText}
        />
      </View>
    </RowComponent>
  );
};

export default CheckboxUserComponent;
