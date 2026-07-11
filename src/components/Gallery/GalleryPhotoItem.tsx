import { View, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Photo } from '../../core/entities/Photo';

interface GalleryPhotoItemProps {
  photo: Photo;
  size: number;
  isSelected: boolean;
  onPress: () => void;
}

export default function GalleryPhotoItem({
  photo,
  size,
  isSelected,
  onPress,
}: GalleryPhotoItemProps) {
  return (
    <View style={[styles.container, { width: size }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
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
  },
  photoFramePressed: {
    opacity: 0.9,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
