// screens/LoginScreen.js
/**
 * LoginScreen — Barbershop background + bottom fade + lower, smaller card
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
  Platform 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import users from "../data/Users";
import { useUser } from "../context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useUser();

  const normalizePhone = (p) => p.replace(/\s+/g, "").replace(/[-()]/g, "");
  const insets = useSafeAreaInsets();
  const DEV_BYPASS_AUTH = __DEV__ && true;

  const handleSubmit = () => {
  setError("");

  // In dev: allow empty password to speed up testing
  const requirePassword = !DEV_BYPASS_AUTH;

  if (!identifier || (requirePassword && !password)) {
    setError(requirePassword
      ? "Please enter your name/phone AND password."
      : "Please enter your name/phone.");
    return;
  }

  const normalizedPhoneNumber = normalizePhone(identifier);
  const lowerName = identifier.toLowerCase().trim();

  const found = users.find((u) => {
    const phoneMatch = u.phone && normalizePhone(u.phone) === normalizedPhoneNumber;
    const nameMatch = u.name && u.name.toLowerCase() === lowerName;
    return phoneMatch || nameMatch;
  });

  if (!found) {
    setError("Account not found. Check your name/phone.");
    return;
  }

  // Only check password if not bypassing
  if (!DEV_BYPASS_AUTH && found.password !== password) {
    setError("Incorrect password.");
    return;
  }

  Keyboard.dismiss();
  InteractionManager.runAfterInteractions(() => {
    setUser(found);
    setIdentifier("");
    setPassword("");

    const targetRoute = found.role === "barber" ? "BarberDashboard" : "Home";
    navigation.reset({ index: 0, routes: [{ name: targetRoute }] });
  });
  };

  return (
    <View className="flex-1 bg-black">
      
      {/* Background image */}
      <ImageBackground
        source={require("../assets/Barbershop Interior.png")}
        resizeMode="cover"
        className="flex-1"
      >
      <View
        pointerEvents="none"
        className="absolute left-0 right-0 items-center"
        style={{
          top: insets.top,        // safe away from status bar
          height: "50%",          // stays in the top half
          justifyContent: "center",
        }}
      >
      <Image
        source={require("../assets/BarbershopLogo.png")}
        resizeMode="contain"
        style={{
          width: 240,            
          height: 240,
        }}
      />
      </View>
        {/* Top→bottom darkening so the bottom becomes pure black */}
        <LinearGradient
          colors={["rgba(0,0,0,0.10)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.70)", "rgba(0,0,0,1)"]}
          locations={[0, 0.35, 0.65, 1]}
          style={{ ...StyleSheet.absoluteFillObject }}
        />
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: "height" })}
          keyboardVerticalOffset={insets.top} // tweak if needed (e.g., +12)
          style={{ flex: 1 }}
        >
        {/* Content: push card to the lower area */}
        <View 
        style={{ paddingBottom: insets.bottom + 30 }}
        className="flex-1 justify-end px-5"
        >
          {/* Card container (smaller, lower) */}
          <View className="w-full self-center max-w-[520px] rounded-3xl bg-black/70 border border-white/10 p-4 shadow-2xl">
            {/* Form */}
            <View>
              <Text className="text-[12px] font-semibold text-neutral-300 mb-1">
                Username or Phone (e.g., <Text className="text-[#EDEADE]">John Doe</Text>)
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
                Password (e.g., <Text className="text-[#EDEADE]">demo123</Text>)
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

              {!!error && <Text className="text-[#D26565] mt-2">{error}</Text>}

              <Pressable
                onPress={handleSubmit}
                className="mt-4 items-center rounded-xl bg-[#B08D57] py-3"
                android_ripple={{ color: "rgba(0,0,0,0.12)", borderless: false }}
              >
                <Text className="font-bold text-black">Sign In</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("Register")}
                className="mt-3 items-center"
                android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: false }}
              >
                <Text className="text-[#EDEADE] font-semibold">
                  Don’t have an account? <Text className="underline">Register</Text>
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

import { StyleSheet } from "react-native";
