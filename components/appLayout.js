// components/appLayout.js
/**
 * AppLayout — Common page chrome for the app.
 * Uses NativeWind + safe-area inset to add bottom padding so content
 * never sits behind the floating Footer.
 */
import React from "react";
import { View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Footer from "./footerNavigation";

export default function AppLayout({ children }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1 bg-transparent">
      <View className="flex-1" >
        {children}
      </View>

      <Footer />
    </SafeAreaView>
  );
}
