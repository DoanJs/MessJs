import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from '.';
import { MessageDetailScreen } from '../screens';

const MainNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="MessageDetailScreen" component={MessageDetailScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
