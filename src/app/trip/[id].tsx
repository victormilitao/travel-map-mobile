import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, FlatList, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';
import PhotoMap from '../../components/Map/PhotoMap';
import GalleryPhotoItem from '../../components/Gallery/GalleryPhotoItem';
import { Photo } from '../../core/entities/Photo';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = width / COLUMN_COUNT;

function parseExifGPS(exif: any): { lat: number | null, lng: number | null } {
  if (!exif || exif.GPSLatitude === undefined || exif.GPSLongitude === undefined) {
    return { lat: null, lng: null };
  }
  
  let lat = Number(exif.GPSLatitude);
  let lng = Number(exif.GPSLongitude);
  
  if (exif.GPSLatitudeRef === 'S') lat = -lat;
  if (exif.GPSLongitudeRef === 'W') lng = -lng;
  
  return { lat, lng };
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trips, currentTripPhotos, isLoading, error, loadPhotosForTrip, addPhotosToTrip, deletePhotoFromTrip, showTimelinePath, toggleTimelinePath } = useAppStore();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<'map' | 'gallery'>('map');
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  const trip = trips.find(t => t.id === id);

  useEffect(() => {
    if (id) {
      loadPhotosForTrip(id);
    }
  }, [id, loadPhotosForTrip]);

  const handleAddPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
      exif: true,
    });

    if (!result.canceled && result.assets && id) {
      const newPhotos: Photo[] = result.assets.map(asset => {
        const { lat, lng } = parseExifGPS(asset.exif);
        
        // Parse DateTimeOriginal or fallback to now
        let creationTime = Date.now();
        if (asset.exif?.DateTimeOriginal) {
          // Format is typically "YYYY:MM:DD HH:MM:SS"
          const parts = asset.exif.DateTimeOriginal.split(/[: ]/);
          if (parts.length === 6) {
            creationTime = new Date(
              Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]),
              Number(parts[3]), Number(parts[4]), Number(parts[5])
            ).getTime();
          }
        }

        return {
          id: asset.assetId || asset.uri, // Fallback to uri if assetId is missing
          uri: asset.uri,
          latitude: lat,
          longitude: lng,
          creationTime,
        };
      });

      await addPhotosToTrip(id, newPhotos);
    }
  };

  const handleSelectPhoto = (photoId: string) => {
    setSelectedPhotoId(prev => (prev === photoId ? null : photoId));
  };

  const handleRemovePhoto = (photo: Photo) => {
    Alert.alert(
      t('trip.removePhotoTitle'),
      t('trip.removePhotoMessage'),
      [
        { text: t('home.cancel'), style: 'cancel' },
        {
          text: t('trip.removePhoto'),
          style: 'destructive',
          onPress: async () => {
            await deletePhotoFromTrip(photo.id);
            setSelectedPhotoId(null);
          },
        },
      ],
    );
  };

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text>Trip not found</Text>
      </View>
    );
  }

  // Filter photos for map (only those with GPS)
  const mapPhotos = currentTripPhotos.filter(p => p.latitude !== null && p.longitude !== null);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: trip.name,
          headerRight: () => (
            <TouchableOpacity onPress={handleAddPhotos} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>+ {t('trip.addPhotos')}</Text>
            </TouchableOpacity>
          )
        }} 
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'map' && styles.activeTab]}
          onPress={() => setActiveTab('map')}
        >
          <Text style={[styles.tabText, activeTab === 'map' && styles.activeTabText]}>
            {t('trip.map')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'gallery' && styles.activeTab]}
          onPress={() => setActiveTab('gallery')}
        >
          <Text style={[styles.tabText, activeTab === 'gallery' && styles.activeTabText]}>
            {t('trip.gallery')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isLoading && currentTripPhotos.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#6C63FF" />
          </View>
        ) : currentTripPhotos.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>{t('trip.empty')}</Text>
          </View>
        ) : activeTab === 'map' ? (
          <PhotoMap 
            photos={mapPhotos}
            tripName={trip.name}
            showTimelinePath={showTimelinePath}
            onToggleTimeline={toggleTimelinePath}
            toggleLabel={t('trip.timelinePath')}
            playLabel={t('trip.playNextPhoto')}
            replayLabel={t('trip.replayTrip')}
            replayLabels={{
              replayTrip: t('trip.replayTrip'),
              pause: t('trip.pause'),
              resume: t('trip.resume'),
              close: t('trip.close'),
              watchAgain: t('trip.watchAgain'),
              photos: t('trip.photos'),
              days: t('trip.days'),
              distance: t('trip.distance'),
              replayComplete: t('trip.replayComplete'),
              notEnoughPhotos: t('trip.notEnoughPhotos'),
            }}
          />
        ) : (
          <FlatList
            data={currentTripPhotos}
            keyExtractor={item => item.id}
            numColumns={COLUMN_COUNT}
            extraData={selectedPhotoId}
            renderItem={({ item }) => (
              <GalleryPhotoItem
                photo={item}
                size={IMAGE_SIZE}
                isSelected={selectedPhotoId === item.id}
                onPress={() => handleSelectPhoto(item.id)}
                onRemove={() => handleRemovePhoto(item)}
              />
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    color: '#6C63FF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6C63FF',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});
