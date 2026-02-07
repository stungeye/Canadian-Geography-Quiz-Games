export interface Province {
  id: string; // Likely from GeoJSON properties
  name: string;
  type: 'Province' | 'Territory'; // We might derive this
}

export interface City {
  Name: string;
  Prov_Ter: string;
  Population: number;
  Latitude: number;
  Longitude: number;
  Capital: 'FEDERAL' | 'PROVINCIAL' | 'TERRITORIAL';
}

export interface GameState {
  mode: 'selection' | 'recall' | 'location' | null;
  score: number;
  currentQuestion: number;
  totalQuestions: number;
  // ... other state
}
