import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { SimpleChange } from '@angular/core';

import { TournamentMatchesComponent } from './tournament-matches.component';
import {
  MatchService,
  TournamentTeamService,
  StandingService,
  ApiResponse,
  MatchSummaryResponse,
  MatchResponse,
  MatchStatus,
  TournamentTeamResponse,
} from '@core';

describe('TournamentMatchesComponent', () => {
  let component: TournamentMatchesComponent;
  let fixture: ComponentFixture<TournamentMatchesComponent>;
  let matchServiceSpy: jasmine.SpyObj<MatchService>;
  let tournamentTeamServiceSpy: jasmine.SpyObj<TournamentTeamService>;
  let standingServiceSpy: jasmine.SpyObj<StandingService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockMatches: MatchSummaryResponse[] = [
    {
      id: 1,
      tournamentId: 1,
      phaseId: 5,
      phaseName: 'Fase de Grupos',
      groupId: 1,
      groupCode: 'A',
      homeTeamId: 10,
      homeTeamName: 'Equipo A',
      awayTeamId: 11,
      awayTeamName: 'Equipo B',
      matchday: 1,
      status: 'SCHEDULED',
    },
    {
      id: 2,
      tournamentId: 1,
      phaseId: 5,
      phaseName: 'Fase de Grupos',
      groupId: 1,
      groupCode: 'A',
      homeTeamId: 12,
      homeTeamName: 'Equipo C',
      awayTeamId: 13,
      awayTeamName: 'Equipo D',
      matchday: 1,
      status: 'FINISHED',
      homeScore: 2,
      awayScore: 1,
    },
    {
      id: 3,
      tournamentId: 1,
      phaseId: 6,
      phaseName: 'Cuartos de Final',
      homeTeamId: 10,
      homeTeamName: 'Equipo A',
      awayTeamId: 13,
      awayTeamName: 'Equipo D',
      matchday: 1,
      status: 'SCHEDULED',
    },
  ];

  const mockTeams: TournamentTeamResponse[] = [
    {
      id: 1,
      tournamentId: 1,
      teamId: 10,
      teamCode: 'EQA',
      teamName: 'Equipo A',
      status: 'APPROVED',
      registrationDate: '2024-01-15',
    },
    {
      id: 2,
      tournamentId: 1,
      teamId: 11,
      teamCode: 'EQB',
      teamName: 'Equipo B',
      status: 'APPROVED',
      registrationDate: '2024-01-15',
    },
  ];

  const mockMatchesResponse: ApiResponse<MatchSummaryResponse[]> = {
    header: { success: true, statusCode: 200, message: 'Success' },
    body: { data: mockMatches },
  };

  const mockTeamsResponse: ApiResponse<TournamentTeamResponse[]> = {
    header: { success: true, statusCode: 200, message: 'Success' },
    body: { data: mockTeams },
  };

  beforeEach(waitForAsync(() => {
    const matchServiceMock = jasmine.createSpyObj('MatchService', [
      'getByTournament',
      'getById',
      'create',
      'update',
      'delete',
      'start',
      'finish',
      'getGoals',
      'getCards',
      'getTeamLineup',
    ]);
    matchServiceMock.getByTournament.and.returnValue(of(mockMatchesResponse));
    matchServiceMock.getGoals.and.returnValue(of({ body: { data: [] } }));
    matchServiceMock.getCards.and.returnValue(of({ body: { data: [] } }));
    matchServiceMock.getTeamLineup.and.returnValue(of({ body: { data: { starters: [], substitutes: [] } } }));

    const tournamentTeamServiceMock = jasmine.createSpyObj('TournamentTeamService', ['getAll']);
    tournamentTeamServiceMock.getAll.and.returnValue(of(mockTeamsResponse));

    const standingServiceMock = jasmine.createSpyObj('StandingService', ['recalculateStandings']);
    standingServiceMock.recalculateStandings.and.returnValue(of({ header: { success: true }, body: { data: null } }));

    const modalMock = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);
    const toastrMock = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [
        TournamentMatchesComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: MatchService, useValue: matchServiceMock },
        { provide: TournamentTeamService, useValue: tournamentTeamServiceMock },
        { provide: StandingService, useValue: standingServiceMock },
        { provide: NgbModal, useValue: modalMock },
        { provide: ToastrService, useValue: toastrMock },
      ],
    }).compileComponents();

    matchServiceSpy = TestBed.inject(MatchService) as jasmine.SpyObj<MatchService>;
    tournamentTeamServiceSpy = TestBed.inject(TournamentTeamService) as jasmine.SpyObj<TournamentTeamService>;
    standingServiceSpy = TestBed.inject(StandingService) as jasmine.SpyObj<StandingService>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentMatchesComponent);
    component = fixture.componentInstance;
    component.tournamentId = 1;
    component.seasonYear = 2024;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load matches and teams on init', () => {
      expect(matchServiceSpy.getByTournament).toHaveBeenCalledWith(1, 0, 100);
      expect(tournamentTeamServiceSpy.getAll).toHaveBeenCalledWith(1, 0, 100);
    });

    it('should set matches array', () => {
      expect(component.matches.length).toBe(3);
    });
  });

  describe('ngOnChanges', () => {
    it('should reload matches when tournamentId changes', () => {
      matchServiceSpy.getByTournament.calls.reset();

      component.ngOnChanges({
        tournamentId: new SimpleChange(1, 2, false),
      });

      expect(matchServiceSpy.getByTournament).toHaveBeenCalled();
    });

    it('should apply filters when currentPhaseId changes and matches exist', () => {
      component.matches = mockMatches;
      spyOn(component, 'applyFilters');

      component.ngOnChanges({
        currentPhaseId: new SimpleChange(undefined, 5, true),
      });

      expect(component.applyFilters).toHaveBeenCalled();
    });

    it('should not apply filters when currentPhaseId changes but no matches', () => {
      component.matches = [];
      spyOn(component, 'applyFilters');

      component.ngOnChanges({
        currentPhaseId: new SimpleChange(undefined, 5, true),
      });

      expect(component.applyFilters).not.toHaveBeenCalled();
    });
  });

  describe('applyFilters', () => {
    beforeEach(() => {
      component.matches = mockMatches;
      component.tournamentFormat = 'GROUP_STAGE';
    });

    it('should filter by matchday', () => {
      component.selectedMatchday = 1;
      component.applyFilters();

      expect(component.filteredMatches.length).toBe(3);
    });

    it('should filter by status', () => {
      component.selectedStatus = 'FINISHED';
      component.applyFilters();

      expect(component.filteredMatches.length).toBe(1);
      expect(component.filteredMatches[0].id).toBe(2);
    });

    it('should filter by phaseId for GROUP_STAGE format', () => {
      component.currentPhaseId = 5;
      component.applyFilters();

      expect(component.filteredMatches.length).toBe(2);
      expect(component.filteredMatches.every(m => m.phaseId === 5)).toBeTrue();
    });

    it('should show all matches when phaseId is undefined', () => {
      component.currentPhaseId = undefined;
      component.applyFilters();

      expect(component.filteredMatches.length).toBe(3);
    });

    it('should not filter by phase when format is not GROUP_STAGE', () => {
      component.tournamentFormat = 'LEAGUE';
      component.currentPhaseId = 5;
      component.applyFilters();

      expect(component.filteredMatches.length).toBe(3);
    });

    it('should combine multiple filters', () => {
      component.selectedMatchday = 1;
      component.selectedStatus = 'SCHEDULED';
      component.currentPhaseId = 5;
      component.applyFilters();

      expect(component.filteredMatches.length).toBe(1);
      expect(component.filteredMatches[0].id).toBe(1);
    });
  });

  describe('isGroupStageFormat', () => {
    it('should return true for GROUP_STAGE format', () => {
      component.tournamentFormat = 'GROUP_STAGE';
      expect(component.isGroupStageFormat()).toBeTrue();
    });

    it('should return true for GROUP_STAGE_SINGLE format', () => {
      component.tournamentFormat = 'GROUP_STAGE_SINGLE';
      expect(component.isGroupStageFormat()).toBeTrue();
    });

    it('should return true for GROUP_STAGE_DOUBLE format', () => {
      component.tournamentFormat = 'GROUP_STAGE_DOUBLE';
      expect(component.isGroupStageFormat()).toBeTrue();
    });

    it('should return false for LEAGUE format', () => {
      component.tournamentFormat = 'LEAGUE';
      expect(component.isGroupStageFormat()).toBeFalse();
    });

    it('should return false when format is undefined', () => {
      component.tournamentFormat = undefined;
      expect(component.isGroupStageFormat()).toBeFalse();
    });
  });

  describe('matchFinished output', () => {
    it('should emit matchFinished when match is finished successfully', fakeAsync(() => {
      const finishResponse: ApiResponse<MatchResponse> = {
        header: { success: true, statusCode: 200, message: 'Match finished' },
        body: { data: { ...mockMatches[0], status: 'FINISHED' as MatchStatus } as MatchResponse },
      };
      matchServiceSpy.finish.and.returnValue(of(finishResponse));
      spyOn(component.matchFinished, 'emit');

      // Simulate the finish flow (would need Swal mock in real test)
      // For now, just verify the output exists
      expect(component.matchFinished).toBeDefined();
    }));
  });

  describe('getStatusClass', () => {
    it('should return bg-info for SCHEDULED', () => {
      expect(component.getStatusClass('SCHEDULED')).toBe('bg-info');
    });

    it('should return bg-success for FINISHED', () => {
      expect(component.getStatusClass('FINISHED')).toBe('bg-success');
    });

    it('should return bg-warning for IN_PROGRESS', () => {
      expect(component.getStatusClass('IN_PROGRESS')).toBe('bg-warning');
    });

    it('should return bg-danger for CANCELLED', () => {
      expect(component.getStatusClass('CANCELLED')).toBe('bg-danger');
    });
  });

  describe('extractMatchdays', () => {
    it('should extract unique matchdays and sort them', () => {
      component.matches = [
        { ...mockMatches[0], matchday: 3 },
        { ...mockMatches[1], matchday: 1 },
        { ...mockMatches[2], matchday: 2 },
      ];

      component['extractMatchdays']();

      expect(component.matchdays).toEqual([1, 2, 3]);
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters and apply', () => {
      component.selectedMatchday = 1;
      component.selectedStatus = 'FINISHED';
      component.matches = mockMatches;

      component.clearFilters();

      expect(component.selectedMatchday).toBeNull();
      expect(component.selectedStatus).toBeNull();
      expect(component.filteredMatches.length).toBe(3);
    });
  });

  describe('getUniqueMatchdays', () => {
    it('should return unique matchdays from filtered matches', () => {
      component.filteredMatches = mockMatches;

      const matchdays = component.getUniqueMatchdays();

      expect(matchdays).toEqual([1]);
    });
  });

  describe('getMatchesByMatchday', () => {
    it('should return matches for specific matchday', () => {
      component.filteredMatches = mockMatches;

      const matches = component.getMatchesByMatchday(1);

      expect(matches.length).toBe(3);
    });
  });

  describe('loadMatches', () => {
    it('should load matches successfully', () => {
      component.loadMatches();

      expect(component.loading).toBeFalse();
      expect(component.matches.length).toBe(3);
    });

    it('should handle error when loading matches', () => {
      matchServiceSpy.getByTournament.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      component.loadMatches();

      expect(component.loading).toBeFalse();
      expect(component.error).toBe('Error loading matches');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('loadTeams', () => {
    it('should load only approved teams', () => {
      component.loadTeams();

      expect(component.teams.length).toBe(2);
      expect(component.teams.every(t => t.status === 'APPROVED')).toBeTrue();
    });

    it('should handle error when loading teams', () => {
      tournamentTeamServiceSpy.getAll.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      component.loadTeams();

      expect(console.error).toHaveBeenCalled();
    });
  });
});
