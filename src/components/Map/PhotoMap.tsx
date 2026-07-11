import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { Photo } from '../../core/entities/Photo';
import PhotoMarker from './PhotoMarker';
import TimelineToggle from './TimelineToggle';
import PhotoPlayButton from './PhotoPlayButton';

interface PhotoMapProps {
  photos: Photo[];
  showTimelinePath?: boolean;
  onToggleTimeline?: () => void;
  toggleLabel?: string;
  playLabel?: string;
}

export default function PhotoMap({
  photos,
  showTimelinePath = true,
  onToggleTimeline,
  toggleLabel = 'Timeline',
  playLabel = 'Play',
}: PhotoMapProps) {
  const mapRef = useRef<MapView>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const sortedPhotos = useMemo(() => {
    return [...photos]
      .filter((photo) => photo.latitude !== null && photo.longitude !== null)
      .sort((a, b) => a.creationTime - b.creationTime);
  }, [photos]);

  const pathCoordinates = useMemo(() => {
    return sortedPhotos.map((photo) => ({
      latitude: photo.latitude!,
      longitude: photo.longitude!,
    }));
  }, [sortedPhotos]);

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
      setTimeout(() => {
        focusPhoto(sortedPhotos[0]);
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
      <MapView ref={mapRef} style={styles.map}>
        {showTimelinePath && pathCoordinates.length > 1 && (
          <Polyline
            coordinates={pathCoordinates}
            strokeColor="#6C63FF"
            strokeWidth={3}
            lineDashPattern={[0]}
            geodesic={true}
          />
        )}

        {sortedPhotos.map((photo) => (
          <PhotoMarker
            key={photo.id}
            photo={photo}
            isActive={photo.id === activePhotoId}
          />
        ))}
      </MapView>

      <View style={styles.overlay} pointerEvents="box-none">
        {onToggleTimeline && pathCoordinates.length > 1 && (
          <TimelineToggle
            isEnabled={showTimelinePath}
            onToggle={onToggleTimeline}
            label={toggleLabel}
          />
        )}

        <PhotoPlayButton
          onPress={handlePlayPress}
          label={playLabel}
          disabled={sortedPhotos.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    elevation: 2,
  },
});
