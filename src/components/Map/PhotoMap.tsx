import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';
import { Photo } from '../../core/entities/Photo';
import PhotoMarker from './PhotoMarker';

interface PhotoMapProps {
  photos: Photo[];
}

export default function PhotoMap({ photos }: PhotoMapProps) {
  const mapRef = useRef<MapView>(null);

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
      <MapView
        ref={mapRef}
        style={styles.map}
      >
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
