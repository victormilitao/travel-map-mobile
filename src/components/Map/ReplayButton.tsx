import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ReplayButtonProps {
  onPress: () => void;
  label: string;
  disabled?: boolean;
}

export default function ReplayButton({ onPress, label, disabled = false }: ReplayButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.icon}>🎬</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#1a1a2e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 3,
  },
  buttonDisabled: {
    backgroundColor: '#999',
    shadowOpacity: 0.1,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
