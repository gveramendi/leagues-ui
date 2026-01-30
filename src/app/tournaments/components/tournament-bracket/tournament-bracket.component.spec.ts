import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { TournamentBracketComponent } from './tournament-bracket.component';
import { MatchService } from '@core';
import { ApiResponse, MatchSummaryResponse } from '../../../core/models/response';

describe('TournamentBracketComponent', () => {
  let component: TournamentBracketComponent;
  let fixture: ComponentFixture<TournamentBracketComponent>;
  let matchService: jasmine.SpyObj<MatchService>;

  const mockSingleEliminationMatches: MatchSummaryResponse[] = [
    {
      id: 1,
      tournamentId: 1,
      matchday: 1,
      homeTeamId: 10,
      homeTeamName: 'Team A',
      awayTeamId: 20,
      awayTeamName: 'Team B',
      homeScore: 2,
      awayScore: 1,
      status: 'FINISHED',
      round: 'SEMI_FINALS',
      phaseName: 'SEMI_FINALS',
    },
    {
      id: 2,
      tournamentId: 1,
      matchday: 1,
      homeTeamId: 30,
      homeTeamName: 'Team C',
      awayTeamId: 40,
      awayTeamName: 'Team D',
      homeScore: 0,
      awayScore: 3,
      status: 'FINISHED',
      round: 'SEMI_FINALS',
      phaseName: 'SEMI_FINALS',
    },
    {
      id: 3,
      tournamentId: 1,
      matchday: 2,
      homeTeamId: 10,
      homeTeamName: 'Team A',
      awayTeamId: 40,
      awayTeamName: 'Team D',
      homeScore: 1,
      awayScore: 2,
      status: 'FINISHED',
      round: 'FINAL',
      phaseName: 'FINAL',
    },
  ];

  const mockDoubleEliminationMatches: MatchSummaryResponse[] = [
    {
      id: 1,
      tournamentId: 1,
      matchday: 1,
      homeTeamId: 10,
      homeTeamName: 'Team A',
      awayTeamId: 20,
      awayTeamName: 'Team B',
      homeScore: 2,
      awayScore: 1,
      status: 'FINISHED',
      round: 'WB_SEMI_FINALS',
      phaseName: 'WB_SEMI_FINALS',
    },
    {
      id: 2,
      tournamentId: 1,
      matchday: 1,
      homeTeamId: 30,
      homeTeamName: 'Team C',
      awayTeamId: 40,
      awayTeamName: 'Team D',
      homeScore: 0,
      awayScore: 3,
      status: 'FINISHED',
      round: 'WB_SEMI_FINALS',
      phaseName: 'WB_SEMI_FINALS',
    },
    {
      id: 3,
      tournamentId: 1,
      matchday: 2,
      homeTeamId: 20,
      homeTeamName: 'Team B',
      awayTeamId: 30,
      awayTeamName: 'Team C',
      homeScore: 2,
      awayScore: 0,
      status: 'FINISHED',
      round: 'LB_ROUND_1',
      phaseName: 'LB_ROUND_1',
    },
    {
      id: 4,
      tournamentId: 1,
      matchday: 3,
      homeTeamId: 10,
      homeTeamName: 'Team A',
      awayTeamId: 40,
      awayTeamName: 'Team D',
      homeScore: 3,
      awayScore: 2,
      status: 'FINISHED',
      round: 'GRAND_FINAL',
      phaseName: 'GRAND_FINAL',
    },
  ];

  const mockGroupStageMatches: MatchSummaryResponse[] = [
    // Group stage matches (should be filtered out)
    {
      id: 1,
      tournamentId: 1,
      matchday: 1,
      homeTeamId: 10,
      homeTeamName: 'Team A',
      awayTeamId: 20,
      awayTeamName: 'Team B',
      homeScore: 1,
      awayScore: 1,
      status: 'FINISHED',
      round: 'GROUP_STAGE',
      phaseName: 'GROUP_STAGE',
    },
    // Knockout matches (should be included)
    {
      id: 10,
      tournamentId: 1,
      matchday: 1,
      homeTeamId: 10,
      homeTeamName: 'Team A',
      awayTeamId: 30,
      awayTeamName: 'Team C',
      homeScore: 2,
      awayScore: 0,
      status: 'FINISHED',
      round: 'QUARTER_FINALS',
      phaseName: 'QUARTER_FINALS',
    },
    {
      id: 11,
      tournamentId: 1,
      matchday: 2,
      homeTeamId: 10,
      homeTeamName: 'Team A',
      awayTeamId: 40,
      awayTeamName: 'Team D',
      homeScore: 1,
      awayScore: 0,
      status: 'FINISHED',
      round: 'FINAL',
      phaseName: 'FINAL',
    },
  ];

  const mockSwissMatches: MatchSummaryResponse[] = [
    // Swiss phase matches (should be filtered out)
    {
      id: 1,
      tournamentId: 1,
      matchday: 1,
      homeTeamId: 10,
      homeTeamName: 'Team A',
      awayTeamId: 20,
      awayTeamName: 'Team B',
      homeScore: 2,
      awayScore: 1,
      status: 'FINISHED',
      round: 'SWISS_ROUND_1',
      phaseName: 'SWISS_ROUND_1',
    },
    // Playoff matches (should be included)
    {
      id: 10,
      tournamentId: 1,
      matchday: 1,
      homeTeamId: 10,
      homeTeamName: 'Team A',
      awayTeamId: 30,
      awayTeamName: 'Team C',
      homeScore: 2,
      awayScore: 0,
      status: 'FINISHED',
      round: 'PLAYOFF',
      phaseName: 'PLAYOFF',
    },
    {
      id: 11,
      tournamentId: 1,
      matchday: 2,
      homeTeamId: 10,
      homeTeamName: 'Team A',
      awayTeamId: 40,
      awayTeamName: 'Team D',
      status: 'SCHEDULED',
      round: 'FINAL',
      phaseName: 'FINAL',
    },
  ];

  const createMockResponse = (data: MatchSummaryResponse[]): ApiResponse<MatchSummaryResponse[]> => ({
    header: { success: true, statusCode: 200, message: 'Success' },
    body: { data },
  });

  beforeEach(async () => {
    const matchServiceSpy = jasmine.createSpyObj('MatchService', ['getByTournament']);

    await TestBed.configureTestingModule({
      imports: [
        TournamentBracketComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [{ provide: MatchService, useValue: matchServiceSpy }],
    }).compileComponents();

    matchService = TestBed.inject(MatchService) as jasmine.SpyObj<MatchService>;
    matchService.getByTournament.and.returnValue(of(createMockResponse(mockSingleEliminationMatches)));

    fixture = TestBed.createComponent(TournamentBracketComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load bracket when tournamentId is provided', () => {
      component.tournamentId = 1;
      component.ngOnInit();

      expect(matchService.getByTournament).toHaveBeenCalledWith(1, 0, 200);
      expect(component.loading).toBeFalse();
    });

    it('should not load bracket when tournamentId is not provided', () => {
      component.ngOnInit();
      expect(matchService.getByTournament).not.toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('should reload bracket when tournamentId changes after first change', () => {
      component.tournamentId = 2;
      component.ngOnChanges({
        tournamentId: {
          currentValue: 2,
          previousValue: 1,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(matchService.getByTournament).toHaveBeenCalledWith(2, 0, 200);
    });

    it('should not reload bracket on first change', () => {
      component.tournamentId = 1;
      component.ngOnChanges({
        tournamentId: {
          currentValue: 1,
          previousValue: undefined,
          firstChange: true,
          isFirstChange: () => true,
        },
      });

      expect(matchService.getByTournament).not.toHaveBeenCalled();
    });

    it('should reload bracket when tournamentFormat changes after first change', () => {
      component.tournamentId = 1;
      component.ngOnChanges({
        tournamentFormat: {
          currentValue: 'DOUBLE_ELIMINATION',
          previousValue: 'SINGLE_ELIMINATION',
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(matchService.getByTournament).toHaveBeenCalled();
    });
  });

  describe('isDoubleElimination', () => {
    it('should return true for DOUBLE_ELIMINATION format', () => {
      component.tournamentFormat = 'DOUBLE_ELIMINATION';
      expect(component.isDoubleElimination).toBeTrue();
    });

    it('should return false for SINGLE_ELIMINATION format', () => {
      component.tournamentFormat = 'SINGLE_ELIMINATION';
      expect(component.isDoubleElimination).toBeFalse();
    });

    it('should return false for GROUP_STAGE_DOUBLE format', () => {
      component.tournamentFormat = 'GROUP_STAGE_DOUBLE';
      expect(component.isDoubleElimination).toBeFalse();
    });
  });

  describe('isGroupStageFormat', () => {
    it('should return true for GROUP_STAGE format', () => {
      component.tournamentFormat = 'GROUP_STAGE';
      expect(component.isGroupStageFormat).toBeTrue();
    });

    it('should return true for GROUP_STAGE_SINGLE format', () => {
      component.tournamentFormat = 'GROUP_STAGE_SINGLE';
      expect(component.isGroupStageFormat).toBeTrue();
    });

    it('should return true for GROUP_STAGE_DOUBLE format', () => {
      component.tournamentFormat = 'GROUP_STAGE_DOUBLE';
      expect(component.isGroupStageFormat).toBeTrue();
    });

    it('should return false for SINGLE_ELIMINATION format', () => {
      component.tournamentFormat = 'SINGLE_ELIMINATION';
      expect(component.isGroupStageFormat).toBeFalse();
    });
  });

  describe('isSwissFormat', () => {
    it('should return true for SWISS format', () => {
      component.tournamentFormat = 'SWISS';
      expect(component.isSwissFormat).toBeTrue();
    });

    it('should return false for other formats', () => {
      component.tournamentFormat = 'LEAGUE';
      expect(component.isSwissFormat).toBeFalse();
    });
  });

  describe('useDoubleEliminationLayout', () => {
    it('should return true only for DOUBLE_ELIMINATION format', () => {
      component.tournamentFormat = 'DOUBLE_ELIMINATION';
      expect(component.useDoubleEliminationLayout).toBeTrue();
    });

    it('should return false for GROUP_STAGE_DOUBLE format', () => {
      component.tournamentFormat = 'GROUP_STAGE_DOUBLE';
      expect(component.useDoubleEliminationLayout).toBeFalse();
    });
  });

  describe('loadBracket - Single Elimination', () => {
    beforeEach(() => {
      matchService.getByTournament.and.returnValue(of(createMockResponse(mockSingleEliminationMatches)));
    });

    it('should organize matches into rounds for single elimination', () => {
      component.tournamentId = 1;
      component.tournamentFormat = 'SINGLE_ELIMINATION';
      component.loadBracket();

      expect(component.rounds.length).toBe(2); // SEMI_FINALS and FINAL
      expect(component.rounds.find((r) => r.name === 'Semifinales')).toBeTruthy();
      expect(component.rounds.find((r) => r.name === 'Final')).toBeTruthy();
    });

    it('should sort rounds by order', () => {
      component.tournamentId = 1;
      component.tournamentFormat = 'SINGLE_ELIMINATION';
      component.loadBracket();

      const roundNames = component.rounds.map((r) => r.name);
      expect(roundNames).toEqual(['Semifinales', 'Final']);
    });
  });

  describe('loadBracket - Double Elimination', () => {
    beforeEach(() => {
      matchService.getByTournament.and.returnValue(of(createMockResponse(mockDoubleEliminationMatches)));
    });

    it('should separate matches into winners, losers, and grand final brackets', () => {
      component.tournamentId = 1;
      component.tournamentFormat = 'DOUBLE_ELIMINATION';
      component.loadBracket();

      expect(component.winnersBracket.length).toBeGreaterThan(0);
      expect(component.losersBracket.length).toBeGreaterThan(0);
      expect(component.grandFinal).toBeTruthy();
    });

    it('should correctly identify winners bracket rounds', () => {
      component.tournamentId = 1;
      component.tournamentFormat = 'DOUBLE_ELIMINATION';
      component.loadBracket();

      const hasWBSemis = component.winnersBracket.some((r) => r.name.includes('WB Semifinal'));
      expect(hasWBSemis).toBeTrue();
    });

    it('should correctly identify losers bracket rounds', () => {
      component.tournamentId = 1;
      component.tournamentFormat = 'DOUBLE_ELIMINATION';
      component.loadBracket();

      const hasLBRound = component.losersBracket.some((r) => r.name.includes('LB Ronda'));
      expect(hasLBRound).toBeTrue();
    });

    it('should have grand final matches', () => {
      component.tournamentId = 1;
      component.tournamentFormat = 'DOUBLE_ELIMINATION';
      component.loadBracket();

      expect(component.grandFinal).toBeTruthy();
      expect(component.grandFinal!.matches.length).toBe(1);
    });
  });

  describe('loadBracket - Group Stage Format', () => {
    beforeEach(() => {
      matchService.getByTournament.and.returnValue(of(createMockResponse(mockGroupStageMatches)));
    });

    it('should filter out group stage matches and only show knockout rounds', () => {
      component.tournamentId = 1;
      component.tournamentFormat = 'GROUP_STAGE_SINGLE';
      component.loadBracket();

      // Should only have QUARTER_FINALS and FINAL, not GROUP_STAGE
      expect(component.rounds.some((r) => r.name === 'GROUP_STAGE' || r.name === 'Fase de Grupos')).toBeFalse();
      expect(component.rounds.length).toBe(2);
    });

    it('should include quarter finals in bracket', () => {
      component.tournamentId = 1;
      component.tournamentFormat = 'GROUP_STAGE_SINGLE';
      component.loadBracket();

      const hasQuarterFinals = component.rounds.some((r) => r.name === 'Cuartos de Final');
      expect(hasQuarterFinals).toBeTrue();
    });
  });

  describe('loadBracket - Swiss Format', () => {
    beforeEach(() => {
      matchService.getByTournament.and.returnValue(of(createMockResponse(mockSwissMatches)));
    });

    it('should filter out Swiss phase matches and show playoff/knockout rounds', () => {
      component.tournamentId = 1;
      component.tournamentFormat = 'SWISS';
      component.loadBracket();

      // Should only have PLAYOFF and FINAL, not SWISS_ROUND
      expect(component.rounds.some((r) => r.name.includes('SWISS'))).toBeFalse();
      expect(component.rounds.length).toBe(2);
    });

    it('should include playoff rounds in bracket', () => {
      component.tournamentId = 1;
      component.tournamentFormat = 'SWISS';
      component.loadBracket();

      const hasPlayoff = component.rounds.some((r) => r.name === 'Playoff');
      expect(hasPlayoff).toBeTrue();
    });
  });

  describe('loadBracket - Error Handling', () => {
    it('should handle error when loading bracket', () => {
      matchService.getByTournament.and.returnValue(throwError(() => new Error('Network error')));

      component.tournamentId = 1;
      component.loadBracket();

      expect(component.loading).toBeFalse();
      expect(component.error).toBe('Error loading bracket');
    });
  });

  describe('isWinner', () => {
    it('should return true for home team when home score is higher', () => {
      const match = {
        id: 1,
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 3,
        awayScore: 1,
        winnerId: 10,
        status: 'FINISHED',
        homePenalties: null,
        awayPenalties: null,
      };

      expect(component.isWinner(match, 'home')).toBeTrue();
      expect(component.isWinner(match, 'away')).toBeFalse();
    });

    it('should return true for away team when away score is higher', () => {
      const match = {
        id: 1,
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 1,
        awayScore: 3,
        winnerId: 20,
        status: 'FINISHED',
        homePenalties: null,
        awayPenalties: null,
      };

      expect(component.isWinner(match, 'home')).toBeFalse();
      expect(component.isWinner(match, 'away')).toBeTrue();
    });

    it('should check penalties when scores are tied', () => {
      const match = {
        id: 1,
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 2,
        awayScore: 2,
        winnerId: 10,
        status: 'FINISHED',
        homePenalties: 5,
        awayPenalties: 3,
      };

      expect(component.isWinner(match, 'home')).toBeTrue();
      expect(component.isWinner(match, 'away')).toBeFalse();
    });

    it('should return false when match is not finished', () => {
      const match = {
        id: 1,
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: null,
        awayScore: null,
        winnerId: null,
        status: 'SCHEDULED',
        homePenalties: null,
        awayPenalties: null,
      };

      expect(component.isWinner(match, 'home')).toBeFalse();
      expect(component.isWinner(match, 'away')).toBeFalse();
    });
  });

  describe('getMatchStatusClass', () => {
    it('should return status-finished for FINISHED status', () => {
      expect(component.getMatchStatusClass('FINISHED')).toBe('status-finished');
    });

    it('should return status-live for IN_PROGRESS status', () => {
      expect(component.getMatchStatusClass('IN_PROGRESS')).toBe('status-live');
    });

    it('should return status-scheduled for SCHEDULED status', () => {
      expect(component.getMatchStatusClass('SCHEDULED')).toBe('status-scheduled');
    });

    it('should return empty string for unknown status', () => {
      expect(component.getMatchStatusClass('UNKNOWN')).toBe('');
    });
  });

  describe('getScoreDisplay', () => {
    it('should return "vs" for scheduled match', () => {
      const match = {
        id: 1,
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: null,
        awayScore: null,
        winnerId: null,
        status: 'SCHEDULED',
        homePenalties: null,
        awayPenalties: null,
      };

      expect(component.getScoreDisplay(match)).toBe('vs');
    });

    it('should return score for finished match', () => {
      const match = {
        id: 1,
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 2,
        awayScore: 1,
        winnerId: 10,
        status: 'FINISHED',
        homePenalties: null,
        awayPenalties: null,
      };

      expect(component.getScoreDisplay(match)).toBe('2 - 1');
    });

    it('should include penalties in score display', () => {
      const match = {
        id: 1,
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 2,
        awayScore: 2,
        winnerId: 10,
        status: 'FINISHED',
        homePenalties: 5,
        awayPenalties: 4,
      };

      expect(component.getScoreDisplay(match)).toBe('2 - 2 (5-4 pen)');
    });
  });

  describe('getChampion', () => {
    it('should return champion for single elimination', () => {
      component.tournamentFormat = 'SINGLE_ELIMINATION';
      component.rounds = [
        {
          name: 'Final',
          order: 8,
          matches: [
            {
              id: 1,
              homeTeam: 'Team A',
              awayTeam: 'Team D',
              homeScore: 1,
              awayScore: 2,
              winnerId: 40,
              status: 'FINISHED',
              homePenalties: null,
              awayPenalties: null,
            },
          ],
        },
      ];

      expect(component.getChampion()).toBe('Team D');
    });

    it('should return champion for double elimination', () => {
      component.tournamentFormat = 'DOUBLE_ELIMINATION';
      component.grandFinal = {
        name: 'Gran Final',
        order: 100,
        matches: [
          {
            id: 1,
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            homeScore: 3,
            awayScore: 2,
            winnerId: 10,
            status: 'FINISHED',
            homePenalties: null,
            awayPenalties: null,
          },
        ],
        bracketType: 'grand_final',
      };

      expect(component.getChampion()).toBe('Team A');
    });

    it('should return null when final is not finished', () => {
      component.tournamentFormat = 'SINGLE_ELIMINATION';
      component.rounds = [
        {
          name: 'Final',
          order: 8,
          matches: [
            {
              id: 1,
              homeTeam: 'Team A',
              awayTeam: 'Team D',
              homeScore: null,
              awayScore: null,
              winnerId: null,
              status: 'SCHEDULED',
              homePenalties: null,
              awayPenalties: null,
            },
          ],
        },
      ];

      expect(component.getChampion()).toBeNull();
    });

    it('should return null when no final exists', () => {
      component.tournamentFormat = 'SINGLE_ELIMINATION';
      component.rounds = [];

      expect(component.getChampion()).toBeNull();
    });
  });

  describe('hasChampion', () => {
    it('should return true when champion exists', () => {
      component.tournamentFormat = 'SINGLE_ELIMINATION';
      component.rounds = [
        {
          name: 'Final',
          order: 8,
          matches: [
            {
              id: 1,
              homeTeam: 'Team A',
              awayTeam: 'Team D',
              homeScore: 2,
              awayScore: 1,
              winnerId: 10,
              status: 'FINISHED',
              homePenalties: null,
              awayPenalties: null,
            },
          ],
        },
      ];

      expect(component.hasChampion()).toBeTrue();
    });

    it('should return false when no champion', () => {
      component.tournamentFormat = 'SINGLE_ELIMINATION';
      component.rounds = [];

      expect(component.hasChampion()).toBeFalse();
    });
  });
});
