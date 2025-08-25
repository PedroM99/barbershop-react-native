import React from 'react';
import { View, Text, StyleSheet, Alert, FlatList } from 'react-native';
import user_placeholder from '../assets/user_placeholder.png';
import Barber from '../components/barber';
import Barbers from '../data/Barbers'; 
import AppLayout from '../components/appLayout';
import {SafeAreaView} from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';


export default function HomeScreen() {
  
  const navigation = useNavigation();
  const { params } = useRoute();
  const user = params?.user;
  const userId = user?.id; 
  const firstName = user?.name? user.name.match(/^\S+/)[0] : '';

  return (
    <AppLayout>
    <SafeAreaView style = {styles.safeArea}>
      <View style = {styles.header}>
        <Text style={styles.title}>{user? 'Welcome ' + firstName : 'Welcome to the Barber Shop'} </Text>
      </View>
      <FlatList
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
    </SafeAreaView>
    </AppLayout>
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
