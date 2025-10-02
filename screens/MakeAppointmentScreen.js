// screens/MakeAppointmentScreen.js
/**
 * MakeAppointmentScreen — Booking flow screen for a single barber.
 * (Styling converted to NativeWind + background image; logic unchanged)
 */
import React, { useMemo, useState } from "react";
import { View, Alert, ImageBackground } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import barbersData from "../data/Barbers";
import AppLayout from "../components/appLayout";
import { useUser } from "../context/UserContext";
import AppointmentSelector from "../components/appointmentSelector";
import ConfirmAlert from "../components/confirmAlert";

export default function MakeAppointmentScreen({ route }) {
  // Route params: barber to book with and current user
  const { barberId } = route.params || {};
  const { user, setUser } = useUser();
  const currentUserId = user?.id;

  // Replace-confirm dialog state
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
        <ImageBackground
          source={require("../assets/background.png")}
          resizeMode="cover"
          className="flex-1"
        >
          <SafeAreaView className="flex-1" />
        </ImageBackground>
      </AppLayout>
    );
  }

  const whenOf = (a) => new Date(`${a.date}T${a.time}`);
  const getUpcomingForUser = () => {
    if (!user?.appointments?.length) return null;
    const now = new Date();
    const upcoming = user.appointments
      .filter((a) => whenOf(a) >= now && a.status !== "completed" && a.status !== "canceled")
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
      status: "scheduled",
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
        : prev.appointments || [];
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
      Alert.alert("Time unavailable", "That time is already booked.");
      return;
    }

    const existingUpcoming = getUpcomingForUser();

    if (existingUpcoming) {
      setPendingBooking({ date, time, existing: existingUpcoming });
    } else {
      commitBooking(date, time, null);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <AppLayout>
      <ImageBackground
        source={require("../assets/background.png")}
        resizeMode="cover"
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          {/* Optional wrapper gives breathing room without touching logic */}
          <View className="flex-1 px-4 pt-3">
            <View className="flex-1 rounded-2xl bg-neutral-900/60 border border-white/10 p-3" style={{ elevation: 2 }}>
              <AppointmentSelector
                mode="book"
                appointments={appointments}
                barberId={barberId}
                userId={currentUserId}
                onConfirm={handleConfirm}
              />
            </View>
          </View>
        </SafeAreaView>

        <ConfirmAlert
          visible={!!pendingBooking}
          title="Replace existing appointment?"
          message={
            pendingBooking
              ? `Replace the appointment on ${formatDate(pendingBooking.existing.date)} at ${pendingBooking.existing.time} with ${formatDate(pendingBooking.date)} at ${pendingBooking.time}?`
              : ""
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
      </ImageBackground>
    </AppLayout>
  );
}
