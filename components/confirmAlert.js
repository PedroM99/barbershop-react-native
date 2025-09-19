import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, Pressable, StyleSheet, Animated
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ConfirmAlert({
  visible,
  message,
  onConfirm,
  onCancel,
  type = "confirm",
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 140, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, stiffness: 180, damping: 18 })
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.96);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.actions}>
            {type === "confirm" && (
              <Pressable style={[styles.iconBtn, styles.cancelBtn]} onPress={onCancel}>
                <MaterialIcons name="close" size={28} color="#222" />
              </Pressable>
            )}
            <Pressable
              style={[styles.iconBtn, styles.confirmBtn]}
              onPress={onConfirm}
            >
              <MaterialIcons name="check" size={28} color="#fff" />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.36)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 18,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  message: { fontSize: 20, fontWeight: '600', color: '#111', marginBottom: 14 },

  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 8 },
  iconBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: { backgroundColor: '#f0f0f0' },
  confirmBtn: { backgroundColor: '#111' },
});