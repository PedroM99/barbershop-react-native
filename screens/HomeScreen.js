import React from 'react';
import { View, Text, StyleSheet, Alert, FlatList } from 'react-native';
import user_placeholder from '../assets/user_placeholder.png';
import Barber from '../components/barber';
import Barbers from '../data/Barbers'; 
import Footer from '../components/footerNavigation';
import {SafeAreaView} from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AppointmentSelector from '../components/appointmentSelector';


export default function HomeScreen() {
  
  const navigation = useNavigation();

  return (
    <SafeAreaView style = {styles.safeArea}>
      <View style = {styles.header}>
        <Text style={styles.title}>Welcome to the Barbershop</Text>
      </View>
      <FlatList
        contentContainerStyle={{ paddingBottom: 35 }}
        key={2}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 20 }}
        showsVerticalScrollIndicator={false}
        data={Barbers}
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
      <Footer 
      onPressAppointments={() => Alert.alert('Appointments pressed')}
      onPressHome={() => Alert.alert('Home pressed')}
      onPressProfile={() => Alert.alert('Profile pressed')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
