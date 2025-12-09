/**
 * HomeScreen
 *
 * Main landing page for regular users.
 *
 * Responsibilities:
 * - Show a personalized welcome message using the logged-in user's first name.
 * - Render a 2-column grid of available barbers.
 * - Navigate to BarberDetails when a barber card is selected.
 * - Integrate with the global AppLayout (safe area + bottom navigation).
 * - Intercept the Android hardware back button to confirm logout.
 */

import React, { useCallback, useState } from "react";
import { View, Text, FlatList, BackHandler, ImageBackground } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Barber from "../components/barber";
import Barbers from "../data/Barbers";
import AppLayout from "../components/appLayout";
import ConfirmAlert from "../components/confirmAlert";
import { useUser } from "../context/UserContext";
import background from "../assets/background.png";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useUser();
  const insets = useSafeAreaInsets();

  const firstName = user?.name ? user.name.match(/^\S+/)[0] : "";
  const [showLogout, setShowLogout] = useState(false);

  // Padding to ensure the FlatList content clears the floating footer navigation
  const FOOTER_PAD = insets.bottom + 70;

  // Handle Android hardware back button by asking the user to confirm logout
  const onBackPress = useCallback(() => {
    setShowLogout(true);
    return true;
  }, []);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => sub.remove();
    }, [onBackPress])
  );

  // Commit logout: clear user, reset navigation, hide dialog
  const confirmLogout = useCallback(() => {
    setUser(null);
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    setShowLogout(false);
  }, [navigation, setUser]);

  return (
    <AppLayout>
      <ImageBackground
        source={background}
        resizeMode="cover"
        className="flex-1"
        imageStyle={{ opacity: 1 }}
      >
        {/* Header */}
        <View
          className="px-5 py-2 bg-neutral-900/60 border-b border-white/10 items-center"
          style={{ paddingTop: insets.top }}
        >
          <Text
            style={{ fontFamily: "CormorantGaramond-SemiBold" }}
            className="text-2xl text-[#EDEADE]"
          >
            {user ? `Welcome ${firstName}` : "Welcome to the Barber Shop"}
          </Text>
        </View>

        {/* Barber grid (2-column FlatList) */}
        <FlatList
          key={2}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
          data={Barbers}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: FOOTER_PAD,
          }}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Barber
              name={item.name}
              specialty={item.specialty}
              image={item.image}
              onPress={() =>
                navigation.navigate("BarberDetails", { barber: item })
              }
            />
          )}
        />
      </ImageBackground>

      {/* Logout confirmation dialog */}
      <ConfirmAlert
        visible={showLogout}
        message="Are you sure you want to log out?"
        onCancel={() => setShowLogout(false)}
        onConfirm={confirmLogout}
      />
    </AppLayout>
  );
}
