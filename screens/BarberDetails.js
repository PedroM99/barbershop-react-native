// screens/BarberDetails.js
/**
 * BarberDetails
 *
 * Barber profile screen with a hero image and a bottom "drawer" that can
 * expand to full height.
 *
 * Layout / behavior:
 * - Top: full-width hero image for the selected barber.
 * - Bottom: draggable-style drawer (toggled via button) that:
 *   - Shows name, specialty, prices, description, and CTA.
 *   - Expands to show the full portfolio grid.
 *
 * Implementation details:
 * - Drawer height is animated using Animated.timing (no useEffect needed).
 * - Collapsed height is computed from measured content + safe bottom padding
 *   and then clamped between MIN_COLLAPSED and MAX_COLLAPSED.
 * - We do not handle rotation/resizing: collapsed height is based on the
 *   initial window dimensions.
 * - Portfolio images are preloaded the first time the drawer expands.
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
import AppLayout from "../components/appLayout";
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

  // Collapsed drawer configuration
  const MIN_COLLAPSED = 280; // minimum height so the card remains usable
  const MAX_COLLAPSED = SCREEN_HEIGHT * 0.48; // avoid covering too much of the hero image
  const COLLAPSE_SAFE_BOTTOM = (insets.bottom || 0) + 24;
  const FOOTER_VISUAL_H = 64; // visual height of the floating footer
  const SCROLL_SAFE_BOTTOM = (insets.bottom || 0) + FOOTER_VISUAL_H + 16;

  // Drawer anchor at the visual bottom (taking safe area and footer into account)
  const BOTTOM_OFFSET = Math.max(insets.bottom + FOOTER_H, 8);

  // Expanded drawer height (nearly full screen, anchored to BOTTOM_OFFSET)
  const EXPANDED_HEIGHT = SCREEN_HEIGHT - BOTTOM_OFFSET - 12;

  // Animation values for the drawer
  const drawerHeight = useRef(new Animated.Value(MIN_COLLAPSED)).current;
  const drawerBottom = useRef(new Animated.Value(BOTTOM_OFFSET)).current;

  // UI state
  const [expanded, setExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0); // measured scroll content height
  const isAnimatingRef = useRef(false);

  /**
   * Compute the "closed" height for the drawer using the measured content
   * height plus some padding, clamped within [MIN_COLLAPSED, MAX_COLLAPSED].
   */
  const getClosedHeight = () => {
    if (!contentHeight) return MIN_COLLAPSED;
    const topPad = 12;
    const target = contentHeight + topPad + COLLAPSE_SAFE_BOTTOM;
    return Math.min(MAX_COLLAPSED, Math.max(MIN_COLLAPSED, target));
  };

  /**
   * Animate the drawer height from its current value to the target height.
   * The bottom offset remains fixed while animating.
   */
  const animateHeight = (toValue) => {
    isAnimatingRef.current = true;
    Animated.timing(drawerHeight, {
      toValue,
      duration: 700,
      easing: Easing.bezier(0.22, 1, 0.36, 1), // custom smooth ease-out
      useNativeDriver: false, // animating height requires layout updates
    }).start(() => {
      isAnimatingRef.current = false;
    });

    // Drawer always sits at the same bottom offset
    drawerBottom.setValue(BOTTOM_OFFSET);
  };

  /**
   * Toggle between collapsed and expanded states.
   * - When expanding for the first time, preload portfolio images.
   * - Update local `expanded` state immediately so scroll/labels react
   *   without waiting for the animation.
   */
  const toggleDrawer = () => {
    const next = !expanded;
    const toHeight = next ? EXPANDED_HEIGHT : getClosedHeight();

    setExpanded(next);

    if (
      next &&
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
          {/* Hero image (barber portrait) */}
          <Image
            source={barber.image}
            className="w-full"
            style={{ height: SCREEN_HEIGHT * 0.6, resizeMode: "cover" }}
          />

          {/* Bottom drawer: collapsible details and portfolio */}
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
                // Only recompute collapsed height if we are in collapsed state
                // and not currently animating.
                if (!expanded && !isAnimatingRef.current) {
                  setContentHeight(h);
                  const closed = (() => {
                    const topPad = 12;
                    const target = h + topPad + COLLAPSE_SAFE_BOTTOM;
                    return Math.min(
                      MAX_COLLAPSED,
                      Math.max(MIN_COLLAPSED, target)
                    );
                  })();
                  drawerHeight.setValue(closed);
                  drawerBottom.setValue(BOTTOM_OFFSET);
                }
              }}
            >
              {/* Drawer toggle button */}
              <Pressable
                onPress={toggleDrawer}
                hitSlop={8}
                className="self-center mb-4 items-center rounded-xl bg-neutral-900 px-6 py-3 border border-white/10"
                android_ripple={{
                  color: "rgba(255,255,255,0.08)",
                  borderless: false,
                }}
                accessibilityRole="button"
                accessibilityLabel={
                  expanded ? "Close Portfolio" : "See Portfolio"
                }
              >
                <Text className="text-[#EDEADE] font-semibold">
                  {expanded ? "Close Portfolio" : "See Portfolio"}
                </Text>
              </Pressable>

              {/* Barber name and specialty */}
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
                  Haircut:{" "}
                  <Text className="text-neutral-300">
                    {barber.prices.haircut}
                  </Text>
                </Text>
                <Text className="text-sm text-[#EDEADE] mt-1">
                  Haircut + Beard:{" "}
                  <Text className="text-neutral-300">
                    {barber.prices.haircutBeard}
                  </Text>
                </Text>
              </View>

              {/* About section */}
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

              {/* Primary CTA: book an appointment with this barber */}
              <Pressable
                onPress={() =>
                  navigation.navigate("MakeAppointment", { barberId: barber.id })
                }
                className="mt-5 items-center rounded-xl bg-[#B08D57] py-3"
                android_ripple={{
                  color: "rgba(0,0,0,0.12)",
                  borderless: false,
                }}
              >
                <Text className="font-bold text-black">Make Appointment</Text>
              </Pressable>

              {/* Portfolio grid (only rendered in expanded mode) */}
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
                      <View
                        className="mt-2 items-center justify-center"
                        style={{ minHeight: 96 }}
                      >
                        <ActivityIndicator color="#B08D57" />
                        <Text className="mt-2 text-neutral-400">
                          Loading…
                        </Text>
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
  );
}
