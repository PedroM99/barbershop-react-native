// screens/ProfileScreen.js
/**
 * ProfileScreen
 *
 * Handles both:
 * - Account profile for any logged-in user (name, phone, avatar).
 * - Barber public profile management (name, specialty, description, prices, portfolio).
 * - Customer appointment history (upcoming + past) with cancel flow.
 *
 * Behavior by role:
 * - Barbers:
 *   - See account header (view/edit) and a public barber profile block.
 *   - Can edit public profile fields and manage portfolio images.
 *   - Do not see appointment sections here (appointments live on barber dashboards).
 * - Customers:
 *   - See account header (view/edit).
 *   - See appointment sections (Upcoming / Past) with cancel support for upcoming ones.
 */

import React, { useMemo, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
  SectionList,
  TextInput,
  ImageBackground,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import AppLayout from "../components/appLayout";
import { useUser } from "../context/UserContext";
import Barbers from "../data/Barbers";
import ConfirmAlert from "../components/confirmAlert";

/* ------------------------------------------------------------------ */
/* Barber profile helpers: lookup + inline updates                     */
/* ------------------------------------------------------------------ */

/**
 * Find a barber in the shared Barbers dataset by id.
 */
function findBarberById(id) {
  return Barbers.find((b) => String(b.id) === String(id));
}

/**
 * updateBarberInline
 *
 * Mutates the shared `Barbers` array in-place for the given barber:
 * - Merges nested `prices` objects if provided.
 * - Replaces `portfolio` if an array is provided.
 * - Shallow-merges remaining top-level fields using the patch.
 */
function updateBarberInline(barberId, patch) {
  const idx = Barbers.findIndex((b) => String(b.id) === String(barberId));
  if (idx === -1) return;
  const current = Barbers[idx];

  // Prices: merge nested object if provided
  if (patch?.prices && typeof patch.prices === "object") {
    current.prices = { ...(current.prices || {}), ...patch.prices };
  }

  // Portfolio: accept require(...) or { uri } items
  if (Array.isArray(patch?.portfolio)) {
    current.portfolio = patch.portfolio;
  }

  // Shallow-merge remaining top-level fields, preserving merged prices/portfolio
  Object.assign(current, {
    ...patch,
    prices: current.prices,
    portfolio: current.portfolio,
  });
}

/* ------------------------------------------------------------------ */
/* Price formatting helpers                                           */
/* ------------------------------------------------------------------ */

function stripEuro(value) {
  return String(value ?? "").replace(/[^\d.,]/g, ""); // keep digits and , .
}

function sanitizeAmountInput(text) {
  // Allow only digits, "." and ","; normalize "," to "." for storage
  return stripEuro(text).replace(",", ".");
}

function toEuroString(amount) {
  const v = stripEuro(amount);
  return v ? `${v}€` : "";
}

/* ------------------------------------------------------------------ */
/* BarberProfileEditor: edit-view for public barber profile           */
/* ------------------------------------------------------------------ */
/**
 * BarberProfileEditor
 *
 * Controlled form editor for the public barber profile block:
 * - Edits display name, specialty, description, prices and portfolio.
 * - Uses registerField + scrollToField to keep focused inputs visible
 *   when the keyboard is open (barber view only).
 */
function BarberProfileEditor({
  drafts,
  setDrafts,
  addImage,
  removeImage,
  registerField,
  scrollToField,
}) {
  const set = (key) => (val) =>
    setDrafts((prev) => ({ ...prev, [key]: val }));

  const dispNameRef = useRef(null);
  const specRef = useRef(null);
  const descRef = useRef(null);
  const priceHairRef = useRef(null);
  const priceComboRef = useRef(null);

  return (
    <View
      className="px-5 pt-3 pb-24"
      onLayout={registerField("__base")}
    >
      <Text className="text-[16px] font-bold text-[#EDEADE] mb-2">
        Barber Profile
      </Text>

      <View className="bg-neutral-900/60 border border-white/10 rounded-xl p-4">
        {/* Display Name */}
        <View className="mb-3" onLayout={registerField("bp_displayName")}>
          <Text className="text-[12px] text-neutral-400 mb-1.5">
            Display Name
          </Text>
          <TextInput
            ref={dispNameRef}
            onFocus={() => scrollToField("bp_displayName")}
            className="rounded-xl px-3 text-[16px] bg-neutral-900 border border-white/10 text-[#EDEADE]"
            value={drafts.name}
            onChangeText={set("name")}
            placeholder="Public name"
            placeholderTextColor="#888"
            maxLength={60}
            multiline={false}
            scrollEnabled={false}
            numberOfLines={1}
            returnKeyType="done"
          />
        </View>

        {/* Specialty */}
        <View className="mb-3" onLayout={registerField("bp_specialty")}>
          <Text className="text-[12px] text-neutral-400 mb-1.5">
            Specialty
          </Text>
          <TextInput
            ref={specRef}
            onFocus={() => scrollToField("bp_specialty")}
            className="rounded-xl px-3 text-[16px] bg-neutral-900 border border-white/10 text-[#EDEADE]"
            value={drafts.specialty}
            onChangeText={set("specialty")}
            placeholder="e.g. Precision Fades"
            placeholderTextColor="#888"
            maxLength={60}
            multiline={false}
            scrollEnabled={false}
            numberOfLines={1}
            returnKeyType="done"
          />
        </View>

        {/* Description */}
        <View className="mb-3" onLayout={registerField("bp_desc")}>
          <Text className="text-[12px] text-neutral-400 mb-1.5">
            Description
          </Text>
          <TextInput
            ref={descRef}
            onFocus={() => scrollToField("bp_desc")}
            className="rounded-xl px-3 py-3 text-[16px] bg-neutral-900 border border-white/10 text-[#EDEADE]"
            value={drafts.description}
            onChangeText={set("description")}
            placeholder="Short description (max ~300 chars)"
            placeholderTextColor="#888"
            multiline
            numberOfLines={4}
            maxLength={300}
          />
        </View>

        {/* Prices */}
        <View className="mb-1" onLayout={registerField("bp_prices")}>
          <Text className="text-[12px] text-neutral-400 mb-1.5">
            Prices
          </Text>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Text className="text-[12px] text-neutral-500 mb-1">
                Haircut
              </Text>
              <View className="flex-row items-center rounded-xl bg-neutral-900 border border-white/10">
                <View className="pl-3 pr-2">
                  <Text className="text-[16px] text-[#EDEADE]">€</Text>
                </View>
                <TextInput
                  ref={priceHairRef}
                  onFocus={() => scrollToField("bp_prices")}
                  className="flex-1 px-3 text-[16px] text-[#EDEADE]"
                  value={drafts.haircut}
                  onChangeText={(t) =>
                    set("haircut")(sanitizeAmountInput(t))
                  }
                  placeholder="15"
                  placeholderTextColor="#888"
                  keyboardType="decimal-pad"
                  maxLength={10}
                  multiline={false}
                  scrollEnabled={false}
                  returnKeyType="done"
                />
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-[12px] text-neutral-500 mb-1">
                Haircut + Beard
              </Text>
              <View className="flex-row items-center rounded-xl bg-neutral-900 border border-white/10">
                <View className="pl-3 pr-2">
                  <Text className="text-[16px] text-[#EDEADE]">€</Text>
                </View>
                <TextInput
                  ref={priceComboRef}
                  onFocus={() => scrollToField("bp_prices")}
                  className="flex-1 px-3 text-[16px] text-[#EDEADE]"
                  value={drafts.haircutBeard}
                  onChangeText={(t) =>
                    set("haircutBeard")(sanitizeAmountInput(t))
                  }
                  placeholder="20"
                  placeholderTextColor="#888"
                  keyboardType="decimal-pad"
                  maxLength={10}
                  multiline={false}
                  scrollEnabled={false}
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Portfolio thumbnails + add tile */}
      <Text className="text-[16px] font-bold text-[#EDEADE] mt-5 mb-2">
        Portfolio
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {drafts.portfolio.map((img, i) => (
          <View key={`${i}`} className="relative">
            <Image
              source={img}
              style={{ width: 100, height: 100, borderRadius: 12 }}
            />
            <Pressable
              onPress={() => removeImage(i)}
              className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-neutral-900/90 border border-white/10 items-center justify-center"
            >
              <MaterialIcons name="close" size={18} color="#EDEADE" />
            </Pressable>
          </View>
        ))}
        <Pressable
          onPress={addImage}
          className="w-[100px] h-[100px] rounded-xl border border-dashed border-white/20 bg-neutral-900/40 items-center justify-center"
        >
          <MaterialIcons name="add" size={28} color="#EDEADE" />
          <Text className="text-[10px] text-neutral-400 mt-1">Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Main ProfileScreen component                                      */
/* ------------------------------------------------------------------ */

export default function ProfileScreen() {
  const { user, setUser } = useUser();
  const insets = useSafeAreaInsets();
  const FOOTER_PAD = insets.bottom + 70;

  const scrollRef = useRef(null);
  const positionsRef = useRef({});

  /**
   * registerField
   *
   * Stores the vertical layout position for a given field key.
   * Used together with scrollToField so focused inputs are scrolled into view
   * above the keyboard on the barber edit view.
   */
  const registerField = useCallback(
    (key) => (e) => {
      const y = e.nativeEvent.layout.y;
      const adjustedY = y - (insets.top ?? 0);
      positionsRef.current[key] = adjustedY;
    },
    []
  );

  /**
   * scrollToField
   *
   * Given a field key, scrolls the main ScrollView so that field is visible,
   * applying a small offset for breathing room above the keyboard.
   */
  const scrollToField = useCallback((key, offset = 80) => {
    const base = positionsRef.current["__base"] ?? 0;
    const y = positionsRef.current[key];
    if (typeof y === "number") {
      const target = Math.max(base + y - offset, 0);
      scrollRef.current?.scrollTo({ y: target, animated: true });
    }
  }, []);

  const isBarber = user?.role === "barber";
  const linkedBarber = useMemo(
    () =>
      isBarber && user?.barberId
        ? findBarberById(user.barberId)
        : null,
    [isBarber, user?.barberId]
  );

  // Account edit state (applies to all users)
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(user?.name ?? "");
  const [draftPhone, setDraftPhone] = useState(String(user?.phone ?? ""));
  const [draftImage, setDraftImage] = useState(user?.image ?? null); // {uri} or require(...)

  // Barber public profile edit state (only used when role === "barber")
  const [barberDraft, setBarberDraft] = useState(() => ({
    name: linkedBarber?.name ?? "",
    specialty: linkedBarber?.specialty ?? "",
    description: linkedBarber?.description ?? "",
    haircut: stripEuro(linkedBarber?.prices?.haircut ?? ""),
    haircutBeard: stripEuro(linkedBarber?.prices?.haircutBeard ?? ""),
    portfolio: Array.isArray(linkedBarber?.portfolio)
      ? linkedBarber.portfolio
      : [],
  }));

  // Customer-only state to confirm canceling an upcoming appointment
  const [confirmAppt, setConfirmAppt] = useState(null);

  /**
   * resetDrafts
   *
   * Resets all account and barber profile drafts from the latest user / barber data.
   * Called when entering edit mode and when cancelling changes.
   */
  const resetDrafts = useCallback(() => {
    // Account
    setDraftName(user?.name ?? "");
    setDraftPhone(String(user?.phone ?? ""));
    setDraftImage(user?.image ?? null);

    // Barber profile (only if barber + linked barber record exists)
    if (isBarber && linkedBarber) {
      setBarberDraft({
        name: linkedBarber.name ?? "",
        specialty: linkedBarber.specialty ?? "",
        description: linkedBarber.description ?? "",
        haircut: stripEuro(linkedBarber?.prices?.haircut ?? ""),
        haircutBeard: stripEuro(
          linkedBarber?.prices?.haircutBeard ?? ""
        ),
        portfolio: Array.isArray(linkedBarber.portfolio)
          ? linkedBarber.portfolio
          : [],
      });
    }
  }, [user, isBarber, linkedBarber]);

  const startEdit = () => {
    resetDrafts();
    setIsEditing(true);
  };

  const cancelEdit = () => {
    resetDrafts();
    setIsEditing(false);
  };

  /**
   * saveEdit
   *
   * - Validates account fields (name + optional phone format).
   * - Updates the logged-in user in context.
   * - For barbers, validates and persists the public barber profile into Barbers.js.
   */
  const saveEdit = () => {
    // Validate & save account fields
    const nameOk = String(draftName).trim().length >= 2;
    const phoneOk =
      !draftPhone ||
      /^[\d+\-\s()]{6,}$/.test(String(draftPhone));
    if (!nameOk) {
      Alert.alert("Invalid name", "Please enter at least 2 characters.");
      return;
    }
    if (!phoneOk) {
      Alert.alert(
        "Invalid phone",
        "Please check the phone number format."
      );
      return;
    }

    setUser((prev) => ({
      ...prev,
      name: String(draftName).trim(),
      phone: draftPhone || "",
      image: draftImage || null,
    }));

    // Barber-specific public profile validation and persistence
    if (isBarber) {
      if (!linkedBarber) {
        Alert.alert(
          "Missing link",
          "No linked barber profile found for this account."
        );
        setIsEditing(false);
        return;
      }
      const displayNameOk =
        String(barberDraft.name).trim().length >= 2;
      const specialtyOk =
        String(barberDraft.specialty).trim().length >= 2;
      if (!displayNameOk || !specialtyOk) {
        Alert.alert(
          "Incomplete profile",
          "Please provide at least a display name and specialty."
        );
        return;
      }

      const nextPrices = {
        haircut: toEuroString(barberDraft.haircut),
        haircutBeard: toEuroString(barberDraft.haircutBeard),
      };

      updateBarberInline(linkedBarber.id, {
        name: String(barberDraft.name).trim(),
        specialty: String(barberDraft.specialty).trim(),
        description: String(barberDraft.description || "").trim(),
        prices: nextPrices,
        portfolio: barberDraft.portfolio,
      });
    }

    setIsEditing(false);
  };

  /**
   * pickImage
   *
   * Opens the media library so the user can change their profile picture.
   * Stores the selected image as a { uri } object in draftImage.
   */
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

  /**
   * Barber portfolio helpers: add/remove images in the barberDraft state.
   */
  const addPortfolioImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to add portfolio photos."
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
      const uri = result.assets[0].uri;
      setBarberDraft((prev) => ({
        ...prev,
        portfolio: [...prev.portfolio, { uri }],
      }));
    }
  };

  const removePortfolioImage = (index) => {
    setBarberDraft((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index),
    }));
  };

  /**
   * freeBarberSlot
   *
   * Customer-only helper:
   * - Removes the corresponding date/time slot from the barber's schedule
   *   in the shared Barbers dataset when a customer cancels an appointment.
   */
  const freeBarberSlot = (barberId, date, time) => {
    const b = Barbers.find(
      (b) => String(b.id) === String(barberId)
    );
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

  /**
   * handleCancelUpcoming
   *
   * - Removes the selected appointment from the customer's own list.
   * - Frees the barber slot in the shared schedule.
   */
  const handleCancelUpcoming = (appt) => {
    setUser((prev) => ({
      ...prev,
      appointments: (prev.appointments || []).filter(
        (a) => a.id !== appt.id
      ),
    }));
    freeBarberSlot(appt.barberId, appt.date, appt.time);
    setConfirmAppt(null);
  };

  /* ------------------------------------------------------------------ */
  /* CUSTOMER APPOINTMENT SECTIONS                                      */
  /* ------------------------------------------------------------------ */

  /**
   * sections
   *
   * For customers:
   * - Builds two SectionList sections: "Upcoming" and "Past".
   * - Each appointment is enriched with its barber record and a `when` Date.
   */
  const sections = useMemo(() => {
    if (isBarber) return [];
    if (!user?.appointments) return [];

    const byId = (id) =>
      Barbers.find((b) => String(b.id) === String(id));

    const withBarber = user.appointments.map((a) => ({
      ...a,
      barber: byId(a.barberId),
      when: new Date(`${a.date}T${a.time}`),
    }));

    const now = new Date();

    const upcoming = withBarber
      .filter(
        (a) => a.when >= now && a.status !== "completed"
      )
      .sort((a, b) => a.when - b.when);

    const past = withBarber
      .filter(
        (a) => a.when < now || a.status === "completed"
      )
      .sort((a, b) => b.when - a.when);

    const sectionsArr = [];
    if (upcoming.length)
      sectionsArr.push({ title: "Upcoming", data: upcoming });
    if (past.length)
      sectionsArr.push({ title: "Past", data: past });
    return sectionsArr;
  }, [isBarber, user?.appointments]);

  /**
   * AppointmentRow
   *
   * Compact row layout for each customer appointment inside the SectionList.
   * - Shows barber name, specialty, date/time and status.
   * - For upcoming entries, includes a round "cancel" button.
   */
  const AppointmentRow = ({ item, sectionTitle }) => {
    const isUpcoming = sectionTitle === "Upcoming";

    return (
      <View
        className="mx-5 mb-3 bg-neutral-900/60 border border-white/10 rounded-xl p-4 flex-row items-center gap-3"
        style={{ elevation: 2 }}
      >
        <View className="flex-1">
          <Text
            style={{ fontFamily: "CormorantGaramond-Bold" }}
            className="text-[#EDEADE]"
          >
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
            android_ripple={{
              color: "rgba(0,0,0,0.06)",
              borderless: false,
            }}
            accessibilityRole="button"
            accessibilityLabel="Cancel appointment"
            className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center ml-2 border border-white/10"
          >
            <MaterialIcons
              name="close"
              size={22}
              color="#EDEADE"
            />
          </Pressable>
        )}
      </View>
    );
  };

  /* ------------------------------------------------------------------ */
  /* SAFE GUARD: no user                                                 */
  /* ------------------------------------------------------------------ */

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
            <Text className="text-neutral-400">
              No user data provided.
            </Text>
          </View>
        </ImageBackground>
      </AppLayout>
    );
  }

  /* ------------------------------------------------------------------ */
  /* SHARED ACCOUNT HEADER (view vs edit)                               */
  /* ------------------------------------------------------------------ */

  /**
   * AccountHeaderView
   *
   * - View mode:
   *   - Shows avatar, name and phone.
   *   - Provides an "Edit" button (label changes for barbers).
   * - Edit mode:
   *   - Lets the user change avatar, name and phone.
   *   - Save/cancel handled by the FooterActions component.
   */
  const AccountHeaderView = () => {
    if (!isEditing) {
      return (
        <View className="px-5 py-2 bg-neutral-900/60 border-b border-white/10 items-center">
          <Image
            source={
              user.image || require("../assets/user_placeholder.png")
            }
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
            className="text-[22px] text-[#EDEADE]"
          >
            {user.name}
          </Text>

          <View className="w-full px-5 py-4">
            <View className="py-3 flex-row justify-between border-b border-white/10">
              <Text className="text-neutral-400">Phone: </Text>
              <Text
                style={{ fontFamily: "Inter-Regular" }}
                className="text-[#EDEADE]"
              >
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
                className="text-black"
              >
                {isBarber ? "Edit Barber Profile" : "Edit Profile"}
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    // Edit mode (account fields)
    return (
      <View className="items-center pt-6 pb-3 w-full border-b border-white/10 bg-neutral-900/60">
        <Pressable onPress={pickImage} className="items-center">
          <Image
            source={
              draftImage || require("../assets/user_placeholder.png")
            }
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
            <Text className="text-[12px] text-neutral-400 mb-1.5">
              Name
            </Text>
            <TextInput
              className="rounded-xl px-3 text-[16px] bg-neutral-900 border border-white/10 text-[#EDEADE]"
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Your name"
              placeholderTextColor="#888"
              autoCapitalize="words"
              maxLength={60}
              returnKeyType="done"
            />
          </View>

          <View className="mb-3">
            <Text className="text-[12px] text-neutral-400 mb-1.5">
              Phone
            </Text>
            <TextInput
              className="rounded-xl px-3 text-[16px] bg-neutral-900 border border-white/10 text-[#EDEADE]"
              value={draftPhone}
              onChangeText={setDraftPhone}
              placeholder="e.g. +351 912 345 678"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              maxLength={24}
              returnKeyType="done"
            />
          </View>
        </View>
      </View>
    );
  };

  /**
   * FooterActions
   *
   * Shared action row for edit mode:
   * - Cancel: resets drafts to original values and exits edit mode.
   * - Save: validates and persists account / barber profile changes.
   */
  const FooterActions = () => (
    <View className="px-5 mt-3">
      <View className="flex-row gap-2">
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

  /* ------------------------------------------------------------------ */
  /* BARBER PUBLIC PROFILE VIEW BLOCK                                   */
  /* ------------------------------------------------------------------ */

  /**
   * BarberPublicBlock
   *
   * For barbers in VIEW mode:
   * - Displays the current public profile (name, specialty, description, prices).
   * - Shows the portfolio grid (if any).
   * - When editing, the full editor is handled by BarberProfileEditor instead.
   */
  const BarberPublicBlock = () => {
    if (!isBarber) return null;
    if (!linkedBarber) {
      return (
        <View className="px-5 pt-4 pb-6">
          <Text className="text-[#EDEADE] font-bold">
            No linked barber profile was found for this account.
          </Text>
          <Text className="text-neutral-400 mt-1">
            Make sure this user has a valid{" "}
            <Text className="text-[#EDEADE]">barberId</Text> in Users.js.
          </Text>
        </View>
      );
    }

    // View mode: show public info + portfolio
    if (!isEditing) {
      return (
        <View className="px-5 pt-3 pb-6">
          <Text className="text-[16px] font-bold text-[#EDEADE] mb-2">
            Barber Profile
          </Text>
          <View className="bg-neutral-900/60 border border-white/10 rounded-xl p-4">
            <Text
              className="text-[#EDEADE]"
              style={{ fontFamily: "CormorantGaramond-Bold" }}
            >
              {linkedBarber.name}
            </Text>
            <Text className="text-neutral-400 mt-1">
              {linkedBarber.specialty}
            </Text>
            {!!linkedBarber.description && (
              <Text className="text-neutral-300 mt-2">
                {linkedBarber.description}
              </Text>
            )}
            <View className="mt-3">
              <Text className="text-neutral-400 text-xs">Prices</Text>
              <View className="flex-row justify-between mt-1">
                <Text className="text-[#EDEADE]">
                  Haircut
                </Text>
                <Text className="text-[#EDEADE]">
                  {linkedBarber?.prices?.haircut || "-"}
                </Text>
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-[#EDEADE]">
                  Haircut + Beard
                </Text>
                <Text className="text-[#EDEADE]">
                  {linkedBarber?.prices?.haircutBeard || "-"}
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-[16px] font-bold text-[#EDEADE] mt-5 mb-2">
            Portfolio
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {(linkedBarber.portfolio || []).map((img, i) => (
              <Image
                key={i}
                source={img}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 12,
                }}
              />
            ))}
            {(!linkedBarber.portfolio ||
              linkedBarber.portfolio.length === 0) && (
              <Text className="text-neutral-400">
                No portfolio images yet.
              </Text>
            )}
          </View>
        </View>
      );
    }

    // In edit mode a dedicated editor (BarberProfileEditor) is rendered instead.
    return null;
  };

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  // Barber branch: one scrollable view combining account header + barber profile
  if (isBarber) {
    return (
      <AppLayout>
        <ImageBackground
          source={require("../assets/background.png")}
          resizeMode="cover"
          className="flex-1"
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{
              paddingTop: insets.top,
              paddingBottom: FOOTER_PAD,
            }}
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            removeClippedSubviews={false}
          >
            <AccountHeaderView />

            {/* Public profile in read-only mode */}
            {!isEditing && <BarberPublicBlock />}

            {/* Full public profile editor (including portfolio) in edit mode */}
            {isEditing && (
              <>
                <BarberProfileEditor
                  drafts={barberDraft}
                  setDrafts={setBarberDraft}
                  addImage={addPortfolioImage}
                  removeImage={removePortfolioImage}
                  registerField={registerField}
                  scrollToField={scrollToField}
                />
                <FooterActions />
              </>
            )}
          </ScrollView>
        </ImageBackground>
      </AppLayout>
    );
  }

  // Customer branch: account header + appointments SectionList with cancel flow
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
          contentContainerStyle={{
            paddingTop: insets.top,
            paddingBottom: FOOTER_PAD,
          }}
          ListHeaderComponent={
            <View>
              <AccountHeaderView />
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
            <AppointmentRow
              item={item}
              sectionTitle={section.title}
            />
          )}
          ListFooterComponent={() =>
            isEditing ? <FooterActions /> : null
          }
        />

        {/* Customer-only: confirm cancel appointment dialog */}
        <ConfirmAlert
          visible={!!confirmAppt}
          message="Cancel this appointment?"
          destructive
          onCancel={() => setConfirmAppt(null)}
          onConfirm={() =>
            confirmAppt && handleCancelUpcoming(confirmAppt)
          }
        />
      </ImageBackground>
    </AppLayout>
  );
}
