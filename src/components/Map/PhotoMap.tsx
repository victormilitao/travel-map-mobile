import React, { useRef, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { Photo } from '../../core/entities/Photo';
import PhotoMarker from './PhotoMarker';
import TimelineToggle from './TimelineToggle';

interface PhotoMapProps {
  photos: Photo[];
  showTimelinePath?: boolean;
  onToggleTimeline?: () => void;
  toggleLabel?: string;
}

export default function PhotoMap({ 
  photos, 
  showTimelinePath = true, 
  onToggleTimeline,
  toggleLabel = 'Timeline',
}: PhotoMapProps) {
  const mapRef = useRef<MapView>(null);

  // Sort photos by creation time to create chronological path
  const sortedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => a.creationTime - b.creationTime);
  }, [photos]);

  // Create coordinates array for the polyline
  const pathCoordinates = useMemo(() => {
    return sortedPhotos
      .filter(p => p.latitude !== null && p.longitude !== null)
      .map(p => ({
        latitude: p.latitude!,
        longitude: p.longitude!,
      }));
  }, [sortedPhotos]);

  useEffect(() => {
    if (photos.length > 0 && mapRef.current) {
      const firstValidPhoto = photos.find(p => p.latitude !== null && p.longitude !== null);
      if (firstValidPhoto) {
        // Pequeno delay para garantir que o mapa já terminou de carregar
        setTimeout(() => {
          mapRef.current?.animateToRegion({
            latitude: firstValidPhoto.latitude!,
            longitude: firstValidPhoto.longitude!,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }, 1000);
        }, 500);
      }
    }
  }, [photos]);

  return (
    <View style={styles.container}>
      {/* Toggle Button */}
      {onToggleTimeline && pathCoordinates.length > 1 && (
        <TimelineToggle
          isEnabled={showTimelinePath}
          onToggle={onToggleTimeline}
          label={toggleLabel}
        />
      )}
      
      <MapView
        ref={mapRef}
        style={styles.map}
      >
        {/* Timeline Path */}
        {showTimelinePath && pathCoordinates.length > 1 && (
          <Polyline
            coordinates={pathCoordinates}
            strokeColor="#6C63FF"
            strokeWidth={3}
            lineDashPattern={[0]}
            geodesic={true}
          />
        )}
        
        {/* Photo Markers */}
        {photos.map((photo) => (
          <PhotoMarker key={photo.id} photo={photo} />
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
