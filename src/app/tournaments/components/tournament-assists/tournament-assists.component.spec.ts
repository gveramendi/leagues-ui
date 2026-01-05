import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { TournamentAssistsComponent } from './tournament-assists.component';
import { PlayerStatisticsService } from '@core';
import { ApiResponse, AssistTableResponse, TopAssistResponse } from '../../../core/models/response';

describe('TournamentAssistsComponent', () => {
  let component: TournamentAssistsComponent;
  let fixture: ComponentFixture<TournamentAssistsComponent>;
  let playerStatisticsService: jasmine.SpyObj<PlayerStatisticsService>;

  const mockTopAssist: TopAssistResponse = {
    rank: 1,
    playerId: 100,
    playerName: 'Kevin De Bruyne',
    playerPhotoUrl: 'https://example.com/kdb.png',
    teamId: 10,
    teamName: 'Manchester City',
    teamLogoUrl: 'https://example.com/city.png',
    assists: 15,
    goals: 5,
    matchesPlayed: 20,
    assistsPerGame: 0.75,
  };

  const mockAssistTable: AssistTableResponse = {
    tournamentId: 1,
    tournamentName: 'Premier League 2024',
    assists: [mockTopAssist],
    lastUpdated: '2024-01-15T10:00:00',
  };

  const mockApiResponse: ApiResponse<AssistTableResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Success',
    },
    body: {
      data: mockAssistTable,
    },
  };

  beforeEach(async () => {
    const playerStatisticsServiceSpy = jasmine.createSpyObj('PlayerStatisticsService', ['getTopAssists']);

    await TestBed.configureTestingModule({
      imports: [
        TournamentAssistsComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: PlayerStatisticsService, useValue: playerStatisticsServiceSpy },
      ],
    }).compileComponents();

    playerStatisticsService = TestBed.inject(PlayerStatisticsService) as jasmine.SpyObj<PlayerStatisticsService>;
    fixture = TestBed.createComponent(TournamentAssistsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should load assists when tournamentId changes', () => {
      playerStatisticsService.getTopAssists.and.returnValue(of(mockApiResponse));

      component.tournamentId = 1;
      component.ngOnChanges({
        tournamentId: {
          currentValue: 1,
          previousValue: undefined,
          firstChange: true,
          isFirstChange: () => true,
        },
      });

      expect(playerStatisticsService.getTopAssists).toHaveBeenCalledWith(1, 50);
      expect(component.assistTable).toEqual(mockAssistTable);
      expect(component.loading).toBeFalse();
    });

    it('should not load assists when tournamentId is not provided', () => {
      component.ngOnChanges({});
      expect(playerStatisticsService.getTopAssists).not.toHaveBeenCalled();
    });
  });

  describe('loadAssists', () => {
    it('should set loading to true while fetching', () => {
      playerStatisticsService.getTopAssists.and.returnValue(of(mockApiResponse));
      component.tournamentId = 1;

      component.loadAssists();

      expect(component.loading).toBeFalse();
      expect(component.assistTable).toEqual(mockAssistTable);
    });

    it('should handle error when loading assists fails', () => {
      playerStatisticsService.getTopAssists.and.returnValue(throwError(() => new Error('Network error')));
      component.tournamentId = 1;

      component.loadAssists();

      expect(component.loading).toBeFalse();
      expect(component.error).toBe('Error loading assists');
      expect(component.assistTable).toBeNull();
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
