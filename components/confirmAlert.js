// components/confirmAlert.js
import React, { useEffect, useRef } from "react";
import { Modal, View, Text, Pressable, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ConfirmAlert({
  visible,
  message,
  onConfirm,
  onCancel,
  type = "confirm",       // "confirm" -> two buttons, "info" -> single confirm
  destructive = false,    // backward-compat: when true, confirm button uses danger tone
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 140, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, stiffness: 180, damping: 18 }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.96);
    }
  }, [visible, opacity, scale]);

  const brass = "#B08D57";
  const danger = "#8C3A37";
  const confirmBg = destructive ? danger : brass;
  const confirmIconColor = "#111"; // on brass
  const confirmIconColorDanger = "#fff"; // on danger

  const showCancel = type === "confirm";

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      {/* Backdrop */}
      <View className="flex-1 bg-black/60 items-center justify-center p-6">
        {/* Card */}
        <Animated.View
          style={{ opacity, transform: [{ scale }] }}
          className="w-full rounded-2xl p-5 bg-neutral-900 border border-white/10"
        >
          {!!message && (
            <Text
              style={{ fontFamily: "CormorantGaramond-SemiBold" }}
              className="text-[20px] text-[#EDEADE] mb-3"
            >
              {message}
            </Text>
          )}

          <View className="flex-row justify-end gap-3 mt-2">
            {showCancel && (
              <Pressable
                onPress={onCancel}
                android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: false }}
                className="flex-1 h-[52px] rounded-xl items-center justify-center bg-neutral-800 border border-white/10"
              >
                <MaterialIcons name="close" size={26} color="#EDEADE" />
              </Pressable>
            )}

            <Pressable
              onPress={onConfirm}
              android_ripple={{ color: "rgba(0,0,0,0.12)", borderless: false }}
              className="flex-1 h-[52px] rounded-xl items-center justify-center"
              style={{ backgroundColor: confirmBg }}
            >
              <MaterialIcons
                name="check"
                size={26}
                color={destructive ? confirmIconColorDanger : confirmIconColor}
              />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
