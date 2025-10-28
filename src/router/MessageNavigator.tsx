import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessageScreen } from '../screens';

const MessageNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MessageScreen" component={MessageScreen} />
    </Stack.Navigator>
  );
};

export default MessageNavigator;
