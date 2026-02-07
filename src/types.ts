export interface Province {
  id: string; // e.g., 'ON', 'QC'
  name: string;
  type: 'Province' | 'Territory';
  capital: string; // Name of the capital city
}

export interface City {
  name: string;
  provinceId: string;
  lat: number;
  lng: number;
  isCapital: boolean;
}

export interface GameState {
  mode: 'selection' | 'recall' | 'location' | null;
  score: number;
  currentQuestion: number;
  totalQuestions: number;
  // ... other state
}
