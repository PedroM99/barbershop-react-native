// screens/ProfileScreen.js
import React, { useMemo } from 'react';
import {
  View, Text, Image, StyleSheet, Pressable, Alert, SectionList,
} from 'react-native';
import AppLayout from '../components/appLayout';
import { useUser } from '../context/UserContext';
import Barbers from '../data/Barbers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, setUser } = useUser();
  const insets = useSafeAreaInsets();

  const sections = useMemo(() => {
    if (!user?.appointments) return [];

    const byId = (id) => Barbers.find(b => String(b.id) === String(id));
    const withBarber = user.appointments.map(a => ({
      ...a,
      barber: byId(a.barberId),
      // naive local time join
      when: new Date(`${a.date}T${a.time}`),
    }));

    const now = new Date();
    const upcoming = withBarber
      .filter(a => a.when >= now && a.status !== 'completed')
      .sort((a, b) => a.when - b.when);

    const past = withBarber
      .filter(a => a.when < now || a.status === 'completed')
      .sort((a, b) => b.when - a.when);

    const sectionsArr = [];
    if (upcoming.length) sectionsArr.push({ title: 'Upcoming', data: upcoming });
    if (past.length) sectionsArr.push({ title: 'Past', data: past });
    return sectionsArr;
  }, [user?.appointments]);

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? '';

  const AppointmentRow = ({ item }) => (
    <View style={styles.apptCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.apptTitle}>{item.barber?.name ?? 'Barber'}</Text>
        <Text style={styles.apptSub}>{item.barber?.specialty ?? ''}</Text>
        <Text style={styles.apptMeta}>
          {item.date} • {item.time} • {item.status}
        </Text>
      </View>
      {/* placeholder action, wire later if needed */}
    </View>
  );

  if (!user) {
    return (
      <AppLayout>
        <View style={styles.center}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.helper}>No user data provided.</Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: insets.top }}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Image
                source={user.image || require('../assets/user_placeholder.png')}
                style={styles.avatar}
              />
              <Text style={styles.name}>{user.name}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Phone</Text>
                <Text style={styles.rowValue}>{user.phone || '-'}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={styles.primaryBtn}
                onPress={() => Alert.alert('Edit Profile', 'Coming soon')}
              >
                <Text style={styles.primaryBtnText}>Edit Profile</Text>
              </Pressable>
            </View>

            {sections.length > 0 && (
              <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>My Appointments</Text>
              </View>
            )}
          </View>
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        renderItem={AppointmentRow}
      />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 10, opacity: 0.9 },
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

  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
    backgroundColor: '#fff',
  },
  sectionHeaderText: { fontSize: 14, fontWeight: '700', color: '#333' },

  apptCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  helper: { color: '#666' },
});
