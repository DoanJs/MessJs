import { PhoneAuthProvider, signInWithPhoneNumber } from '@react-native-firebase/auth';
import { doc, getDoc, serverTimestamp } from '@react-native-firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { auth, db } from '../../../firebase.config';
import {
  BtnShadowLinearComponent,
  Container,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import { addDocData } from '../../constants/addDocData';
import { colors } from '../../constants/colors';
import { fontFamillies } from '../../constants/fontFamilies';
import { setDocData } from '../../constants/setDocData';
import { sizes } from '../../constants/sizes';
import useVerifyPhoneStore from '../../zustand/store/useVerifyPhoneStore';

const OTPScreen = ({ navigation, route }: any) => {
  const { params } = route
  const [codeValues, setCodeValues] = useState<string[]>([]);
  const [disable, setDisable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { verifyPhone, setVerifyPhone } = useVerifyPhoneStore();
  const [limit, setLimit] = useState(83);
  const ref1 = useRef<any>(0);
  const ref2 = useRef<any>(1);
  const ref3 = useRef<any>(2);
  const ref4 = useRef<any>(3);
  const ref5 = useRef<any>(4);
  const ref6 = useRef<any>(5);

  useEffect(() => {
    ref1.current.focus();
  }, []);

  useEffect(() => {
    if (limit > 0) {
      const interval = setInterval(() => {
        setLimit((limit) => limit - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [limit]);

  useEffect(() => {
    if (codeValues.length < 6) {
      setDisable(true)
    } else {
      setDisable(false)
    }
  }, [codeValues])

  const handleChangeCode = (val: string, index: number) => {
    const data = [...codeValues];
    data[index] = val;

    setCodeValues(data);
  };
  // verificationId
  const handleVerifyCode = async () => {
    const { verificationId } = verifyPhone
    setIsLoading(true)
    try {
      if (!verificationId) throw new Error('Missing verificationId');
      const credential = PhoneAuthProvider.credential(verificationId, codeValues.join(''));
      const { user } = await auth.signInWithCredential(credential);

      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (!docSnap.exists()) {
        setDocData({
          nameCollect: 'users',
          id: user.uid,
          valueUpdate: {
            email: '',
            name: user.phoneNumber,
            url: '',
            phone: user.phoneNumber,
            createAt: serverTimestamp(),
            updateAt: serverTimestamp(),
          },
        });
        addDocData({
          nameCollect: 'settings',
          value: {
            allowNotifications: true,
            emailNotifications: false,
            orderNotifications: false,
            generalNotifications: true,
            userId: user.uid,
            createAt: serverTimestamp(),
            updateAt: serverTimestamp(),
          },
        });
      } else {
        console.log(`getDoc data error`);
      }
      setIsLoading(false)
      // Ví dụ: quay lại Home
      navigation.replace('Main');
      console.log('Phone auth successful');
    } catch (error) {
      console.error('❌ Sai OTP:', error);
    }


  };

  const handleSendOTP = async () => {
    const { phoneFull } = params;
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneFull);
      setVerifyPhone(confirmation);
      console.log('✅ OTP đã gửi tới: ', phoneFull);
    } catch (err) {
      console.error('❌ Lỗi gửi OTP: ', err);
    }
  };

  return (
    <Container bg={colors.background1} back title="Verify Number">
      <SectionComponent
        styles={{
          flex: 1,
        }}
      >
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: '35%',
          }}
        >
          <TextComponent
            text="Verify your number"
            font={fontFamillies.poppinsSemiBold}
            size={sizes.title}
          />
          <TextComponent
            styles={{
              textAlign: 'center',
              width: '80%',
            }}
            text="Enter your OTP code below"
            font={fontFamillies.poppinsMedium}
            size={sizes.bigText}
            color={colors.text}
          />
        </View>

        <RowComponent
          styles={{
            justifyContent: 'space-around',
          }}
        >
          <TextInput
            keyboardType="number-pad"
            style={[styles.input]}
            maxLength={1}
            placeholder="-"
            ref={ref1}
            value={codeValues[0]}
            onChangeText={val => {
              val.length > 0 && ref2.current.focus();
              handleChangeCode(val, 0);
            }}
          />
          <TextInput
            keyboardType="number-pad"
            style={[styles.input]}
            maxLength={2}
            placeholder="-"
            ref={ref2}
            value={codeValues[1]}
            onChangeText={val => {
              val.length > 0 && ref3.current.focus();
              handleChangeCode(val, 1);
            }}
          />
          <TextInput
            keyboardType="number-pad"
            style={[styles.input]}
            maxLength={3}
            placeholder="-"
            ref={ref3}
            value={codeValues[2]}
            onChangeText={val => {
              val.length > 0 && ref4.current.focus();
              handleChangeCode(val, 2);
            }}
          />
          <TextInput
            keyboardType="number-pad"
            style={[styles.input]}
            maxLength={4}
            placeholder="-"
            ref={ref4}
            value={codeValues[3]}
            onChangeText={val => {
              val.length > 0 && ref5.current.focus();
              handleChangeCode(val, 3);
            }}
          />
          <TextInput
            keyboardType="number-pad"
            style={[styles.input]}
            maxLength={5}
            placeholder="-"
            ref={ref5}
            value={codeValues[4]}
            onChangeText={val => {
              val.length > 0 && ref6.current.focus();
              handleChangeCode(val, 4);
            }}
          />
          <TextInput
            keyboardType="number-pad"
            style={[styles.input]}
            maxLength={6}
            placeholder="-"
            ref={ref6}
            value={codeValues[5]}
            onChangeText={val => handleChangeCode(val, 5)}
          />
        </RowComponent>

        <SpaceComponent height={16} />

        <BtnShadowLinearComponent
          isLoading={isLoading}
          disable={disable}
          onPress={handleVerifyCode} title="Next"
        />

        <RowComponent
          styles={{
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <TextComponent
            text="Did’nt receive the code ?"
            font={fontFamillies.poppinsLight}
            size={sizes.bigText}
          />
          <RowComponent onPress={limit > 0 ? undefined : handleSendOTP}>
            <TextComponent
              text="Resend a new code"
              font={fontFamillies.poppinsMedium}
              size={sizes.bigText}
              color={limit > 0 ? colors.text : colors.text2}
            />
            {
              limit > 0 &&
              <TextComponent
                color={limit > 0 ? colors.text : colors.text2}
                text={` (${(limit - (limit % 60)) / 60}:${limit - (limit - (limit % 60))
                  })`} />
            }
          </RowComponent>
        </RowComponent>
      </SectionComponent>
    </Container>
  );
};

export default OTPScreen;
const styles = StyleSheet.create({
  input: {
    height: 55,
    width: 55,
    borderRadius: 5,
    backgroundColor: colors.background,
    borderColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
    fontFamily: fontFamillies.poppinsBold,
    textAlign: 'center',
  },
});
