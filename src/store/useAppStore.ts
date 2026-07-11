import { create } from 'zustand';
import { Photo } from '../core/entities/Photo';
import { Trip } from '../core/entities/Trip';
import { IPhotoRepository } from '../core/repositories/IPhotoRepository';
import { LocalPhotoRepository } from '../data/local/LocalPhotoRepository';

interface AppState {
  trips: Trip[];
  currentTripPhotos: Photo[];
  isLoading: boolean;
  error: string | null;
  repository: IPhotoRepository;
  showTimelinePath: boolean;
  
  // Actions
  loadTrips: () => Promise<void>;
  createTrip: (name: string) => Promise<Trip | null>;
  deleteTrip: (tripId: string) => Promise<void>;
  loadPhotosForTrip: (tripId: string) => Promise<void>;
  addPhotosToTrip: (tripId: string, photos: Photo[]) => Promise<void>;
  deletePhotoFromTrip: (photoId: string) => Promise<void>;
  setRepository: (repo: IPhotoRepository) => void;
  toggleTimelinePath: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  trips: [],
  currentTripPhotos: [],
  isLoading: false,
  error: null,
  showTimelinePath: true,
  
  repository: new LocalPhotoRepository(),

  setRepository: (repo: IPhotoRepository) => set({ repository: repo }),

  toggleTimelinePath: () => set((state) => ({ showTimelinePath: !state.showTimelinePath })),

  loadTrips: async () => {
    set({ isLoading: true, error: null });
    try {
      const { repository } = get();
      const trips = await repository.getTrips();
      set({ trips, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Erro ao carregar viagens', isLoading: false });
    }
  },

  createTrip: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const { repository, loadTrips } = get();
      const newTrip = await repository.createTrip(name);
      await loadTrips();
      return newTrip;
    } catch (error: any) {
      set({ error: error.message || 'Erro ao criar viagem', isLoading: false });
      return null;
    }
  },

  deleteTrip: async (tripId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { repository, loadTrips } = get();
      await repository.deleteTrip(tripId);
      await loadTrips();
    } catch (error: any) {
      set({ error: error.message || 'Erro ao deletar viagem', isLoading: false });
    }
  },

  loadPhotosForTrip: async (tripId: string) => {
    set({ isLoading: true, error: null, currentTripPhotos: [] });
    try {
      const { repository } = get();
      const photos = await repository.getPhotosForTrip(tripId);
      set({ currentTripPhotos: photos, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Erro ao carregar fotos da viagem', isLoading: false });
    }
  },

  addPhotosToTrip: async (tripId: string, photos: Photo[]) => {
    set({ isLoading: true, error: null });
    try {
      const { repository, loadPhotosForTrip } = get();
      await repository.addPhotosToTrip(tripId, photos);
      await loadPhotosForTrip(tripId);
    } catch (error: any) {
      set({ error: error.message || 'Erro ao adicionar fotos', isLoading: false });
    }
  },

  deletePhotoFromTrip: async (photoId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { repository, currentTripPhotos } = get();
      await repository.deletePhoto(photoId);
      set({
        currentTripPhotos: currentTripPhotos.filter(p => p.id !== photoId),
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message || 'Erro ao remover foto', isLoading: false });
    }
  },
}));
