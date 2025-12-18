// screens/BarberDashboard.js
/**
 * BarberDashboard
 *
 * Home screen for barbers.
 *
 * Responsibilities:
 * - Show a "Next appointment" card with quick actions (cancel, view all).
 * - List today's appointments with inline status controls.
 * - Summarize appointment activity in memory (snapshot).
 * - Seed dev appointments for the current day in development mode.
 * - Route to:
 *   - BarberAppointments ("view all" or full history).
 *   - MakeAppointment (add new booking).
 * - Intercept the Android hardware back button to ask for logout confirmation.
 */

import ReAnimated, {
  LinearTransition,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ImageBackground,
  Animated,
  Easing,
  BackHandler,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

import AppLayout from "../components/appLayout";
import ConfirmAlert from "../components/confirmAlert";
import { useUser } from "../context/UserContext";
import Barbers from "../data/Barbers";
import users from "../data/Users";
import { ensureDevAppointmentsForDay } from "../dev/seedAppointments";
import AppointmentRowCard from "../components/appointmentRowCard";

/* ------------------------------------------------------------------ */
/* Constants + helpers                                                */
/* ------------------------------------------------------------------ */

// Normalized status values shared with the appointment list components
const STATUS = {
  BOOKED: "scheduled",
  COMPLETED: "completed",
  CANCELED: "canceled",
  NO_SHOW: "no_show",
};


// Human-friendly date label for the dashboard header (e.g., "Monday, 22 January")
function formatLongDate(d) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

// Current date as "YYYY-MM-DD"
function toTodayString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Build a Date from appointment's date/time (used for next-up selection)
function toDateTime(appt) {
  return new Date(`${appt.date}T${appt.time}`);
}

/* ------------------------------------------------------------------ */
/* NextUpCard: hoisted to avoid remounts when list state changes      */
/* ------------------------------------------------------------------ */

/**
 * NextUpCard
 *
 * Collapsible card that shows the next upcoming appointment (if any)
 * with quick access to:
 * - Cancel the next appointment (if it is not in a terminal state).
 * - Navigate to the full appointments list.
 *
 * Uses a manual height animation (Animated.Value) instead of layout
 * animation to keep behavior predictable across platforms.
 */
function NextUpCard({ appt, onCancel, onViewAll }) {
  const [expandedNext, setExpandedNext] = useState(false);
  const anim = React.useRef(new Animated.Value(0)).current;
  const [contentH, setContentH] = useState(0);

  const toggle = () => {
    const to = expandedNext ? 0 : 1;
    setExpandedNext(!expandedNext);
    Animated.timing(anim, {
      toValue: to,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  };

  // Empty-state card when there is no upcoming appointment
  if (!appt) {
    return (
      <View
        className="mx-5 mt-3 rounded-2xl p-6 bg-neutral-900/60 border border-white/10"
        style={{ elevation: 2 }}
      >
        <Text
          className="text-[#EDEADE] text-lg"
          style={{ fontFamily: "Inter-Medium" }}
        >
          No upcoming appointments
        </Text>
        <Text className="text-neutral-400 text-base mt-1">
          New bookings will appear here.
        </Text>
      </View>
    );
  }

  const isTerminal =
    appt.status === STATUS.COMPLETED ||
    appt.status === STATUS.CANCELED ||
    appt.status === STATUS.NO_SHOW;

  const height = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentH || 0],
  });

  return (
    <Pressable
      onPress={toggle}
      android_ripple={{ color: "rgba(255,255,255,0.06)", borderless: false }}
      className="mx-5 mt-3 rounded-2xl overflow-hidden p-6 bg-neutral-900/60 border border-white/10 "
      style={{ elevation: 2 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-xs text-neutral-300 mb-1">
            Next appointment
          </Text>
          <Text
            className="text-[#EDEADE]"
            style={{ fontFamily: "Inter-Medium" }}
          >
            {appt.date} • {appt.time} • {appt.customer?.name ?? "Customer"}
          </Text>
        </View>
      </View>

      {/* Hidden measurer: same markup as the visible expanded section.
         Used to compute the animated height without layout flicker. */}
      <View
        style={{ position: "absolute", left: -9999, opacity: 0 }}
        onLayout={(e) => setContentH(e.nativeEvent.layout.height)}
      >
        <View className="mt-3 border-t border-white/10 pt-3">
          {!!appt.customer?.phone && (
            <Text className="text-neutral-300 text-[13px]">
              Phone: {appt.customer.phone}
            </Text>
          )}
          <View className="flex-row gap-2 mt-3">
            {!isTerminal && (
              <Pressable
                onPress={() => onCancel?.(appt)}
                android_ripple={{ color: "rgba(255,255,255,0.12)" }}
                className="flex-1 h-10 rounded-xl items-center justify-center bg-rose-600/90"
              >
                <Text className="text-white">Cancel</Text>
              </Pressable>
            )}
            <Pressable
              onPress={onViewAll}
              android_ripple={{ color: "rgba(255,255,255,0.12)" }}
              className="flex-1 h-10 rounded-xl items-center justify-center bg-neutral-900/60 border border-white/10"
            >
              <Text className="text-white">View all</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Animated expanded content */}
      <Animated.View style={{ height, overflow: "hidden" }}>
        <View className="mt-3 border-t border-white/10 pt-3">
          {!!appt.customer?.phone && (
            <Text className="text-neutral-300 text-[13px]">
              Phone: {appt.customer.phone}
            </Text>
          )}
          <View className="flex-row gap-2 mt-3">
            {!isTerminal && (
              <Pressable
                onPress={() => onCancel?.(appt)}
                android_ripple={{ color: "rgba(255,255,255,0.12)" }}
                className="flex-1 h-10 rounded-xl items-center justify-center bg-rose-600/90"
              >
                <Text className="text-white">Cancel</Text>
              </Pressable>
            )}
            <Pressable
              onPress={onViewAll}
              android_ripple={{ color: "rgba(255,255,255,0.12)" }}
              className="flex-1 h-10 rounded-xl items-center justify-center bg-neutral-900/60 border border-white/10"
            >
              <Text className="text-white">View all</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                             */
/* ------------------------------------------------------------------ */

export default function BarberDashboard() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useUser();

  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmItem, setConfirmItem] = useState(null); // { appt, action: 'cancel' | 'no_show' }
  const [expandedRowId, setExpandedRowId] = useState(null); // appointment id or null
  const [showLogout, setShowLogout] = useState(false);
  const rowHeightsRef = React.useRef(new Map()); // reserved if per-row measurements are needed later

  const today = useMemo(() => new Date(), []);
  const todayStr = toTodayString(today);
  const longDate = formatLongDate(today);
  const firstName = user?.name ? user.name.match(/^\S+/)[0] : "";

  // Space at the bottom to clear the floating footer navigation
  const FOOTER_PAD = insets.bottom + 70;

  // Intercept Android hardware back button to show logout confirmation
  const onBackPress = useCallback(() => {
    setShowLogout(true);
    return true;
  }, []);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => sub.remove();
    }, [onBackPress])
  );

  /* ------------------------------- Data ------------------------------- */

  // Resolve the barber profile associated with the logged-in user
  const barber = useMemo(() => {
    if (!user?.barberId) return null;
    return Barbers.find((b) => String(b.id) === String(user.barberId));
  }, [user?.barberId, refreshKey]);

  // Dev-time seeding: ensure the barber has a set of appointments for today
  React.useEffect(() => {
    if (__DEV__ && barber?.id) {
      ensureDevAppointmentsForDay({
        barberId: barber.id,
        date: toTodayString(new Date()),
        start: "09:00",
        intervalMins: 60,
        slots: 8,
        mirrorToCustomer: true,
        // customerPool can be provided to restrict the user pool if desired
      });
      setRefreshKey((k) => k + 1);
    }
  }, [barber?.id]);

  // Today's appointments, sorted by time and enriched with customer data
  const todays = useMemo(() => {
    if (!barber?.appointments) return [];
    return barber.appointments
      .filter((a) => a.date === todayStr)
      .slice()
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((a) => ({
        ...a,
        customer:
          users.find((u) => String(u.id) === String(a.customerId)) || null,
      }));
  }, [barber?.appointments, todayStr, refreshKey]);

  // Aggregated snapshot for today (total, upcoming, completed, canceled, no-show)
  const snapshot = useMemo(() => {
    let total = todays.length;
    let completed = 0,
      canceled = 0,
      noShow = 0;
    todays.forEach((a) => {
      if (a.status === STATUS.COMPLETED) completed++;
      else if (a.status === STATUS.CANCELED) canceled++;
      else if (a.status === STATUS.NO_SHOW) noShow++;
    });
    const upcoming = total - (completed + canceled + noShow);
    return { total, completed, canceled, noShow, upcoming };
  }, [todays]);

  // Determine the "next up" appointment:
  // - Prefer upcoming scheduled appointments for today (with a 10-minute grace).
  // - Otherwise, pick the earliest scheduled appointment after today.
  const nextUp = useMemo(() => {
    if (!barber?.appointments) return null;

    const now = new Date();
    const graceMs = 10 * 60 * 1000; // 10-minute grace window
    const cutoff = new Date(now.getTime() - graceMs);

    const enrich = (a) => ({ ...a, when: toDateTime(a) });

    // 1) Today's scheduled appointments that are still upcoming
    const todaysUpcoming = barber.appointments
      .filter((a) => a.status === STATUS.BOOKED && a.date === todayStr)
      .map(enrich)
      .filter((a) => a.when >= cutoff)
      .sort((a, b) => a.when - b.when);

    if (todaysUpcoming.length) {
      const appt = todaysUpcoming[0];
      return {
        ...appt,
        customer:
          users.find((u) => String(u.id) === String(appt.customerId)) || null,
      };
    }

    // 2) If none today, pick the earliest scheduled appointment strictly after today
    const futureUpcoming = barber.appointments
      .filter((a) => a.status === STATUS.BOOKED && a.date > todayStr)
      .map(enrich)
      .sort((a, b) => a.when - b.when);

    if (!futureUpcoming.length) return null;

    const appt = futureUpcoming[0];
    return {
      ...appt,
      customer:
        users.find((u) => String(u.id) === String(appt.customerId)) || null,
    };
  }, [barber?.appointments, refreshKey, todayStr]);

  /* ------------------------------ Mutators ------------------------------ */

  // Update the appointment status in the barber dataset
  const mutateBarberAppt = useCallback(
    (apptId, nextStatus) => {
      if (!barber) return;
      const idx = Barbers.findIndex(
        (b) => String(b.id) === String(barber.id)
      );
      if (idx < 0) return;
      const list = Barbers[idx].appointments || [];
      const i = list.findIndex((x) => String(x.id) === String(apptId));
      if (i >= 0) list[i] = { ...list[i], status: nextStatus };
    },
    [barber]
  );

  // Mirror the status change into the corresponding customer's appointments
  const mirrorToCustomer = useCallback((custId, apptId, nextStatus) => {
    const u = users.find((uu) => String(uu.id) === String(custId));
    if (!u || !Array.isArray(u.appointments)) return;
    const i = u.appointments.findIndex((x) => String(x.id) === String(apptId));
    if (i >= 0) u.appointments[i] = { ...u.appointments[i], status: nextStatus };
  }, []);

  // Combined status update: apply to barber + customer and then trigger a refresh
  const applyStatus = useCallback(
    (appt, nextStatus) => {
      mutateBarberAppt(appt.id, nextStatus);
      mirrorToCustomer(appt.customerId, appt.id, nextStatus);
      setRefreshKey((k) => k + 1);
    },
    [mutateBarberAppt, mirrorToCustomer]
  );

  /* --------------------------- Inner components -------------------------- */

  /**
   * AddAppointmentCard
   *
   * Floating action tile used to navigate to the MakeAppointment screen
   * for the current barber. Positioned above the footer navigation bar.
   */
  const AddAppointmentCard = () => (
    <View
      className="mb-3 rounded-2xl"
      style={{ borderRadius: 16, elevation: 2 }}
    >
      <Pressable
        onPress={() =>
          navigation.navigate("MakeAppointment", {
            barberId: user?.barberId,
            source: "BarberDashboard",
          })
        }
        android_ripple={{ color: "rgba(0, 0, 0, 0.12)", borderless: false }}
        className="rounded-xs overflow-hidden p-1.5 bg-[#B08D57] border border-white/10 flex-row items-center justify-center"
        style={{ borderRadius: 16 }}
      >
        <MaterialIcons name="add" size={32} color="#000" />
      </Pressable>
    </View>
  );

  // ID of the "next up" appointment, but only if it is scheduled for today
  const nextIdToday = nextUp?.date === todayStr ? String(nextUp.id) : null;

  /* -------------------------------- Render -------------------------------- */

  return (
    <AppLayout>
      <ImageBackground
        source={require("../assets/background.png")}
        resizeMode="cover"
        className="flex-1"
      >
        {/* Header (safe-area aware) */}
        <View
          className="px-5 py-2 bg-neutral-900/60 border-b border-white/10 items-center"
          style={{ paddingTop: insets.top }}
        >
          <Text
            className="text-2xl text-[#EDEADE]"
            style={{ fontFamily: "CormorantGaramond-SemiBold" }}
          >
            {user ? `Welcome back, ${firstName}` : "Welcome"}
          </Text>
          <Text className="text-neutral-400 text-xs mt-1">{longDate}</Text>
        </View>

        {/* Always-visible "Next up" appointment card */}
        <NextUpCard
          appt={nextUp}
          onCancel={(appt) => setConfirmItem({ appt, action: "cancel" })}
          onViewAll={() =>
            navigation.navigate("BarberAppointments", {
              barberId: user?.barberId,
              view: "all",
            })
          }
        />

        {/* Body: list of today's appointments, or empty-state when none */}
        <View className="flex-1">
          {todays.length === 0 ? (
            <View className="flex-1 px-5">
              <View
                className="flex-1 items-center justify-center"
                style={{ paddingBottom: insets.bottom + 70 + 72 }}
              >
                <Text className="text-neutral-400">
                  No appointments today.
                </Text>
              </View>
            </View>
          ) : (
            <ReAnimated.FlatList
              data={todays}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <AppointmentRowCard
                  appt={item}
                  isExpanded={expandedRowId === item.id}
                  onToggle={() =>
                    setExpandedRowId(
                      expandedRowId === item.id ? null : item.id
                    )
                  }
                  STATUS={STATUS}
                  applyStatus={applyStatus}
                  setConfirmItem={setConfirmItem}
                  isNextUpcomingToday={nextIdToday === String(item.id)}
                />
              )}
              showsVerticalScrollIndicator={false}
              extraData={expandedRowId}
              itemLayoutAnimation={LinearTransition.duration(180)}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: FOOTER_PAD + 72,
              }}
              onRefresh={() => setRefreshKey((k) => k + 1)}
              refreshing={false}
            />
          )}
        </View>

        {/* Background band behind the footer area */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: FOOTER_PAD + 50,
          }}
        >
          <View className="flex-1 bg-neutral-900 border-t border-white/10" />
        </View>

        {/* Fixed "add appointment" button above the footer */}
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: insets.bottom + 70 - 12, // FOOTER_PAD - 12
          }}
        >
          <AddAppointmentCard />
        </View>

        {/* Confirmation dialogs for appointment actions and logout */}

        <ConfirmAlert
          visible={!!confirmItem}
          message={
            confirmItem?.action === "cancel"
              ? "Cancel this appointment?"
              : confirmItem?.action === "no_show"
              ? "Mark as no-show?"
              : ""
          }
          destructive
          onCancel={() => setConfirmItem(null)}
          onConfirm={() => {
            if (!confirmItem) return;
            const { appt, action } = confirmItem;
            const next =
              action === "cancel"
                ? STATUS.CANCELED
                : action === "no_show"
                ? STATUS.NO_SHOW
                : null;
            if (next) applyStatus(appt, next);
            setConfirmItem(null);
          }}
        />

        <ConfirmAlert
          visible={showLogout}
          message="Are you sure you want to log out?"
          onCancel={() => setShowLogout(false)}
          onConfirm={() => {
            setUser(null);
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            setShowLogout(false);
          }}
        />
      </ImageBackground>
    </AppLayout>
  );
}
