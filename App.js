import 'react-native-reanimated'; // must be first
import "./global.css";
import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
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


const APP_BG = '#0B0B0C';
const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: APP_BG, 
    card: APP_BG,       
    border: 'transparent',
    text: '#EDEADE',
    primary: '#EDEADE',
  },
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
    
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: APP_BG }}>
      <UserProvider>
        <NavigationContainer theme={MyTheme}>
          <StatusBar style="light" backgroundColor={APP_BG} />
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              // Critical: never transparent during transitions
              contentStyle: { backgroundColor: APP_BG },

              headerStyle: { backgroundColor: APP_BG },
              headerTitleStyle: {
                color: '#EDEADE',
                fontFamily: 'CormorantGaramond-Bold',
                fontSize: 18,
              },
              headerTintColor: '#EDEADE',
              headerTitleAlign: 'center',
              headerShadowVisible: true,
              headerShadowColor: 'rgba(255,255,255,0.06)',

              // Softer animation reduces any perceptible flicker
              animation: 'slide_from_right',
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
