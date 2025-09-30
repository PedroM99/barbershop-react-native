/**
 * HomeScreen — Main landing page of the app.
 *
 * Features:
 * - Displays a welcome message (personalized if `user` is passed via route params)
 * - Grid of barber cards (2-column FlatList)
 * - Clicking a barber navigates to the BarberDetails screen with that barber's data
 * - Wrapped in AppLayout, which provides consistent SafeArea and bottom navigation
 */


import React, {useCallback, useState} from 'react';
import { View, Text, FlatList, BackHandler, ImageBackground } from 'react-native';
import user_placeholder from '../assets/user_placeholder.png';
import Barber from '../components/barber';
import Barbers from '../data/Barbers'; 
import AppLayout from '../components/appLayout';
import ConfirmAlert from "../components/confirmAlert";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import background from '../assets/background.png';


export default function HomeScreen() {
  
  const navigation = useNavigation();
  const { user, setUser } = useUser();
  const firstName = user?.name? user.name.match(/^\S+/)[0] : '';
  const insets = useSafeAreaInsets();
  const [showLogout, setShowLogout] = useState(false);

  const onBackPress = useCallback(() => {
    setShowLogout(true);
    return true; 
  }, []);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [onBackPress])
  );


  const confirmLogout = useCallback(() => {
    setUser(null);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    setShowLogout(false);
  }, [navigation, setUser]);

  return (
    <AppLayout>
    <ImageBackground
      source={background}
      resizeMode="cover"
      className="flex-1"
      imageStyle={{ opacity: 1 }}  
    >
    <View
      className="px-5 py-2 bg-white border-b border-gray-200 items-center"
      style={{ paddingTop: insets.top }}
    >
      <Text className="text-2xl font-bold text-gray-900">{user ? 'Welcome ' + firstName : 'Welcome to the Barber Shop'} </Text>
    </View>

    <FlatList
      key={2}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 20 }}
      showsVerticalScrollIndicator={false}
      data={Barbers}
      contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20, paddingTop: 12 }}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
      <Barber
        name={item.name}
        specialty={item.specialty}
        image={user_placeholder}
        onPress={() => navigation.navigate('BarberDetails', { barber: item })}
      />
      )}
    />
    </ImageBackground>
    <ConfirmAlert
        visible={showLogout}
        message="Are you sure you want to log out?"
        onCancel={() => setShowLogout(false)}
        onConfirm={confirmLogout}
      />
    </AppLayout>
  );
}

