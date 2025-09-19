// screens/ProfileScreen.js
import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, Image, StyleSheet, Pressable, Alert, SectionList, TextInput
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AppLayout from '../components/appLayout';
import { useUser } from '../context/UserContext';
import Barbers from '../data/Barbers';
import ConfirmAlert from '../components/confirmAlert';



export default function ProfileScreen() {
  const { user, setUser } = useUser();
  const insets = useSafeAreaInsets();

  // --- Edit state ---
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(user?.name ?? '');
  const [draftPhone, setDraftPhone] = useState(user?.phone ?? '');
  const [draftImage, setDraftImage] = useState(user?.image ?? null); // can be { uri } or require(...)
  const [confirmAppt, setConfirmAppt] = useState(null);

  const resetDrafts = useCallback(() => {
    setDraftName(user?.name ?? '');
    setDraftPhone(user?.phone ?? '');
    setDraftImage(user?.image ?? null);
  }, [user]);

  const startEdit = () => {
    resetDrafts();
    setIsEditing(true);
  };

  const cancelEdit = () => {
    resetDrafts();
    setIsEditing(false);
  };

  const saveEdit = () => {
    const nameOk = String(draftName).trim().length >= 2;
    const phoneOk = !draftPhone || /^[\d+\-\s()]{6,}$/.test(String(draftPhone));
    if (!nameOk) {
      Alert.alert('Invalid name', 'Please enter at least 2 characters.');
      return;
    }
    if (!phoneOk) {
      Alert.alert('Invalid phone', 'Please check the phone number format.');
      return;
    }

    setUser(prev => ({
      ...prev,
      name: draftName.trim(),
      phone: draftPhone || '',
      image: draftImage || null,
    }));
    setIsEditing(false);
  };

  const pickImage = async () => {
    // Ask for permission at runtime (Expo handles platform differences)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to change your picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setDraftImage({ uri: result.assets[0].uri });
    }
  };

  const freeBarberSlot = (barberId, date, time) => {
  const b = Barbers.find(b => String(b.id) === String(barberId));
  if (!b) return;
  if (Array.isArray(b.appointments)) {
    b.appointments = b.appointments.filter(ap => !(ap.date === date && ap.time === time));
  } else if (Array.isArray(b.booked)) {
    b.booked = b.booked.filter(ap => !(ap.date === date && ap.time === time));
  }
  };

  const handleCancelUpcoming = (appt) => {
  setUser(prev => ({
    ...prev,
    appointments: (prev.appointments || []).filter(a => a.id !== appt.id)
  }));
  freeBarberSlot(appt.barberId, appt.date, appt.time);
  setConfirmAppt(null);
  };

  const sections = useMemo(() => {
    if (!user?.appointments) return [];

    const byId = (id) => Barbers.find(b => String(b.id) === String(id));
    const withBarber = user.appointments.map(a => ({
      ...a,
      barber: byId(a.barberId),
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

  const AppointmentRow = ({ item, sectionTitle }) => {
  const isUpcoming = sectionTitle === 'Upcoming';

    return (
    <View style={styles.apptCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.apptTitle}>{item.barber?.name ?? 'Barber'}</Text>
        <Text style={styles.apptSub}>{item.barber?.specialty ?? ''}</Text>
        <Text style={styles.apptMeta}>
          {item.date} • {item.time} • {item.status}
        </Text>
      </View>

      {isUpcoming && (
        <Pressable
          style={styles.cancelFab}
          onPress={() => setConfirmAppt(item)}
          android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: false }}
          accessibilityRole="button"
          accessibilityLabel="Cancel appointment"
        >
          {/* you can swap for 'close' if you prefer */}
          <MaterialIcons name="close" size={22} color="#222" />
        </Pressable>
      )}
    </View>
    );
  };

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

  const renderHeaderView = () => {
    if (!isEditing) {
      return (
        <View style={styles.header}>
          <Image
            source={user.image || require('../assets/user_placeholder.png')}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user.name}</Text>

          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Phone: </Text>
              <Text style={styles.rowValue}>{user.phone || '-'}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.primaryBtn} onPress={startEdit}>
              <Text style={styles.primaryBtnText}>Edit Profile</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    // Edit mode UI
    return (
      <View style={styles.header}>
        <Pressable onPress={pickImage} style={{ alignItems: 'center' }}>
          <Image
            source={draftImage || require('../assets/user_placeholder.png')}
            style={[styles.avatar, { opacity: 1 }]}
          />
          <Text style={styles.linkText}>Change photo</Text>
        </Pressable>

        <View style={[styles.section, { width: '100%' }]}>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Your name"
              autoCapitalize="words"
              maxLength={60}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.input}
              value={draftPhone}
              onChangeText={setDraftPhone}
              placeholder="e.g. +351 912 345 678"
              keyboardType="phone-pad"
              maxLength={24}
            />
          </View>
        </View>

        <View style={[styles.actions, { flexDirection: 'row', gap: 10, justifyContent: 'center' }]}>
          <Pressable style={[styles.secondaryBtn, {flex: 1}] } onPress={cancelEdit}>
            <Text style={styles.secondaryBtnText}>Cancel</Text>
          </Pressable>
          <Pressable style={[styles.primaryBtn, {flex: 1}]} onPress={saveEdit}>
            <Text style={styles.primaryBtnText}>Save</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <AppLayout>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: insets.top }}
        ListHeaderComponent={
          <View>
            {renderHeaderView()}
            {sections.length > 0 && (
              <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>My Appointments</Text>
              </View>
            )}
            {sections.length === 0 && (
              <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>You have no booked appointments...</Text>
              </View>
            )}
          </View>
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        renderItem={({item, section }) => (
          <AppointmentRow item = {item} sectionTitle = {section.title}/>
        )}
      />
      <ConfirmAlert
        visible={!!confirmAppt}
        message="Cancel this appointment?"
        destructive
        onCancel={() => setConfirmAppt(null)}
        onConfirm={() => confirmAppt && handleCancelUpcoming(confirmAppt)}
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
    width: '100%',
  },
  avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 10, opacity: 0.95 },
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

  actions: { paddingHorizontal: 20, marginTop: 8, gap: 10, width: '100%' },
  primaryBtn: {
    backgroundColor: '#222',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: { 
    color: '#fff', 
    fontWeight: '700',
    
  },

  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryBtnText: { color: '#222', fontWeight: '700' },

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

  // Inputs
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, color: '#666', marginBottom: 6 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  helper: { color: '#666' },


  cancelFab: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#f0f0f0',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 8,
},
});
