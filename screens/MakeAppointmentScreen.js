/**
 * MakeAppointmentScreen — Booking flow screen for a single barber.
 *
 * Responsibilities:
 * - Receives `barberId` (and optional `userId`) via route params.
 * - Finds the target barber from `barbersData` (mock dataset).
 * - Initializes appointment data for that barber.
 * - Renders AppointmentSelector in "book" mode for picking a slot.
 * - Handles booking confirmation:
 *     - Creates a new appointment entry.
 *     - Updates both local state AND the shared `barbersData` mock so changes persist across screens.
 *
 * Notes:
 * - Currently uses local mock data, but structure is API-ready.
 * - Prevents double booking in DEV mode (via console.warn).
 */



import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AppointmentSelector from '../components/appointmentSelector';
import { SafeAreaView } from 'react-native-safe-area-context';
import barbersData from '../data/Barbers';
import AppLayout from '../components/appLayout';



export default function MakeAppointmentScreen({ route }) {
  // Route params: barber to book with and current user
  const { barberId, userId = 'user1' } = route.params || {};

  // Defensive: ensure `barbersData` is an array
  const allBarbers = Array.isArray(barbersData) ? barbersData : [];

  

  // Find barber index in dataset for easier updates
  const barberIndex = useMemo(
    () => allBarbers.findIndex(b => b.id === String(barberId)),
    [allBarbers, barberId]
  );

  const barber = barberIndex >= 0 ? allBarbers[barberIndex] : null;

  const initialAppointments = (barber?.appointments ?? []).map(a =>
    a.barberId ? a : { ...a, barberId: String(barberId) }
  );
  

  

  const [appointments, setAppointments] = useState(initialAppointments);

  if (!barber) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ padding: 16 }} />
      </SafeAreaView>
    );
  }

  
  /**
   * Handle confirmed booking:
   * - Prevent duplicate slot booking (DEV mode only).
   * - Create a new appointment object.
   * - Update local state AND mock dataset for persistence.
   */
  const handleConfirm = (date, time) => {
    // prevent double-booking same barber+slot

    if (__DEV__ && appointments.some(a => a.date === date && a.time === time)) {
    console.warn('Invariant: attempted to book an already taken slot', { date, time });
    return; 
  }

    const newAppt = {
      id: String(Date.now()),
      date,
      time,
      customerId: userId,
      status: 'scheduled',
      barberId: String(barberId),
    };

    // update local state
    const next = [...appointments, newAppt];
    setAppointments(next);

    // update the shared mock object so other screens see it
    allBarbers[barberIndex] = {
      ...barber,
      appointments: next,
    };

    
  };

  return (
    <AppLayout>
    <SafeAreaView style={styles.container}>
      <AppointmentSelector
        mode="book"
        appointments={appointments}
        barberId={barberId}
        userId={userId}
        onConfirm={handleConfirm}
      />
    </SafeAreaView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
