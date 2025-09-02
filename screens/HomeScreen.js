/**
 * HomeScreen — Main landing page of the app.
 *
 * Features:
 * - Displays a welcome message (personalized if `user` is passed via route params)
 * - Grid of barber cards (2-column FlatList)
 * - Clicking a barber navigates to the BarberDetails screen with that barber's data
 * - Wrapped in AppLayout, which provides consistent SafeArea and bottom navigation
 */


import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import user_placeholder from '../assets/user_placeholder.png';
import Barber from '../components/barber';
import Barbers from '../data/Barbers'; 
import AppLayout from '../components/appLayout';
import {SafeAreaView} from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from '../context/UserContext';


export default function HomeScreen() {
  
  const navigation = useNavigation();
  const { user } = useUser();
  const firstName = user?.name? user.name.match(/^\S+/)[0] : '';

  return (
    <AppLayout>
    <View style = {styles.screen}>
      <View style = {styles.header}>
        <Text style={styles.title}>{user? 'Welcome ' + firstName : 'Welcome to the Barber Shop'} </Text>
      </View>
      <FlatList
        key={2}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 20 }}
        showsVerticalScrollIndicator={false}
        data={Barbers}
        contentContainerStyle= {{paddingBottom: 100}}
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
    </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
  paddingHorizontal: 20,
  paddingVertical: 5,
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  alignItems: 'center',
},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
