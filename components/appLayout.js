// components/appLayout.js
/**
 * AppLayout
 *
 * Shared layout wrapper for all top-level screens.
 *
 * Responsibilities:
 * - Provide a full-height safe-area container so content does not overlap
 *   with system UI on the left and right edges.
 * - Render the shared bottom navigation Footer below any screen content.
 *
 * Usage:
 * - Wrap screen-level JSX in <AppLayout> to get consistent structure/navigation.
 */

import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "./footerNavigation";

export default function AppLayout({ children }) {

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1 bg-transparent">
      <View className="flex-1">
        {children}
      </View>

      <Footer />
    </SafeAreaView>
  );
}
