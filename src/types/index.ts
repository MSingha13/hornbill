export interface TrackingPoint {
  index: number;
  code: string;
  date: string;
  time: string;
  lat: number;
  lng: number;
  location: string;
  battery: number;
  temp: number;
  altitudeM?: number;
  speedKmh?: number;
  activity?: string;
  address?: string;
  positionId?: string;
  rawRecordedAt?: string;
  rawRecord?: Record<string, any>;
}

export interface HornbillProfile {
  code: string;
  name: string;
  thaiSpecies: string;
  englishSpecies: string;
  scientificName: string;
  gender: string;
  age: string;
  weightKg: number;
  wingSpanCm: number;
  collarTag: string;
  releaseDate: string;
  originPark: string;
  currentPark: string;
  photoUrl: string;
  status: 'active' | 'resting' | 'nesting' | 'migrating';
  latestPoint: TrackingPoint;
  history: TrackingPoint[];
  isLiveFeed?: boolean;
  lastSyncedAt?: string;
  rawGasRecords?: Record<string, any>[];
}

export interface OrganizationInfo {
  name: string;
  shortName: string;
  role: string;
}
