import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Photo } from '../../core/entities/Photo';

interface GalleryPhotoItemProps {
  photo: Photo;
  size: number;
  isSelected: boolean;
  onPress: () => void;
  onRemove: () => void;
}

export default function GalleryPhotoItem({
  photo,
  size,
  isSelected,
  onPress,
  onRemove,
}: GalleryPhotoItemProps) {
  return (
    <View style={[styles.container, { width: size }]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.imageWrapper, isSelected && styles.imageWrapperSelected]}
      >
        <Image
          source={{ uri: photo.uri }}
          style={[styles.image, { width: size, height: size }]}
          contentFit="cover"
        />
      </TouchableOpacity>

      {isSelected && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={22} color="#E02424" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageWrapper: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  imageWrapperSelected: {
    borderColor: '#6C63FF',
  },
  image: {
    borderWidth: 1,
    borderColor: '#FFF',
  },
  removeButton: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
