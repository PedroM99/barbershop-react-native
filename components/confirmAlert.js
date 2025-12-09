// components/confirmAlert.js
/**
 * ConfirmAlert
 *
 * Reusable modal dialog for confirmations and info messages.
 *
 * Responsibilities:
 * - Display a centered modal with a dimmed backdrop.
 * - Animate opacity and scale when the dialog is shown.
 * - Support two modes:
 *   - type="confirm": confirm and cancel buttons.
 *   - type="info": single confirm button.
 * - Optionally render the confirm button with a "destructive" visual style.
 * - On Android, temporarily adjust the system navigation bar styling.
 */

import React, { useEffect, useRef } from "react";
import { Modal, View, Text, Pressable, Animated, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar";

export default function ConfirmAlert({
  visible,
  message,
  onConfirm,
  onCancel,
  type = "confirm",       // "confirm" → two buttons, "info" → single confirm button
  destructive = false,    // when true, confirm button uses an alternative visual tone
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  // Handle enter/exit animation and Android navigation bar styling when visibility changes
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          stiffness: 180,
          damping: 18,
        }),
      ]).start();

      if (Platform.OS === "android") {
        NavigationBar.setBackgroundColorAsync("#0B0B0C");
        NavigationBar.setButtonStyleAsync("light");
        NavigationBar.setBehaviorAsync("overlay-swipe");
      }
    } else {
      opacity.setValue(0);
      scale.setValue(0.96);
    }
  }, [visible, opacity, scale]);

  // Color tokens for confirm button variants
  const brass = "#B08D57";
  const danger = "#8C3A37";
  const confirmBg = destructive ? danger : brass;
  const confirmIconColor = "#111"; // intended for use on brass
  const confirmIconColorDanger = "#fff"; // intended for use on darker backgrounds

  const showCancel = type === "confirm";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onCancel}
    >
      {/* Backdrop */}
      <View className="flex-1 bg-black/60 items-center justify-center p-6">
        {/* Dialog card */}
        <Animated.View
          style={{ opacity, transform: [{ scale }] }}
          className="w-full rounded-2xl p-5 bg-neutral-900 border border-white/10"
        >
          {!!message && (
            <Text
              style={{ fontFamily: "Inter-Medium" }}
              className="text-[20px] text-[#EDEADE] mb-3"
            >
              {message}
            </Text>
          )}

          <View className="flex-row justify-end gap-3 mt-2">
            {showCancel && (
              <Pressable
                onPress={onCancel}
                android_ripple={{
                  color: "rgba(255,255,255,0.08)",
                  borderless: false,
                }}
                className="flex-1 h-[52px] rounded-xl items-center justify-center bg-neutral-800 border border-white/10"
              >
                <MaterialIcons name="close" size={26} color="#EDEADE" />
              </Pressable>
            )}

            <Pressable
              onPress={onConfirm}
              android_ripple={{
                color: "rgba(0,0,0,0.12)",
                borderless: false,
              }}
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
