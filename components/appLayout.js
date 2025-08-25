// components/AppLayout.js
import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Footer from './footerNavigation';

const FOOTER_HEIGHT = 88; // ~ your footer's visual height + bottom offset

export default function AppLayout({ children }) {
  const navigation = useNavigation();
  const { params } = useRoute();
  const user = params?.user; // forward the logged-in user

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
