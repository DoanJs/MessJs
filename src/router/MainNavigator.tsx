import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from '.';
import { AddGroupScreen, MessageDetailScreen } from '../screens';

const MainNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="MessageDetailScreen" component={MessageDetailScreen} />
      <Stack.Screen name="AddGroupScreen" component={AddGroupScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
