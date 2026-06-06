import React, { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import { Photo } from '../../core/entities/Photo';
import PhotoThumbnail from './PhotoThumbnail';

interface PhotoMarkerProps {
  photo: Photo;
}

export default function PhotoMarker({ photo }: PhotoMarkerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!photo.latitude || !photo.longitude) return null;

  const handleImageLoad = useCallback(() => {
    // No iOS, o Marker precisa de pelo menos 1 frame com tracksViewChanges=true
    // DEPOIS que a imagem carrega, para pintar o conteúdo customizado.
    // Sem esse delay, o marker fica invisível.
    if (Platform.OS === 'ios') {
      setTimeout(() => setIsLoaded(true), 300);
    } else {
      setIsLoaded(true);
    }
  }, []);

  return (
    <Marker
      coordinate={{ latitude: photo.latitude, longitude: photo.longitude }}
      tracksViewChanges={!isLoaded}
      anchor={{ x: 0.5, y: 1 }} // Ponta do pin aponta para a coordenada
      calloutAnchor={{ x: 0.5, y: 0 }}
    >
      <PhotoThumbnail
        uri={photo.uri}
        onLoad={handleImageLoad}
      />
    </Marker>
  );
}
