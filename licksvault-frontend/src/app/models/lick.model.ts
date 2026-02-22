export enum MusicalKey {
  C = 'C',
  C_SHARP = 'C_SHARP',
  D = 'D',
  D_SHARP = 'D_SHARP',
  E = 'E',
  F = 'F',
  F_SHARP = 'F_SHARP',
  G = 'G',
  G_SHARP = 'G_SHARP',
  A = 'A',
  A_SHARP = 'A_SHARP',
  B = 'B'
}
export const MusicalKeyLabels: { [key in MusicalKey]: string } = {
  [MusicalKey.C]: 'C',
  [MusicalKey.C_SHARP]: 'C# / Db',
  [MusicalKey.D]: 'D',
  [MusicalKey.D_SHARP]: 'D# / Eb',
  [MusicalKey.E]: 'E',
  [MusicalKey.F]: 'F',
  [MusicalKey.F_SHARP]: 'F# / Gb',
  [MusicalKey.G]: 'G',
  [MusicalKey.G_SHARP]: 'G# / Ab',
  [MusicalKey.A]: 'A',
  [MusicalKey.A_SHARP]: 'A# / Bb',
  [MusicalKey.B]: 'B'
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
