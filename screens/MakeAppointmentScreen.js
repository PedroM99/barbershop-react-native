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
import { View, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import barbersData from '../data/Barbers';
import AppLayout from '../components/appLayout';
import { useUser } from '../context/UserContext';
import AppointmentSelector from '../components/appointmentSelector';
import ConfirmAlert from '../components/confirmAlert';

export default function MakeAppointmentScreen({ route }) {
  // Route params: barber to book with and current user
  const { barberId } = route.params || {};
  const { user, setUser } = useUser();
  const currentUserId = user?.id;

  // Modern replace-confirm dialog state
  const [pendingBooking, setPendingBooking] = useState(null); // { date, time, existing }

  // Defensive: ensure `barbersData` is an array
  const allBarbers = Array.isArray(barbersData) ? barbersData : [];

  // Find barber index in dataset for easier updates
  const barberIndex = useMemo(
    () => allBarbers.findIndex((b) => b.id === String(barberId)),
    [allBarbers, barberId]
  );

  const barber = barberIndex >= 0 ? allBarbers[barberIndex] : null;

  // Build initial appointments list for this barber
  const initialAppointments = useMemo(() => {
    const src = barber?.appointments ?? [];
    return src.map((a) => (a.barberId ? a : { ...a, barberId: String(barberId) }));
  }, [barber, barberId]);

  // Local state for AppointmentSelector
  const [appointments, setAppointments] = useState(initialAppointments);

  // Refresh from shared mock whenever screen focuses (e.g., after cancel on Profile)
  useFocusEffect(
    React.useCallback(() => {
      const fresh = (barbersData[barberIndex]?.appointments || []).map((a) =>
        a.barberId ? a : { ...a, barberId: String(barberId) }
      );
      setAppointments(fresh);
    }, [barberIndex, barberId])
  );

  if (!barber) {
    return (
      <AppLayout>
        <SafeAreaView style={styles.container}>
          <View style={{ padding: 16 }} />
        </SafeAreaView>
      </AppLayout>
    );
  }

  const whenOf = (a) => new Date(`${a.date}T${a.time}`);
  const getUpcomingForUser = () => {
    if (!user?.appointments?.length) return null;
    const now = new Date();
    const upcoming = user.appointments
      .filter((a) => whenOf(a) >= now && a.status !== 'completed' && a.status !== 'canceled')
      .sort((a, b) => whenOf(a) - whenOf(b));
    return upcoming[0] || null; // earliest upcoming
  };

  // --- Booking commit (top-level so ConfirmAlert can call it) ---
  const commitBooking = (date, time, existingUpcoming) => {
    const newAppt = {
      id: String(Date.now()),
      date,
      time,
      customerId: currentUserId,
      status: 'scheduled',
      barberId: String(barberId),
    };

    // If the old upcoming was with THIS barber, remove it from local state first
    let base = appointments;
    if (existingUpcoming && String(existingUpcoming.barberId) === String(barberId)) {
      base = appointments.filter((a) => a.id !== existingUpcoming.id);
    }

    // update local state
    const next = [...base, newAppt];
    setAppointments(next);

    // update the shared mock object so other screens see it
    allBarbers[barberIndex] = {
      ...barber,
      appointments: next,
    };

    // If the old upcoming was with a DIFFERENT barber, remove it from that barber too
    if (existingUpcoming && String(existingUpcoming.barberId) !== String(barberId)) {
      const prevIdx = allBarbers.findIndex((b) => String(b.id) === String(existingUpcoming.barberId));
      if (prevIdx !== -1) {
        const prevBarber = allBarbers[prevIdx];
        allBarbers[prevIdx] = {
          ...prevBarber,
          appointments: (prevBarber.appointments || []).filter((a) => a.id !== existingUpcoming.id),
        };
      }
    }

    // update the signed-in user's appointments (global)
    setUser((prev) => {
      if (!prev) return prev;
      const withoutOld = existingUpcoming
        ? (prev.appointments || []).filter((a) => a.id !== existingUpcoming.id)
        : (prev.appointments || []);
      return {
        ...prev,
        appointments: [
          ...withoutOld,
          { id: newAppt.id, barberId: newAppt.barberId, date, time, status: newAppt.status },
        ],
      };
    });
  };

  /**
   * Handle Confirm Appointment (from AppointmentSelector)
   * - Prevent double booking same barber+slot
   * - If user already has an upcoming appointment → show ConfirmAlert
   * - Otherwise book immediately
   */
  const handleConfirm = (date, time) => {
    if (appointments.some((a) => a.date === date && a.time === time)) {
      Alert.alert('Time unavailable', 'That time is already booked.');
      return;
    }

    const existingUpcoming = getUpcomingForUser();

    if (existingUpcoming) {
      setPendingBooking({ date, time, existing: existingUpcoming });
    } else {
      commitBooking(date, time, null);
    }
  };

  return (
    <AppLayout>
      <SafeAreaView style={styles.container}>
        <AppointmentSelector
          mode="book"
          appointments={appointments}
          barberId={barberId}
          userId={currentUserId}
          onConfirm={handleConfirm}
        />
      </SafeAreaView>

      <ConfirmAlert
        visible={!!pendingBooking}
        title="Replace existing appointment?"
        message={
          pendingBooking
            ? `Replace the appointment on ${pendingBooking.existing.date} at ${pendingBooking.existing.time} with ${pendingBooking.date} at ${pendingBooking.time}?`
            : ''
        }
        destructive
        onCancel={() => setPendingBooking(null)}
        onConfirm={() => {
          if (pendingBooking) {
            commitBooking(pendingBooking.date, pendingBooking.time, pendingBooking.existing);
          }
          setPendingBooking(null);
        }}
      />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
