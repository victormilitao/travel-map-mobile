import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Photo } from '../../core/entities/Photo';
import { useTranslation } from '../../hooks/useTranslation';
import PhotoMarker from './PhotoMarker';
import {
  calculateTripDistance,
  formatDistance,
  getTripDateRange,
  getTripDurationDays,
} from '../../utils/geo';

const MAP_FLEX = 0.35;
const PHOTO_FLEX = 0.65;
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
  const insets = useSafeAreaInsets();
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
            {phase !== 'finished' && (
              <View style={styles.replayLayout}>
                <View style={styles.mapSection}>
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

                  <TouchableOpacity
                    onPress={handleClose}
                    style={[styles.closeButton, { top: insets.top + 8 }]}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {currentPhoto && (
                  <Animated.View
                    style={[
                      styles.photoSection,
                      {
                        opacity: cardAnim,
                        transform: [
                          {
                            translateY: cardAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [24, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: currentPhoto.uri }}
                      style={styles.photoFull}
                      contentFit="cover"
                    />
                    <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
                      <View style={styles.bottomBarInfo}>
                        <Text style={styles.photoDate} numberOfLines={1}>
                          {new Date(currentPhoto.creationTime).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                        <Text style={styles.photoCounter}>
                          {t('trip.photoOf', {
                            current: activeIndex + 1,
                            total: sortedPhotos.length,
                          })}
                        </Text>
                        <TouchableOpacity
                          style={styles.pauseButton}
                          onPress={togglePause}
                          activeOpacity={0.8}
                        >
                          <MaterialIcons
                            name={phase === 'paused' ? 'play-arrow' : 'pause'}
                            size={17}
                            color="#FFF"
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.progressTrack}>
                        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                      </View>
                    </View>
                  </Animated.View>
                )}
              </View>
            )}

            {phase === 'finished' && (
              <>
                <MapView ref={mapRef} style={styles.map}>
                  {pathCoordinates.length > 1 && (
                    <Polyline
                      coordinates={pathCoordinates}
                      strokeColor="#6C63FF"
                      strokeWidth={4}
                      geodesic
                    />
                  )}
                  {sortedPhotos.map((photo) => (
                    <PhotoMarker key={photo.id} photo={photo} isActive={false} />
                  ))}
                </MapView>
              </>
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
    backgroundColor: '#000',
  },
  replayLayout: {
    flex: 1,
  },
  mapSection: {
    flex: MAP_FLEX,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressTrack: {
    alignSelf: 'stretch',
    height: 2,
    marginTop: 4,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
  },
  photoSection: {
    flex: PHOTO_FLEX,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  photoFull: {
    width: '100%',
    height: '100%',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 8,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  bottomBarInfo: {
    position: 'relative',
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
    marginBottom: 2,
  },
  photoDate: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingRight: 36,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  photoCounter: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'right',
    paddingLeft: 36,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pauseButton: {
    position: 'absolute',
    left: '50%',
    marginLeft: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
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
