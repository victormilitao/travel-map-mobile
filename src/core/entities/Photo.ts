export interface Photo {
  id: string;
  uri: string; // The local file uri or remote url
  latitude: number | null;
  longitude: number | null;
  creationTime: number; // Unix timestamp
  tripId?: string;
}
