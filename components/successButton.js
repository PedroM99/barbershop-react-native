import React, { useEffect, useRef } from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * SuccessButton (no logic inside):
 * - Base button keeps your normal background (gold by default).
 * - Green flash is an overlay that fades in/out (no color snap).
 * - Text crossfades to a check and back (no flicker).
 *
 * Props:
 * - label: string
 * - onPress: () => void
 * - successToken: number|string   // change to trigger success animation
 * - durationMs?: number           // total duration (default 900)
 * - disabled?: boolean
 * - containerClassName?: string   // override base classes if you want
 * - textClassName?: string        // override text classes (default black)
 */
export default function SuccessButton({
  label = "Confirm Appointment",
  onPress,
  successToken,
  durationMs = 900,
  disabled,
  containerClassName = "h-14 rounded-2xl border border-white/10 items-center justify-center bg-[#B08D57] overflow-hidden",
  textClassName = "text-[16px] text-black",
}) {
  const prev = useRef(successToken);

  // Separate animation tracks
  const flash = useSharedValue(0); // green overlay opacity
  const swap  = useSharedValue(0); // 0 = show text, 1 = show check
  const pop   = useSharedValue(0); // tiny success scale

  // container: only scale (leave background to className)
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pop.value * 0.06 }],
  }));

  // overlay: green wash opacity (no background snap)
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
  }));

  // text ↔ check crossfade
  const textStyle = useAnimatedStyle(() => ({
    opacity: 1 - swap.value,
    transform: [{ translateY: -8 * swap.value }],
  }));
  const checkStyle = useAnimatedStyle(() => ({
    opacity: swap.value,
    transform: [{ translateY: (1 - swap.value) * 8 }],
  }));

  // play on token change
  useEffect(() => {
    if (prev.current === successToken) return;
    prev.current = successToken;

    // green overlay
    flash.value = withSequence(
      withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) }),
      withDelay(260, withTiming(0, { duration: 320 }))
    );

    // text -> check -> text
    swap.value = withSequence(
      withTiming(1, { duration: 300 }),                     // show check
      withDelay(300, withTiming(0, { duration: 220 }))      // back to text
    );

    // tiny pop
    pop.value = withSequence(
      withTiming(1, { duration: 160, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 220 })
    );

    return () => {
      cancelAnimation(flash);
      cancelAnimation(swap);
      cancelAnimation(pop);
      flash.value = 0;
      swap.value = 0;
      pop.value = 0;
    };
  }, [successToken]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
      className="w-full"
    >
      <Animated.View className={containerClassName} style={containerStyle}>
        {/* Green overlay (non-interactive) */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: 10, backgroundColor: "rgba(21, 100, 50, 1)" }, // green-600 @ ~35% opacity
            overlayStyle,
          ]}
        />

        {/* Label */}
        <Animated.View style={textStyle} className="absolute inset-0 items-center justify-center">
          <Text style={{ fontFamily: "Inter-SemiBold" }} className={textClassName}>
            {label}
          </Text>
        </Animated.View>

        {/* Check */}
        <Animated.View style={checkStyle} className="absolute inset-0 items-center justify-center">
          <MaterialIcons name="check" size={26} color="#111111" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
