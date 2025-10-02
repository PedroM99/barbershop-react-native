// screens/BarberDetails.js
/**
 * BarberDetails — Dark themed + NativeWind styling, logic unchanged.
 */

import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Animated,
  ImageBackground,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWindowDimensions } from "react-native";

export default function BarberDetails() {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const route = useRoute();
  const { barber } = route.params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const COLLAPSED_HEIGHT = SCREEN_HEIGHT * 0.40;
  const EXPANDED_HEIGHT  = SCREEN_HEIGHT * 0.86;

  const COLLAPSED_BOTTOM = insets.bottom + 30; // ≈ footer height
  const EXPANDED_BOTTOM  = insets.bottom + 15;

  // Animated values
  const drawerHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const drawerBottom = useRef(new Animated.Value(COLLAPSED_BOTTOM)).current;
  const [expanded, setExpanded] = useState(false);

  // keep drawer height in sync on rotate / expand state change
  useEffect(() => {
    drawerHeight.setValue(expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT);
  }, [SCREEN_HEIGHT, expanded]);

  const toggleDrawer = () => {
    const next = !expanded;
    Animated.parallel([
      Animated.timing(drawerHeight, {
        toValue: next ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(drawerBottom, {
        toValue: next ? EXPANDED_BOTTOM : COLLAPSED_BOTTOM,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
    setExpanded(next);
  };

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1">
        {/* Hero image */}
        <Image source={barber.image} className="w-full" style={{ height: SCREEN_HEIGHT * 0.40, resizeMode: "cover" }} />

        {/* Drawer */}
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: drawerHeight,
            bottom: drawerBottom,
          }}
          className="bg-neutral-900/90 border-t border-white/10 rounded-t-2xl overflow-hidden"
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 40 }}
            className="px-5 pt-4"
            showsVerticalScrollIndicator={false}
          >
            {/* Handle / toggle */}
            <Pressable
              onPress={toggleDrawer}
              className="self-center mb-4 items-center rounded-xl bg-neutral-900 px-6 py-3 border border-white/10"
              android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: false }}
              accessibilityRole="button"
              accessibilityLabel={expanded ? "Close Portfolio" : "See Portfolio"}
            >
            <Text className="text-[#EDEADE] font-semibold">
                {expanded ? "Close Portfolio" : "See Portfolio"}
            </Text>
            </Pressable>

            {/* Name + meta */}
            <Text
              style={{ fontFamily: "CormorantGaramond-SemiBold" }}
              className="text-[22px] text-[#EDEADE]"
            >
              {barber.name}
            </Text>
            <Text className="text-[13px] text-neutral-400 mt-0.5">{barber.specialty}</Text>

            {/* Prices */}
            <View className="mt-3">
              <Text className="text-sm text-[#EDEADE]">
                Haircut: <Text className="text-neutral-300">{barber.prices.haircut}</Text>
              </Text>
              <Text className="text-sm text-[#EDEADE] mt-1">
                Haircut + Beard: <Text className="text-neutral-300">{barber.prices.haircutBeard}</Text>
              </Text>
            </View>

            {/* About */}
            <View className="mt-5">
              <Text
                style={{ fontFamily: "CormorantGaramond-SemiBold" }}
                className="text-[18px] text-[#EDEADE] mb-1"
              >
                About
              </Text>
              <Text
                // Inter for body if you want: style={{ fontFamily: "Inter-Regular" }}
                className="text-[14px] leading-5 text-neutral-300"
              >
                {barber.description}
              </Text>
            </View>

            {/* CTA */}
            <Pressable
              onPress={() => navigation.navigate("MakeAppointment", { barberId: barber.id })}
              className="mt-5 items-center rounded-xl bg-[#B08D57] py-3"
              android_ripple={{ color: "rgba(0,0,0,0.12)", borderless: false }}
            >
              <Text className="font-bold text-black">Make Appointment</Text>
            </Pressable>

            {/* Portfolio */}
            {expanded && Array.isArray(barber.portfolio) && barber.portfolio.length > 0 && (
              <View className="mt-6">
                <Text
                  style={{ fontFamily: "CormorantGaramond-SemiBold" }}
                  className="text-[18px] text-[#EDEADE] mb-2"
                >
                  Portfolio
                </Text>

                <ScrollView
                  horizontal={false}
                  showsVerticalScrollIndicator={false}
                  className="mt-1"
                  contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}
                >
                  {barber.portfolio.map((img, idx) => (
                    <Image
                      key={idx}
                      source={img}
                      className="rounded-xl mb-2"
                      style={{ width: "48%", aspectRatio: 1 }}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}
