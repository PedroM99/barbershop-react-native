/**
 * LoginScreen — Simple username/phone + password sign-in.
 *
 * Behavior:
 * - Accepts either a username (exact, case-insensitive) or a phone number (normalized).
 * - Validates against local mock `users` data.
 * - On success: calls optional `onLogin(user)` or navigates to Home with { user }.
 * - Displays inline error text for invalid credentials or missing fields.
 */



import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image } from 'react-native';
import users from '../data/Users';

export default function LoginScreen({ navigation, onLogin }) {
  const [identifier, setIdentifier] = useState(''); // username or phone
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


   // Remove spaces and common punctuation from phone input for reliable matching
  const normalizePhone = (p) => p.replace(/\s+/g, '').replace(/[-()]/g, '');


  // Validate form and attempt sign-in
  const handleSubmit = () => {
    setError('');

    if (!identifier || !password) {
      setError('Please enter your username/phone and password.');
      return;
    }

    const normalizedPhoneNumber = normalizePhone(identifier);
    const lowerName = identifier.toLowerCase();


    // Find user by (normalized) phone OR (case-insensitive) username
    const user = users.find((u) => {
      const phoneMatch = u.phone && normalizePhone(u.phone) === normalizedPhoneNumber;
      const nameMatch = u.name && u.name.toLowerCase() === lowerName;
      return phoneMatch || nameMatch;
    });


    // Credentials check
    if (!user || user.password !== password) {
      setError('Invalid username/phone or password.');
      return;
    }

    // Success: prefer onLogin callback if provided, else navigate
    if (typeof onLogin === 'function') {
      onLogin(user);
    } else if (navigation?.navigate) {
      setIdentifier('');
      setPassword(''); 
      navigation.navigate('Home', { user });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/user_placeholder.png')} style={styles.logo} />
        <Text style={styles.title}>Barbershop</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Username or Phone, for testing use: John Doe </Text>
        <TextInput
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          style={styles.input}
          returnKeyType="next"
        />

        <Text style={styles.label}>Password, for testing use: demo123</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.primaryBtn} onPress={handleSubmit}>
          <Text style={styles.primaryBtnText}>Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 72, height: 72, borderRadius: 36, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { color: '#666', marginTop: 4 },
  form: { marginTop: 8 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  error: { color: '#c33', marginBottom: 12 },
  primaryBtn: {
    backgroundColor: '#222',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
});
