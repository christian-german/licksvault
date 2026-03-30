export enum MusicalKey {
  C = 'C',
  G = 'G',
  D = 'D',
  A = 'A',
  E = 'E',
  B = 'B',
  F_SHARP = 'F_SHARP',
  C_SHARP = 'C_SHARP',
  G_SHARP = 'G_SHARP',
  D_SHARP = 'D_SHARP',
  A_SHARP = 'A_SHARP',
  F = 'F'
}

export interface MusicalKeyInfo {
  major: string;
  minor: string;
  majorEnum: MusicalKey;
  angle: number;
}

export const CIRCLE_OF_FIFTHS: MusicalKeyInfo[] = [
  { major: 'C', minor: 'Am', majorEnum: MusicalKey.C, angle: 0 },
  { major: 'G', minor: 'Em', majorEnum: MusicalKey.G, angle: 30 },
  { major: 'D', minor: 'Bm', majorEnum: MusicalKey.D, angle: 60 },
  { major: 'A', minor: 'F♯m', majorEnum: MusicalKey.A, angle: 90 },
  { major: 'E', minor: 'C♯m', majorEnum: MusicalKey.E, angle: 120 },
  { major: 'B', minor: 'G♯m', majorEnum: MusicalKey.B, angle: 150 },
  { major: 'F♯', minor: 'D♯m', majorEnum: MusicalKey.F_SHARP, angle: 180 },
  { major: 'C♯', minor: 'A♯m', majorEnum: MusicalKey.C_SHARP, angle: 210 },
  { major: 'A♭', minor: 'Fm', majorEnum: MusicalKey.G_SHARP, angle: 240 },
  { major: 'E♭', minor: 'Cm', majorEnum: MusicalKey.D_SHARP, angle: 270 },
  { major: 'B♭', minor: 'Gm', majorEnum: MusicalKey.A_SHARP, angle: 300 },
  { major: 'F', minor: 'Dm', majorEnum: MusicalKey.F, angle: 330 },
];
export const MusicalKeyLabels: { [key in MusicalKey]: string } = {
  [MusicalKey.C]: 'C',
  [MusicalKey.G]: 'G',
  [MusicalKey.D]: 'D',
  [MusicalKey.A]: 'A',
  [MusicalKey.E]: 'E',
  [MusicalKey.B]: 'B',
  [MusicalKey.F_SHARP]: 'F♯',
  [MusicalKey.C_SHARP]: 'C♯',
  [MusicalKey.G_SHARP]: 'A♭',
  [MusicalKey.D_SHARP]: 'E♭',
  [MusicalKey.A_SHARP]: 'B♭',
  [MusicalKey.F]: 'F'
};

export enum Mode {
  IONIAN = 'IONIAN',
  DORIAN = 'DORIAN',
  PHRYGIAN = 'PHRYGIAN',
  LYDIAN = 'LYDIAN',
  MIXOLYDIAN = 'MIXOLYDIAN',
  AEOLIAN = 'AEOLIAN',
  LOCRIAN = 'LOCRIAN',
  HARMONIC_MINOR = 'HARMONIC_MINOR',
  MELODIC_MINOR = 'MELODIC_MINOR'
}

export enum Genre {
  BLUES = 'BLUES',
  JAZZ = 'JAZZ',
  ROCK = 'ROCK',
  METAL = 'METAL',
  FUNK = 'FUNK',
  COUNTRY = 'COUNTRY',
  FUSION = 'FUSION',
  CLASSICAL = 'CLASSICAL',
  POP = 'POP',
  OTHER = 'OTHER'
}

export interface Lick {
  id?: number;
  name: string;
  bpm: number;
  rootNote: MusicalKey;
  mode: Mode;
  lengthBars: number;
  genre: Genre;
  description?: string;
  gpFile?: string;
  videoUrl?: string;
  videoFilename?: string;
  videoThumbnailFilename?: string;
  videoContentType?: string;
  videoSize?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
