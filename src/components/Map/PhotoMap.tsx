import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';
import { Photo } from '../../core/entities/Photo';
import PhotoMarker from './PhotoMarker';
import PhotoPlayButton from './PhotoPlayButton';

interface PhotoMapProps {
  photos: Photo[];
  playLabel?: string;
}

export default function PhotoMap({ photos, playLabel = 'Play' }: PhotoMapProps) {
  const mapRef = useRef<MapView>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const sortedPhotos = useMemo(() => {
    return [...photos]
      .filter((photo) => photo.latitude !== null && photo.longitude !== null)
      .sort((a, b) => a.creationTime - b.creationTime);
  }, [photos]);

  const activePhotoId = activeIndex >= 0 ? sortedPhotos[activeIndex]?.id : null;

  const focusPhoto = useCallback((photo: Photo) => {
    if (!mapRef.current || photo.latitude === null || photo.longitude === null) return;

    mapRef.current.animateToRegion(
      {
        latitude: photo.latitude,
        longitude: photo.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      800
    );
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [sortedPhotos]);

  useEffect(() => {
    if (sortedPhotos.length > 0 && mapRef.current) {
      const firstPhoto = sortedPhotos[0];
      setTimeout(() => {
        focusPhoto(firstPhoto);
      }, 500);
    }
  }, [sortedPhotos, focusPhoto]);

  const handlePlayPress = () => {
    if (sortedPhotos.length === 0) return;

    const nextIndex = (activeIndex + 1) % sortedPhotos.length;
    setActiveIndex(nextIndex);
    focusPhoto(sortedPhotos[nextIndex]);
  };

  return (
    <View style={styles.container}>
      <PhotoPlayButton
        onPress={handlePlayPress}
        label={playLabel}
        disabled={sortedPhotos.length === 0}
      />

      <MapView ref={mapRef} style={styles.map}>
        {sortedPhotos.map((photo) => (
          <PhotoMarker
            key={photo.id}
            photo={photo}
            isActive={photo.id === activePhotoId}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
