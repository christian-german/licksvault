import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LickService } from '../../services/lick.service';
import { Genre, Lick, Mode, MusicalKey, MusicalKeyLabels } from '../../models/lick.model';

@Component({
  selector: 'app-lick-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    ToastModule
  ],
  templateUrl: './lick-create.component.html',
  styleUrl: './lick-create.component.css',
  providers: [MessageService]
})
export class LickCreateComponent implements OnInit {
  lick: Lick = {
    name: '',
    bpm: 120,
    rootNote: MusicalKey.C,
    mode: Mode.IONIAN,
    lengthBars: 4,
    genre: Genre.ROCK,
    description: ''
  };

  genreOptions = Object.values(Genre).map(g => ({ label: g.charAt(0) + g.slice(1).toLowerCase(), value: g }));
  keyOptions = Object.entries(MusicalKeyLabels).map(([value, label]) => ({ label, value }));
  modeOptions = Object.values(Mode).map(m => ({ label: m.charAt(0) + m.slice(1).toLowerCase().replace('_', ' '), value: m }));

  constructor(
    private lickService: LickService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {}

  saveLick(): void {
    if (!this.lick.name) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Name is required' });
      return;
    }

    this.lickService.createLick(this.lick).subscribe({
      next: (createdLick) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Lick created successfully' });
        setTimeout(() => {
          this.router.navigate(['/licks', createdLick.id]);
        }, 1000);
      },
      error: (err) => {
        console.error('Error creating lick:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not create lick' });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
