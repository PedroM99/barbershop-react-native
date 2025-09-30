// components/barber.js
import React from "react";
import { Pressable, View, Image, Text, Dimensions, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
      <View className="shadow-sm" style={{ elevation: 3 }}>
        {/* Wooden frame */}
        <ImageBackground
          source={require("../assets/Wood.png")}
          resizeMode="cover"
          className="rounded-sm overflow-hidden"
        >
          {/* slight dark glaze so the photo pops */}
          <View className="bg-black/5 absolute inset-0" />
          <View className="p-2">
            <View className=" overflow-hidden bg-black/10">
              <Image
                source={image}
                resizeMode="cover"
                style={{ width: imageSize, height: imageSize }}
                className="rounded-sm self-center"
                accessible
                accessibilityLabel={`${name}'s photo`}
              />
            </View>
          </View>
        </ImageBackground>

        <LinearGradient
         colors={["#F7E7B5", "#D4AF37", "#B8860B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mt-2 rounded-xl border border-black/30 shadow-sm"
          style={{ paddingHorizontal: 12, paddingVertical: 8, elevation: 2 }}
        >
        <Text className="font-semibold text-[13px] tracking-wide uppercase text-center" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-black/70 text-[12px] text-center" numberOfLines={1}>
          {specialty}
        </Text>
        </LinearGradient>
      </View>
    </Pressable>
  );
}
