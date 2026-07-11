import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Photo } from '../../core/entities/Photo';

const TRASH_BAR_HEIGHT = 40;

interface GalleryPhotoItemProps {
  photo: Photo;
  size: number;
  isSelected: boolean;
  onPress: () => void;
  onRemove: () => void;
  removeLabel: string;
}

export default function GalleryPhotoItem({
  photo,
  size,
  isSelected,
  onPress,
  onRemove,
  removeLabel,
}: GalleryPhotoItemProps) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          marginBottom: isSelected ? 8 : 0,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.photoFrame,
          { width: size, height: size },
          isSelected && styles.photoFrameSelected,
          pressed && styles.photoFramePressed,
        ]}
      >
        <Image
          source={{ uri: photo.uri }}
          style={styles.image}
          contentFit="cover"
          pointerEvents="none"
        />
      </Pressable>

      {isSelected && (
        <Pressable
          style={({ pressed }) => [
            styles.removeButton,
            { width: size },
            pressed && styles.removeButtonPressed,
          ]}
          onPress={onRemove}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={18} color="#FFF" />
          <Text style={styles.removeLabel}>{removeLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

export { TRASH_BAR_HEIGHT };

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    overflow: 'visible',
    zIndex: 1,
  },
  photoFrame: {
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#E8E6F0',
    overflow: 'hidden',
  },
  photoFrameSelected: {
    borderColor: '#6C63FF',
    borderWidth: 4,
    zIndex: 2,
  },
  photoFramePressed: {
    opacity: 0.9,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    height: TRASH_BAR_HEIGHT,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E02424',
    borderRadius: 8,
    zIndex: 3,
  },
  removeButtonPressed: {
    backgroundColor: '#B91C1C',
  },
  removeLabel: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
