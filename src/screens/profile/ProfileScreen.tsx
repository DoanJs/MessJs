import { ArrowRight2, Camera, Logout, UserSquare } from 'iconsax-react-native';
import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Container,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import { colors } from '../../constants/colors';
import { fontFamillies } from '../../constants/fontFamilies';
import { sizes } from '../../constants/sizes';
import { signOut } from '@react-native-firebase/auth';
import { auth } from '../../../firebase.config';

const ProfileScreen = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    await signOut(auth);
    // await GoogleSignin.signOut();
    // await GoogleSignin.revokeAccess()

    setIsLoading(false);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['bottom']}
    >
      <Container bg={colors.primaryLight}>
        <SectionComponent
          styles={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              top: '60%',
              zIndex: 1,
            }}
          >
            <View
              style={{
                marginBottom: 10,
                position: 'relative',
              }}
            >
              <Image
                source={{
                  uri: 'https://cdn.pixabay.com/photo/2019/10/30/16/19/fox-4589927_1280.jpg',
                }}
                style={{
                  resizeMode: 'cover',
                  borderRadius: 100,
                  height: 120,
                  width: 120,
                }}
              />
              <View
                style={{
                  backgroundColor: colors.red,
                  padding: 4,
                  position: 'absolute',
                  borderRadius: 100,
                  bottom: 0,
                  right: 10,
                }}
              >
                <Camera size={16} color={colors.background} variant="Bold" />
              </View>
            </View>
            <TextComponent
              text={`user.name`}
              font={fontFamillies.poppinsSemiBold}
              size={sizes.bigText}
            />
            <TextComponent text={`user.email`} color={colors.text} />
          </View>
        </SectionComponent>

        <SectionComponent
          styles={{
            backgroundColor: colors.background,
            flex: 1,
            paddingTop: 120,
          }}
        >
          <RowComponent justify="space-between" onPress={() => {}}>
            <RowComponent>
              <UserSquare
                size={sizes.title}
                variant="Bold"
                color={colors.textBold}
              />
              <SpaceComponent width={16} />
              <TextComponent
                text="About me"
                font={fontFamillies.poppinsBold}
                color={colors.textBold}
              />
            </RowComponent>
            <ArrowRight2 size={sizes.title} color={colors.textBold} />
          </RowComponent>
          <SpaceComponent height={16 } />
          <RowComponent onPress={handleLogout}>
            <Logout size={sizes.title} color={colors.textBold} />
            <SpaceComponent width={16} />
            <TextComponent
              text="Sign out"
              font={fontFamillies.poppinsBold}
              color={colors.textBold}
            />
          </RowComponent>
        </SectionComponent>
      </Container>
    </SafeAreaView>
  );
};

export default ProfileScreen;
