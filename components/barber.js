// components/barber.js
/**
 * Barber
 *
 * Card component used on the client's home screen to display a single barber.
 *
 * Responsibilities:
 * - Render the barber's photo, name, and specialty inside a tiled grid.
 * - Compute a responsive width so two cards fit side by side on the screen.
 * - Expose an onPress handler so the parent can navigate to a detail screen.
 */

import React from "react";
import { Pressable, View, Image, Text, Dimensions } from "react-native";

// Grid layout measurements for a 2-column card layout
const screenWidth = Dimensions.get("window").width;
const H_PADDING = 40;     // horizontal padding applied to the FlatList content (e.g. 20 left + 20 right)
const COL_GAP = 16;       // space between the two columns
const ITEM_SIZE = Math.floor((screenWidth - H_PADDING - COL_GAP) / 2);

/**
 * Barber card
 *
 * Props:
 * - name: string      → barber's display name.
 * - specialty: string → short label describing the barber's focus (e.g., "Fades & Beard").
 * - image: ImageSourcePropType → source passed to the Image component.
 * - onPress: () => void       → callback invoked when the card is pressed.
 */
export default function Barber({ name, specialty, image, onPress }) {
  // Inner image size so the photo fits inside the card with padding
  const imageSize = ITEM_SIZE - 16; // accounts for p-2 horizontal padding inside the card

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${name} details`}
      android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: false }}
      style={{ width: ITEM_SIZE }}
      className="active:scale-95"
    >
      <View
        className="p-3 bg-neutral-900/50 border border-white/10 shadow-sm"
        style={{ elevation: 2 }}
      >
        <Image
          source={image}
          resizeMode="cover"
          style={{ width: imageSize, height: imageSize, aspectRatio: 4 / 5 }}
          className="self-center mb-2 border border-white/10 bg-neutral-800"
          accessible
          accessibilityLabel={`${name}'s photo`}
        />

        <View className="h-px w-full bg-white/10 my-2" />

        <Text
          style={{
            fontFamily: "CormorantGaramond-SemiBold",
            fontSize: 18,
            lineHeight: 22,
          }}
          className="text-center text-[#EDEADE]"
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text
          style={{
            fontFamily: "Inter-Regular",
            fontSize: 13,
            lineHeight: 16,
          }}
          className="text-center text-neutral-400 mt-0.5"
          numberOfLines={1}
        >
          {specialty}
        </Text>
      </View>
    </Pressable>
  );
}
