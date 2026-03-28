import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfiguration } from '../models/config.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfiguration | undefined;

  constructor(private http: HttpClient) {}

  loadConfig() {
    return this.http.get<AppConfiguration>('/assets/config.json')
      .pipe(
        tap(config => this.config = config)
      );
  }

  get apiUrl(): string {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config.apiUrl;
  }
}
