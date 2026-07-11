import { Photo } from '../core/entities/Photo';

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateTripDistance(photos: Photo[]): number {
  const sorted = [...photos]
    .filter((p) => p.latitude !== null && p.longitude !== null)
    .sort((a, b) => a.creationTime - b.creationTime);

  let total = 0;
  for (let i = 1; i < sorted.length; i++) {
    total += haversineDistance(
      sorted[i - 1].latitude!,
      sorted[i - 1].longitude!,
      sorted[i].latitude!,
      sorted[i].longitude!
    );
  }
  return total;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function getTripDateRange(photos: Photo[]): { start: Date; end: Date } | null {
  if (photos.length === 0) return null;
  const times = photos.map((p) => p.creationTime);
  return {
    start: new Date(Math.min(...times)),
    end: new Date(Math.max(...times)),
  };
}

export function getTripDurationDays(photos: Photo[]): number {
  const range = getTripDateRange(photos);
  if (!range) return 0;
  const diff = range.end.getTime() - range.start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
