// screens/RegisterScreen.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { addUser, findUserByPhone } from "../data/Users";
import ConfirmAlert from "../components/confirmAlert";
import { useUser } from "../context/UserContext";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { setUser } = useUser();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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
    <ImageBackground
      source={require("../assets/background.png")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 px-5 py-6 items-center justify-center">
        {/* Card */}
        <View className="w-full max-w-[520px] rounded-2xl bg-neutral-900/70 border border-white/10 p-5">
          <Text
            style={{ fontFamily: "CormorantGaramond-SemiBold" }}
            className="text-[24px] text-[#EDEADE] text-center mb-5"
          >
            Register
          </Text>

          {/* Inputs */}
          <TextInput
            placeholder="Full name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            className="h-12 rounded-xl px-3 text-[16px] bg-neutral-900 border border-white/10 text-[#EDEADE] mb-3"
          />
          <TextInput
            placeholder="Phone"
            placeholderTextColor="#888"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            className="h-12 rounded-xl px-3 text-[16px] bg-neutral-900 border border-white/10 text-[#EDEADE] mb-3"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="h-12 rounded-xl px-3 text-[16px] bg-neutral-900 border border-white/10 text-[#EDEADE] mb-3"
          />
          <TextInput
            placeholder="Confirm password"
            placeholderTextColor="#888"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            className="h-12 rounded-xl px-3 text-[16px] bg-neutral-900 border border-white/10 text-[#EDEADE]"
          />

          {/* Actions */}
          <Pressable
            onPress={handleRegister}
            className="mt-4 items-center rounded-xl bg-[#B08D57] py-3"
            android_ripple={{ color: "rgba(0,0,0,0.12)", borderless: false }}
          >
            <Text className="font-bold text-black">Create account</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("Login")}
            className="mt-3 items-center"
            android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: false }}
          >
            <Text className="text-[#EDEADE] font-semibold">
              Already have an account? <Text className="underline">Log in</Text>
            </Text>
          </Pressable>
        </View>
      </View>

      <ConfirmAlert
        visible={alertVisible}
        message={alertMessage}
        type="info"
        onConfirm={() => setAlertVisible(false)}
      />
    </ImageBackground>
  );
}
