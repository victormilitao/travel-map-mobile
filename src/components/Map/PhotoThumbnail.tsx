import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';

interface PhotoThumbnailProps {
  uri: string;
  onLoad?: () => void;
}

const PIN_SIZE = 56;
const POINTER_SIZE = 14;

export default function PhotoThumbnail({ uri, onLoad }: PhotoThumbnailProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de entrada tipo "bounce in"
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 120,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      {/* Anel externo gradiente-like */}
      <View style={styles.outerRing}>
        {/* Container da foto */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri }}
            style={styles.image}
            contentFit="cover"
            onLoad={onLoad}
            recyclingKey={uri}
          />
        </View>
      </View>
      {/* Ponteiro triangular do pin */}
      <View style={styles.pointer} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    // Sombra projetada no pin inteiro
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 6,
    elevation: 8,
  },
  outerRing: {
    width: PIN_SIZE + 6,
    height: PIN_SIZE + 6,
    borderRadius: (PIN_SIZE + 6) / 2,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    // Borda sutil com cor premium
    borderWidth: 2.5,
    borderColor: '#6C63FF',
  },
  photoContainer: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#E8E6F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pointer: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: POINTER_SIZE / 2,
    borderRightWidth: POINTER_SIZE / 2,
    borderTopWidth: POINTER_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#6C63FF',
  },
});
