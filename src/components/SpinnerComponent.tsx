import React from 'react';
import Spinner from 'react-native-loading-spinner-overlay';
import { colors } from '../constants/colors';

interface Props {
  loading: boolean;
}
const SpinnerComponent = (props: Props) => {
  const { loading } = props;
  return (
    <Spinner
      visible={loading}
      textContent={'Đang xử lý...'}
      textStyle={{ color: colors.background }}
      overlayColor={colors.spinner}
    />
  );
};

export default SpinnerComponent;
