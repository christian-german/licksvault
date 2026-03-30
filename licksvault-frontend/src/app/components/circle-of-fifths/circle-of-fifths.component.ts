import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicalKey, MusicalKeyLabels, CIRCLE_OF_FIFTHS, MusicalKeyInfo } from '../../models/lick.model';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-circle-of-fifths',
  standalone: true,
  imports: [CommonModule, PopoverModule, ButtonModule],
  templateUrl: './circle-of-fifths.component.html',
  styleUrl: './circle-of-fifths.component.css'
})
export class CircleOfFifthsComponent {
  selectedKey = input<MusicalKey | null>(null);
  keyChange = output<MusicalKey | null>();

  readonly circleKeys = CIRCLE_OF_FIFTHS;

  selectedKeyLabel = computed(() => {
    const key = this.selectedKey();
    return key ? MusicalKeyLabels[key] : 'Key';
  });

  selectKey(key: MusicalKey, popover: any) {
    if (this.selectedKey() === key) {
      this.keyChange.emit(null);
    } else {
      this.keyChange.emit(key);
    }
    popover.hide();
  }

  clearSelection(popover: any) {
    this.keyChange.emit(null);
    popover.hide();
  }

  getSlicePath(innerRadius: number, outerRadius: number, startAngle: number, endAngle: number): string {
    const start = this.polarToCartesian(120, 120, outerRadius, endAngle);
    const end = this.polarToCartesian(120, 120, outerRadius, startAngle);
    const startInner = this.polarToCartesian(120, 120, innerRadius, endAngle);
    const endInner = this.polarToCartesian(120, 120, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
      "L", endInner.x, endInner.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
      "Z"
    ].join(" ");
  }

  polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  getLabelPosition(radius: number, angle: number) {
    return this.polarToCartesian(120, 120, radius, angle);
  }
}
