import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private _showCreateLickModal = signal(false);

  showCreateLickModal = this._showCreateLickModal.asReadonly();

  openCreateLickModal() {
    this._showCreateLickModal.set(true);
  }

  closeCreateLickModal() {
    this._showCreateLickModal.set(false);
  }
}
