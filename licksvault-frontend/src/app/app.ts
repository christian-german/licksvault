import { Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, ButtonModule, TooltipModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = signal('licks-frontend');
  isDarkMode = true;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.isDarkMode = savedTheme === 'dark';
      }
      this.applyTheme();
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }
    this.applyTheme();
  }

  private applyTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.querySelector('html');
      if (element) {
        if (this.isDarkMode) {
          element.classList.add('my-app-dark');
        } else {
          element.classList.remove('my-app-dark');
        }
      }
    }
  }
}
