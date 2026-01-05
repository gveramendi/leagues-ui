import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { TournamentScorersComponent } from './tournament-scorers.component';
import { PlayerStatisticsService } from '@core';
import { ApiResponse, ScorerTableResponse, TopScorerResponse } from '../../../core/models/response';

describe('TournamentScorersComponent', () => {
  let component: TournamentScorersComponent;
  let fixture: ComponentFixture<TournamentScorersComponent>;
  let playerStatisticsService: jasmine.SpyObj<PlayerStatisticsService>;

  const mockTopScorer: TopScorerResponse = {
    rank: 1,
    playerId: 100,
    playerName: 'Lionel Messi',
    playerPhotoUrl: 'https://example.com/messi.png',
    teamId: 10,
    teamName: 'Inter Miami',
    teamLogoUrl: 'https://example.com/miami.png',
    goals: 12,
    penaltyGoals: 2,
    assists: 8,
    matchesPlayed: 15,
    goalsPerGame: 0.8,
  };

  const mockScorerTable: ScorerTableResponse = {
    tournamentId: 1,
    tournamentName: 'Liga Apertura 2024',
    scorers: [mockTopScorer],
    lastUpdated: '2024-01-15T10:00:00',
  };

  const mockApiResponse: ApiResponse<ScorerTableResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Success',
    },
    body: {
      data: mockScorerTable,
    },
  };

  beforeEach(async () => {
    const playerStatisticsServiceSpy = jasmine.createSpyObj('PlayerStatisticsService', ['getTopScorers']);

    await TestBed.configureTestingModule({
      imports: [
        TournamentScorersComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: PlayerStatisticsService, useValue: playerStatisticsServiceSpy },
      ],
    }).compileComponents();

    playerStatisticsService = TestBed.inject(PlayerStatisticsService) as jasmine.SpyObj<PlayerStatisticsService>;
    fixture = TestBed.createComponent(TournamentScorersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should load scorers when tournamentId changes', () => {
      playerStatisticsService.getTopScorers.and.returnValue(of(mockApiResponse));

      component.tournamentId = 1;
      component.ngOnChanges({
        tournamentId: {
          currentValue: 1,
          previousValue: undefined,
          firstChange: true,
          isFirstChange: () => true,
        },
      });

      expect(playerStatisticsService.getTopScorers).toHaveBeenCalledWith(1, 50);
      expect(component.scorerTable).toEqual(mockScorerTable);
      expect(component.loading).toBeFalse();
    });

    it('should not load scorers when tournamentId is not provided', () => {
      component.ngOnChanges({});
      expect(playerStatisticsService.getTopScorers).not.toHaveBeenCalled();
    });
  });

  describe('loadScorers', () => {
    it('should set loading to true while fetching', () => {
      playerStatisticsService.getTopScorers.and.returnValue(of(mockApiResponse));
      component.tournamentId = 1;

      component.loadScorers();

      expect(component.loading).toBeFalse();
      expect(component.scorerTable).toEqual(mockScorerTable);
    });

    it('should handle error when loading scorers fails', () => {
      playerStatisticsService.getTopScorers.and.returnValue(throwError(() => new Error('Network error')));
      component.tournamentId = 1;

      component.loadScorers();

      expect(component.loading).toBeFalse();
      expect(component.error).toBe('Error loading scorers');
      expect(component.scorerTable).toBeNull();
    });
  });

  describe('getRankClass', () => {
    it('should return rank-gold for rank 1', () => {
      expect(component.getRankClass(1)).toBe('rank-gold');
    });

    it('should return rank-silver for rank 2', () => {
      expect(component.getRankClass(2)).toBe('rank-silver');
    });

    it('should return rank-bronze for rank 3', () => {
      expect(component.getRankClass(3)).toBe('rank-bronze');
    });

    it('should return empty string for other ranks', () => {
      expect(component.getRankClass(4)).toBe('');
      expect(component.getRankClass(10)).toBe('');
    });

    it('should return empty string for undefined rank', () => {
      expect(component.getRankClass(undefined)).toBe('');
    });
  });
});
