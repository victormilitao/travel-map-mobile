import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface PhotoPlayButtonProps {
  onPress: () => void;
  label: string;
  disabled?: boolean;
}

export default function PhotoPlayButton({ onPress, label, disabled = false }: PhotoPlayButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.icon}>▶</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1,
  },
  buttonDisabled: {
    backgroundColor: '#B8B5D6',
    shadowOpacity: 0.1,
  },
  icon: {
    color: '#FFF',
    fontSize: 22,
    marginLeft: 4,
  },
});
