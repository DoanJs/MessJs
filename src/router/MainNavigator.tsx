import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from '.';
import { AddFriendScreen, AddGroupScreen, MessageDetailScreen, SearchMsgScreen, SearchScreen } from '../screens';

const MainNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="MessageDetailScreen" component={MessageDetailScreen} />
      <Stack.Screen name="SearchMsgScreen" component={SearchMsgScreen} />
      <Stack.Screen name="AddGroupScreen" component={AddGroupScreen} />
      <Stack.Screen name="AddFriendScreen" component={AddFriendScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
