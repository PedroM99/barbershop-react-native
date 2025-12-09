// screens/MakeAppointmentScreen.js
/**
 * MakeAppointmentScreen
 *
 * Booking flow screen used by:
 * - Regular users: book appointments for themselves.
 * - Barbers: select a client and book an appointment on the client's behalf.
 *
 * Responsibilities:
 * - Resolve the active barber and load their appointments.
 * - Orchestrate the AppointmentSelector component (calendar/time slots).
 * - Handle role-based booking rules and conflict resolution (replace upcoming booking).
 * - Update both barber and customer in the in-memory data stores.
 */

import React, { useMemo, useState } from "react";
import {
  View,
  ImageBackground,
  Text,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

import AppLayout from "../components/appLayout";
import AppointmentSelector from "../components/appointmentSelector";
import ConfirmAlert from "../components/confirmAlert";
import barbersData from "../data/Barbers";
import usersData from "../data/Users";
import { useUser } from "../context/UserContext";

export default function MakeAppointmentScreen({ route }) {
  const { barberId } = route.params || {};
  const { user, setUser } = useUser();
  const currentUserId = user?.id;

  // Role detection: used to switch between user and barber flows
  const isBarberUser = user?.role === "barber" || user?.isBarber;

  // In-memory data sources used during development (not persisted to a backend)
  const allBarbers = Array.isArray(barbersData) ? barbersData : [];
  const allUsers = useMemo(
    () => (Array.isArray(usersData) ? usersData : []),
    []
  );

  // Drives the success animation token that is passed down to AppointmentSelector
  const [successPulse, setSuccessPulse] = useState(0);

  // Forces AppointmentSelector to remount when the screen blurs (ensures clean state)
  const [selectorKey, setSelectorKey] = useState(0);

  // Stores information for the "replace existing appointment" confirmation dialog
  // Shape: { date, time, existing, customerId }
  const [pendingBooking, setPendingBooking] = useState(null);

  // Barber-only: client selection and validation state
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [clientPickerVisible, setClientPickerVisible] = useState(false);
  const [clientValidationOpen, setClientValidationOpen] = useState(false);

  // Resolve the barber backing this screen; guards against an invalid barberId
  const barberIndex = useMemo(
    () => allBarbers.findIndex((b) => String(b.id) === String(barberId)),
    [allBarbers, barberId]
  );
  const barber = barberIndex >= 0 ? allBarbers[barberIndex] : null;

  // Initialize local appointment state for the active barber
  // Ensures each appointment carries the current barberId
  const initialAppointments = useMemo(() => {
    const src = barber?.appointments ?? [];
    return src.map((a) => (a.barberId ? a : { ...a, barberId: String(barberId) }));
  }, [barber, barberId]);

  const [appointments, setAppointments] = useState(initialAppointments);

  // Derives the list of possible clients for a barber:
  // - Excludes the logged-in barber.
  // - Excludes other barber accounts.
  const customerOptions = useMemo(() => {
    if (!isBarberUser) return [];
    return allUsers.filter((u) => {
      const isCurrent = String(u.id) === String(currentUserId);
      const isBarber = u.role === "barber" || u.isBarber;
      return !isCurrent && !isBarber;
    });
  }, [allUsers, isBarberUser, currentUserId]);

  const selectedCustomer = useMemo(
    () =>
      customerOptions.find(
        (u) => String(u.id) === String(selectedCustomerId)
      ) || null,
    [customerOptions, selectedCustomerId]
  );

  // Refreshes appointment data when the screen gains focus and
  // performs cleanup when the screen loses focus.
  useFocusEffect(
    React.useCallback(() => {
      // On focus: pull the latest appointments for this barber from the shared data
      if (barberIndex >= 0) {
        const fresh = (allBarbers[barberIndex]?.appointments || []).map((a) =>
          a.barberId ? a : { ...a, barberId: String(barberId) }
        );
        setAppointments(fresh);
      }

      // On blur: trigger a remount of the selector and clear any pending confirmation
      return () => {
        setSelectorKey((k) => k + 1);
        setPendingBooking(null);
      };
    }, [barberIndex, barberId])
  );

  // Defensive fallback: if the barber cannot be resolved, render an empty layout
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

  /**
   * Helpers
   */

  // Builds a Date object from an appointment's date and time fields
  const whenOf = (a) => new Date(`${a.date}T${a.time}`);

  // Returns the next upcoming (non-completed, non-canceled) appointment for a given customer
  const getUpcomingForCustomer = (customerId) => {
    if (!customerId) return null;
    const srcUser =
      String(customerId) === String(currentUserId)
        ? user
        : allUsers.find((u) => String(u.id) === String(customerId));

    if (!srcUser?.appointments?.length) return null;

    const now = new Date();
    const upcoming = srcUser.appointments
      .filter(
        (a) =>
          whenOf(a) >= now &&
          a.status !== "completed" &&
          a.status !== "canceled"
      )
      .sort((a, b) => whenOf(a) - whenOf(b));

    return upcoming[0] || null;
  };

  // Convenience helper for the logged-in user
  const getUpcomingForUser = () => getUpcomingForCustomer(currentUserId);

  /**
   * commitBooking
   *
   * Central booking function that:
   * - Creates the new appointment.
   * - Updates the active barber's appointment list.
   * - Removes an existing upcoming appointment, if it belongs to this or another barber.
   * - Updates the corresponding customer's appointment list (current user or another user).
   * - Increments successPulse so AppointmentSelector can trigger its confirmation animation.
   */
  const commitBooking = (
    date,
    time,
    existingUpcoming,
    customerIdOverride = null
  ) => {
    const effectiveCustomerId = customerIdOverride || currentUserId;

    const newAppt = {
      id: String(Date.now()),
      date,
      time,
      customerId: effectiveCustomerId,
      status: "scheduled",
      barberId: String(barberId),
    };

    // Update this barber's appointments in local state
    let base = appointments;
    if (
      existingUpcoming &&
      String(existingUpcoming.barberId) === String(barberId)
    ) {
      base = appointments.filter((a) => a.id !== existingUpcoming.id);
    }
    const next = [...base, newAppt];
    setAppointments(next);

    // Persist the new list in the shared barbers dataset
    allBarbers[barberIndex] = { ...barber, appointments: next };

    // If the existing upcoming appointment belongs to a different barber,
    // remove it from that barber's list as well.
    if (
      existingUpcoming &&
      String(existingUpcoming.barberId) !== String(barberId)
    ) {
      const prevIdx = allBarbers.findIndex(
        (b) => String(b.id) === String(existingUpcoming.barberId)
      );
      if (prevIdx !== -1) {
        const prevBarber = allBarbers[prevIdx];
        allBarbers[prevIdx] = {
          ...prevBarber,
          appointments: (prevBarber.appointments || []).filter(
            (a) => a.id !== existingUpcoming.id
          ),
        };
      }
    }

    // Update the customer's appointment list.
    // If the effective customer is the current user (or a non-barber user flow),
    // use setUser to keep React state in sync. Otherwise, mutate the mock users dataset.
    if (!isBarberUser || String(effectiveCustomerId) === String(currentUserId)) {
      // Regular user flow, or barber booking for themselves
      setUser((prev) => {
        if (!prev || String(prev.id) !== String(effectiveCustomerId)) return prev;
        const withoutOld = existingUpcoming
          ? (prev.appointments || []).filter(
              (a) => a.id !== existingUpcoming.id
            )
          : prev.appointments || [];
        return {
          ...prev,
          appointments: [
            ...withoutOld,
            {
              id: newAppt.id,
              barberId: newAppt.barberId,
              date,
              time,
              status: newAppt.status,
            },
          ],
        };
      });
    } else {
      // Barber booking on behalf of another user (client)
      const uIndex = allUsers.findIndex(
        (u) => String(u.id) === String(effectiveCustomerId)
      );
      if (uIndex !== -1) {
        const targetUser = allUsers[uIndex];
        const withoutOld = existingUpcoming
          ? (targetUser.appointments || []).filter(
              (a) => a.id !== existingUpcoming.id
            )
          : targetUser.appointments || [];
        allUsers[uIndex] = {
          ...targetUser,
          appointments: [
            ...withoutOld,
            {
              id: newAppt.id,
              barberId: newAppt.barberId,
              date,
              time,
              status: newAppt.status,
            },
          ],
        };
      }
    }

    // Notify the AppointmentSelector that a successful booking occurred
    setSuccessPulse((t) => t + 1);
  };

  /**
   * handleConfirm
   *
   * Handles the booking request coming from AppointmentSelector.
   * Applies different rules depending on whether the logged-in user is a barber or a regular user:
   * - Barbers must have a client selected before proceeding.
   * - Both flows optionally show a confirmation dialog if an upcoming appointment already exists.
   */
  const handleConfirm = (date, time) => {
    if (isBarberUser) {
      // Barber flow: require client selection first
      if (!selectedCustomerId) {
        setClientValidationOpen(true);
        return;
      }
      const existingUpcoming = getUpcomingForCustomer(selectedCustomerId);
      if (existingUpcoming) {
        setPendingBooking({
          date,
          time,
          existing: existingUpcoming,
          customerId: selectedCustomerId,
        });
      } else {
        commitBooking(date, time, null, selectedCustomerId);
      }
    } else {
      // Regular user flow: operate on the logged-in user's upcoming appointment
      const existingUpcoming = getUpcomingForUser();
      if (existingUpcoming) {
        setPendingBooking({
          date,
          time,
          existing: existingUpcoming,
          customerId: currentUserId,
        });
      } else {
        commitBooking(date, time, null, currentUserId);
      }
    }
  };

  // Formats a date string into a short, user-facing label (e.g., "Jan 5")
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
            {/* Barber-only client selector displayed above the calendar */}
            {isBarberUser && (
              <>
                <Pressable
                  onPress={() => setClientPickerVisible(true)}
                  className="mb-3 rounded-xl border border-white/20 bg-black/40 px-3 py-2 flex-row items-center justify-between"
                  android_ripple={{
                    color: "rgba(255, 255, 255, 0.12)",
                    borderless: false,
                  }}
                >
                  <View>
                    <Text className="text-white text-xs uppercase tracking-widest opacity-60">
                      Client
                    </Text>
                    <Text className="text-white text-base font-semibold mt-0.5">
                      {selectedCustomer ? selectedCustomer.name : "Select client"}
                    </Text>
                  </View>
                </Pressable>

                <Modal
                  visible={clientPickerVisible}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setClientPickerVisible(false)}
                >
                  <View className="flex-1 justify-end bg-black/40">
                    <View className="max-h-[70%] bg-neutral-900 rounded-t-3xl border-t border-white/10 p-4">
                      <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-white text-lg font-semibold">
                          Select client
                        </Text>
                        <Pressable
                          onPress={() => setClientPickerVisible(false)}
                          hitSlop={8}
                        >
                          <MaterialIcons name="close" size={22} color="#fff" />
                        </Pressable>
                      </View>

                      <ScrollView className="mt-1">
                        {customerOptions.map((c) => (
                          <Pressable
                            key={c.id}
                            onPress={() => {
                              setSelectedCustomerId(c.id);
                              setClientPickerVisible(false);
                            }}
                            className="py-2.5 flex-row items-center justify-between border-b border-white/5"
                          >
                            <View>
                              <Text className="text-white font-medium">
                                {c.name}
                              </Text>
                              {c.email && (
                                <Text className="text-white/60 text-xs">
                                  {c.email}
                                </Text>
                              )}
                            </View>
                            {String(selectedCustomerId) === String(c.id) && (
                              <MaterialIcons
                                name="check"
                                size={18}
                                color="#fff"
                              />
                            )}
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </Modal>
              </>
            )}

            {/* Calendar and time-slot selector card */}
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

        {/* Validation dialog shown when a barber tries to confirm without selecting a client */}
        <ConfirmAlert
          visible={clientValidationOpen}
          type="info"
          message="Select a client please"
          onConfirm={() => setClientValidationOpen(false)}
        />

        {/* Confirmation dialog for replacing an existing upcoming appointment */}
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
                pendingBooking.existing,
                pendingBooking.customerId
              );
            }
            setPendingBooking(null);
          }}
        />
      </ImageBackground>
    </AppLayout>
  );
}
