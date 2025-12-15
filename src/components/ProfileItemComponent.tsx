import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import {
  AvatarComponent,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '.';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';
import { useUserStore } from '../zustand';

const ProfileItemComponent = () => {
  const navigation: any = useNavigation()
  const { user } = useUserStore()

  if (!user) return <ActivityIndicator />

  return (
    <RowComponent justify="space-between" styles={{ marginVertical: 10 }}>
      <RowComponent onPress={() => navigation.navigate('Main', {
        screen: 'Profile'
      })} styles={{ flex: 1 }}>
        <AvatarComponent size={sizes.header} uri={user.photoURL} />
        <SpaceComponent width={10} />
        <TextComponent text={user.displayName} numberOfLine={1} />
      </RowComponent>
      <RowComponent styles={{ paddingHorizontal: 10 }}>
        <TextComponent
          text={'Chính bạn'}
          styles={{ fontStyle: 'italic' }}
          color={colors.textBold}
        />
      </RowComponent>
    </RowComponent>
  );
};

export default ProfileItemComponent;
