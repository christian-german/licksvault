import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DataViewModule } from 'primeng/dataview';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CircleOfFifthsComponent } from '../circle-of-fifths/circle-of-fifths.component';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LickService } from '../../services/lick.service';
import { Lick, Genre, MusicalKey, MusicalKeyLabels, Mode } from '../../models/lick.model';

@Component({
  selector: 'app-lick-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DataViewModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    SliderModule,
    CheckboxModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule,
    AccordionModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    ProgressSpinnerModule,
    CircleOfFifthsComponent
  ],
  templateUrl: './lick-list.component.html',
  styleUrl: './lick-list.component.css',
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class LickListComponent implements OnInit {
  licks: Lick[] = [];
  totalElements: number = 0;
  loading: boolean = false;
  rows: number = 12;
  currentPage: number = 0;
  hasMore: boolean = true;

  filters: {
    name: string;
    bpmMin: number;
    bpmMax: number;
    key: MusicalKey | null;
    mode: Mode | null;
    lengthMin: number;
    lengthMax: number;
    genre: Genre | null;
  } = {
    name: '',
    bpmMin: 40,
    bpmMax: 240,
    key: null,
    mode: null,
    lengthMin: 1,
    lengthMax: 64,
    genre: null
  };

  genreOptions = [
    { label: 'All Genres', value: null },
    ...Object.values(Genre).map(g => ({ label: g.charAt(0) + g.slice(1).toLowerCase(), value: g }))
  ];

  keyOptions = [
    { label: 'All Tonics', value: null },
    ...Object.entries(MusicalKeyLabels).map(([value, label]) => ({ label, value }))
  ];

  modeOptions = [
    { label: 'All Modes', value: null },
    ...Object.values(Mode).map(m => ({ label: m.charAt(0) + m.slice(1).toLowerCase().replace('_', ' '), value: m }))
  ];

  getModeLabel(mode: string): string {
    return mode.charAt(0) + mode.slice(1).toLowerCase().replace('_', ' ');
  }

  constructor(
    private lickService: LickService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLicks();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.loading || !this.hasMore) return;

    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;
    const max = document.documentElement.scrollHeight;

    // Load more when 200px from bottom
    if (pos > max - 200) {
      this.loadMore();
    }
  }

  loadLicks(append: boolean = false): void {
    if (this.loading) return;
    this.loading = true;

    if (!append) {
      this.currentPage = 0;
    }

    const size = this.rows;
    const page = this.currentPage;
    const sortBy = 'createdAt';
    const sortDir = 'desc';

    this.lickService.getLicks(this.filters, page, size, sortBy, sortDir).subscribe({
      next: (response) => {
        if (append) {
          this.licks = [...this.licks, ...response.content];
        } else {
          this.licks = response.content;
        }
        this.totalElements = response.totalElements;
        this.hasMore = this.licks.length < this.totalElements;
        this.loading = false;
        this.cd.markForCheck();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load licks' });
        this.loading = false;
        this.cd.markForCheck();
      }
    });
  }

  loadMore(): void {
    if (this.hasMore && !this.loading) {
      this.currentPage++;
      this.loadLicks(true);
    }
  }

  onSearch(): void {
    this.loadLicks();
  }

  getThumbnailUrl(lick: Lick): string | null {
    if (lick.videoThumbnailFilename) {
      return this.lickService.getThumbnailUrl(lick.id!);
    }
    return null;
  }

  resetFilters(): void {
    this.filters = {
      name: '',
      bpmMin: 40,
      bpmMax: 240,
      key: null,
      mode: null,
      lengthMin: 1,
      lengthMax: 64,
      genre: null
    };
    this.loadLicks();
  }

  viewDetail(lick: Lick): void {
    this.router.navigate(['/licks', lick.id]);
  }

  deleteLick(event: Event, lick: Lick): void {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${lick.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.lickService.deleteLick(lick.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Lick deleted successfully' });
            this.loadLicks();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete lick' });
          }
        });
      }
    });
  }

  getKeyLabel(key: MusicalKey): string {
    return MusicalKeyLabels[key] || key;
  }
}
