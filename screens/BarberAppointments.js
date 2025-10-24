// screens/BarberAppointments.js
import ReAnimated, { LinearTransition, FadeIn, FadeOut } from "react-native-reanimated";
import React, { useMemo, useEffect, useState, useCallback } from "react";
import { View, Text, ImageBackground, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import AppLayout from "../components/appLayout";
import ConfirmAlert from "../components/confirmAlert";
import AppointmentRowCard from "../components/appointmentRowCard";
import { useUser } from "../context/UserContext";
import Barbers from "../data/Barbers";
import users from "../data/Users";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const STATUS = {
  BOOKED: "scheduled",
  COMPLETED: "completed",
  CANCELED: "canceled",
  NO_SHOW: "no_show",
};

// Display order for the counters
const STATUS_ORDER = ["scheduled", "completed", "canceled", "no_show"];

// Text/border colors for each status (kept subtle to fit your aesthetic)
const COLOR_BY_STATUS = {
  scheduled: "#38BDF8", // sky-400
  completed: "#22C55E", // green-500
  canceled:  "#EF4444", // red-500
  no_show:   "#F59E0B", // amber-500
};

function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromYmd(s) {
  const [y, m, d] = s.split("-").map((n) => parseInt(n, 10));
  return new Date(y, m - 1, d);
}

function formatFullDate(d) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toDateString();
  }
}

function formatDateLabel(ymdStr) {
  const [y, m, d] = ymdStr.split("-").map((n) => parseInt(n, 10));
  const date = new Date(y, m - 1, d);
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return ymdStr;
  }
}

/* ---------------------- Tiny calendar helpers ---------------------- */
function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addDays(d, delta) {
  const x = new Date(d);
  x.setDate(x.getDate() + delta);
  return x;
}
function addMonths(d, delta) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + delta);
  return x;
}
function getMonthMatrix(anyDateInMonth) {
  // Monday-start grid
  const first = startOfMonth(anyDateInMonth);
  const last = endOfMonth(anyDateInMonth);

  // JS getDay(): 0 Sun .. 6 Sat. We want 0 Mon .. 6 Sun.
  const firstWeekdayMon0 = (first.getDay() + 6) % 7;
  const daysInMonth = last.getDate();

  const cells = [];
  // Leading blanks from previous month
  for (let i = 0; i < firstWeekdayMon0; i++) {
    const d = new Date(first);
    d.setDate(first.getDate() - (firstWeekdayMon0 - i));
    cells.push({ date: d, inMonth: false });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: new Date(first.getFullYear(), first.getMonth(), i), inMonth: true });
  }
  // Trailing blanks to complete rows (42 cells = 6 weeks)
  while (cells.length % 7 !== 0) {
    const d = new Date(last);
    d.setDate(last.getDate() + (cells.length % 7 === 0 ? 0 : 1));
    cells.push({ date: new Date(cells[cells.length - 1].date.getTime() + 86400000), inMonth: false });
  }
  // Chunk into weeks
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/* -------------------- Day selector + calendar UI ------------------- */

function DaySelector({ value, onChange }) {
  const baseDate = value ?? new Date();
  const goPrev = () => onChange(addDays(baseDate, -1));
  const goNext = () => onChange(addDays(baseDate, +1));
  const isAll = value == null;

  const [calOpen, setCalOpen] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(baseDate));

  // Keep month view anchored to selected value when opening
  useEffect(() => {
    if (calOpen) setMonthCursor(startOfMonth(value ?? new Date()));
  }, [calOpen, value]);

  const weeks = useMemo(() => getMonthMatrix(monthCursor), [monthCursor]);
  const monthLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(monthCursor);
    } catch {
      return `${monthCursor.getFullYear()}-${monthCursor.getMonth() + 1}`;
    }
  }, [monthCursor]);

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <>
      <View className="px-5 py-2 bg-neutral-900/60 border-b border-white/10 flex-row items-center justify-between">
        <Pressable
          onPress={goPrev}
          android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: true }}
          className={`p-2 rounded-xl bg-neutral-800/70 border border-white/10 ${isAll ? 'opacity-0' : ''}`}
          disabled={isAll}
        >
          <MaterialIcons name="chevron-left" size={22} color="#EDEADE" />
        </Pressable>

        <Pressable
          onPress={() => setCalOpen(true)}
          android_ripple={{ color: "rgba(255,255,255,0.08)" }}
          className="px-3 py-2 rounded-xl bg-neutral-900/60 border border-white/10"
        >
          <Text className="text-[#EDEADE]" style={{ fontFamily: "Inter-Medium" }}>
            {isAll ? "All appointments" : formatFullDate(value)}
          </Text>
        </Pressable>

        <Pressable
          onPress={goNext}
          android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: true }}
          className={`p-2 rounded-xl bg-neutral-800/70 border border-white/10 ${isAll ? 'opacity-0' : ''}`}
          disabled={isAll}
        >
          <MaterialIcons name="chevron-right" size={22} color="#EDEADE" style={{ fontFamily: "MaterialIcons", fontWeight: "normal" }} />
        </Pressable>
      </View>

      {/* Calendar modal (no extra libs) */}
      <Modal visible={calOpen} transparent animationType="fade" onRequestClose={() => setCalOpen(false)}>
        {/* Backdrop */}
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          {/* Card */}
          <View className="w-full rounded-2xl p-4 bg-neutral-900 border border-white/10">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-2">
              <Pressable
                onPress={() => setMonthCursor(addMonths(monthCursor, -1))}
                android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: true }}
                className="p-2 rounded-xl bg-neutral-800/70 border border-white/10"
              >
                <MaterialIcons name="chevron-left" size={20} color="#EDEADE" />
              </Pressable>
              <Text className="text-[#EDEADE]" style={{ fontFamily: "Inter-Medium" }}>
                {monthLabel}
              </Text>
              <Pressable
                onPress={() => setMonthCursor(addMonths(monthCursor, +1))}
                android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: true }}
                className="p-2 rounded-xl bg-neutral-800/70 border border-white/10"
              >
                <MaterialIcons name="chevron-right" size={20} color="#EDEADE" />
              </Pressable>
            </View>

            {/* Weekday row */}
            <View className="flex-row justify-between mb-1">
              {weekdays.map((w) => (
                <Text key={w} className="flex-1 text-center text-neutral-400 text-[12px]">
                  {w}
                </Text>
              ))}
            </View>

            {/* Weeks grid */}
            {weeks.map((week, wi) => (
              <View key={`w-${wi}`} className="flex-row justify-between">
                {week.map(({ date, inMonth }, di) => {
                  const isSelected = !!value && ymd(date) === ymd(value);
                  const isToday = ymd(date) === ymd(new Date());
                  const muted = !inMonth;

                  const base =
                    "flex-1 mx-[2px] my-[3px] h-10 rounded-xl items-center justify-center border";
                  const bg = isSelected
                    ? "bg-[#B08D57]"
                    : "bg-neutral-900/60";
                  const border = isSelected ? "border-white/10" : "border-white/10";
                  const text =
                    isSelected
                      ? "text-black"
                      : muted
                      ? "text-neutral-500"
                      : "text-neutral-200";
                  const todayRing = !isSelected && isToday ? "border-[#B08D57]" : border;

                  return (
                    <Pressable
                      key={`d-${wi}-${di}`}
                      onPress={() => {
                        onChange(new Date(date));
                        setCalOpen(false);
                      }}
                      android_ripple={{ color: "rgba(255,255,255,0.06)" }}
                      className={`${base} ${bg} ${todayRing}`}
                    >
                      <Text className={text}>{date.getDate()}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}

            {/* Footer actions */}
            <View className="flex-row justify-end gap-2 mt-3">
              <Pressable
                onPress={() => setCalOpen(false)}
                android_ripple={{ color: "rgba(255,255,255,0.08)" }}
                className="px-3 h-10 rounded-xl items-center justify-center bg-neutral-800 border border-white/10"
              >
                <Text className="text-white">Close</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  onChange(null); 
                  setCalOpen(false);     // <- switch to All mode
                }}
                android_ripple={{ color: "rgba(255,255,255,0.08)" }}
                className="px-3 h-10 rounded-xl items-center justify-center bg-[#B08D57] border border-white/10"
              >
                <Text className="text-black">All</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  onChange(new Date());
                  setMonthCursor(startOfMonth(new Date()));
                  setCalOpen(false);
                }}
                android_ripple={{ color: "rgba(255,255,255,0.08)" }}
                className="px-3 h-10 rounded-xl items-center justify-center bg-neutral-900/60 border border-white/10"
              >
                <Text className="text-white">Today</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function DayGroup({ group, expanded, onToggle, renderRow }) {
  // Build per-status counts for this group/day
  const counts = useMemo(() => {
    const tally = { scheduled: 0, completed: 0, canceled: 0, no_show: 0 };
    for (const item of group.data) {
      const s = (item.status || "").toLowerCase();
      if (s in tally) tally[s] += 1;
    }
    return tally;
  }, [group.data]);

  const hasAny = Object.values(counts).some((n) => n > 0);

  return (
    <View className="px-5">
      {/* Header row */}
      <Pressable
        onPress={onToggle}
        android_ripple={{ color: "rgba(255,255,255,0.08)" }}
        className="mt-3 mb-1 h-11 px-3 rounded-xl bg-neutral-900/70 border border-white/10 flex-row items-center justify-between"
      >
        <Text className="text-[#EDEADE]" style={{ fontFamily: "Inter-Medium" }}>
          {group.title}
        </Text>

        <View className="flex-row items-center">
          {/* Counters (one chip per status with > 0) */}
          {hasAny && (
            <View className="flex-row items-center mr-1">
              {STATUS_ORDER.map((key) => {
                const n = counts[key];
                if (!n) return null;
                const color = COLOR_BY_STATUS[key];
                return (
                  <View
                    key={key}
                    className="px-2 py-[2px] mr-1 rounded-full border bg-neutral-800/40"
                    style={{ borderColor: color }}
                  >
                    <Text
                      className="text-[12px]"
                      style={{ color, fontFamily: "Inter-Medium" }}
                    >
                      {n}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={20} color="#EDEADE" />
        </View>
      </Pressable>

      {/* Collapsible content */}
      {expanded && (
        <ReAnimated.View entering={FadeIn.duration(140)} exiting={FadeOut.duration(120)}>
          {group.data.map((item) => (
            <View key={String(item.id)} className="pt-3">
              {renderRow(item)}
            </View>
          ))}
        </ReAnimated.View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                             */
/* ------------------------------------------------------------------ */

export default function BarberAppointments() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const route = useRoute();
  const wantAll = route?.params?.view === "all";
  const barberId = user?.barberId ?? null;

  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmItem, setConfirmItem] = useState(null); // { appt, action }
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [day, setDay] = useState(() => (wantAll ? null : new Date()));
  const [openDays, setOpenDays] = useState(() => new Set());

  useEffect(() => {
    if (day == null) setOpenDays(new Set());
  }, [day]);

  useEffect(() => {
    if (route?.params?.view === "all") {
      setDay(null);
    }
  }, [route?.params?.view]);

  // Logged-in barber
  const barber = useMemo(() => {
    if (!barberId) return null;
    return Barbers.find((b) => String(b.id) === String(barberId)) || null;
  }, [barberId, refreshKey]);

  // Filter to the selected day
  const list = useMemo(() => {
    if (!barber?.appointments || day == null) return [];
    const key = ymd(day);
    return barber.appointments
      .filter((a) => a.date === key)
      .map((a) => ({
        ...a,
        customer: users.find((u) => String(u.id) === String(a.customerId)) || null,
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [barber?.appointments, day, refreshKey]);

  const allGroups = React.useMemo(() => {
    if (!barber?.appointments || day != null) return [];
    const byDate = new Map();
    for (const a of barber.appointments) {
      if (!byDate.has(a.date)) byDate.set(a.date, []);
      byDate.get(a.date).push({
        ...a,
        customer: users.find((u) => String(u.id) === String(a.customerId)) || null,
      });
    }
    const keys = Array.from(byDate.keys()).sort((a, b) => b.localeCompare(a));
    return keys.map((dateKey) => ({
      title: formatDateLabel(dateKey),
      key: `date-${dateKey}`,
      data: byDate
        .get(dateKey)
        .slice()
        .sort((a, b) => (a.date === b.date ? b.time.localeCompare(a.time) : b.date.localeCompare(a.date))),
    }));
  }, [barber?.appointments, day, refreshKey]);

  /* ------------------------------ Mutators ------------------------------ */

  const mutateBarberAppt = useCallback(
    (apptId, nextStatus) => {
      if (!barber) return;
      const idx = Barbers.findIndex((b) => String(b.id) === String(barber.id));
      if (idx < 0) return;
      const arr = Barbers[idx].appointments || [];
      const i = arr.findIndex((x) => String(x.id) === String(apptId));
      if (i >= 0) arr[i] = { ...arr[i], status: nextStatus };
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
      setRefreshKey((k) => k + 1); // same pattern as dashboard
    },
    [mutateBarberAppt, mirrorToCustomer]
  );

  /* -------------------------------- Render -------------------------------- */

  return (
    <AppLayout>
      <ImageBackground
        source={require("../assets/background.png")}
        resizeMode="cover"
        className="flex-1"
      >
        {/* Header */}
        <View
          className="px-5 py-2 bg-neutral-900/60 border-b border-white/10"
          style={{ paddingTop: insets.top }}
        >
          <Text
            className="text-2xl text-[#EDEADE]"
            style={{ fontFamily: "CormorantGaramond-SemiBold" }}
          >
            Appointments
          </Text>
        </View>

        {/* Day selector (arrows + pressable date opens calendar) */}
        <DaySelector value={day} onChange={(d) => setDay(d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : null)} />

        {/* Body: list for the selected day */}
        <View className="flex-1">
          {day == null ? (
            // ALL mode
            allGroups.length === 0 ? (
              <View className="flex-1 items-center justify-center px-5">
                <Text className="text-neutral-400">No appointments to show.</Text>
              </View>
            ) : (
              <ReAnimated.FlatList
                data={allGroups}
                keyExtractor={(g) => g.key}
                renderItem={({ item: group }) => {
                  const expanded = openDays.has(group.key);
                  const toggle = () =>
                    setOpenDays((prev) => {
                      const next = new Set(prev);
                      if (next.has(group.key)) next.delete(group.key);
                      else next.add(group.key);
                      return next;
                    });
                  const renderRow = (item) => (
                    <AppointmentRowCard
                      appt={item}
                      isExpanded={String(expandedRowId) === String(item.id)}
                      onToggle={() =>
                        setExpandedRowId(
                          String(expandedRowId) === String(item.id) ? null : String(item.id)
                        )
                      }
                      STATUS={STATUS}
                      applyStatus={applyStatus}
                      setConfirmItem={setConfirmItem}
                    />
                  );
                  return (
                    <DayGroup group={group} expanded={expanded} onToggle={toggle} renderRow={renderRow} />
                  );
                }}
                extraData={`${refreshKey}-${expandedRowId}-${Array.from(openDays).join(",")}`}
                itemLayoutAnimation={LinearTransition.duration(180)}
                contentContainerStyle={{ paddingBottom: insets.bottom + 70, paddingTop: 8 }}
                showsVerticalScrollIndicator={false}
              />
            )
          ) : (
            <ReAnimated.FlatList
              data={list}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View className="px-5 pt-3">
                  <AppointmentRowCard
                    appt={item}
                    isExpanded={String(expandedRowId) === String(item.id)}
                    onToggle={() =>
                      setExpandedRowId(
                        String(expandedRowId) === String(item.id) ? null : String(item.id)
                      )
                    }
                    STATUS={STATUS}
                    applyStatus={applyStatus}
                    setConfirmItem={setConfirmItem}
                  />
                </View>
              )}
              extraData={`${refreshKey}-${expandedRowId}-${ymd(day)}`}
              itemLayoutAnimation={LinearTransition.duration(180)}
              contentContainerStyle={{ paddingBottom: insets.bottom + 70, paddingTop: 8 }}
              showsVerticalScrollIndicator={false}
            />
          )}
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
      </ImageBackground>
    </AppLayout>
  );
}
