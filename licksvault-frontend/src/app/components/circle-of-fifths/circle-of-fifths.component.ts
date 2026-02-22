import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicalKey, MusicalKeyLabels } from '../../models/lick.model';

interface KeySlice {
  key: MusicalKey;
  label: string;
  angle: number;
}

@Component({
  selector: 'app-circle-of-fifths',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './circle-of-fifths.component.html',
  styleUrl: './circle-of-fifths.component.css'
})
export class CircleOfFifthsComponent {
  selectedKey = input<MusicalKey | null>(null);
  keyChange = output<MusicalKey | null>();

  // Circle of fifths order: C, G, D, A, E, B, F#, C#, G#, D#, A#, F
  readonly keys: KeySlice[] = [
    { key: MusicalKey.C, label: 'C', angle: 0 },
    { key: MusicalKey.G, label: 'G', angle: 30 },
    { key: MusicalKey.D, label: 'D', angle: 60 },
    { key: MusicalKey.A, label: 'A', angle: 90 },
    { key: MusicalKey.E, label: 'E', angle: 120 },
    { key: MusicalKey.B, label: 'B', angle: 150 },
    { key: MusicalKey.F_SHARP, label: 'F#', angle: 180 },
    { key: MusicalKey.C_SHARP, label: 'C#', angle: 210 },
    { key: MusicalKey.G_SHARP, label: 'G#', angle: 240 },
    { key: MusicalKey.D_SHARP, label: 'D#', angle: 270 },
    { key: MusicalKey.A_SHARP, label: 'A#', angle: 300 },
    { key: MusicalKey.F, label: 'F', angle: 330 },
  ];

  selectKey(key: MusicalKey) {
    if (this.selectedKey() === key) {
      this.keyChange.emit(null);
    } else {
      this.keyChange.emit(key);
    }
  }

  getTransform(angle: number): string {
    return `rotate(${angle} 100 100)`;
  }

  getTextTransform(angle: number): string {
    // Position text at the outer part of the slice
    const radius = 70;
    const x = 100 + radius * Math.sin((angle * Math.PI) / 180);
    const y = 100 - radius * Math.cos((angle * Math.PI) / 180);
    return `translate(${x}, ${y})`;
  }
}
