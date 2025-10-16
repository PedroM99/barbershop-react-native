// screens/ProfileScreen.js
import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
  SectionList,
  TextInput,
  ImageBackground,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import AppLayout from "../components/appLayout";
import { useUser } from "../context/UserContext";
import Barbers from "../data/Barbers";
import ConfirmAlert from "../components/confirmAlert";

export default function ProfileScreen() {
  const { user, setUser } = useUser();
  const insets = useSafeAreaInsets();
  const FOOTER_PAD = insets.bottom + 70;

  // --- Edit state ---
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(user?.name ?? "");
  const [draftPhone, setDraftPhone] = useState(user?.phone ?? "");
  const [draftImage, setDraftImage] = useState(user?.image ?? null); // {uri} or require(...)
  const [confirmAppt, setConfirmAppt] = useState(null);

  const resetDrafts = useCallback(() => {
    setDraftName(user?.name ?? "");
    setDraftPhone(user?.phone ?? "");
    setDraftImage(user?.image ?? null);
  }, [user]);

  const startEdit = () => {
    resetDrafts();
    setIsEditing(true);
  };

  const cancelEdit = () => {
    resetDrafts();
    setIsEditing(false);
  };

  const saveEdit = () => {
    const nameOk = String(draftName).trim().length >= 2;
    const phoneOk =
      !draftPhone || /^[\d+\-\s()]{6,}$/.test(String(draftPhone));
    if (!nameOk) {
      Alert.alert("Invalid name", "Please enter at least 2 characters.");
      return;
    }
    if (!phoneOk) {
      Alert.alert("Invalid phone", "Please check the phone number format.");
      return;
    }

    setUser((prev) => ({
      ...prev,
      name: draftName.trim(),
      phone: draftPhone || "",
      image: draftImage || null,
    }));
    setIsEditing(false);
  };

  const pickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to change your picture."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setDraftImage({ uri: result.assets[0].uri });
    }
  };

  const freeBarberSlot = (barberId, date, time) => {
    const b = Barbers.find((b) => String(b.id) === String(barberId));
    if (!b) return;
    if (Array.isArray(b.appointments)) {
      b.appointments = b.appointments.filter(
        (ap) => !(ap.date === date && ap.time === time)
      );
    } else if (Array.isArray(b.booked)) {
      b.booked = b.booked.filter(
        (ap) => !(ap.date === date && ap.time === time)
      );
    }
  };

  const handleCancelUpcoming = (appt) => {
    setUser((prev) => ({
      ...prev,
      appointments: (prev.appointments || []).filter((a) => a.id !== appt.id),
    }));
    freeBarberSlot(appt.barberId, appt.date, appt.time);
    setConfirmAppt(null);
  };

  const sections = useMemo(() => {
    if (!user?.appointments) return [];

    const byId = (id) => Barbers.find((b) => String(b.id) === String(id));
    const withBarber = user.appointments.map((a) => ({
      ...a,
      barber: byId(a.barberId),
      when: new Date(`${a.date}T${a.time}`),
    }));

    const now = new Date();
    const upcoming = withBarber
      .filter((a) => a.when >= now && a.status !== "completed")
      .sort((a, b) => a.when - b.when);

    const past = withBarber
      .filter((a) => a.when < now || a.status === "completed")
      .sort((a, b) => b.when - a.when);

    const sectionsArr = [];
    if (upcoming.length) sectionsArr.push({ title: "Upcoming", data: upcoming });
    if (past.length) sectionsArr.push({ title: "Past", data: past });
    return sectionsArr;
  }, [user?.appointments]);

  const AppointmentRow = ({ item, sectionTitle }) => {
    const isUpcoming = sectionTitle === "Upcoming";

    return (
      <View
        className="mx-5 mb-3 bg-neutral-900/60 border border-white/10 rounded-xl p-4 flex-row items-center gap-3"
        style={{ elevation: 2 }}
      >
        <View className="flex-1">
          <Text 
          style= {{ fontFamily: "CormorantGaramond-Bold" }}
          className="text-[#EDEADE]">
            {item.barber?.name ?? "Barber"}
          </Text>
          <Text className="text-neutral-400 text-xs mt-0.5">
            {item.barber?.specialty ?? ""}
          </Text>
          <Text className="text-neutral-400 text-xs mt-1">
            {item.date} • {item.time} • {item.status}
          </Text>
        </View>

        {isUpcoming && (
          <Pressable
            onPress={() => setConfirmAppt(item)}
            android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
            accessibilityRole="button"
            accessibilityLabel="Cancel appointment"
            className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center ml-2 border border-white/10"
          >
            <MaterialIcons name="close" size={22} color="#EDEADE" />
          </Pressable>
        )}
      </View>
    );
  };

  if (!user) {
    return (
      <AppLayout>
        <ImageBackground
          source={require("../assets/background.png")}
          resizeMode="cover"
          className="flex-1"
        >
          <View className="flex-1 items-center justify-center gap-3">
            <Text className="text-[22px] font-extrabold text-[#EDEADE]">
              Profile
            </Text>
            <Text className="text-neutral-400">No user data provided.</Text>
          </View>
        </ImageBackground>
      </AppLayout>
    );
  }

  const renderHeaderView = () => {
    if (!isEditing) {
      return (
        <View className="px-5 py-2 bg-neutral-900/60 border-b border-white/10 items-center">
          <Image
            source={user.image || require("../assets/user_placeholder.png")}
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              marginBottom: 10,
              opacity: 0.95,
            }}
          />
          <Text 
          style={{ fontFamily: "CormorantGaramond-SemiBold" }}
          className="text-[22px] text-[#EDEADE]">
            {user.name}
          </Text>

          <View className="w-full px-5 py-4">
            <View className="py-3 flex-row justify-between border-b border-white/10">
              <Text className="text-neutral-400">Phone: </Text>
              <Text 
              style={{ fontFamily: "Inter-Regular" }}
              className="text-[#EDEADE]">
                {user.phone || "-"}
              </Text>
            </View>
          </View>

          <View className="px-5 mt-2 w-full">
            <Pressable
              onPress={startEdit}
              className="items-center rounded-xl bg-[#B08D57] py-3"
            >
              <Text 
              style={{ fontFamily: "Inter-Medium" }}
              className="text-black">Edit Profile</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    // Edit mode
    return (
      <View className="items-center pt-6 pb-3 w-full border-b border-white/10 bg-neutral-900/60">
        <Pressable onPress={pickImage} className="items-center">
          <Image
            source={draftImage || require("../assets/user_placeholder.png")}
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              marginBottom: 10,
              opacity: 1,
            }}
          />
          <Text className="text-xs text-neutral-300 underline">
            Change photo
          </Text>
        </Pressable>

        <View className="w-full px-5 py-4">
          <View className="mb-3">
            <Text className="text-[12px] text-neutral-400 mb-1.5">Name</Text>
            <TextInput
              className="h-11 rounded-xl px-3 text-[16px] bg-neutral-900 border border-white/10 text-[#EDEADE]"
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Your name"
              placeholderTextColor="#888"
              autoCapitalize="words"
              maxLength={60}
            />
          </View>

          <View className="mb-3">
            <Text className="text-[12px] text-neutral-400 mb-1.5">Phone</Text>
            <TextInput
              className="h-11 rounded-xl px-3 text-[16px] bg-neutral-900 border border-white/10 text-[#EDEADE]"
              value={draftPhone}
              onChangeText={setDraftPhone}
              placeholder="e.g. +351 912 345 678"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              maxLength={24}
            />
          </View>
        </View>

        <View className="px-5 mt-2 w-full flex-row gap-2 justify-center">
          <Pressable
            onPress={cancelEdit}
            className="flex-1 items-center rounded-xl border border-white/10 bg-neutral-900 py-3"
          >
            <Text className="font-bold text-[#EDEADE]">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={saveEdit}
            className="flex-1 items-center rounded-xl bg-[#B08D57] py-3"
          >
            <Text className="font-bold text-black">Save</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <AppLayout>
      <ImageBackground
        source={require("../assets/background.png")}
        resizeMode="cover"
        className="flex-1"
      >
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingTop: insets.top, paddingBottom: FOOTER_PAD }}
          ListHeaderComponent={
            <View>
              {renderHeaderView()}
              {sections.length > 0 ? (
                <View className="px-5 pt-2">
                  <Text className="text-[16px] font-bold text-[#EDEADE] mb-0">
                    My Appointments
                  </Text>
                </View>
              ) : (
                <View className="px-5 pt-2">
                  <Text className="text-[16px] font-bold text-[#EDEADE] mb-0">
                    You have no booked appointments...
                  </Text>
                </View>
              )}
            </View>
          }
          renderSectionHeader={({ section: { title } }) => (
            <View className="px-5 pt-3 pb-1">
              <Text className="text-[14px] font-bold text-[#EDEADE]">
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item, section }) => (
            <AppointmentRow item={item} sectionTitle={section.title} />
          )}
        />

        <ConfirmAlert
          visible={!!confirmAppt}
          message="Cancel this appointment?"
          destructive
          onCancel={() => setConfirmAppt(null)}
          onConfirm={() => confirmAppt && handleCancelUpcoming(confirmAppt)}
        />
      </ImageBackground>
    </AppLayout>
  );
}
