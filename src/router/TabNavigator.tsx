import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Message, Profile2User, User } from 'iconsax-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContactNavigator, MessageNavigator, ProfileNavigator } from '.';
import { TextComponent } from '../components';
import { colors } from '../constants/colors';
import { fontFamillies } from '../constants/fontFamilies';
import { sizes } from '../constants/sizes';

const TabNavigator = () => {
  const Tab = createBottomTabNavigator();
  const insets = useSafeAreaInsets();

  const tabBarIcon = ({ focused, size, color, route }: any) => {
    color = focused ? colors.background : colors.text;
    size = sizes.title;
    let icon = <Message variant="Bold" size={size} color={color} />;
    let title;

    switch (route.name) {
      case 'Message':
        icon = (
          <View
            style={{
              position: 'relative',
            }}
          >
            {/* {
            pendings.length > 0 &&
            <TextComponent
              text={`${pendings.length}`}
              size={size.smallText}
              font={fontFamillies.poppinsBold}
              color={colors.red}
              styles={{
                position: 'absolute',
                height: 26,
                width: 26,
                top: -10,
                right: -24,
                borderRadius: 100,
              }}
            />
          } */}
            <Message size={size} variant="Bold" color={color} />
          </View>
        );
        title = (
          <TextComponent
            text="Tin nhắn"
            size={sizes.smallText}
            color={color}
            font={fontFamillies.poppinsBold}
          />
        );
        break;
      case 'Contact':
        icon = (
          <View
            style={{
              position: 'relative',
            }}
          >
            {/* {
            carts.length > 0 &&
            <TextComponent
              text={`${carts.length}`}
              size={size.smallText}
              font={fontFamillies.poppinsBold}
              color={colors.red}
              styles={{
                position: 'absolute',
                height: 26,
                width: 26,
                top: -10,
                right: -24,
                borderRadius: 100,
              }}
            />
          } */}
            <Profile2User variant="Bold" size={size} color={color} />
          </View>
        );
        title = (
          <TextComponent
            text="Danh bạ"
            size={sizes.smallText}
            color={color}
            font={fontFamillies.poppinsBold}
          />
        );
        break;
      case 'Profile':
        icon = <User variant="Bold" size={size} color={color} />;
        title = (
          <TextComponent
            text="Cá nhân"
            size={sizes.smallText}
            color={color}
            font={fontFamillies.poppinsBold}
          />
        );
        break;

      default:
        break;
    }
    return (
      <View style={localStyle.tabIcon}>
        {icon}
        {title}
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.primaryLight,
          paddingTop: 8,
          justifyContent: 'space-around',
          alignItems: 'center',
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom,
          position: 'absolute',
        },
        tabBarIcon: ({ focused, size, color }: any) =>
          tabBarIcon({ focused, size, color, route }),
      })}
    >
      <Tab.Screen name="Message" component={MessageNavigator} />
      <Tab.Screen name="Contact" component={ContactNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
const localStyle = StyleSheet.create({
  tabIcon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    width: 200,
  },
});
