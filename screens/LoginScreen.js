// screens/LoginScreen.js
/**
 * LoginScreen
 *
 * Responsibilities:
 * - Display a branded barbershop background with centered logo.
 * - Show a lower, semi-transparent login card over a darkened bottom area.
 * - Allow login by username or phone number (mock data in Users.js).
 * - In development, optionally bypass password checking to speed up testing.
 * - Navigate to:
 *   - BarberDashboard when the logged-in user is a barber.
 *   - Home when the logged-in user is a regular customer.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Keyboard,
  InteractionManager,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import users from "../data/Users";
import { useUser } from "../context/UserContext";

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { setUser } = useUser();
  const insets = useSafeAreaInsets();

  // Dev flag: when true (only in __DEV__), allows skipping password check
  const DEV_BYPASS_AUTH = __DEV__ && true;

  // Normalize phone numbers by stripping spaces, dashes and parentheses
  const normalizePhone = (p) =>
    p.replace(/\s+/g, "").replace(/[-()]/g, "");

  /**
   * handleSubmit
   *
   * - Validates identifier (username/phone) and password.
   * - Looks up a matching user in the mock dataset.
   * - Applies a dev-mode bypass for the password check when enabled.
   * - Sets the global user context and redirects to the appropriate home screen.
   */
  const handleSubmit = () => {
    setError("");

    // In dev: allow empty password to speed up testing
    const requirePassword = !DEV_BYPASS_AUTH;

    if (!identifier || (requirePassword && !password)) {
      setError(
        requirePassword
          ? "Please enter your name/phone AND password."
          : "Please enter your name/phone."
      );
      return;
    }

    const normalizedPhoneNumber = normalizePhone(identifier);
    const lowerName = identifier.toLowerCase().trim();

    // Match either by phone or full name (case-insensitive)
    const found = users.find((u) => {
      const phoneMatch =
        u.phone && normalizePhone(u.phone) === normalizedPhoneNumber;
      const nameMatch =
        u.name && u.name.toLowerCase() === lowerName;
      return phoneMatch || nameMatch;
    });

    if (!found) {
      setError("Account not found. Check your name/phone.");
      return;
    }

    // Only check password if we are not bypassing in dev
    if (!DEV_BYPASS_AUTH && found.password !== password) {
      setError("Incorrect password.");
      return;
    }

    Keyboard.dismiss();

    // Defer state/navigation updates until after any in-flight animations
    InteractionManager.runAfterInteractions(() => {
      setUser(found);
      setIdentifier("");
      setPassword("");

      const targetRoute =
        found.role === "barber" ? "BarberDashboard" : "Home";
      navigation.reset({ index: 0, routes: [{ name: targetRoute }] });
    });
  };

  return (
    <View className="flex-1 bg-black">
      {/* Background barbershop photo */}
      <ImageBackground
        source={require("../assets/Barbershop Interior.png")}
        resizeMode="cover"
        className="flex-1"
      >
        {/* Centered logo in the top half, safe-area aware */}
        <View
          pointerEvents="none"
          className="absolute left-0 right-0 items-center"
          style={{
            top: insets.top,
            height: "50%",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../assets/BarbershopLogo.png")}
            resizeMode="contain"
            style={{ width: 240, height: 240 }}
          />
        </View>

        {/* Top → bottom darkening so the bottom becomes pure black */}
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.10)",
            "rgba(0,0,0,0.35)",
            "rgba(0,0,0,0.70)",
            "rgba(0,0,0,1)",
          ]}
          locations={[0, 0.35, 0.65, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Keyboard-aware layout to keep the card visible when typing */}
        <KeyboardAvoidingView
          behavior={Platform.select({
            ios: "padding",
            android: "height",
          })}
          keyboardVerticalOffset={insets.top}
          style={{ flex: 1 }}
        >
          {/* Push the login card down into the lower part of the screen */}
          <View
            style={{ paddingBottom: insets.bottom + 30 }}
            className="flex-1 justify-end px-5"
          >
            {/* Login card */}
            <View className="w-full self-center max-w-[520px] rounded-3xl bg-black/70 border border-white/10 p-4 shadow-2xl">
              {/* Form fields */}
              <View>
                <Text className="text-[12px] font-semibold text-neutral-300 mb-1">
                  Username or Phone (e.g.,{" "}
                  <Text className="text-[#EDEADE]">John Doe</Text>)
                </Text>
                <TextInput
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  returnKeyType="next"
                  placeholder="Enter username or phone"
                  placeholderTextColor="#8B8B8B"
                  className="h-12 rounded-xl px-3 text-[16px] bg-neutral-900/90 border border-white/10 text-[#EDEADE] mb-3"
                />

                <Text className="text-[12px] font-semibold text-neutral-300 mb-1">
                  Password (e.g.,{" "}
                  <Text className="text-[#EDEADE]">demo123</Text>)
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  placeholder="Enter password"
                  placeholderTextColor="#8B8B8B"
                  className="h-12 rounded-xl px-3 text-[16px] bg-neutral-900/90 border border-white/10 text-[#EDEADE]"
                />

                {!!error && (
                  <Text className="text-[#D26565] mt-2">{error}</Text>
                )}

                {/* Primary sign-in button */}
                <Pressable
                  onPress={handleSubmit}
                  className="mt-4 items-center rounded-xl bg-[#B08D57] py-3"
                  android_ripple={{
                    color: "rgba(0,0,0,0.12)",
                    borderless: false,
                  }}
                >
                  <Text className="font-bold text-black">Sign In</Text>
                </Pressable>

                {/* Link to registration flow */}
                <Pressable
                  onPress={() => navigation.navigate("Register")}
                  className="mt-3 items-center"
                  android_ripple={{
                    color: "rgba(255,255,255,0.08)",
                    borderless: false,
                  }}
                >
                  <Text className="text-[#EDEADE] font-semibold">
                    Don’t have an account?{" "}
                    <Text className="underline">Register</Text>
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}
