import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ContactScreen } from '../screens';

const ContactNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ContactScreen" component={ContactScreen} />
    </Stack.Navigator>
  );
};

export default ContactNavigator;
