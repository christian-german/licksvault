import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { UiService } from './services/ui.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, ButtonModule, TooltipModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = signal('licks-frontend');
  private uiService = inject(UiService);
  private oidcSecurityService = inject(OidcSecurityService);

  isAuthenticated = signal(false);

  constructor() {
    this.oidcSecurityService.isAuthenticated$.subscribe(({ isAuthenticated }) => {
      this.isAuthenticated.set(isAuthenticated);
    });
  }

  openNewLickDialog() {
    this.uiService.openCreateLickModal();
  }

  logout() {
    this.oidcSecurityService.logoff().subscribe();
  }
}
