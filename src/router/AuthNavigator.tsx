import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { AuthHomeScreen, ForgotPasswordScreen, Login, Register } from '../screens';

const AuthNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthHomeScreen" component={AuthHomeScreen} />
       <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      {/* <Stack.Screen name='Main' component={TabNavigator} /> */}
    </Stack.Navigator>
  );
};

export default AuthNavigator;
