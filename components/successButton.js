import React, { useEffect, useRef } from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import Animated,
{
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
 * SuccessButton
 *
 * Animated confirmation button used in the booking flow.
 *
 * Responsibilities:
 * - Render a pressable button with a configurable label and styling.
 * - Play a success animation (overlay flash + icon swap + scale pop)
 *   whenever the `successToken` prop changes.
 *
 * Animation design:
 * - The base background color comes from Tailwind/NativeWind classes.
 * - A green overlay fades in and out above the button (no abrupt color changes).
 * - The label crossfades into a check icon and back.
 * - A small scale "pop" is applied to the button container on success.
 *
 * Props:
 * - label: string
 *     Text content shown on the button.
 * - onPress: () => void
 *     Callback executed when the button is pressed.
 * - successToken: number | string
 *     When this value changes, the success animation is triggered.
 * - durationMs?: number
 *     Total conceptual duration of the animation sequence (default 900).
 * - disabled?: boolean
 *     Disables the Pressable when true.
 * - containerClassName?: string
 *     Tailwind/NativeWind classes for the outer container.
 * - textClassName?: string
 *     Tailwind/NativeWind classes for the label text.
 */
export default function SuccessButton({
  label = "Confirm Appointment",
  onPress,
  successToken,
  disabled,
  containerClassName = "h-14 rounded-2xl border border-white/10 items-center justify-center bg-[#B08D57] overflow-hidden",
  textClassName = "text-[16px] text-black",
}) {
  const prev = useRef(successToken);

  // Separate animation tracks
  const flash = useSharedValue(0); // controls opacity of the green overlay
  const swap = useSharedValue(0);  // 0 = show label, 1 = show check icon
  const pop = useSharedValue(0);   // scale "pop" value for the button container

  // Container style: slight scale change on success
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pop.value * 0.06 }],
  }));

  // Overlay style: fade the green wash in and out
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: flash.value,
  }));

  // Label crossfade and vertical offset
  const textStyle = useAnimatedStyle(() => ({
    opacity: 1 - swap.value,
    transform: [{ translateY: -8 * swap.value }],
  }));

  // Check icon crossfade and vertical offset
  const checkStyle = useAnimatedStyle(() => ({
    opacity: swap.value,
    transform: [{ translateY: (1 - swap.value) * 8 }],
  }));

  // Trigger the success animation whenever successToken changes
  useEffect(() => {
    if (prev.current === successToken) return;
    prev.current = successToken;

    // Green overlay: fade in, hold briefly, then fade out
    flash.value = withSequence(
      withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) }),
      withDelay(260, withTiming(0, { duration: 320 }))
    );

    // Swap label → check → label using a crossfade
    swap.value = withSequence(
      withTiming(1, { duration: 300 }),                // show check
      withDelay(300, withTiming(0, { duration: 220 })) // back to label
    );

    // Small scale "pop" on the button
    pop.value = withSequence(
      withTiming(1, { duration: 160, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 220 })
    );

    // Cleanup to avoid stale animation values if the component unmounts
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
        {/* Green overlay sitting above the base background */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: 10, backgroundColor: "rgba(21, 100, 50, 1)" },
            overlayStyle,
          ]}
        />

        {/* Button label */}
        <Animated.View
          style={textStyle}
          className="absolute inset-0 items-center justify-center"
        >
          <Text style={{ fontFamily: "Inter-SemiBold" }} className={textClassName}>
            {label}
          </Text>
        </Animated.View>

        {/* Success check icon */}
        <Animated.View
          style={checkStyle}
          className="absolute inset-0 items-center justify-center"
        >
          <MaterialIcons name="check" size={26} color="#111111" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
