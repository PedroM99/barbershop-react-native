import React, { useState, useMemo } from "react";
import { View, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext";
import ConfirmAlert from "./confirmAlert";

export default function Footer() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { setUser } = useUser();
  const [showLogout, setShowLogout] = useState(false);

  const current = useMemo(() => {
    const state = navigation.getState?.();
    return state?.routes?.[state.index]?.name ?? "";
  }, [navigation]);

  const isHome = current === "Home";
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
        {/* Logout (danger tone) */}
        <NavBtn
          onPress={() => setShowLogout(true)}
          active={false}
          icon="logout"
          tone="danger"
        />

        {/* Home */}
        <NavBtn
          onPress={() => {
            if (isHome) return;
            navigation.reset({ index: 0, routes: [{ name: "Home" }] });
          }}
          active={isHome}
          icon="home"
        />

        {/* Profile */}
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

function NavBtn({ onPress, active, icon, tone = "default" }) {
  const base = "#2B2B2B";     // default icon
  const accent = "#B08D57";   // active brass
  const danger = "#8C3A37";   // oxblood (logout)

  const color = tone === "danger" ? danger : active ? accent : base;
  const ripple = tone === "danger" ? "rgba(140,58,55,0.15)" : "rgba(0,0,0,0.06)";

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: ripple, borderless: true }}
      className="flex-1 items-center justify-center py-2"
      hitSlop={8}
    >
      {/* Brass indicator for active state (non-danger) */}
      {active && tone !== "danger" ? (
        <View
          className="absolute -top-0.5 h-[2px] w-6 rounded-full"
          style={{ backgroundColor: accent }}
        />
      ) : null}
      <MaterialIcons name={icon} size={24} color={color} />
    </Pressable>
  );
}
