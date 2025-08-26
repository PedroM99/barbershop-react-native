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
 *
 * Props:
 *  - onPressAppointments: callback when appointments button is pressed
 *  - onPressHome: callback when home button is pressed
 *  - onPressProfile: callback when profile button is pressed
 */


import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Footer({ onPressAppointments, onPressHome, onPressProfile }) {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <Pressable style={styles.navButton} onPress={onPressAppointments}>
          <MaterialIcons name="event" size={32} color="#222" />
        </Pressable>

        <Pressable style={styles.navButton} onPress={onPressHome}>
          <MaterialIcons name="home" size={32} color="#222" />
        </Pressable>

        <Pressable style={styles.navButton} onPress={onPressProfile}>
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
  label: {
    fontSize: 10,
    marginTop: 2,
    color: '#222',
  },
});
