// components/appointmentSelector.js (booking-only, updated)
import React, { useMemo, useState, memo } from "react";
import { View, Text, Pressable } from "react-native";
import { Calendar } from "react-native-calendars";
import PropTypes from "prop-types";
import ConfirmAlert from "./confirmAlert";
import SuccessButton from "./successButton";

const BookSection = memo(function BookSection({
  selectedDate,
  selectedTime,
  setSelectedTime,
  getAvailableSlots,
  confirmBooking,
  successToken, // ⬅️ comes from the screen
}) {
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

      <SuccessButton
        label="Confirm Appointment"
        onPress={confirmBooking}
        successToken={successToken}
        durationMs={900}
      />
    </View>
  );
});

export default function AppointmentSelector({
  appointments = [],
  timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
  barberId,
  userId,
  onConfirm,
  successToken, 
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [validationOpen, setValidationOpen] = useState(false);

  const isPast = (dateStr) => dateStr < new Date().toISOString().split("T")[0];

  const scopedAppointments = useMemo(
    () => appointments.filter((a) => String(a.barberId) === String(barberId)),
    [appointments, barberId]
  );

  const bookedByDate = useMemo(() => {
    const map = {};
    scopedAppointments.forEach(({ date, time }) => {
      if (!map[date]) map[date] = [];
      map[date].push(time);
    });
    return map;
  }, [scopedAppointments]);

  const markedDates = useMemo(() => {
    const marks = {};
    Object.keys(bookedByDate).forEach((date) => {
      const bookedCount = bookedByDate[date].length;
      const total = timeSlots.length;
      if (bookedCount === total) {
        marks[date] = {
          selected: true,
          selectedColor: "#4a0000",
          disabled: true,
          disableTouchEvent: true,
        };
      } else if (bookedCount > 0) {
        marks[date] = { selected: true, selectedColor: "#3a2a00" };
      }
    });
    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        customStyles: {
          container: { borderWidth: 2, borderColor: "#B08D57", borderRadius: 8 },
        },
      };
    }
    return marks;
  }, [bookedByDate, selectedDate, timeSlots]);

  const getAvailableSlots = (date) => {
    const taken = bookedByDate[date] || [];
    return timeSlots.filter((slot) => !taken.includes(slot));
  };

  const handleDayPress = (day) => {
    const date = day.dateString;
    if (isPast(date)) return;
    if ((bookedByDate[date]?.length || 0) >= timeSlots.length) return;
    setSelectedDate(date);
    setSelectedTime(null);
  };

  // ✅ Only validate & call the parent; DON'T animate here
  const confirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      setValidationOpen(true);
      return;
    }
    onConfirm && onConfirm(selectedDate, selectedTime);
    setSelectedTime(null);
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
        minDate={new Date().toISOString().split("T")[0]}
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
          "stylesheet.day.basic": {
            base: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
            selected: { backgroundColor: "#B08D57", borderRadius: 8 },
            todayText: { color: "#B08D57" },
          },
        }}
      />

      <View className="h-px bg-white/10 mt-2" />

      <BookSection
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        getAvailableSlots={getAvailableSlots}
        confirmBooking={confirmBooking}
        successToken={successToken} // ⬅️ comes from screen
      />

      <ConfirmAlert
        visible={validationOpen}
        type="info"
        message="Select a time please"
        onConfirm={() => setValidationOpen(false)}
      />
    </View>
  );
}

AppointmentSelector.propTypes = {
  appointments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      barberId: PropTypes.string,
      customerId: PropTypes.string,
    })
  ),
  timeSlots: PropTypes.arrayOf(PropTypes.string),
  barberId: PropTypes.string.isRequired,
  userId: PropTypes.string,
  onConfirm: PropTypes.func, // (date, time) => void
  successToken: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // ⬅️ new
};
