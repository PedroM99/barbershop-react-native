// screens/MakeAppointmentScreen.js
import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AppointmentSelector from '../components/appointmentSelector';
import { SafeAreaView } from 'react-native-safe-area-context';
import barbersData from '../data/Barbers';



export default function MakeAppointmentScreen({ route }) {
  const { barberId, userId = 'user1' } = route.params || {};

  const allBarbers = Array.isArray(barbersData) ? barbersData : [];

  

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
    <SafeAreaView style={styles.container}>
      <AppointmentSelector
        mode="book"
        appointments={appointments}
        barberId={barberId}
        userId={userId}
        onConfirm={handleConfirm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
