// components/AppointmentRowCard.js
import React, { useState, useCallback, memo } from "react";
import { View, Text, Pressable } from "react-native";
import ReAnimated, { FadeIn, FadeOut } from "react-native-reanimated";

/* ------------------------------------------------------------------ */
/* Local UI helpers                                                    */
/* ------------------------------------------------------------------ */

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

const StatusChip = memo(function StatusChip({ status }) {
  // Label formatting to match your dashboard style
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
      isNextUpcomingToday ? 'border-[#B08D57]' : 'border-white/10'}`}
      style={{ elevation: 2 }}
    >
      {/* Header is the only pressable area → ripple stays in the header */}
      <Pressable
        onPress={onToggle}
        android_ripple={{ color: "rgba(255,255,255,0.06)", borderless: false }}
        className="p-4"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-[#EDEADE] text-base" style={{ fontFamily: "Inter-Medium" }}>
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

            {/* Inline QuickActions (same API/behavior as your original) */}
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
