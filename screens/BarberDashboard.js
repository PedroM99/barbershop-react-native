// screens/BarberDashboard.js
import ReAnimated, { LinearTransition, FadeIn, FadeOut } from "react-native-reanimated";
import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ImageBackground,
  Animated,
  Easing,
  BackHandler
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

/* ------------------------------------------------------------------ */
/* Constants + helpers                                                */
/* ------------------------------------------------------------------ */

const STATUS = {
  BOOKED: "scheduled",
  COMPLETED: "completed",
  CANCELED: "canceled",
  NO_SHOW: "no_show",
};

// Outlined style: subtle border + tinted text (no filled backgrounds)
const BORDER_BY_STATUS = {
  [STATUS.BOOKED]: "border-[#58A6FF]",
  [STATUS.COMPLETED]: "border-[#4CAF70]",
  [STATUS.CANCELED]: "border-[#C26262]",
  [STATUS.NO_SHOW]: "border-[#D0A24F]",
};
const TEXT_BY_STATUS = {
  [STATUS.BOOKED]: "text-[#58A6FF]",
  [STATUS.COMPLETED]: "text-[#4CAF70]",
  [STATUS.CANCELED]: "text-[#C26262]",
  [STATUS.NO_SHOW]: "text-[#D0A24F]",
};

function formatLongDate(d) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      day: "2-digit",
      month: "long",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function toTodayString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toDateTime(appt) {
  // Create a Date from YYYY-MM-DD + HH:mm (assumes local time)
  return new Date(`${appt.date}T${appt.time}`);
}

/* ------------------------------------------------------------------ */
/* Hoisted component: NextUpCard (so it doesn't remount on list state) */
/* ------------------------------------------------------------------ */

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

  if (!appt) {
    return (
      <View
        className="mx-5 mt-3 rounded-2xl p-6 bg-neutral-900/60 border border-white/10"
        style={{ elevation: 2 }}
      >
        <Text className="text-[#EDEADE] text-lg" style={{ fontFamily: "Inter-Medium" }}>
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
          <Text className="text-xs text-neutral-300 mb-1">Next appointment</Text>
          <Text className="text-[#EDEADE]" style={{ fontFamily: "Inter-Medium" }}>
            {appt.date} • {appt.time} • {appt.customer?.name ?? "Customer"}
          </Text>
        </View>
        {/* We'll use StatusChip from parent scope through props */}
      </View>

      {/* Hidden measurer (same markup as the visible expanded section) */}
      <View
        style={{ position: "absolute", left: -9999, opacity: 0 }}
        onLayout={(e) => setContentH(e.nativeEvent.layout.height)}
      >
        <View className="mt-3 border-t border-white/10 pt-3">
          {!!appt.customer?.phone && (
            <Text className="text-neutral-300 text-[13px]">Phone: {appt.customer.phone}</Text>
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

      {/* Animated section */}
      <Animated.View style={{ height, overflow: "hidden" }}>
        <View className="mt-3 border-t border-white/10 pt-3">
          {!!appt.customer?.phone && (
            <Text className="text-neutral-300 text-[13px]">Phone: {appt.customer.phone}</Text>
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
  const [confirmItem, setConfirmItem] = useState(null); // { appt, action: 'cancel'|'no_show' }
  const [expandedRowId, setExpandedRowId] = useState(null); // appt.id or null
  const [showLogout, setShowLogout] = useState(false);
  const rowHeightsRef = React.useRef(new Map());

  const today = useMemo(() => new Date(), []);
  const todayStr = toTodayString(today);
  const longDate = formatLongDate(today);
  const firstName = user?.name ? user.name.match(/^\S+/)[0] : "";

  const FOOTER_PAD = insets.bottom + 70; // space to clear your floating footer nav

  const onBackPress = useCallback(() => {
    setShowLogout(true);
    return true;
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [onBackPress])
  );

  /* ------------------------------- Data ------------------------------- */

  const barber = useMemo(() => {
    if (!user?.barberId) return null;
    return Barbers.find((b) => String(b.id) === String(user.barberId));
  }, [user?.barberId, refreshKey]);

  React.useEffect(() => {
    if (__DEV__ && barber?.id) {
      ensureDevAppointmentsForDay({
        barberId: barber.id,           // Andre's id when you're testing that profile
        date: toTodayString(new Date()),
        start: "09:00",
        intervalMins: 30,
        slots: 10,                     // <- tweak freely
        // customerPool: ["user2","user7"], // optional: restrict pool
        mirrorToCustomer: true,
      });
      setRefreshKey((k) => k + 1);     // re-run memos to pick up seeded data
    }
  }, [barber?.id]);

  const todays = useMemo(() => {
    if (!barber?.appointments) return [];
    return barber.appointments
      .filter((a) => a.date === todayStr)
      .slice()
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((a) => ({
        ...a,
        customer: users.find((u) => String(u.id) === String(a.customerId)) || null,
      }));
  }, [barber?.appointments, todayStr, refreshKey]);

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

  const nextUp = useMemo(() => {
    if (!barber?.appointments) return null;
    const now = new Date();
     candidates = barber.appointments
      .filter((a) => a.status === STATUS.BOOKED)
      .map((a) => ({ ...a, when: toDateTime(a) }))
      .filter((a) => a.when >= now)
      .sort((a, b) => a.when - b.when);

    if (!candidates.length) return null;

    const appt = candidates[0];
    return {
      ...appt,
      customer:
        users.find((u) => String(u.id) === String(appt.customerId)) || null,
    };
  }, [barber?.appointments, refreshKey]);

  /* ------------------------------ Mutators ------------------------------ */

  const mutateBarberAppt = useCallback(
    (apptId, nextStatus) => {
      if (!barber) return;
      const idx = Barbers.findIndex((b) => String(b.id) === String(barber.id));
      if (idx < 0) return;
      const list = Barbers[idx].appointments || [];
      const i = list.findIndex((x) => String(x.id) === String(apptId));
      if (i >= 0) list[i] = { ...list[i], status: nextStatus };
    },
    [barber]
  );

  const mirrorToCustomer = useCallback((custId, apptId, nextStatus) => {
    const u = users.find((uu) => String(uu.id) === String(custId));
    if (!u || !Array.isArray(u.appointments)) return;
    const i = u.appointments.findIndex((x) => String(x.id) === String(apptId));
    if (i >= 0) u.appointments[i] = { ...u.appointments[i], status: nextStatus };
  }, []);

  const applyStatus = useCallback(
    (appt, nextStatus) => {
      mutateBarberAppt(appt.id, nextStatus);
      mirrorToCustomer(appt.customerId, appt.id, nextStatus);
      setRefreshKey((k) => k + 1);
    },
    [mutateBarberAppt, mirrorToCustomer]
  );

  /* --------------------------- Inner Components -------------------------- */

  const StatusChip = ({ status }) => {
    let label = String(status || "").toUpperCase();
    if (status === STATUS.BOOKED) label = "BOOKED";
    if (status === STATUS.COMPLETED) label = "COMPLETED";
    if (status === STATUS.CANCELED) label = "CANCELED";
    if (status === STATUS.NO_SHOW) label = "NO-SHOW";

    const borderClass = BORDER_BY_STATUS[status] ?? "border-white/10";
    const textClass = TEXT_BY_STATUS[status] ?? "text-neutral-300";

    return (
      <View className={`px-2 py-1 rounded-lg bg-transparent border ${borderClass}`}>
        <Text className={`text-[11px] ${textClass}`}>{label}</Text>
      </View>
    );
  };

  const QuickActions = ({ appt }) => {
    const isTerminal =
      appt.status === STATUS.COMPLETED ||
      appt.status === STATUS.CANCELED ||
      appt.status === STATUS.NO_SHOW;

    if (!isTerminal) {
      return (
        <View className="flex-row gap-2 mt-3">
          <Pressable
            onPress={() => applyStatus(appt, STATUS.COMPLETED)}
            className="flex-1 h-10 rounded-xl items-center justify-center bg-emerald-600/90"
            android_ripple={{ color: "rgba(255,255,255,0.12)" }}
          >
            <Text className="text-white">Done</Text>
          </Pressable>

          <Pressable
            onPress={() => setConfirmItem({ appt, action: "no_show" })}
            className="flex-1 h-10 rounded-xl items-center justify-center bg-amber-600/90"
            android_ripple={{ color: "rgba(255,255,255,0.12)" }}
          >
            <Text className="text-white">No-show</Text>
          </Pressable>

          <Pressable
            onPress={() => setConfirmItem({ appt, action: "cancel" })}
            className="flex-1 h-10 rounded-xl items-center justify-center bg-rose-600/90"
            android_ripple={{ color: "rgba(255,255,255,0.12)" }}
          >
            <Text className="text-white">Cancel</Text>
          </Pressable>
        </View>
      );
    }
    return null;
  };

const Row = React.memo(({ appt }) => {
  const isExpanded = expandedRowId === appt.id;
  const onToggle = () => setExpandedRowId(isExpanded ? null : appt.id);

  return (
    // Outer card (clips ripple + corners)
    <View className="mb-3 rounded-2xl bg-neutral-900/60 border border-white/10 overflow-hidden" style={{ elevation: 2 }}>
      {/* Header is the only pressable area → ripple stays in the header */}
      <Pressable
        onPress={onToggle}
        android_ripple={{ color: "rgba(255,255,255,0.06)", borderless: false }}
        className="p-4"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-[#EDEADE] text-base" style={{ fontFamily: "Inter-Medium" }}>
              {appt.time} • {appt.customer?.name ?? "Customer"}
            </Text>
          </View>
          <StatusChip status={appt.status} />
        </View>
      </Pressable>

      {/* Let the list animate height; content fades in/out for polish */}
      {isExpanded && (
        <ReAnimated.View
          entering={FadeIn.duration(140)}
          exiting={FadeOut.duration(120)}
          className="px-4 pb-4"
        >
          <View className="border-t border-white/10 pt-3">
            {!!appt.customer?.phone && (
              <Text className="text-neutral-300 text-[13px] mt-1">
                Phone: {appt.customer.phone}
              </Text>
            )}
            <QuickActions appt={appt} />
          </View>
        </ReAnimated.View>
      )}
    </View>
  );
});


const AddAppointmentCard = () => (
<View
      className="mb-3 rounded-2xl"
      style={{ borderRadius: 16, elevation: 2 }} // shadow/elevation lives here
    >
      <Pressable
        onPress={() =>
          navigation.navigate("MakeAppointment", {
            barberId: user?.barberId,
            source: "BarberDashboard",
          })
        }
        android_ripple={{ color: "rgba(0, 0, 0, 0.12)", borderless: false }}
        className="rounded-2xl overflow-hidden p-4 bg-[#B08D57] border border-white/10 flex-row items-center justify-center"
        style={{ borderRadius: 16 }}
      >
        <MaterialIcons name="add" size={32} color="#000" />
      </Pressable>
    </View>
  );

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

        {/* Always-visible "Next up" card */}
        <NextUpCard
          appt={nextUp}
          onCancel={(appt) => setConfirmItem({ appt, action: "cancel" })}
          onViewAll={() =>
            navigation.navigate("BarberAppointments", {
              barberId: user?.barberId,
            })
          }
        />

        {/* Body */}
        <View className="flex-1">
          {todays.length === 0 ? (
            <View className="flex-1 px-5">
              <View
                className="flex-1 items-center justify-center"
                style={{ paddingBottom: insets.bottom + 70 + 72 }}
              >
                <Text className="text-neutral-400">No appointments today.</Text>
              </View>
            </View>
          ) : (
            <ReAnimated.FlatList
              data={todays}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <Row appt={item} />}
              showsVerticalScrollIndicator={false}
              extraData={expandedRowId}
              itemLayoutAnimation={LinearTransition.duration(180)}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: insets.bottom + 70 + 72,
              }}
              onRefresh={() => setRefreshKey((k) => k + 1)}
              refreshing={false}
            />
          )}
        </View>

        {/* Fixed Add button above the footer */}
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

        {/* Confirm dialogs */}
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
