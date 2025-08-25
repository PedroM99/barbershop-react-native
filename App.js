import 'react-native-reanimated'; // This *must* be at the top
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import BarberDetails from './screens/BarberDetails';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';  
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MakeAppointmentScreen from './screens/MakeAppointmentScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
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
          options={{ headerShown: true, title: 'Barber Details' }}
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
  </GestureHandlerRootView>
  );
}
