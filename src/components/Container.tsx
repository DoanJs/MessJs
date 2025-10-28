import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'iconsax-react-native';
import React, { ReactNode } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { RowComponent } from '.';
import { colors } from '../constants/colors';
import { globalStyles } from '../styles/globalStyles';

type Props = {
  children: ReactNode;
  title?: ReactNode;
  back?: boolean;
  left?: ReactNode;
  right?: ReactNode;
  center?: ReactNode;
  isScroll?: boolean;
  bg?: string;
  uri?: string;
};

const Container = (props: Props) => {
  const navigation: any = useNavigation();
  const { children, title, back, left, right, center, isScroll, bg } = props;
  const localStyle = StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    title: { paddingHorizontal: 16, flex: 1, alignItems: 'center' },
  });

  return (
    <SafeAreaView
      style={[
        globalStyles.container,
        { backgroundColor: bg ?? colors.background },
      ]}
    >
      {(back || left || right || title) && (
        <RowComponent styles={[localStyle.header]}>
          {back && (
            <ArrowLeft
              size={26}
              color={colors.background}
              onPress={() => navigation.goBack()}
              style={{marginRight: 16}}
            />
          )}
          {title && title}
          {center && center}
          {right && right}
        </RowComponent>
      )}
      {!isScroll ? (
        <View style={[globalStyles.container]}>{children}</View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={[globalStyles.container]}
        >
          {children}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Container;
