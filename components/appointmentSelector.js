// components/appointmentSelector.js
/**
 * AppointmentSelector — Calendar + slots for three modes:
 *  - "book": user books with a barber; past days & fully-booked days are blocked
 *  - "my":   user reviews/cancels their own appointments
 *  - "manage": barber/admin reviews, reschedules, or cancels by day
 *
 * Styling: NativeWind (dark, compact calendar). Logic unchanged.
 */

import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Alert, FlatList } from "react-native";
import { Calendar } from "react-native-calendars";
import PropTypes from "prop-types";

export default function AppointmentSelector({
  mode = "book", // 'book' | 'my' | 'manage'
  appointments = [],
  timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
  barberId,
  userId,
  onConfirm,
  onCancel,
  onReschedule,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const isPast = (dateStr) => dateStr < new Date().toISOString().split("T")[0];

  // Scope appointments based on mode
  const scopedAppointments = useMemo(() => {
    if (mode === "book") return appointments.filter((a) => a.barberId === barberId);
    if (mode === "my") return appointments.filter((a) => a.customerId === userId);
    return barberId ? appointments.filter((a) => a.barberId === barberId) : appointments;
  }, [appointments, mode, barberId, userId]);

  // Map { date: [times...] }
  const bookedByDate = useMemo(() => {
    const map = {};
    scopedAppointments.forEach(({ date, time }) => {
      if (!map[date]) map[date] = [];
      map[date].push(time);
    });
    return map;
  }, [scopedAppointments]);

  // Calendar marked dates (full, partial, selected ring)
  const markedDates = useMemo(() => {
    const marks = {};
    Object.keys(bookedByDate).forEach((date) => {
      const bookedCount = bookedByDate[date].length;
      const total = timeSlots.length;
      if (bookedCount === total) {
        marks[date] = {
          selected: true,
          selectedColor: "#4a0000", // subtle dark red fill
          ...(mode === "book" ? { disabled: true, disableTouchEvent: true } : {}),
        };
      } else if (bookedCount > 0) {
        marks[date] = { selected: true, selectedColor: "#3a2a00" }; // subtle amber fill
      }
    });

    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        customStyles: {
          container: {
            borderWidth: 2,
            borderColor: "#B08D57", // brass ring
            borderRadius: 8,
          },
        },
      };
    }
    return marks;
  }, [bookedByDate, selectedDate, timeSlots, mode]);

  // Utility: free slots for date
  const getAvailableSlots = (date) => {
    const taken = bookedByDate[date] || [];
    return timeSlots.filter((slot) => !taken.includes(slot));
  };

  // Day click
  const handleDayPress = (day) => {
    const date = day.dateString;

    if (mode === "book") {
      if (isPast(date)) return;
      if ((bookedByDate[date]?.length || 0) >= timeSlots.length) return;
      setSelectedDate(date);
      setSelectedTime(null);
      return;
    }

    if (mode === "my") {
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
      Alert.alert("Select a date and time");
      return;
    }
    onConfirm && onConfirm(selectedDate, selectedTime);
  };

  // --- Renderers -------------------------------------------------------------

  const BookSection = () => {
    if (!selectedDate) return null;
    const available = getAvailableSlots(selectedDate);
    if (available.length === 0) {
      return <Text className="text-neutral-400 mt-3">No slots available for {selectedDate}</Text>;
    }
    return (
      <View className="mt-3">
        <Text className="text-sm font-semibold text-neutral-300 mb-2">Available Time Slots</Text>
        <View className="flex-row flex-wrap">
          {available.map((slot) => {
            const isSel = selectedTime === slot;
            return (
              <Pressable
                key={slot}
                onPress={() => setSelectedTime(slot)}
                className={`px-3 py-2 rounded-lg mr-2 mb-2 border ${
                  isSel ? "bg-[#B08D57] border-[#B08D57]" : "bg-neutral-800 border-white/10"
                }`}
                android_ripple={{ color: "rgba(255,255,255,0.06)", borderless: false }}
              >
                <Text className={isSel ? "text-black font-semibold" : "text-[#EDEADE]"}>{slot}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable onPress={confirmBooking} className="mt-3 items-center rounded-xl bg-[#B08D57] py-3">
          <Text className="font-bold text-black">Confirm Appointment</Text>
        </Pressable>
      </View>
    );
  };

  const MySection = () => {
    const myByDate = {};
    scopedAppointments.forEach((a) => {
      if (!myByDate[a.date]) myByDate[a.date] = [];
      myByDate[a.date].push({ id: a.id, time: a.time });
    });

    const dates = selectedDate ? [selectedDate] : Object.keys(myByDate).sort();
    if (dates.length === 0) return <Text className="text-neutral-400 mt-3">No appointments yet.</Text>;

    return (
      <View className="mt-3">
        {dates.map((date) => (
          <View key={date} className="mb-3">
            <Text className="text-base font-semibold text-[#EDEADE] mb-2">{date}</Text>
            <FlatList
              data={myByDate[date] || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const canCancel = !isPast(date);
                return (
                  <View className="flex-row items-center justify-between py-2">
                    <Text className="text-[15px] text-[#EDEADE]">{item.time}</Text>
                    {canCancel && (
                      <Pressable
                        onPress={() => onCancel && onCancel(item.id)}
                        className="px-3 py-1.5 bg-neutral-800 border border-white/10 rounded-lg"
                      >
                        <Text className="text-[#EDEADE] font-semibold">Cancel</Text>
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

  const ManageSection = () => {
    if (!selectedDate) return <Text className="text-neutral-400 mt-3">Select a day to manage.</Text>;

    const taken = bookedByDate[selectedDate] || [];
    const available = getAvailableSlots(selectedDate);

    return (
      <View className="mt-3">
        <Text className="text-base font-semibold text-[#EDEADE]">Appointments on {selectedDate}</Text>

        <Text className="text-sm font-semibold text-neutral-300 mt-2 mb-1">Booked</Text>
        {taken.length === 0 ? (
          <Text className="text-neutral-400">No bookings yet.</Text>
        ) : (
          taken
            .sort()
            .map((t) => {
              const appt = scopedAppointments.find((a) => a.date === selectedDate && a.time === t);
              if (!appt) return null;
              return (
                <View key={appt.id} className="flex-row items-center justify-between py-2">
                  <Text className="text-[15px] text-[#EDEADE]">{t}</Text>
                  <View className="flex-row gap-2">
                    {onReschedule && (
                      <Pressable
                        className="px-3 py-1.5 bg-neutral-800 border border-white/10 rounded-lg"
                        onPress={() => onReschedule(appt.id, selectedDate, t)}
                      >
                        <Text className="text-[#EDEADE] font-semibold">Reschedule</Text>
                      </Pressable>
                    )}
                    <Pressable
                      className="px-3 py-1.5 bg-neutral-800 border border-white/10 rounded-lg"
                      onPress={() => onCancel && onCancel(appt.id)}
                    >
                      <Text className="text-[#EDEADE] font-semibold">Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
        )}

        <Text className="text-sm font-semibold text-neutral-300 mt-4 mb-1">Available</Text>
        {available.length === 0 ? (
          <Text className="text-neutral-400">No free slots.</Text>
        ) : (
          <View className="flex-row flex-wrap">
            {available.map((slot) => (
              <View key={slot} className="px-3 py-2 rounded-lg mr-2 mb-2 bg-neutral-800 border border-white/10">
                <Text className="text-[#EDEADE]">{slot}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-transparent px-3 pt-3 pb-4">
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        markingType="custom"
        hideExtraDays
        firstDay={1}
        enableSwipeMonths
        {...(mode === "book" ? { minDate: new Date().toISOString().split("T")[0] } : {})}
        style={{ backgroundColor: "transparent", paddingBottom: 0 }}
        theme={{
          calendarBackground: "transparent",
          textSectionTitleColor: "#A3A3A3",
          monthTextColor: "#EDEADE",
          dayTextColor: "#EDEADE",
          todayTextColor: "#B08D57",
          selectedDayBackgroundColor: "#B08D57",
          selectedDayTextColor: "#111111",
          arrowColor: "#EDEADE",
          // smaller day cells (reduce vertical space)
          "stylesheet.day.basic": {
            base: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
            selected: { backgroundColor: "#B08D57", borderRadius: 8 },
            todayText: { color: "#B08D57" },
          },
        }}
      />

      {/* Divider */}
      <View className="h-px bg-white/10 mt-2" />

      {mode === "book" && <BookSection />}
      {mode === "my" && <MySection />}
      {mode === "manage" && <ManageSection />}
    </View>
  );
}

AppointmentSelector.propTypes = {
  mode: PropTypes.oneOf(["book", "my", "manage"]),
  appointments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired, // 'YYYY-MM-DD'
      time: PropTypes.string.isRequired, // 'HH:mm'
      barberId: PropTypes.string,
      customerId: PropTypes.string,
    })
  ),
  timeSlots: PropTypes.arrayOf(PropTypes.string),
  barberId: PropTypes.string,
  userId: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  onReschedule: PropTypes.func,
};
