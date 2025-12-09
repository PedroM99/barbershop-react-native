// screens/RegisterScreen.js 
/**
 * RegisterScreen
 *
 * Public registration screen for new customers:
 * - Uses the same barbershop hero background and logo as Login.
 * - Collects name, phone, password and password confirmation.
 * - Validates missing fields, password mismatch and duplicate phone.
 * - On success, creates a new user in the mock Users store and logs them in.
 * - Uses ConfirmAlert for inline validation errors instead of native alerts.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { addUser, findUserByPhone } from "../data/Users";
import ConfirmAlert from "../components/confirmAlert";
import { useUser } from "../context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { setUser } = useUser();
  const insets = useSafeAreaInsets();

  // Local form state for registration fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // ConfirmAlert state for validation messages
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  /**
   * handleRegister
   *
   * - Validates required fields.
   * - Checks password confirmation.
   * - Ensures phone is not already registered.
   * - On success, adds the user to the in-memory Users store and logs them in.
   */
  const handleRegister = () => {
    if (!name || !phone || !password) {
      setAlertMessage("Please fill in all required fields.");
      setAlertVisible(true);
      return;
    }
    if (password !== confirm) {
      setAlertMessage("Passwords don't match. Check your password fields.");
      setAlertVisible(true);
      return;
    }
    if (findUserByPhone(phone)) {
      setAlertMessage("Phone already registered. Try logging in instead.");
      setAlertVisible(true);
      return;
    }

    const newUser = addUser({ name, phone, password });
    setUser(newUser);
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  };

  return (
    <View className="flex-1 bg-black">
      {/* Outer pressable area so tapping outside the card dismisses the keyboard */}
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <ImageBackground
          source={require("../assets/Barbershop Interior.png")}
          resizeMode="cover"
          className="flex-1"
        >
          {/* Centered logo in the upper portion of the screen (safe-area aware) */}
          <View
            pointerEvents="none"
            className="absolute left-0 right-0 items-center"
            style={{
              top: insets.top,
              height: "40%",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../assets/BarbershopLogo.png")}
              resizeMode="contain"
              style={{ width: 240, height: 240 }}
            />
          </View>

          {/* Gradient overlay for text legibility over the background image */}
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

          {/* Keyboard avoidance keeps the card visible while typing on mobile keyboards */}
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: "padding", android: "height" })}
            keyboardVerticalOffset={insets.top - 70}
            style={{ flex: 1 }}
          >
            {/* Bottom card container with registration form */}
            <View
              className="flex-1 justify-end px-5"
              style={{ paddingBottom: insets.bottom + 30 }}
            >
              <View className="w-full self-center max-w-[520px] rounded-3xl bg-black/70 border border-white/10 p-4 shadow-2xl">
                <Text
                  style={{ fontFamily: "CormorantGaramond-SemiBold" }}
                  className="text-[22px] text-[#EDEADE] text-center mb-4"
                >
                  Create your account
                </Text>

                <TextInput
                  placeholder="Full name"
                  placeholderTextColor="#888"
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                  className="h-12 rounded-xl px-3 text-[16px] bg-neutral-900/90 border border-white/10 text-[#EDEADE] mb-3"
                />

                <TextInput
                  placeholder="Phone"
                  placeholderTextColor="#888"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  className="h-12 rounded-xl px-3 text-[16px] bg-neutral-900/90 border border-white/10 text-[#EDEADE] mb-3"
                />

                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#888"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="next"
                  className="h-12 rounded-xl px-3 text-[16px] bg-neutral-900/90 border border-white/10 text-[#EDEADE] mb-3"
                />

                <TextInput
                  placeholder="Confirm password"
                  placeholderTextColor="#888"
                  secureTextEntry
                  value={confirm}
                  onChangeText={setConfirm}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  className="h-12 rounded-xl px-3 text-[16px] bg-neutral-900/90 border border-white/10 text-[#EDEADE]"
                />

                <Pressable
                  onPress={handleRegister}
                  className="mt-4 items-center rounded-xl bg-[#B08D57] py-3"
                  android_ripple={{
                    color: "rgba(0,0,0,0.12)",
                    borderless: false,
                  }}
                >
                  <Text className="font-bold text-black">
                    Create account
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => navigation.navigate("Login")}
                  className="mt-3 items-center"
                  android_ripple={{
                    color: "rgba(255,255,255,0.08)",
                    borderless: false,
                  }}
                >
                  <Text className="text-[#EDEADE] font-semibold">
                    Already have an account?{" "}
                    <Text className="underline">Log in</Text>
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </ImageBackground>
      </Pressable>

      {/* Reusable confirmation modal for validation errors */}
      <ConfirmAlert
        visible={alertVisible}
        message={alertMessage}
        type="info"
        onConfirm={() => setAlertVisible(false)}
      />
    </View>
  );
}
