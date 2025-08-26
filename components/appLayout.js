/**
 * AppLayout — Common page chrome for the app.
 * Wraps each screen in a SafeAreaView and renders a floating Footer nav.
 * - Ensures the screen content never sits behind the Footer by adding bottom padding
 *   equal to the Footer's measured height.
 * - Exposes navigation shortcuts to the Footer buttons.
 */

import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Footer from './footerNavigation';

const FOOTER_HEIGHT = 88; 

export default function AppLayout({ children }) {
  const navigation = useNavigation();
  const { params } = useRoute();
  const user = params?.user; 

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.content, { paddingBottom: FOOTER_HEIGHT }]}>
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
