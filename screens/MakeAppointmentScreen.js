// screens/MakeAppointmentScreen.js
/**
 * MakeAppointmentScreen — Booking flow screen for a single barber (user-only).
 * - Uses booking-only AppointmentSelector
 * - Success animation only after commitBooking (via successPulse token)
 * - Fixes navigation bug by remounting selector on blur (key bump)
 */

import React, { useMemo, useState } from "react";
import { View, ImageBackground } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppLayout from "../components/appLayout";
import AppointmentSelector from "../components/appointmentSelector";
import ConfirmAlert from "../components/confirmAlert";
import barbersData from "../data/Barbers";
import { useUser } from "../context/UserContext";

export default function MakeAppointmentScreen({ route }) {
  const { barberId } = route.params || {};
  const { user, setUser } = useUser();
  const currentUserId = user?.id;

  // 🔔 Drives the SuccessButton animation downstream (only after commitBooking)
  const [successPulse, setSuccessPulse] = useState(0);

  // 🔧 Remount key: forces AppointmentSelector to unmount on blur
  const [selectorKey, setSelectorKey] = useState(0);

  // Replace-confirm dialog state
  const [pendingBooking, setPendingBooking] = useState(null); // { date, time, existing }

  // Defensive dataset
  const allBarbers = Array.isArray(barbersData) ? barbersData : [];

  // Locate barber once
  const barberIndex = useMemo(
    () => allBarbers.findIndex((b) => String(b.id) === String(barberId)),
    [allBarbers, barberId]
  );
  const barber = barberIndex >= 0 ? allBarbers[barberIndex] : null;

  // Local appointments for this barber
  const initialAppointments = useMemo(() => {
    const src = barber?.appointments ?? [];
    return src.map((a) => (a.barberId ? a : { ...a, barberId: String(barberId) }));
  }, [barber, barberId]);

  const [appointments, setAppointments] = useState(initialAppointments);

  // Refresh on focus; on blur, bump key (remount selector) and clear dialog
  useFocusEffect(
    React.useCallback(() => {
      // FOCUS: refresh appointments from shared mock
      if (barberIndex >= 0) {
        const fresh = (allBarbers[barberIndex]?.appointments || []).map((a) =>
          a.barberId ? a : { ...a, barberId: String(barberId) }
        );
        setAppointments(fresh);
      }

      // BLUR cleanup: remount selector & close any pending modal state
      return () => {
        setSelectorKey((k) => k + 1);
        setPendingBooking(null);
      };
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

  // Helpers
  const whenOf = (a) => new Date(`${a.date}T${a.time}`);

  const getUpcomingForUser = () => {
    if (!user?.appointments?.length) return null;
    const now = new Date();
    const upcoming = user.appointments
      .filter((a) => whenOf(a) >= now && a.status !== "completed" && a.status !== "canceled")
      .sort((a, b) => whenOf(a) - whenOf(b));
    return upcoming[0] || null;
  };

  // ✅ Central commit; triggers the success pulse after data is updated
  const commitBooking = (date, time, existingUpcoming) => {
    const newAppt = {
      id: String(Date.now()),
      date,
      time,
      customerId: currentUserId,
      status: "scheduled",
      barberId: String(barberId),
    };

    // Update this barber's list
    let base = appointments;
    if (existingUpcoming && String(existingUpcoming.barberId) === String(barberId)) {
      base = appointments.filter((a) => a.id !== existingUpcoming.id);
    }
    const next = [...base, newAppt];
    setAppointments(next);

    // Write to shared mock
    allBarbers[barberIndex] = { ...barber, appointments: next };

    // If previous upcoming belonged to a different barber, remove there too
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

    // Update user context (global)
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

    // 🔔 Only now play the success animation downstream
    setSuccessPulse((t) => t + 1);
  };

  const handleConfirm = (date, time) => {
    const existingUpcoming = getUpcomingForUser();
    if (existingUpcoming) {
      setPendingBooking({ date, time, existing: existingUpcoming });
    } else {
      commitBooking(date, time, null); // triggers successPulse
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
          <View className="flex-1 px-4 pt-3">
            <View
              className="flex-1 rounded-2xl bg-neutral-900/60 border border-white/10 p-3"
              style={{ elevation: 2 }}
            >
              <AppointmentSelector
                key={selectorKey}               
                appointments={appointments}
                barberId={barberId}
                userId={currentUserId}
                onConfirm={handleConfirm}
                successToken={successPulse}    
              />
            </View>
          </View>
        </SafeAreaView>

        <ConfirmAlert
          visible={!!pendingBooking}
          title="Replace existing appointment?"
          message={
            pendingBooking
              ? `Replace the appointment on ${formatDate(
                  pendingBooking.existing.date
                )} at ${pendingBooking.existing.time} with ${formatDate(
                  pendingBooking.date
                )} at ${pendingBooking.time}?`
              : ""
          }
          destructive
          onCancel={() => setPendingBooking(null)}
          onConfirm={() => {
            if (pendingBooking) {
              commitBooking(
                pendingBooking.date,
                pendingBooking.time,
                pendingBooking.existing
              );
            }
            setPendingBooking(null);
          }}
        />
      </ImageBackground>
    </AppLayout>
  );
}
