import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LickListComponent } from './lick-list.component';
import { LickService } from '../../services/lick.service';
import { of } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

describe('LickListComponent', () => {
  let component: LickListComponent;
  let fixture: ComponentFixture<LickListComponent>;
  let lickService: jasmine.SpyObj<LickService>;

  beforeEach(async () => {
    const lickServiceSpy = jasmine.createSpyObj('LickService', ['getLicks', 'deleteLick']);
    lickServiceSpy.getLicks.and.returnValue(of({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 20
    }));

    await TestBed.configureTestingModule({
      imports: [
        LickListComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: LickService, useValue: lickServiceSpy },
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    lickService = TestBed.inject(LickService) as jasmine.SpyObj<LickService>;
    fixture = TestBed.createComponent(LickListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load licks on init', () => {
    expect(lickService.getLicks).toHaveBeenCalled();
  });
});
