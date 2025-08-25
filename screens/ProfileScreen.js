// screens/ProfileScreen.js
import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const user = params?.user;

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.helper}>No user data provided.</Text>
          <Pressable style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Image
          source={user.image || require('../assets/user_placeholder.png')}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.subtle}>ID: {user.id}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Phone</Text>
          <Text style={styles.rowValue}>{user.phone}</Text>
        </View>
      </View>

      {/* Actions — placeholders for future features */}
      <View style={styles.actions}>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => Alert.alert('Edit Profile', 'Coming soon')}
        >
          <Text style={styles.primaryBtnText}>Edit Profile</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryBtn}
          onPress={() => Alert.alert('Logout', `Goodbye ${firstName}! (wire this later)`)}
        >
          <Text style={styles.secondaryBtnText}>Log Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: '800' },
  subtle: { color: '#777', marginTop: 2 },

  section: { paddingHorizontal: 20, paddingVertical: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },

  row: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowLabel: { color: '#666' },
  rowValue: { fontWeight: '600' },

  actions: { paddingHorizontal: 20, marginTop: 8, gap: 10 },
  primaryBtn: {
    backgroundColor: '#222',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#222', fontWeight: '700' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  helper: { color: '#666' },
});
