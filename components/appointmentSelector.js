import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import PropTypes from 'prop-types';

export default function AppointmentSelector({
  mode = 'book',                      // 'book' | 'my' | 'manage'
  appointments = [],                  // [{ id, date, time, barberId, customerId }]
  timeSlots = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00'],
  barberId,
  userId,
  onConfirm,                          // (date, time) => void
  onCancel,                           // (appointmentId) => void
  onReschedule,                       // (appointmentId, date, time) => void
}) {

  const today = new Date();


  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);


  // helpers
  const isPast = (dateStr) => dateStr < new Date().toISOString().split('T')[0];

  // Scope appointments based on mode
  const scopedAppointments = useMemo(() => {
    if (mode === 'book') {
      return appointments.filter(a => a.barberId === barberId);
    }
    if (mode === 'my') {
      return appointments.filter(a => a.customerId === userId);
    }
    return barberId ? appointments.filter(a => a.barberId === barberId) : appointments;
  }, [appointments, mode, barberId, userId]);

  // Build { date: [times...] }
  const bookedByDate = useMemo(() => {
    const map = {};
    scopedAppointments.forEach(({ date, time }) => {
      if (!map[date]) map[date] = [];
      map[date].push(time);
    });
    return map;
  }, [scopedAppointments]);

  // Mark calendar days: full (red), limited (orange)
  const markedDates = useMemo(() => {
    const marks = {};
    Object.keys(bookedByDate).forEach(date => {
      const bookedCount = bookedByDate[date].length;
      const total = timeSlots.length;

      if (bookedCount === total) {
        marks[date] = {
          selected: true,
          selectedColor: '#ffcccc',
          ...(mode === 'book' ? { disabled: true, disableTouchEvent: true } : {}),
        };
      } else if (bookedCount > 0) {
        marks[date] = { selected: true, selectedColor: '#ffe4b5' };
      }
    });

    if (selectedDate) {
  // If already has a mark (like orange background), keep it but add a border
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      customStyles: {
        container: {
          borderWidth: 2,
          borderColor: '#4e99e9ff', // bright blue border
          borderRadius: 18, // make sure it stays circular
          },
      },
    };
    }
    return marks;
  }, [bookedByDate, selectedDate, timeSlots, mode]);

  const getAvailableSlots = (date) => {
    const taken = bookedByDate[date] || [];
    return timeSlots.filter(slot => !taken.includes(slot));
  };

  const handleDayPress = (day) => {
    const date = day.dateString;

    if (mode === 'book') {
      if (isPast(date)) return;
      if ((bookedByDate[date]?.length || 0) >= timeSlots.length) return;
      setSelectedDate(date);
      setSelectedTime(null);
      return;
    }

    if (mode === 'my') {
      setSelectedDate(date);
      setSelectedTime(null);
      return;
    }

    // manage
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const confirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Select a date and time');
      return;
    }
    onConfirm && onConfirm(selectedDate, selectedTime);
  };

  const renderBookSection = () => {
    if (!selectedDate) return null;
    const available = getAvailableSlots(selectedDate);
    if (available.length === 0) {
      return <Text style={styles.helper}>No slots available for {selectedDate}</Text>;
    }
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Time Slots</Text>
        <View style={styles.timeGrid}>
          {available.map(slot => (
            <Pressable
              key={slot}
              style={[styles.timeSlot, selectedTime === slot && styles.timeSlotSelected]}
              onPress={() => setSelectedTime(slot)}
            >
              <Text style={[styles.timeText, selectedTime === slot && styles.timeTextSelected]}>
                {slot}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.primaryBtn} onPress={confirmBooking}>
          <Text style={styles.primaryBtnText}>Confirm Appointment</Text>
        </Pressable>
      </View>
    );
  };

  const renderMySection = () => {
    const myByDate = {};
    scopedAppointments.forEach(a => {
      if (!myByDate[a.date]) myByDate[a.date] = [];
      myByDate[a.date].push({ id: a.id, time: a.time });
    });

    const dates = selectedDate ? [selectedDate] : Object.keys(myByDate).sort();
    if (dates.length === 0) return <Text style={styles.helper}>No appointments yet.</Text>;

    return (
      <View style={styles.section}>
        {dates.map(date => (
          <View key={date} style={{ marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>{date}</Text>
            <FlatList
              data={myByDate[date] || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const canCancel = !isPast(date);
                return (
                  <View style={styles.row}>
                    <Text style={styles.rowText}>{item.time}</Text>
                    {canCancel && (
                      <Pressable style={styles.secondaryBtn} onPress={() => onCancel && onCancel(item.id)}>
                        <Text style={styles.secondaryBtnText}>Cancel</Text>
                      </Pressable>
                    )}
                  </View>
                );
              }}
            />
          </View>
        ))}
      </View>
    );
  };

  const renderManageSection = () => {
    if (!selectedDate) return <Text style={styles.helper}>Select a day to manage.</Text>;

    const taken = bookedByDate[selectedDate] || [];
    const available = getAvailableSlots(selectedDate);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appointments on {selectedDate}</Text>

        <Text style={styles.subTitle}>Booked</Text>
        {taken.length === 0 ? (
          <Text style={styles.helper}>No bookings yet.</Text>
        ) : (
          taken.sort().map(t => {
            const appt = scopedAppointments.find(a => a.date === selectedDate && a.time === t);
            if (!appt) return null;
            return (
              <View key={appt.id} style={styles.row}>
                <Text style={styles.rowText}>{t}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {onReschedule && (
                    <Pressable
                      style={styles.secondaryBtn}
                      onPress={() => onReschedule(appt.id, selectedDate, t)}
                    >
                      <Text style={styles.secondaryBtnText}>Reschedule</Text>
                    </Pressable>
                  )}
                  <Pressable style={styles.secondaryBtn} onPress={() => onCancel && onCancel(appt.id)}>
                    <Text style={styles.secondaryBtnText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}

        <Text style={[styles.subTitle, { marginTop: 16 }]}>Available</Text>
        {available.length === 0 ? (
          <Text style={styles.helper}>No free slots.</Text>
        ) : (
          <View style={styles.timeGrid}>
            {available.map(slot => (
              <View key={slot} style={[styles.timeSlot, { backgroundColor: '#eef5ee' }]}>
                <Text style={styles.timeText}>{slot}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        markingType="custom"
        {...(mode === 'book' ? { minDate: new Date().toISOString().split('T')[0] } : {})}
      />

      {mode === 'book'   && renderBookSection()}
      {mode === 'my'     && renderMySection()}
      {mode === 'manage' && renderManageSection()}
    </View>
  );
}

AppointmentSelector.propTypes = {
  mode: PropTypes.oneOf(['book', 'my', 'manage']),
  appointments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired, // 'YYYY-MM-DD'
    time: PropTypes.string.isRequired, // 'HH:mm'
    barberId: PropTypes.string,
    customerId: PropTypes.string,
  })),
  timeSlots: PropTypes.arrayOf(PropTypes.string),
  barberId: PropTypes.string,
  userId: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  onReschedule: PropTypes.func,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  subTitle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeSlot: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#eee', borderRadius: 10 },
  timeSlotSelected: { backgroundColor: '#222' },
  timeText: { color: '#222' },
  timeTextSelected: { color: '#fff' },
  primaryBtn: { marginTop: 14, backgroundColor: '#222', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#eee' },
  secondaryBtnText: { color: '#222', fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  rowText: { fontSize: 15 },
  helper: { color: '#666' },
});
