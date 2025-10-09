// components/barber.js
import React from "react";
import { Pressable, View, Image, Text, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const H_PADDING = 40;     // FlatList content horizontal padding (20 + 20)
const COL_GAP = 16;       // space between columns
const ITEM_SIZE = Math.floor((screenWidth - H_PADDING - COL_GAP) / 2);

export default function Barber({ name, specialty, image, onPress }) {
  const imageSize = ITEM_SIZE - 16; // photo inside frame (p-2 each side)

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${name} details`}
      android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: false }}
      style={{ width: ITEM_SIZE }}
      className="active:scale-95"
    >
    <View className="p-3 bg-neutral-900/50 border border-white/10 shadow-sm" style={{ elevation: 2 }}>
      <Image
        source={image}
        resizeMode="cover"
        style={{ width: imageSize, height: imageSize, aspectRatio: 4/5 }}
        className="self-center mb-2 border border-white/10 bg-neutral-800"
        accessible
        accessibilityLabel={`${name}'s photo`}
      />

      <View className="h-px w-full bg-white/10 my-2" />

      <Text 
      style={{ fontFamily: "CormorantGaramond-SemiBold", fontSize: 18, lineHeight: 22  }}
      className="text-center text-[#EDEADE]" numberOfLines={1}>
        {name}
      </Text>
      <Text 
      style={{ fontFamily: "Inter-Regular", fontSize: 13, lineHeight: 16  }}
      className="text-center text-neutral-400 mt-0.5" numberOfLines={1}>
        {specialty}
      </Text>
      
    </View>
    </Pressable>
  );
}
