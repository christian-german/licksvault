import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LickService } from './lick.service';
import { Lick, MusicalKey, Mode, Genre } from '../models/lick.model';
import { environment } from '../../environments/environment';

describe('LickService', () => {
  let service: LickService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LickService]
    });
    service = TestBed.inject(LickService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch licks', () => {
    const mockResponse = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 20
    };

    service.getLicks().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(req => req.url === `${environment.apiUrl}/licks`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create a lick', () => {
    const mockLick: Lick = {
      name: 'Test Lick',
      bpm: 120,
      rootNote: MusicalKey.C,
      mode: Mode.IONIAN,
      lengthBars: 4,
      genre: Genre.ROCK
    };

    service.createLick(mockLick).subscribe(lick => {
      expect(lick).toEqual(mockLick);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/licks`);
    expect(req.request.method).toBe('POST');
    req.flush(mockLick);
  });
});
