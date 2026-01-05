import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { TournamentStandingsComponent } from './tournament-standings.component';
import { StandingService } from '@core';
import { ApiResponse, StandingTableResponse, StandingSummaryResponse } from '../../../core/models/response';

describe('TournamentStandingsComponent', () => {
  let component: TournamentStandingsComponent;
  let fixture: ComponentFixture<TournamentStandingsComponent>;
  let standingService: jasmine.SpyObj<StandingService>;

  const mockStandingSummary: StandingSummaryResponse = {
    id: 1,
    position: 1,
    teamId: 10,
    teamName: 'FC Barcelona',
    teamCode: 'FCB',
    teamLogoUrl: 'https://example.com/fcb.png',
    played: 10,
    won: 8,
    drawn: 1,
    lost: 1,
    goalsFor: 25,
    goalsAgainst: 8,
    goalDifference: 17,
    points: 25,
    form: 'WWWDW',
    qualified: true,
    relegated: false,
  };

  const mockStandingTable: StandingTableResponse = {
    tournamentId: 1,
    tournamentName: 'Liga Apertura 2024',
    standings: [mockStandingSummary],
    lastUpdated: '2024-01-15T10:00:00',
  };

  const mockApiResponse: ApiResponse<StandingTableResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Success',
    },
    body: {
      data: mockStandingTable,
    },
  };

  beforeEach(async () => {
    const standingServiceSpy = jasmine.createSpyObj('StandingService', ['getByTournament']);

    await TestBed.configureTestingModule({
      imports: [
        TournamentStandingsComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: StandingService, useValue: standingServiceSpy },
      ],
    }).compileComponents();

    standingService = TestBed.inject(StandingService) as jasmine.SpyObj<StandingService>;
    fixture = TestBed.createComponent(TournamentStandingsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should load standings when tournamentId changes', () => {
      standingService.getByTournament.and.returnValue(of(mockApiResponse));

      component.tournamentId = 1;
      component.ngOnChanges({
        tournamentId: {
          currentValue: 1,
          previousValue: undefined,
          firstChange: true,
          isFirstChange: () => true,
        },
      });

      expect(standingService.getByTournament).toHaveBeenCalledWith(1);
      expect(component.standingTable).toEqual(mockStandingTable);
      expect(component.loading).toBeFalse();
    });

    it('should not load standings when tournamentId is not provided', () => {
      component.ngOnChanges({});
      expect(standingService.getByTournament).not.toHaveBeenCalled();
    });
  });

  describe('loadStandings', () => {
    it('should set loading to true while fetching', () => {
      standingService.getByTournament.and.returnValue(of(mockApiResponse));
      component.tournamentId = 1;

      component.loadStandings();

      expect(component.loading).toBeFalse();
      expect(component.standingTable).toEqual(mockStandingTable);
    });

    it('should handle error when loading standings fails', () => {
      standingService.getByTournament.and.returnValue(throwError(() => new Error('Network error')));
      component.tournamentId = 1;

      component.loadStandings();

      expect(component.loading).toBeFalse();
      expect(component.error).toBe('Error loading standings');
      expect(component.standingTable).toBeNull();
    });
  });

  describe('getPositionClass', () => {
    it('should return table-success for qualified teams', () => {
      const standing: StandingSummaryResponse = { ...mockStandingSummary, qualified: true, relegated: false };
      expect(component.getPositionClass(standing)).toBe('table-success');
    });

    it('should return table-danger for relegated teams', () => {
      const standing: StandingSummaryResponse = { ...mockStandingSummary, qualified: false, relegated: true };
      expect(component.getPositionClass(standing)).toBe('table-danger');
    });

    it('should return empty string for normal teams', () => {
      const standing: StandingSummaryResponse = { ...mockStandingSummary, qualified: false, relegated: false };
      expect(component.getPositionClass(standing)).toBe('');
    });
  });

  describe('getFormBadges', () => {
    it('should return last 5 results as array', () => {
      expect(component.getFormBadges('WWWDWL')).toEqual(['W', 'W', 'D', 'W', 'L']);
    });

    it('should return empty array for undefined form', () => {
      expect(component.getFormBadges(undefined)).toEqual([]);
    });

    it('should return all results if less than 5', () => {
      expect(component.getFormBadges('WDL')).toEqual(['W', 'D', 'L']);
    });
  });

  describe('getFormBadgeClass', () => {
    it('should return bg-success for win', () => {
      expect(component.getFormBadgeClass('W')).toBe('bg-success');
    });

    it('should return bg-warning for draw', () => {
      expect(component.getFormBadgeClass('D')).toBe('bg-warning');
    });

    it('should return bg-danger for loss', () => {
      expect(component.getFormBadgeClass('L')).toBe('bg-danger');
    });

    it('should return bg-secondary for unknown result', () => {
      expect(component.getFormBadgeClass('X')).toBe('bg-secondary');
    });
  });
});
