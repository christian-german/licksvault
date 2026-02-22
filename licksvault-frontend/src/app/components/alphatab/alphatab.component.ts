import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  viewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {MessageService} from 'primeng/api';
import * as alphaTab from '@coderline/alphatab';
import {PlayerMode} from '@coderline/alphatab';
import {Lick, Mode} from '../../models/lick.model';
import {LickService} from '../../services/lick.service';
import {MusicalKeyToPitch} from '../../services/harmony.service';

const ModeIntervals: { [key in Mode]: { [role: string]: number } } = {
  [Mode.IONIAN]: { root: 0, third: 4, fifth: 7, seventh: 11 },
  [Mode.DORIAN]: { root: 0, third: 3, fifth: 7, seventh: 10 },
  [Mode.PHRYGIAN]: { root: 0, third: 3, fifth: 7, seventh: 10 },
  [Mode.LYDIAN]: { root: 0, third: 4, fifth: 7, seventh: 11 },
  [Mode.MIXOLYDIAN]: { root: 0, third: 4, fifth: 7, seventh: 10 },
  [Mode.AEOLIAN]: { root: 0, third: 3, fifth: 7, seventh: 10 },
  [Mode.LOCRIAN]: { root: 0, third: 3, fifth: 6, seventh: 10 },
  [Mode.HARMONIC_MINOR]: { root: 0, third: 3, fifth: 7, seventh: 11 },
  [Mode.MELODIC_MINOR]: { root: 0, third: 3, fifth: 7, seventh: 11 }
};

@Component({
  selector: 'app-alphatab',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="surface-card p-2 border-round cursor-pointer hover:border-primary border-1 border-transparent mb-3">
      <div #alphaTab [hidden]="!lick()?.gpFile"></div>
      @if (!lick()?.gpFile) {
        <div class="p-4 text-center surface-100 border-round">
          <i class="pi pi-file-excel text-4xl mb-3 text-color-secondary"></i>
          <p class="m-0 text-color-secondary">No Guitar Pro file attached to this lick.</p>
          <p class="text-sm text-color-secondary mt-1">You can add one by editing the lick in Guitar Pro.</p>
        </div>
      }
    </div>
    <div class="flex gap-2">
      <p-button label="Edit in Guitar Pro" icon="pi pi-external-link" (onClick)="openInGuitarPro()" severity="info"></p-button>
      <p-button [label]="isPaused() ? 'Play' : 'Pause'" [icon]="isPaused() ? 'pi pi-play' : 'pi pi-pause'" (onClick)="play()" [disabled]="!lick()?.gpFile"></p-button>
      <p-button [label]="isLooping() ? 'Loop: On' : 'Loop: Off'" [icon]="isLooping() ? 'pi pi-sync' : 'pi pi-sync'" (onClick)="toggleLoop()" [severity]="isLooping() ? 'primary' : 'secondary'" [disabled]="!lick()?.gpFile"></p-button>
      <p-button [label]="isMetronomeEnabled() ? 'Metronome: On' : 'Metronome: Off'" [icon]="isMetronomeEnabled() ? 'pi pi-volume-up' : 'pi pi-volume-off'" (onClick)="toggleMetronome()" [severity]="isMetronomeEnabled() ? 'primary' : 'secondary'" [disabled]="!lick()?.gpFile"></p-button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AlphaTabComponent implements OnDestroy {
  lick = input<Lick | undefined>();
  readonly alphaTabElement = viewChild<ElementRef<HTMLDivElement>>('alphaTab');
  #alphaTab?: alphaTab.AlphaTabApi;

  isPaused = signal(true);
  isLooping = signal(false);
  isMetronomeEnabled = signal(false);

  private lickService = inject(LickService);
  private messageService = inject(MessageService);

  constructor() {
    effect(() => {
      const element = this.alphaTabElement();
      const lickData = this.lick();

      if (element && !this.#alphaTab) {
        const api = new alphaTab.AlphaTabApi(element.nativeElement, {
          core: {
            fontDirectory: '/font/',
            includeNoteBounds: true,
            engine: 'html5'
          },
          player: {
            playerMode: PlayerMode.EnabledAutomatic,
            enableCursor: true,
            enableUserInteraction: true,
            soundFont: '/soundfont/sonivox.sf2'
          }
        } as alphaTab.Settings);
        this.#alphaTab = api;

        const start = api.playbackRange?.startTick ?? 0;
        const endExclusive = api.playbackRange?.endTick ?? 0;
        const endGuard = endExclusive - 10;

        api.scoreLoaded.on(score => {
          this.applyColors(score);
        });

        api.playerStateChanged.on(args => {
          this.isPaused.set(args.state !== alphaTab.synth.PlayerState.Playing);
        });

        // Workaround for https://github.com/CoderLine/alphaTab/issues/2569
        // To avoid the small pause between loops, we don't use the internal isLooping
        // but instead seek back manually when the end is reached.
        api.playerPositionChanged.on(args => {
          if (this.isLooping() && args.currentTick >= args.endTick) {
            if (args.currentTick >= endGuard) {
              api.tickPosition = start;
            }
          }
        });
      }

      if (this.#alphaTab && lickData) {
        this.loadLickTablature(lickData);
      }
    });
  }

  /**
   * Applies the colors to the tablature based on the lick's root note and mode.
   * This is done by setting the fret number color for each note based on its relative pitch.
   */
  private applyColors(score: alphaTab.model.Score) {
    const lickData = this.lick();
    if (!lickData) return;

    const rootPitch = MusicalKeyToPitch[lickData.rootNote];
    const intervals = ModeIntervals[lickData.mode];

    for (const track of score.tracks) {
      for (const staff of track.staves) {
        for (const bar of staff.bars) {
          for (const voice of bar.voices) {
            for (const beat of voice.beats) {
              for (const note of beat.notes) {
                const notePitch = note.realValue % 12;
                const relativePitch = (notePitch - rootPitch + 12) % 12;

                note.style = new alphaTab.model.NoteStyle();
                if (relativePitch === intervals['root']) {
                  note.style.colors.set(alphaTab.model.NoteSubElement.GuitarTabFretNumber, alphaTab.model.Color.fromJson("#ff0000"));
                } else if (relativePitch === intervals['third']) {
                  note.style.colors.set(alphaTab.model.NoteSubElement.GuitarTabFretNumber, alphaTab.model.Color.fromJson("#0000ff"));
                } else if (relativePitch === intervals['fifth']) {
                  note.style.colors.set(alphaTab.model.NoteSubElement.GuitarTabFretNumber, alphaTab.model.Color.fromJson("#00ff00"));
                } else {
                  note.style.colors.set(alphaTab.model.NoteSubElement.GuitarTabFretNumber, alphaTab.model.Color.fromJson("#000000"));
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Loads the tablature from the lick's Guitar Pro file.
   * This is done by decoding the base64-encoded string and creating a Uint8Array.
   */
  private loadLickTablature(lick: Lick): void {
    const api = this.#alphaTab;
    if (!api || !lick.gpFile) return;

    const binaryString = window.atob(lick.gpFile);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    api.load(bytes);
  }

  ngOnDestroy(): void {
    if (this.#alphaTab) {
      this.#alphaTab.destroy();
    }
  }

  // Exposed methods for a parent component if needed
  public play(): void {
    this.#alphaTab?.playPause();
  }

  /**
   * Toggles the loop state of the AlphaTab player.
   */
  public toggleLoop(): void {
    this.isLooping.update(l => !l);
  }

  /**
   * Toggles the metronome state of the AlphaTab player.
   */
  public toggleMetronome(): void {
    if (this.#alphaTab) {
      this.#alphaTab.metronomeVolume = this.#alphaTab.metronomeVolume > 0 ? 0 : 1;
      this.isMetronomeEnabled.set(this.#alphaTab.metronomeVolume > 0);
    }
  }

  openInGuitarPro() {
    const lick = this.lick();
    if (!lick) return;

    this.lickService.openInGuitarPro(lick).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Opening in Guitar Pro...' });
      },
      error: (err) => {
        console.error('Error opening in Guitar Pro:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not communicate with Licksvault Companion. Make sure it is running.'
        });
      }
    });
  }
}
