/**
 * FooterNavigation — Floating bottom navigation bar.
 * 
 * Displays three icon buttons:
 *  - Calendar icon → Appointments screen
 *  - Home icon → Home screen
 *  - Profile icon → User profile screen
 *
 * Positioning:
 *  - Absolute at the bottom with rounded background container
 *  - Uses shadows/elevation for floating effect
 */


import React from 'react';
import { View, Pressable, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';


export default function Footer() {

   const navigation = useNavigation();
   const insets = useSafeAreaInsets();
   const { setUser } = useUser();

   const confirmLogout = () =>
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          setUser(null);
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);

  return (
    <View pointerEvents='box-none' style={[styles.container, { bottom: insets.bottom + 12 }]}>
      <View style={styles.navBar}>
        <Pressable style={styles.navButton} onPress={confirmLogout}>
          <MaterialIcons name="logout" size={32} color="#222" />
        </Pressable>

        <Pressable style={styles.navButton} onPress={() => navigation.navigate('Home')}>
          <MaterialIcons name="home" size={32} color="#222" />
        </Pressable>

        <Pressable style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
          <MaterialIcons name="person" size={32} color="#222" />
        </Pressable>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'space-around',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,      // more height
    paddingHorizontal: 20,    // more width
    minWidth: 80
  },
});
