import React from 'react';
import { Image, ImageBackground, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import googlePng from '../../assets/images/google.png';
import userPng from '../../assets/images/user.png';
import {
  BtnShadowLinearComponent,
  ButtonComponent,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import { colors } from '../../constants/colors';
import { fontFamillies } from '../../constants/fontFamilies';
import { sizes } from '../../constants/sizes';
// import { signInWithGoogle } from '../../../firebase.config';

const AuthHomeScreen = ({ navigation }: any) => {
  const handleLoginGoolgle = () => {
    // signInWithGoogle()
  };
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ImageBackground
        source={{
          uri: 'https://cdn.pixabay.com/photo/2019/10/30/16/19/fox-4589927_1280.jpg',
        }}
        imageStyle={{ resizeMode: 'cover' }}
        style={{ flex: 1, alignItems: 'center' }}
      >
        <SectionComponent
          styles={{ backgroundColor: 'transparent', top: '6%' }}
        >
          <RowComponent styles={{ width: '100%' }}>
            <TextComponent
              text="Welcome"
              color={colors.background}
              size={sizes.title}
              flex={1}
              font={fontFamillies.poppinsBold}
              styles={{
                textAlign: 'center',
              }}
            />
          </RowComponent>
        </SectionComponent>

        <View
          style={{
            backgroundColor: colors.background1,
            position: 'absolute',
            right: 0,
            left: 0,
            bottom: 0,
            paddingVertical: 20,
            borderRadius: 10,
          }}
        >
          <SectionComponent>
            <TextComponent
              text="Welcome"
              font={fontFamillies.poppinsSemiBold}
              size={sizes.title}
            />
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TextComponent
                textAlign="center"
                text="MESS JS"
                color={colors.text}
                font={fontFamillies.poppinsBold}
                styles={{
                  width: '80%',
                }}
              />
            </View>

            <SpaceComponent height={16} />

            <ButtonComponent
              text="Continue with google"
              onPress={handleLoginGoolgle}
              color={colors.background}
              preffix={
                <Image source={googlePng} style={{ marginHorizontal: 20 }} />
              }
              styles={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                borderRadius: 5,
                marginBottom: 10,
              }}
              textStyles={{
                fontFamily: fontFamillies.poppinsMedium,
                fontSize: sizes.bigText,
                marginLeft: 16,
              }}
            />

            <BtnShadowLinearComponent
              title="Create an account"
              onPress={() => navigation.navigate('Register')}
              preffix={
                <Image source={userPng} style={{ marginHorizontal: 20 }} />
              }
              btnStyles={{
                justifyContent: 'flex-start',
              }}
            />

            <RowComponent justify="center">
              <TextComponent
                text="Already have an account ?"
                size={sizes.bigText}
                font={fontFamillies.poppinsLight}
                color={colors.text}
              />
              <SpaceComponent width={10} />
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <TextComponent
                  text="Login"
                  color={colors.text}
                  size={sizes.bigText}
                  font={fontFamillies.poppinsMedium}
                />
              </TouchableOpacity>
            </RowComponent>
          </SectionComponent>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};
export default AuthHomeScreen;
