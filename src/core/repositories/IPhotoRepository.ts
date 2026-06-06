import { Photo } from '../entities/Photo';
import { Trip } from '../entities/Trip';

export interface IPhotoRepository {
  /** Gets all trips */
  getTrips(): Promise<Trip[]>;
  
  /** Creates a new trip */
  createTrip(name: string): Promise<Trip>;
  
  /** Deletes a trip */
  deleteTrip(tripId: string): Promise<void>;

  /** Gets all photos for a specific trip */
  getPhotosForTrip(tripId: string): Promise<Photo[]>;
  
  /** Adds manually selected photos to a trip */
  addPhotosToTrip(tripId: string, photos: Photo[]): Promise<void>;
  
  /** Deletes a photo from a trip */
  deletePhoto(photoId: string): Promise<void>;
}
