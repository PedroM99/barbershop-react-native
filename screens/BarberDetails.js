// screens/BarberDetails.js
/**
 * BarberDetails — Smooth height animation without useEffect.
 * - No rotation support: we don't resync on dimension changes.
 * - Collapsed height updates only when collapsed & not animating.
 */

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Animated,
  ImageBackground,
  Easing,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWindowDimensions } from "react-native";
import AppLayout from '../components/appLayout';
import { Asset } from "expo-asset";

export default function BarberDetails() {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const route = useRoute();
  const { barber } = route.params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const didPreloadPortfolio = useRef(false);

  // Layout constants
  const HEADER_PAD = Math.max(insets.top + 20, 72);
  const FOOTER_H = 20;

  // Closed-state constraints
  const MIN_COLLAPSED = 280;                  // don't get too tiny
  const MAX_COLLAPSED = SCREEN_HEIGHT * 0.48; // don't cover too much of the photo
  const COLLAPSE_SAFE_BOTTOM = (insets.bottom || 0) + 24;
  const FOOTER_VISUAL_H = 64; // visual height of your floating footer (tweak 56–72)
  const SCROLL_SAFE_BOTTOM = (insets.bottom || 0) + FOOTER_VISUAL_H + 16;

  // Drawer sits at real bottom
  const BOTTOM_OFFSET = Math.max(insets.bottom + FOOTER_H, 8);

  const EXPANDED_HEIGHT = SCREEN_HEIGHT - BOTTOM_OFFSET - 12;

  // Animation values
  const drawerHeight = useRef(new Animated.Value(MIN_COLLAPSED)).current;
  const drawerBottom = useRef(new Animated.Value(BOTTOM_OFFSET)).current;

  // UI state
  const [expanded, setExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0); // measured closed content height
  const isAnimatingRef = useRef(false);

  // Helpers
  const getClosedHeight = () => {
    if (!contentHeight) return MIN_COLLAPSED;
    const topPad = 12;
    const target = contentHeight + topPad + COLLAPSE_SAFE_BOTTOM;
    return Math.min(MAX_COLLAPSED, Math.max(MIN_COLLAPSED, target));
  };

  const animateHeight = (toValue) => {
    isAnimatingRef.current = true;
    Animated.timing(drawerHeight, {
      toValue,
      duration: 700,
      easing: Easing.bezier(0.22, 1, 0.36, 1), // smooth ease-out
      useNativeDriver: false, // animating height requires false
    }).start(() => {
      isAnimatingRef.current = false;
    });
    // bottom stays fixed
    drawerBottom.setValue(BOTTOM_OFFSET);
  };

  const toggleDrawer = () => {
    const next = !expanded;
    const toHeight = next ? EXPANDED_HEIGHT : getClosedHeight();

    // Update UI immediately (scrollEnabled, labels, etc.)
    setExpanded(next);

       if (next &&
          !didPreloadPortfolio.current &&
          Array.isArray(barber.portfolio) &&
          barber.portfolio.length > 0
   ) {
     setPortfolioLoading(true);
     Asset.loadAsync(barber.portfolio)
       .catch(() => {})
       .finally(() => {
         didPreloadPortfolio.current = true;
         setPortfolioLoading(false);
       });
   }

    // Run the animation
    animateHeight(toHeight);
  };

  return (
  <AppLayout>
    <ImageBackground
      source={require("../assets/background.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1">
        {/* Hero image */}
        <Image
          source={barber.image}
          className="w-full"
          style={{ height: SCREEN_HEIGHT * 0.6, resizeMode: "cover" }}
        />

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
            contentContainerStyle={{
              paddingTop: expanded ? HEADER_PAD : 12,
              paddingBottom: SCROLL_SAFE_BOTTOM,
            }}
            className="px-5 pt-4"
            showsVerticalScrollIndicator={false}
            scrollEnabled={expanded}
            onContentSizeChange={(_, h) => {
              if (!expanded && !isAnimatingRef.current) {
                setContentHeight(h);
                const closed = (() => {
                  const topPad = 12;
                  const target = h + topPad + COLLAPSE_SAFE_BOTTOM;
                  return Math.min(MAX_COLLAPSED, Math.max(MIN_COLLAPSED, target));
                })();
                drawerHeight.setValue(closed);
                drawerBottom.setValue(BOTTOM_OFFSET);
              }
            }}
          >
            {/* Toggle button */}
            <Pressable
              onPress={toggleDrawer}
              hitSlop={8}
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
            <Text className="text-[13px] text-neutral-400 mt-0.5">
              {barber.specialty}
            </Text>

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
                style={{ fontFamily: "Inter-Regular" }}
                className="text-[14px] leading-5 text-neutral-300"
                numberOfLines={expanded ? undefined : 3}
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

            {/* Portfolio (expanded only) */}
            {expanded &&
              Array.isArray(barber.portfolio) &&
              barber.portfolio.length > 0 && (
                <View className="mt-6">
                  <Text
                    style={{ fontFamily: "CormorantGaramond-SemiBold" }}
                    className="text-[18px] text-[#EDEADE] mb-2"
                  >
                    Portfolio
                  </Text>

                  {portfolioLoading ? (
                    <View className="mt-2 items-center justify-center" style={{ minHeight: 96 }}>
                      <ActivityIndicator color="#B08D57" />
                      <Text className="mt-2 text-neutral-400">Loading…</Text>
                    </View>
                  ) : (
                    <ScrollView
                      horizontal={false}
                      showsVerticalScrollIndicator={false}
                      className="mt-1"
                      contentContainerStyle={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                      }}
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
                  )}
                </View>
              )}
          </ScrollView>
        </Animated.View>
      </View>
    </ImageBackground>
  </AppLayout>
)};
