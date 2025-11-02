import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../constants/colors';

const ActivityLoadingComponent = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primaryLight} />
    </View>
  );
};

export default ActivityLoadingComponent;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
