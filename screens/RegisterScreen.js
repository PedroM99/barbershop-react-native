// screens/RegisterScreen.jsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
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
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>

        <TextInput
          style={styles.input}
          placeholder="Full name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        <Pressable style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Create account</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Already have an account? Log in</Text>
        </Pressable>
        <ConfirmAlert
        visible={alertVisible}
        message={alertMessage}
        type="info"
        onConfirm={() => setAlertVisible(false)}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", gap: 12 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  link: { color: "#555", textAlign: "center", marginTop: 10 },
});