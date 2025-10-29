import React, { ReactNode } from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface Props {
  children: ReactNode;
  styles?: StyleProp<ViewStyle>;
}
const KeyboardAwareScrollViewComponent = (props: Props) => {
  const { children, styles } = props;
  return (
    <KeyboardAwareScrollView
      style={[{ flex: 1 }, styles]}
      contentContainerStyle={{ flexGrow: 1, padding: 16 }}
      enableOnAndroid={true} // rất quan trọng cho Android
      extraScrollHeight={20} // thêm khoảng trống khi scroll
      extraHeight={Platform.OS === 'ios' ? 0 : 100}
      keyboardOpeningTime={0}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </KeyboardAwareScrollView>
  );
};

export default KeyboardAwareScrollViewComponent;
