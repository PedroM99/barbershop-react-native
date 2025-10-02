// screens/LoginScreen.js
/**
 * LoginScreen — Dark themed with NativeWind. Logic unchanged.
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
} from "react-native";
import users from "../data/Users";
import { useUser } from "../context/UserContext";

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState(""); // username or phone
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useUser();

  const normalizePhone = (p) => p.replace(/\s+/g, "").replace(/[-()]/g, "");

  const handleSubmit = () => {
    setError("");

    if (!identifier /* || !password */) {
      setError("Please enter your username/phone and password.");
      return;
    }

    const normalizedPhoneNumber = normalizePhone(identifier);
    const lowerName = identifier.toLowerCase().trim();

    const user = users.find((u) => {
      const phoneMatch = u.phone && normalizePhone(u.phone) === normalizedPhoneNumber;
      const nameMatch = u.name && u.name.toLowerCase() === lowerName;
      return phoneMatch || nameMatch;
    });

      /**
     * -------------------- PASSWORD CHECK (DISABLED FOR TESTING) --------------------
     * To enable password validation in the future, UNCOMMENT this block:
     *
     * if (!user || user.password !== password) {
     *   setError("Invalid username/phone or password.");
     *   return;
     * }
     * ------------------------------------------------------------------------------
     */

    Keyboard.dismiss();
    InteractionManager.runAfterInteractions(() => {
      setUser(user);
      setIdentifier("");
      setPassword("");
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    });
  };

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 px-5 py-6 items-center justify-center">
        {/* Card container */}
        <View className="w-full max-w-[520px] rounded-2xl bg-neutral-900/70 border border-white/10 p-5">
          {/* Header */}
          <View className="items-center mb-5">
            <Image
              source={require("../assets/user_placeholder.png")}
              className="w-[72px] h-[72px] rounded-full mb-2 opacity-90"
            />
            <Text
              style={{ fontFamily: "CormorantGaramond-SemiBold" }}
              className="text-[24px] text-[#EDEADE] tracking-wide"
            >
              Barbershop
            </Text>
            <Text className="text-neutral-400 mt-1">Sign in to continue</Text>
          </View>

          {/* Form */}
          <View>
            <Text className="text-[13px] font-semibold text-neutral-300 mb-1.5">
              Username or Phone (e.g., <Text className="text-[#EDEADE]">John Doe</Text>)
            </Text>
            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              returnKeyType="next"
              placeholder="Enter username or phone"
              placeholderTextColor="#888"
              className="h-12 rounded-xl px-3 text-[16px] bg-neutral-900 border border-white/10 text-[#EDEADE] mb-3"
            />

            <Text className="text-[13px] font-semibold text-neutral-300 mb-1.5">
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
              placeholderTextColor="#888"
              className="h-12 rounded-xl px-3 text-[16px] bg-neutral-900 border border-white/10 text-[#EDEADE]"
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
    </ImageBackground>
  );
}
