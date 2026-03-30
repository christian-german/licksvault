import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  viewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {ToastModule} from 'primeng/toast';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {InplaceModule} from 'primeng/inplace';
import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {SelectModule} from 'primeng/select';
import {TextareaModule} from 'primeng/textarea';
import {ConfirmationService, MessageService} from 'primeng/api';
import {LickService} from '../../services/lick.service';
import {ConfigService} from '../../services/config.service';
import {Genre, Lick, Mode, MusicalKeyLabels} from '../../models/lick.model';
import {AlphaTabComponent} from '../alphatab/alphatab.component';
import {CircleOfFifthsComponent} from '../circle-of-fifths/circle-of-fifths.component';

@Component({
  selector: 'app-lick-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    InplaceModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    AlphaTabComponent,
    CircleOfFifthsComponent
  ],
  templateUrl: './lick-detail.component.html',
  styleUrl: './lick-detail.component.css'
})
export class LickDetailComponent implements OnInit, OnDestroy {
  lick?: Lick;
  private originalLick?: string;
  readonly alphaTab = viewChild(AlphaTabComponent);

  private eventSource?: EventSource;

  // Video recording
  recording = false;
  mediaRecorder?: MediaRecorder;
  recordedChunks: Blob[] = [];
  videoUrl?: string;
  isSavingVideo = false;
  recordingStream?: MediaStream;

  readonly previewElement = viewChild<ElementRef<HTMLVideoElement>>('videoPreview');

  genreOptions = Object.values(Genre).map(g => ({ label: g.charAt(0) + g.slice(1).toLowerCase(), value: g }));
  keyOptions = Object.entries(MusicalKeyLabels).map(([value, label]) => ({ label, value }));
  modeOptions = Object.values(Mode).map(m => ({ label: m.charAt(0) + m.slice(1).toLowerCase().replace('_', ' '), value: m }));

  getModeLabel(mode: string): string {
    return mode.charAt(0) + mode.slice(1).toLowerCase().replace('_', ' ');
  }

  constructor(
    private lickService: LickService,
    private configService: ConfigService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef
  ) { }

  /**
   * Initializes the SSE connection for real-time updates.
   * This is used to detect when the user edits the lick and the companion posts the updated data.
   */
  private initSse(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.eventSource = new EventSource(`${this.configService.apiUrl}/licks/events`);
    this.eventSource.addEventListener('LICK_UPDATED', (event: any) => {
      const data = JSON.parse(event.data);
      if (data.lickId === +id) {
        if (this.lick?.updatedAt === data.updatedAt) {
          return;
        }

        if (this.alphaTab()) {
          this.fetchUpdatedLick();
        }
      }
    });

    this.eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
    };
  }

  /**
   * Fetches the updated lick details from the server.
   * This could occur if the user has edited the lick, the companion has posted it, and the server notifies us of the change.
   */
  private fetchUpdatedLick(): void {
    if (!this.lick?.id) return;
    this.lickService.getLick(this.lick.id).subscribe({
      next: (lick) => {
        this.lick = lick;
        this.originalLick = JSON.stringify(lick);
        this.cd.markForCheck();
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.lickService.getLick(+id).subscribe({
        next: (lick) => {
          this.lick = lick;
          this.originalLick = JSON.stringify(lick);
          this.cd.markForCheck();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load lick details' });
          this.router.navigate(['/']);
        }
      });
      this.initSse();
    }
  }

  saveLick(): void {
    if (!this.lick || !this.lick.id) return;

    const currentLickData = JSON.stringify(this.lick);
    if (this.originalLick === currentLickData) {
      return;
    }

    const lickToUpdate = { ...this.lick, gpFile: undefined };

    this.lickService.updateLick(this.lick.id, lickToUpdate).subscribe({
      next: (updatedLick) => {
        this.lick = updatedLick;
        this.originalLick = JSON.stringify(updatedLick);
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Lick updated successfully' });
        this.cd.markForCheck();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not update lick' });
      }
    });
  }

  deleteLick(): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${this.lick?.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.lickService.deleteLick(this.lick?.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Lick deleted successfully' });
            setTimeout(() => this.router.navigate(['/']), 1000);
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete lick' });
          }
        });
      }
    });
  }

  getKeyLabel(key: any): string {
    return MusicalKeyLabels[key as keyof typeof MusicalKeyLabels] || key;
  }

  focusInplace(inplace: any): void {
    setTimeout(() => {
      const el = inplace.el.nativeElement;

      // Try to find PrimeNG focusable internal elements first
      const primeSelect = el.querySelector('p-select');
      if (primeSelect) {
          // PrimeNG Select has a focus method on the component, but we have the DOM element.
          // In PrimeNG 18+, it often has an internal focusable element with certain classes.
          const focusable = primeSelect.querySelector('.p-select-label, input, [tabindex="0"]');
          if (focusable) {
              focusable.focus();
              return;
          }
      }

      const primeInputNumber = el.querySelector('p-inputnumber');
      if (primeInputNumber) {
          const focusable = primeInputNumber.querySelector('input');
          if (focusable) {
              focusable.focus();
              if (focusable.select) focusable.select();
              return;
          }
      }

      // Fallback to general search
      const input = el.querySelector('input, textarea, select');
      if (input) {
        input.focus();
        if (input.select) {
          input.select();
        }
      }
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
    this.stopRecordingStream();
  }

  async startRecording() {
    try {
      this.recordedChunks = [];
      this.videoUrl = undefined;
      this.recording = true;
      this.cd.detectChanges();

      this.recordingStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      if (this.previewElement()) {
        this.previewElement()!.nativeElement.srcObject = this.recordingStream;
      }

      this.mediaRecorder = new MediaRecorder(this.recordingStream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.videoUrl = URL.createObjectURL(blob);
        this.stopRecordingStream();
        this.cd.markForCheck();
      };

      this.mediaRecorder.start();
    } catch (err) {
      console.error('Error accessing media devices:', err);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not access camera/microphone' });
      this.recording = false;
      this.cd.markForCheck();
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.recording) {
      this.mediaRecorder.stop();
      this.recording = false;
    }
  }

  private stopRecordingStream() {
    if (this.recordingStream) {
      this.recordingStream.getTracks().forEach(track => track.stop());
      this.recordingStream = undefined;
    }
  }

  clearRecording() {
    this.videoUrl = undefined;
    this.recordedChunks = [];
  }

  saveVideo() {
    if (this.recordedChunks.length === 0 || !this.lick?.id) return;

    this.isSavingVideo = true;
    const blob = new Blob(this.recordedChunks, { type: 'video/webm' });

    this.lickService.uploadVideo(this.lick.id, blob).subscribe({
      next: (updatedLick) => {
        this.lick = updatedLick;
        this.videoUrl = undefined;
        this.recordedChunks = [];
        this.isSavingVideo = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Video uploaded successfully' });
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Error uploading video:', err);
        this.isSavingVideo = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload video' });
      }
    });
  }

  getExistingVideoUrl(): string | undefined {
    if (this.lick?.id && this.lick.videoFilename) {
      return this.lickService.getVideoUrl(this.lick.id);
    }
    return undefined;
  }
}
