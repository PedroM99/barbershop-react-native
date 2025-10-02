import 'react-native-reanimated'; // This *must* be at the top
import "./global.css";
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './screens/HomeScreen';
import BarberDetails from './screens/BarberDetails';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import RegisterScreen from './screens/RegisterScreen';
import MakeAppointmentScreen from './screens/MakeAppointmentScreen';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProvider } from './context/UserContext';

import { useFonts } from "expo-font";
import { CormorantGaramond_600SemiBold, CormorantGaramond_700Bold } from "@expo-google-fonts/cormorant-garamond";
import { Inter_400Regular, Inter_500Medium } from "@expo-google-fonts/inter";

const Stack = createNativeStackNavigator();

// optional: dark background for nav container to prevent white flashes
const DarkNavTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: '#000' },
};

export default function App() {
  const [loaded] = useFonts({
    "CormorantGaramond-SemiBold": CormorantGaramond_600SemiBold,
    "CormorantGaramond-Bold": CormorantGaramond_700Bold,
    "Inter-Regular": Inter_400Regular,
    "Inter-Medium": Inter_500Medium,
  });
  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <NavigationContainer theme={DarkNavTheme}>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerStyle: { backgroundColor: '#101010' },      // matte charcoal
              headerTitleStyle: {
                color: '#EDEADE',                               // ivory
                fontFamily: 'CormorantGaramond-Bold',       
                fontSize: 18,
              },
              headerTintColor: '#EDEADE',                       // back arrow & icons
              headerTitleAlign: 'center',
              headerShadowVisible: true,
              headerShadowColor: 'rgba(255,255,255,0.06)',      // subtle hairline
              contentStyle: { backgroundColor: 'transparent' }, // screens render their own bg
            }}
          >
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ headerShown: true, title: 'Profile' }}
            />
            <Stack.Screen
              name="BarberDetails"
              component={BarberDetails}
              options={{ headerShown: true, title: 'Barber Details' }}
            />
            <Stack.Screen
              name="MakeAppointment"
              component={MakeAppointmentScreen}
              options={{ headerShown: true, title: 'Make Appointment' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
