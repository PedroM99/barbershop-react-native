import React, { useState, useMemo } from "react";
import { View, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext";
import ConfirmAlert from "./confirmAlert";

/**
 * Footer
 *
 * Fixed bottom navigation bar shown across the app.
 *
 * Responsibilities:
 * - Position a floating navigation bar above the system navigation area.
 * - Render role-aware navigation: "Home" routes to BarberDashboard for barbers,
 *   and Home for regular users.
 * - Provide quick access to Home, Profile, and Logout.
 * - Confirm logout using the shared ConfirmAlert component.
 */
export default function Footer() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useUser();

  const [showLogout, setShowLogout] = useState(false);

  // Determines which route name should be treated as "Home" for the current user
  const homeRouteName = useMemo(
    () => (user?.role === "barber" ? "BarberDashboard" : "Home"),
    [user?.role]
  );

  // Reads the current route name from the navigation state
  const current = useMemo(() => {
    const state = navigation.getState?.();
    return state?.routes?.[state.index]?.name ?? "";
  }, [navigation]);

  const isHomeActive = current === homeRouteName;
  const isProfile = current === "Profile";

  return (
    <View
      pointerEvents="box-none"
      style={{ bottom: insets.bottom + 8 }}
      className="absolute left-2 right-2 z-50 items-center justify-center"
    >
      <View
        className="w-full flex-row items-center justify-around rounded-xl px-4 py-1.5 bg-[#F2EFE8] border border-black/10 shadow-md"
        style={{ elevation: 5 }}
      >
        {/* Logout button (styled with danger tone) */}
        <NavBtn
          onPress={() => setShowLogout(true)}
          active={false}
          icon="logout"
          tone="danger"
        />

        {/* Role-aware Home: resets the stack to the appropriate home screen */}
        <NavBtn
          onPress={() => {
            if (isHomeActive) return;
            navigation.reset({ index: 0, routes: [{ name: homeRouteName }] });
          }}
          active={isHomeActive}
          icon="home"
        />

        {/* Profile: always navigates to the Profile screen */}
        <NavBtn
          onPress={() => navigation.navigate("Profile")}
          active={isProfile}
          icon="person"
        />
      </View>

      <ConfirmAlert
        visible={showLogout}
        message="Are you sure you want to log out?"
        onCancel={() => setShowLogout(false)}
        onConfirm={() => {
          setUser(null);
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          setShowLogout(false);
        }}
      />
    </View>
  );
}

/**
 * NavBtn
 *
 * Single icon-only navigation button used inside the footer bar.
 *
 * Props:
 * - onPress: () => void      → handler for button press.
 * - active: boolean          → whether this route is currently active.
 * - icon: string             → MaterialIcons icon name.
 * - tone: "default" | "danger" → visual variant; danger used for logout.
 *
 * The active state is indicated by a small accent bar above the icon
 * (except for the danger variant, which is handled via color only).
 */
function NavBtn({ onPress, active, icon, tone = "default" }) {
  const base = "#2B2B2B";
  const accent = "#B08D57";
  const danger = "#8C3A37";

  const color = tone === "danger" ? danger : active ? accent : base;
  const ripple =
    tone === "danger" ? "rgba(140,58,55,0.15)" : "rgba(0,0,0,0.06)";

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: ripple, borderless: true }}
      className="flex-1 items-center justify-center py-2"
      hitSlop={8}
    >
      {active && tone !== "danger" ? (
        <View
          className="absolute -top-0.5 h-[2px] w-6 rounded-full"
          style={{ backgroundColor: "#B08D57" }}
        />
      ) : null}
      <MaterialIcons name={icon} size={24} color={color} />
    </Pressable>
  );
}
