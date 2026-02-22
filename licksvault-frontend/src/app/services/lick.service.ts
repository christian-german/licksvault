import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lick, PageResponse } from '../models/lick.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LickService {
  private apiUrl = `${environment.apiUrl}/licks`;

  constructor(private http: HttpClient) {}

  getLicks(filters: any = {}, page: number = 0, size: number = 20, sortBy: string = 'createdAt', sortDir: string = 'desc'): Observable<PageResponse<Lick>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (filters.name) params = params.set('name', filters.name);
    if (filters.bpmMin) params = params.set('bpmMin', filters.bpmMin.toString());
    if (filters.bpmMax) params = params.set('bpmMax', filters.bpmMax.toString());
    if (filters.key) params = params.set('key', filters.key);
    if (filters.mode) params = params.set('mode', filters.mode);
    if (filters.lengthMin) params = params.set('lengthMin', filters.lengthMin.toString());
    if (filters.lengthMax) params = params.set('lengthMax', filters.lengthMax.toString());
    if (filters.genre) params = params.set('genre', filters.genre);

    return this.http.get<PageResponse<Lick>>(this.apiUrl, { params });
  }

  getLick(id: number): Observable<Lick> {
    return this.http.get<Lick>(`${this.apiUrl}/${id}`);
  }

  createLick(lick: Lick, gpFile?: File): Observable<Lick> {
    const formData = new FormData();
    formData.append('lick', JSON.stringify(lick));
    if (gpFile) {
      formData.append('gpFile', gpFile);
    }
    return this.http.post<Lick>(this.apiUrl, formData);
  }

  updateLick(id: number, lick: Lick, gpFile?: File): Observable<Lick> {
    const formData = new FormData();
    formData.append('lick', JSON.stringify(lick));
    if (gpFile) {
      formData.append('gpFile', gpFile);
    }
    return this.http.put<Lick>(`${this.apiUrl}/${id}`, formData);
  }

  deleteLick(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  openInGuitarPro(lick: Lick): Observable<string> {
    const companionUrl = 'http://127.0.0.1:43125/open-file';
    return this.http.post(companionUrl, {
      filename: `${lick.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gp`,
      content: lick.gpFile,
      lick_id: lick.id,
      api_url: environment.apiUrl
    }, { responseType: 'text' });
  }

  uploadVideo(id: number, videoFile: Blob): Observable<Lick> {
    const formData = new FormData();
    formData.append('video', videoFile, 'recording.webm');
    return this.http.post<Lick>(`${this.apiUrl}/${id}/video`, formData);
  }

  getVideoUrl(id: number): string {
    return `${this.apiUrl}/${id}/video`;
  }

  getThumbnailUrl(id: number): string {
    return `${this.apiUrl}/${id}/thumbnail`;
  }
}
