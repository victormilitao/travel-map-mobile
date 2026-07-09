import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface TimelineToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  label: string;
}

export default function TimelineToggle({ isEnabled, onToggle, label }: TimelineToggleProps) {
  return (
    <TouchableOpacity 
      style={[styles.button, isEnabled ? styles.buttonActive : styles.buttonInactive]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, isEnabled ? styles.textActive : styles.textInactive]}>
        {isEnabled ? '🗺️ ' : '📍 '}
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  buttonActive: {
    backgroundColor: '#6C63FF',
  },
  buttonInactive: {
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textActive: {
    color: '#FFFFFF',
  },
  textInactive: {
    color: '#6C63FF',
  },
});
