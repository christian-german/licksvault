import { Injectable } from '@angular/core';
import { Mode, MusicalKey } from '../models/lick.model';

export const MusicalKeyToPitch: { [key in MusicalKey]: number } = {
  [MusicalKey.C]: 0,
  [MusicalKey.C_SHARP]: 1,
  [MusicalKey.D]: 2,
  [MusicalKey.D_SHARP]: 3,
  [MusicalKey.E]: 4,
  [MusicalKey.F]: 5,
  [MusicalKey.F_SHARP]: 6,
  [MusicalKey.G]: 7,
  [MusicalKey.G_SHARP]: 8,
  [MusicalKey.A]: 9,
  [MusicalKey.A_SHARP]: 10,
  [MusicalKey.B]: 11
};

export const PitchToMusicalKey: { [pitch: number]: string } = {
  0: 'C',
  1: 'C#',
  2: 'D',
  3: 'D#',
  4: 'E',
  5: 'F',
  6: 'F#',
  7: 'G',
  8: 'G#',
  9: 'A',
  10: 'A#',
  11: 'B'
};

const ScaleIntervals: { [key in Mode]: number[] } = {
  [Mode.IONIAN]: [0, 2, 4, 5, 7, 9, 11],
  [Mode.DORIAN]: [0, 2, 3, 5, 7, 9, 10],
  [Mode.PHRYGIAN]: [0, 1, 3, 5, 7, 8, 10],
  [Mode.LYDIAN]: [0, 2, 4, 6, 7, 9, 11],
  [Mode.MIXOLYDIAN]: [0, 2, 4, 5, 7, 9, 10],
  [Mode.AEOLIAN]: [0, 2, 3, 5, 7, 8, 10],
  [Mode.LOCRIAN]: [0, 1, 3, 5, 6, 8, 10],
  [Mode.HARMONIC_MINOR]: [0, 2, 3, 5, 7, 8, 11],
  [Mode.MELODIC_MINOR]: [0, 2, 3, 5, 7, 9, 11]
};

const ProgressionTemplates: { [key in Mode]: number[][] } = {
  [Mode.IONIAN]: [[1, 5, 6, 4], [1, 4, 5, 1]],
  [Mode.DORIAN]: [[1, 4, 1, 7], [1, 2, 4, 1]],
  [Mode.PHRYGIAN]: [[1, 2, 1, 7], [1, 4, 3, 7]],
  [Mode.LYDIAN]: [[1, 2, 1, 2], [1, 5, 2, 4]],
  [Mode.MIXOLYDIAN]: [[1, 7, 4, 1], [1, 5, 7, 4]],
  [Mode.AEOLIAN]: [[1, 6, 7, 1], [1, 4, 5, 1]],
  [Mode.LOCRIAN]: [[1, 2, 1, 7], [1, 6, 2, 1]],
  [Mode.HARMONIC_MINOR]: [[1, 4, 5, 1], [1, 6, 5, 1]],
  [Mode.MELODIC_MINOR]: [[1, 4, 5, 1], [1, 2, 5, 1]]
};

@Injectable({
  providedIn: 'root'
})
export class HarmonyService {

  buildChords(rootNote: MusicalKey, mode: Mode): string[] {
    const rootPitch = MusicalKeyToPitch[rootNote];
    const scaleIntervals = ScaleIntervals[mode];
    const chords: string[] = [];

    for (let i = 0; i < 7; i++) {
      // Scale degrees are 0-indexed in our array
      const rootDegreePitch = (rootPitch + scaleIntervals[i]) % 12;
      const rootDegreeNote = PitchToMusicalKey[rootDegreePitch];

      // Calculate the intervals of the 3rd, 5th, and 7th from the scale
      const thirdDegreeIndex = (i + 2) % 7;
      const fifthDegreeIndex = (i + 4) % 7;
      const seventhDegreeIndex = (i + 6) % 7;

      const rootScalePitch = scaleIntervals[i];
      const thirdScalePitch = scaleIntervals[thirdDegreeIndex] < scaleIntervals[i] ? scaleIntervals[thirdDegreeIndex] + 12 : scaleIntervals[thirdDegreeIndex];
      const fifthScalePitch = scaleIntervals[fifthDegreeIndex] < scaleIntervals[i] ? scaleIntervals[fifthDegreeIndex] + 12 : scaleIntervals[fifthDegreeIndex];
      const seventhScalePitch = scaleIntervals[seventhDegreeIndex] < scaleIntervals[i] ? scaleIntervals[seventhDegreeIndex] + 12 : scaleIntervals[seventhDegreeIndex];

      const thirdInterval = thirdScalePitch - rootScalePitch;
      const fifthInterval = fifthScalePitch - rootScalePitch;
      const seventhInterval = seventhScalePitch - rootScalePitch;

      let chordSuffix = '';
      if (thirdInterval === 4) { // Major 3rd
        if (seventhInterval === 11) {
          chordSuffix = 'maj7';
        } else if (seventhInterval === 10) {
          chordSuffix = '7';
        }
      } else if (thirdInterval === 3) { // Minor 3rd
        if (fifthInterval === 7) {
          if (seventhInterval === 10) {
            chordSuffix = 'm7';
          } else if (seventhInterval === 11) {
            chordSuffix = 'm(maj7)';
          }
        } else if (fifthInterval === 6) { // Diminished 5th
          if (seventhInterval === 10) {
            chordSuffix = 'm7b5';
          } else if (seventhInterval === 9) {
            chordSuffix = 'dim7';
          }
        }
      }

      chords.push(`${rootDegreeNote}${chordSuffix}`);
    }

    return chords;
  }

  generateProgression(chords: string[], mode: Mode): string[] {
    const templates = ProgressionTemplates[mode];
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.map(degree => chords[degree - 1]);
  }
}
