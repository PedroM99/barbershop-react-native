/**
 * AppLayout — Common page chrome for the app.
 * Wraps each screen in a SafeAreaView and renders a floating Footer nav.
 * - Ensures the screen content never sits behind the Footer by adding bottom padding
 *   equal to the Footer's measured height.
 * - Exposes navigation shortcuts to the Footer buttons.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Footer from './footerNavigation';


export default function AppLayout({ children }) {

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']} >
      <View style={styles.content}>
        {children}
      </View>
      
      <Footer/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1 },
});
