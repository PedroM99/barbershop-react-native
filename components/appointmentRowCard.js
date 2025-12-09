// components/AppointmentRowCard.js
/**
 * AppointmentRowCard
 *
 * Expandable row used in the barber's appointment list.
 *
 * Responsibilities:
 * - Display a single appointment with time, customer name, and status.
 * - Highlight the "next upcoming" appointment (today) with a different border.
 * - Show additional details and inline actions when expanded (complete, no-show, cancel).
 *
 * Supports both:
 * - Uncontrolled mode (internal expanded state).
 * - Controlled mode (parent passes isExpanded and onToggle).
 */

import React, { useState, useCallback, memo } from "react";
import { View, Text, Pressable } from "react-native";
import ReAnimated, { FadeIn, FadeOut } from "react-native-reanimated";

/**
 * Visual configuration per appointment status
 * (border and text color variants linked to status values).
 */
const BORDER_BY_STATUS = {
  scheduled: "border-[#58A6FF]",
  completed: "border-[#4CAF70]",
  canceled: "border-[#C26262]",
  no_show: "border-[#D0A24F]",
};

const TEXT_BY_STATUS = {
  scheduled: "text-[#58A6FF]",
  completed: "text-[#4CAF70]",
  canceled: "text-[#C26262]",
  no_show: "text-[#D0A24F]",
};

/**
 * StatusChip
 *
 * Small pill showing the current appointment status with
 * a status-specific label and color.
 */
const StatusChip = memo(function StatusChip({ status }) {
  let label = String(status || "").toUpperCase();
  if (status === "scheduled") label = "BOOKED";
  if (status === "completed") label = "COMPLETED";
  if (status === "canceled") label = "CANCELED";
  if (status === "no_show") label = "NO-SHOW";

  const borderClass = BORDER_BY_STATUS[status] ?? "border-white/10";
  const textClass = TEXT_BY_STATUS[status] ?? "text-neutral-300";

  return (
    <View className={`px-2 py-1 rounded-lg bg-transparent border ${borderClass}`}>
      <Text className={`text-[11px] ${textClass}`}>{label}</Text>
    </View>
  );
});

/**
 * QuickActions
 *
 * Inline actions shown under an expanded appointment:
 * - Mark as completed.
 * - Mark as no-show.
 * - Cancel appointment.
 *
 * Hidden for terminal states (completed, canceled, no-show).
 */
function QuickActions({ appt, STATUS, applyStatus, setConfirmItem }) {
  const isTerminal =
    appt.status === STATUS.COMPLETED ||
    appt.status === STATUS.CANCELED ||
    appt.status === STATUS.NO_SHOW;

  if (isTerminal) return null;

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

/**
 * AppointmentRowCardBase
 *
 * Core card implementation. Exposed as a memoized AppointmentRowCard.
 * Accepts an optional controlled API (isExpanded, onToggle) so parent lists
 * can manage which row is open.
 */
function AppointmentRowCardBase({
  appt,
  isExpanded: controlledExpanded,
  onToggle: controlledOnToggle,
  STATUS,
  applyStatus,
  setConfirmItem,
  isNextUpcomingToday,
}) {
  const [internalExpanded, setInternalExpanded] = useState(false);

  const isControlled = typeof controlledExpanded === "boolean";
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const onToggle = useCallback(() => {
    if (isControlled) {
      controlledOnToggle?.();
    } else {
      setInternalExpanded((v) => !v);
    }
  }, [isControlled, controlledOnToggle]);

  return (
    <View
      className={`mb-3 rounded-2xl bg-neutral-900/60 border overflow-hidden ${
        isNextUpcomingToday ? "border-[#B08D57]" : "border-white/10"
      }`}
      style={{ elevation: 2 }}
    >
      {/* Header: main row content and tap target for expand/collapse */}
      <Pressable
        onPress={onToggle}
        android_ripple={{ color: "rgba(255,255,255,0.06)", borderless: false }}
        className="p-4"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text
              className="text-[#EDEADE] text-base"
              style={{ fontFamily: "Inter-Medium" }}
            >
              {appt?.time} • {appt?.customer?.name ?? "Customer"}
            </Text>
          </View>
          <StatusChip status={appt?.status} />
        </View>
      </Pressable>

      {isExpanded && (
        <ReAnimated.View
          entering={FadeIn.duration(140)}
          exiting={FadeOut.duration(120)}
          className="px-4 pb-4"
        >
          <View className="border-t border-white/10 pt-3">
            {!!appt?.customer?.phone && (
              <Text className="text-neutral-300 text-[13px] mt-1">
                Phone: {appt.customer.phone}
              </Text>
            )}

            {/* Inline actions for updating appointment status */}
            <QuickActions
              appt={appt}
              STATUS={STATUS}
              applyStatus={applyStatus}
              setConfirmItem={setConfirmItem}
            />
          </View>
        </ReAnimated.View>
      )}
    </View>
  );
}

const AppointmentRowCard = memo(AppointmentRowCardBase);
export default AppointmentRowCard;
