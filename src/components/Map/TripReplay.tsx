import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { Image } from 'expo-image';
import { Photo } from '../../core/entities/Photo';
import { useTranslation } from '../../hooks/useTranslation';
import PhotoMarker from './PhotoMarker';
import {
  calculateTripDistance,
  formatDistance,
  getTripDateRange,
  getTripDurationDays,
} from '../../utils/geo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_INTERVAL_MS = 2500;
const MAP_ANIMATION_MS = 1200;

interface TripReplayProps {
  visible: boolean;
  photos: Photo[];
  tripName: string;
  labels: {
    replayTrip: string;
    pause: string;
    resume: string;
    close: string;
    watchAgain: string;
    photos: string;
    days: string;
    distance: string;
    replayComplete: string;
    notEnoughPhotos: string;
  };
  onClose: () => void;
}

type ReplayPhase = 'playing' | 'paused' | 'finished';

export default function TripReplay({
  visible,
  photos,
  tripName,
  labels,
  onClose,
}: TripReplayProps) {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<ReplayPhase>('playing');
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  const sortedPhotos = useMemo(() => {
    return [...photos]
      .filter((p) => p.latitude !== null && p.longitude !== null)
      .sort((a, b) => a.creationTime - b.creationTime);
  }, [photos]);

  const pathCoordinates = useMemo(() => {
    return sortedPhotos.map((photo) => ({
      latitude: photo.latitude!,
      longitude: photo.longitude!,
    }));
  }, [sortedPhotos]);

  const revealedPath = useMemo(() => {
    return pathCoordinates.slice(0, activeIndex + 1);
  }, [pathCoordinates, activeIndex]);

  const activePhotoId = sortedPhotos[activeIndex]?.id ?? null;
  const currentPhoto = sortedPhotos[activeIndex];
  const hasEnoughPhotos = sortedPhotos.length >= 2;

  const tripStats = useMemo(() => ({
    photoCount: sortedPhotos.length,
    days: getTripDurationDays(sortedPhotos),
    distance: formatDistance(calculateTripDistance(sortedPhotos)),
    dateRange: getTripDateRange(sortedPhotos),
  }), [sortedPhotos]);

  const focusPhoto = useCallback((photo: Photo) => {
    if (!mapRef.current || photo.latitude === null || photo.longitude === null) return;
    mapRef.current.animateToRegion(
      {
        latitude: photo.latitude,
        longitude: photo.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      },
      MAP_ANIMATION_MS
    );
  }, []);

  const resetReplay = useCallback(() => {
    setActiveIndex(0);
    setPhase('playing');
    progressAnim.setValue(0);
    cardAnim.setValue(0);
    if (sortedPhotos[0]) {
      setTimeout(() => focusPhoto(sortedPhotos[0]), 300);
    }
  }, [sortedPhotos, focusPhoto, progressAnim, cardAnim]);

  useEffect(() => {
    if (!visible) return;
    resetReplay();
  }, [visible, resetReplay]);

  useEffect(() => {
    if (!visible || phase !== 'playing' || !hasEnoughPhotos) return;

    if (sortedPhotos[activeIndex]) {
      focusPhoto(sortedPhotos[activeIndex]);
      cardAnim.setValue(0);
      Animated.spring(cardAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }

    const targetProgress = (activeIndex + 1) / sortedPhotos.length;
    Animated.timing(progressAnim, {
      toValue: targetProgress,
      duration: PHOTO_INTERVAL_MS,
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      if (activeIndex >= sortedPhotos.length - 1) {
        setPhase('finished');
        return;
      }
      setActiveIndex((prev) => prev + 1);
    }, PHOTO_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [visible, phase, activeIndex, sortedPhotos, hasEnoughPhotos, focusPhoto, progressAnim, cardAnim]);

  const handleClose = () => {
    setPhase('playing');
    setActiveIndex(0);
    onClose();
  };

  const togglePause = () => {
    setPhase((prev) => (prev === 'playing' ? 'paused' : 'playing'));
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        {hasEnoughPhotos ? (
          <>
            <MapView ref={mapRef} style={styles.map}>
              {revealedPath.length > 1 && (
                <Polyline
                  coordinates={revealedPath}
                  strokeColor="#6C63FF"
                  strokeWidth={4}
                  geodesic
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

            <View style={styles.topBar}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.tripTitle} numberOfLines={1}>
                {tripName}
              </Text>
              <View style={styles.closeButtonPlaceholder} />
            </View>

            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>

            {phase !== 'finished' && currentPhoto && (
              <Animated.View
                style={[
                  styles.photoCard,
                  {
                    opacity: cardAnim,
                    transform: [
                      {
                        translateY: cardAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [40, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Image
                  source={{ uri: currentPhoto.uri }}
                  style={styles.photoCardImage}
                  contentFit="cover"
                />
                <View style={styles.photoCardInfo}>
                  <Text style={styles.photoCardDate}>
                    {new Date(currentPhoto.creationTime).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.photoCardCounter}>
                    {t('trip.photoOf', {
                      current: activeIndex + 1,
                      total: sortedPhotos.length,
                    })}
                  </Text>
                </View>
              </Animated.View>
            )}

            {phase === 'finished' && (
              <View style={styles.summaryOverlay}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryEmoji}>🎬</Text>
                  <Text style={styles.summaryTitle}>{labels.replayComplete}</Text>
                  <Text style={styles.summaryTripName}>{tripName}</Text>

                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{tripStats.photoCount}</Text>
                      <Text style={styles.statLabel}>{labels.photos}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{tripStats.days}</Text>
                      <Text style={styles.statLabel}>{labels.days}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{tripStats.distance}</Text>
                      <Text style={styles.statLabel}>{labels.distance}</Text>
                    </View>
                  </View>

                  {tripStats.dateRange && (
                    <Text style={styles.dateRange}>
                      {tripStats.dateRange.start.toLocaleDateString()} —{' '}
                      {tripStats.dateRange.end.toLocaleDateString()}
                    </Text>
                  )}

                  <View style={styles.summaryActions}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={resetReplay}>
                      <Text style={styles.secondaryButtonText}>{labels.watchAgain}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleClose}>
                      <Text style={styles.primaryButtonText}>{labels.close}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {phase !== 'finished' && (
              <TouchableOpacity style={styles.pauseButton} onPress={togglePause}>
                <Text style={styles.pauseButtonText}>
                  {phase === 'paused' ? '▶' : '⏸'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📍</Text>
            <Text style={styles.emptyText}>{labels.notEnoughPhotos}</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleClose}>
              <Text style={styles.primaryButtonText}>{labels.close}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButtonPlaceholder: {
    width: 36,
  },
  tripTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  progressTrack: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    zIndex: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 2,
  },
  photoCard: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 10,
  },
  photoCardImage: {
    width: '100%',
    height: 160,
  },
  photoCardInfo: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  photoCardDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  photoCardCounter: {
    fontSize: 13,
    color: '#888',
  },
  pauseButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    left: SCREEN_WIDTH / 2 - 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pauseButtonText: {
    color: '#FFF',
    fontSize: 22,
  },
  summaryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 20,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  summaryEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  summaryTripName: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '600',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  dateRange: {
    fontSize: 13,
    color: '#888',
    marginBottom: 24,
  },
  summaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#F0EFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#6C63FF',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#CCC',
    textAlign: 'center',
    marginBottom: 24,
  },
});
