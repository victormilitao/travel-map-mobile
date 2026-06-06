import AsyncStorage from '@react-native-async-storage/async-storage';
import { IPhotoRepository } from '../../core/repositories/IPhotoRepository';
import { Photo } from '../../core/entities/Photo';
import { Trip } from '../../core/entities/Trip';

const TRIPS_KEY = '@travelmap:trips';
const getPhotosKey = (tripId: string) => `@travelmap:photos:${tripId}`;

export class LocalPhotoRepository implements IPhotoRepository {
  
  async getTrips(): Promise<Trip[]> {
    try {
      const data = await AsyncStorage.getItem(TRIPS_KEY);
      if (!data) return [];
      return JSON.parse(data) as Trip[];
    } catch (e) {
      console.error('Failed to fetch trips', e);
      return [];
    }
  }

  async createTrip(name: string): Promise<Trip> {
    const trips = await this.getTrips();
    const newTrip: Trip = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name,
      createdAt: Date.now(),
    };
    
    trips.push(newTrip);
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    return newTrip;
  }

  async deleteTrip(tripId: string): Promise<void> {
    const trips = await this.getTrips();
    const updatedTrips = trips.filter(t => t.id !== tripId);
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(updatedTrips));
    await AsyncStorage.removeItem(getPhotosKey(tripId));
  }

  async getPhotosForTrip(tripId: string): Promise<Photo[]> {
    try {
      const data = await AsyncStorage.getItem(getPhotosKey(tripId));
      if (!data) return [];
      return JSON.parse(data) as Photo[];
    } catch (e) {
      console.error('Failed to fetch photos for trip', e);
      return [];
    }
  }

  async addPhotosToTrip(tripId: string, photos: Photo[]): Promise<void> {
    const existingPhotos = await this.getPhotosForTrip(tripId);
    
    // Add new photos, ensuring we don't add duplicates by ID (uri or local id)
    const newPhotos = photos.map(p => ({ ...p, tripId }));
    const mergedPhotos = [...existingPhotos];
    
    for (const photo of newPhotos) {
      if (!mergedPhotos.find(p => p.id === photo.id)) {
        mergedPhotos.push(photo);
      }
    }
    
    await AsyncStorage.setItem(getPhotosKey(tripId), JSON.stringify(mergedPhotos));
  }

  async deletePhoto(photoId: string): Promise<void> {
    // To delete a photo without knowing the tripId upfront, we might need to search all trips,
    // or just assume we'll pass tripId if we update the interface. 
    // For now, this is a basic implementation that scans all trips to delete it.
    const trips = await this.getTrips();
    for (const trip of trips) {
      const photos = await this.getPhotosForTrip(trip.id);
      if (photos.some(p => p.id === photoId)) {
        const updatedPhotos = photos.filter(p => p.id !== photoId);
        await AsyncStorage.setItem(getPhotosKey(trip.id), JSON.stringify(updatedPhotos));
        break; // Assuming photo ID is unique across all trips
      }
    }
  }
}
