import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { TournamentDetailComponent } from './tournament-detail.component';
import {
  TournamentService,
  TournamentTeamService,
  TeamService,
  StandingService,
  ApiResponse,
  TournamentResponse,
  TournamentTeamResponse,
  TeamResponse,
  PhaseStatusResponse,
  PhaseAdvancementResponse,
  StandingTableResponse,
} from '@core';

describe('TournamentDetailComponent', () => {
  let component: TournamentDetailComponent;
  let fixture: ComponentFixture<TournamentDetailComponent>;
  let tournamentServiceSpy: jasmine.SpyObj<TournamentService>;
  let tournamentTeamServiceSpy: jasmine.SpyObj<TournamentTeamService>;
  let teamServiceSpy: jasmine.SpyObj<TeamService>;
  let standingServiceSpy: jasmine.SpyObj<StandingService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let router: Router;
  let routeParamsSubject: Subject<{ tournamentId: string }>;

  const mockTournament: TournamentResponse = {
    id: 1,
    code: 'LIGA2024',
    name: 'Liga Nacional 2024',
    shortName: 'Liga 2024',
    format: 'LEAGUE',
    status: 'REGISTRATION_OPEN',
    category: 'PRIMERA',
    gender: 'MALE',
    footballType: 'FOOTBALL_11',
    seasonYear: 2024,
    minTeams: 10,
    maxTeams: 20,
    registeredTeamsCount: 5,
    approvedTeamsCount: 3,
  };

  const mockTournamentTeam: TournamentTeamResponse = {
    id: 1,
    tournamentId: 1,
    teamId: 101,
    teamCode: 'TEAM01',
    teamName: 'Equipo Uno',
    clubName: 'Club Uno',
    registrationNumber: 1,
    status: 'PENDING',
    registrationDate: '2024-01-15',
  };

  const mockTournamentTeams: TournamentTeamResponse[] = [
    mockTournamentTeam,
    {
      id: 2,
      tournamentId: 1,
      teamId: 102,
      teamCode: 'TEAM02',
      teamName: 'Equipo Dos',
      clubName: 'Club Dos',
      registrationNumber: 2,
      status: 'APPROVED',
      registrationDate: '2024-01-16',
    },
    {
      id: 3,
      tournamentId: 1,
      teamId: 103,
      teamCode: 'TEAM03',
      teamName: 'Equipo Tres',
      clubName: 'Club Tres',
      registrationNumber: 3,
      status: 'REJECTED',
      rejectionReason: 'Documentos incompletos',
      registrationDate: '2024-01-17',
    },
  ];

  const mockTeam: TeamResponse = {
    id: 201,
    code: 'NEWTEAM',
    name: 'Nuevo Equipo',
    clubId: 5,
    clubName: 'Club Nuevo',
    category: 'PRIMERA',
    gender: 'MALE',
    footballType: 'FOOTBALL_11',
    seasonYear: 2024,
    status: 'ACTIVE',
  };

  const mockTeams: TeamResponse[] = [
    mockTeam,
    {
      id: 202,
      code: 'OTHERTEAM',
      name: 'Otro Equipo',
      clubId: 6,
      clubName: 'Club Otro',
      category: 'PRIMERA',
      gender: 'MALE',
      footballType: 'FOOTBALL_11',
      seasonYear: 2024,
      status: 'ACTIVE',
    },
  ];

  const mockTournamentResponse: ApiResponse<TournamentResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Tournament retrieved successfully',
    },
    body: {
      data: mockTournament,
    },
  };

  const mockTeamsListResponse: ApiResponse<TournamentTeamResponse[]> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Teams retrieved successfully',
    },
    body: {
      data: mockTournamentTeams,
    },
  };

  const mockSearchTeamsResponse: ApiResponse<TeamResponse[]> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Teams retrieved successfully',
    },
    body: {
      data: mockTeams,
      pagination: {
        totalElements: 2,
        totalPages: 1,
        size: 20,
        number: 0,
        first: true,
        last: true,
        empty: false,
      },
    },
  };

  const mockRegisterResponse: ApiResponse<TournamentTeamResponse> = {
    header: {
      success: true,
      statusCode: 201,
      message: 'Team registered successfully',
    },
    body: {
      data: mockTournamentTeam,
    },
  };

  const mockApproveResponse: ApiResponse<TournamentTeamResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Team approved successfully',
    },
    body: {
      data: { ...mockTournamentTeam, status: 'APPROVED' },
    },
  };

  const mockRejectResponse: ApiResponse<TournamentTeamResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Team rejected successfully',
    },
    body: {
      data: { ...mockTournamentTeam, status: 'REJECTED' },
    },
  };

  const mockWithdrawResponse: ApiResponse<TournamentTeamResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Team withdrawn successfully',
    },
    body: {
      data: { ...mockTournamentTeam, status: 'WITHDRAWN' },
    },
  };

  const mockDeleteResponse: ApiResponse<void> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Team registration deleted successfully',
    },
    body: {
      data: undefined as unknown as void,
    },
  };

  const mockOpenRegistrationResponse: ApiResponse<TournamentResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Registration opened successfully',
    },
    body: {
      data: { ...mockTournament, status: 'REGISTRATION_OPEN' },
    },
  };

  const mockCloseRegistrationResponse: ApiResponse<TournamentResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Registration closed successfully',
    },
    body: {
      data: { ...mockTournament, status: 'REGISTRATION_CLOSED' },
    },
  };

  const mockStartResponse: ApiResponse<TournamentResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Tournament started successfully',
    },
    body: {
      data: { ...mockTournament, status: 'IN_PROGRESS' },
    },
  };

  const mockFinishResponse: ApiResponse<TournamentResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Tournament finished successfully',
    },
    body: {
      data: { ...mockTournament, status: 'FINISHED' },
    },
  };

  const mockPhaseStatus: PhaseStatusResponse = {
    tournamentId: 1,
    tournamentName: 'Liga 2024',
    currentPhaseId: 5,
    currentPhaseName: 'Fase de Grupos',
    currentPhaseType: 'GROUP_STAGE',
    currentPhaseStatus: 'IN_PROGRESS',
    totalMatches: 24,
    finishedMatches: 24,
    pendingMatches: 0,
    inProgressMatches: 0,
    canAdvance: true,
    nextPhaseType: 'QUARTER_FINALS',
    nextPhaseName: 'Cuartos de Final',
    tournamentComplete: false,
  };

  const mockPhaseStatusResponse: ApiResponse<PhaseStatusResponse> = {
    header: { success: true, statusCode: 200, message: 'Success' },
    body: { data: mockPhaseStatus },
  };

  const mockPhaseAdvancement: PhaseAdvancementResponse = {
    tournamentId: 1,
    tournamentName: 'Liga 2024',
    previousPhaseId: 5,
    previousPhaseName: 'Fase de Grupos',
    previousPhaseType: 'GROUP_STAGE',
    newPhaseId: 6,
    newPhaseName: 'Cuartos de Final',
    newPhaseType: 'QUARTER_FINALS',
    qualifiedTeams: [
      { teamId: 10, teamName: 'Equipo A', fromGroup: 'Grupo A', groupPosition: 1, points: 9, goalDifference: 5 },
      { teamId: 12, teamName: 'Equipo B', fromGroup: 'Grupo A', groupPosition: 2, points: 6, goalDifference: 2 },
    ],
    totalQualifiedTeams: 8,
    generatedMatches: [
      { matchId: 101, matchNumber: 1, homeTeamName: 'Equipo A', awayTeamName: 'Equipo D', round: 'QUARTER_FINALS' },
    ],
    totalMatchesGenerated: 4,
  };

  const mockPhaseAdvancementResponse: ApiResponse<PhaseAdvancementResponse> = {
    header: { success: true, statusCode: 200, message: 'Fase avanzada exitosamente' },
    body: { data: mockPhaseAdvancement },
  };

  beforeEach(waitForAsync(() => {
    routeParamsSubject = new Subject();

    const tournamentServiceMock = jasmine.createSpyObj('TournamentService', [
      'getById',
      'openRegistration',
      'closeRegistration',
      'start',
      'finish',
      'getPhaseStatus',
      'canAdvance',
      'canAdvanceGroupStage',
      'canAdvanceKnockout',
      'advanceFromGroupStage',
      'advanceKnockout',
    ]);
    tournamentServiceMock.getById.and.returnValue(of(mockTournamentResponse));
    tournamentServiceMock.openRegistration.and.returnValue(of(mockOpenRegistrationResponse));
    tournamentServiceMock.closeRegistration.and.returnValue(of(mockCloseRegistrationResponse));
    tournamentServiceMock.start.and.returnValue(of(mockStartResponse));
    tournamentServiceMock.finish.and.returnValue(of(mockFinishResponse));
    tournamentServiceMock.getPhaseStatus.and.returnValue(of(mockPhaseStatusResponse));
    tournamentServiceMock.canAdvance.and.returnValue(of({ body: { data: true } }));
    tournamentServiceMock.canAdvanceGroupStage.and.returnValue(of({ body: { data: true } }));
    tournamentServiceMock.canAdvanceKnockout.and.returnValue(of({ body: { data: true } }));
    tournamentServiceMock.advanceFromGroupStage.and.returnValue(of(mockPhaseAdvancementResponse));
    tournamentServiceMock.advanceKnockout.and.returnValue(of(mockPhaseAdvancementResponse));

    const tournamentTeamServiceMock = jasmine.createSpyObj('TournamentTeamService', [
      'getAll',
      'registerTeam',
      'approve',
      'reject',
      'withdraw',
      'delete',
    ]);
    tournamentTeamServiceMock.getAll.and.returnValue(of(mockTeamsListResponse));
    tournamentTeamServiceMock.registerTeam.and.returnValue(of(mockRegisterResponse));
    tournamentTeamServiceMock.approve.and.returnValue(of(mockApproveResponse));
    tournamentTeamServiceMock.reject.and.returnValue(of(mockRejectResponse));
    tournamentTeamServiceMock.withdraw.and.returnValue(of(mockWithdrawResponse));
    tournamentTeamServiceMock.delete.and.returnValue(of(mockDeleteResponse));

    const teamServiceMock = jasmine.createSpyObj('TeamService', ['searchTeams']);
    teamServiceMock.searchTeams.and.returnValue(of(mockSearchTeamsResponse));

    const standingServiceMock = jasmine.createSpyObj('StandingService', ['getByTournament']);
    standingServiceMock.getByTournament.and.returnValue(of({
      header: { success: true, statusCode: 200, message: 'Success' },
      body: { data: { tournamentId: 1, standings: [] } as StandingTableResponse },
    }));

    const modalMock = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);
    const toastrMock = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [
        TournamentDetailComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        provideRouter([]),
        { provide: TournamentService, useValue: tournamentServiceMock },
        { provide: TournamentTeamService, useValue: tournamentTeamServiceMock },
        { provide: TeamService, useValue: teamServiceMock },
        { provide: StandingService, useValue: standingServiceMock },
        { provide: NgbModal, useValue: modalMock },
        { provide: ToastrService, useValue: toastrMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: routeParamsSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    tournamentServiceSpy = TestBed.inject(TournamentService) as jasmine.SpyObj<TournamentService>;
    tournamentTeamServiceSpy = TestBed.inject(TournamentTeamService) as jasmine.SpyObj<TournamentTeamService>;
    teamServiceSpy = TestBed.inject(TeamService) as jasmine.SpyObj<TeamService>;
    standingServiceSpy = TestBed.inject(StandingService) as jasmine.SpyObj<StandingService>;
    modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    routeParamsSubject.next({ tournamentId: '1' });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load tournament and teams when route params change', () => {
      expect(tournamentServiceSpy.getById).toHaveBeenCalledWith(1);
      expect(tournamentTeamServiceSpy.getAll).toHaveBeenCalledWith(1, 0, 10);
    });

    it('should set tournamentId from route params', () => {
      expect(component.tournamentId).toBe(1);
    });
  });

  describe('loadTournament', () => {
    it('should load tournament successfully', () => {
      component.loadTournament();

      expect(component.loading).toBeFalse();
      expect(component.tournament).toEqual(mockTournament);
    });

    it('should handle error and navigate back', () => {
      tournamentServiceSpy.getById.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');
      const navigateSpy = spyOn(router, 'navigate');

      component.loadTournament();

      expect(component.loading).toBeFalse();
      expect(console.error).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/tournaments/list']);
    });
  });

  describe('loadTeams', () => {
    it('should load teams successfully', () => {
      component.loadTeams();

      expect(component.teamsLoading).toBeFalse();
      expect(component.teams.length).toBe(3);
      expect(component.filteredTeams.length).toBe(3);
    });

    it('should handle error when loading teams', () => {
      tournamentTeamServiceSpy.getAll.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      component.loadTeams();

      expect(component.teamsLoading).toBeFalse();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('searchTeams', () => {
    it('should search teams and filter out already registered', () => {
      component.teams = mockTournamentTeams;

      component.searchTeams('equipo');

      expect(teamServiceSpy.searchTeams).toHaveBeenCalledWith('equipo', 0, 20, 'name,asc');
      expect(component.availableTeams.length).toBe(2); // mockTeams (201, 202) not in registered (101, 102, 103)
    });

    it('should handle error when searching teams', () => {
      teamServiceSpy.searchTeams.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      component.searchTeams('test');

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('onTeamSearch', () => {
    it('should emit search term to subject', fakeAsync(() => {
      spyOn(component.teamSearchTerm$, 'next');
      const event = { target: { value: 'equipo' } } as unknown as Event;

      component.onTeamSearch(event);

      expect(component.teamSearchTerm$.next).toHaveBeenCalledWith('equipo');
    }));
  });

  describe('setupTeamSearch', () => {
    it('should call searchTeams when term is at least 2 characters', fakeAsync(() => {
      component.teams = [];

      component.teamSearchTerm$.next('eq');
      tick(300);

      expect(teamServiceSpy.searchTeams).toHaveBeenCalled();
    }));

    it('should clear availableTeams when term is less than 2 characters', fakeAsync(() => {
      component.availableTeams = mockTeams;

      component.teamSearchTerm$.next('a');
      tick(300);

      expect(component.availableTeams.length).toBe(0);
    }));

    it('should clear availableTeams when term is empty', fakeAsync(() => {
      component.availableTeams = mockTeams;

      component.teamSearchTerm$.next('');
      tick(300);

      expect(component.availableTeams.length).toBe(0);
    }));
  });

  describe('filterTeams', () => {
    it('should filter by teamName', () => {
      component.teams = mockTournamentTeams;
      component.filteredTeams = [...mockTournamentTeams];

      const event = { target: { value: 'Uno' } } as unknown as Event;
      component.filterTeams(event);

      expect(component.filteredTeams.length).toBe(1);
      expect(component.filteredTeams[0].teamName).toBe('Equipo Uno');
    });

    it('should filter by teamCode', () => {
      component.teams = mockTournamentTeams;
      component.filteredTeams = [...mockTournamentTeams];

      const event = { target: { value: 'TEAM02' } } as unknown as Event;
      component.filterTeams(event);

      expect(component.filteredTeams.length).toBe(1);
      expect(component.filteredTeams[0].teamCode).toBe('TEAM02');
    });

    it('should filter by clubName', () => {
      component.teams = mockTournamentTeams;
      component.filteredTeams = [...mockTournamentTeams];

      const event = { target: { value: 'Club Dos' } } as unknown as Event;
      component.filterTeams(event);

      expect(component.filteredTeams.length).toBe(1);
      expect(component.filteredTeams[0].clubName).toBe('Club Dos');
    });

    it('should filter by registrationNumber', () => {
      component.teams = mockTournamentTeams;
      component.filteredTeams = [...mockTournamentTeams];

      const event = { target: { value: '3' } } as unknown as Event;
      component.filterTeams(event);

      expect(component.filteredTeams.length).toBe(1);
      expect(component.filteredTeams[0].registrationNumber).toBe(3);
    });

    it('should be case insensitive', () => {
      component.teams = mockTournamentTeams;
      component.filteredTeams = [...mockTournamentTeams];

      const event = { target: { value: 'equipo uno' } } as unknown as Event;
      component.filterTeams(event);

      expect(component.filteredTeams.length).toBe(1);
    });
  });

  describe('openRegistration', () => {
    it('should show confirmation and open registration when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );

      component.openRegistration();
      tick();

      expect(tournamentServiceSpy.openRegistration).toHaveBeenCalledWith(1);
      expect(toastrSpy.success).toHaveBeenCalledWith('Registration opened successfully');
    }));

    it('should not open registration when cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );

      component.openRegistration();
      tick();

      expect(tournamentServiceSpy.openRegistration).not.toHaveBeenCalled();
    }));

    it('should handle error when opening registration', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      tournamentServiceSpy.openRegistration.and.returnValue(
        throwError(() => ({ message: 'Error opening' }))
      );

      component.openRegistration();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Error opening');
    }));
  });

  describe('closeRegistration', () => {
    it('should show confirmation and close registration when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );

      component.closeRegistration();
      tick();

      expect(tournamentServiceSpy.closeRegistration).toHaveBeenCalledWith(1);
      expect(toastrSpy.success).toHaveBeenCalledWith('Registration closed successfully');
    }));

    it('should not close registration when cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );

      component.closeRegistration();
      tick();

      expect(tournamentServiceSpy.closeRegistration).not.toHaveBeenCalled();
    }));
  });

  describe('startTournament', () => {
    it('should show confirmation and start tournament when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );

      component.startTournament();
      tick();

      expect(tournamentServiceSpy.start).toHaveBeenCalledWith(1);
      expect(toastrSpy.success).toHaveBeenCalledWith('Tournament started successfully');
    }));

    it('should handle error when starting tournament', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      tournamentServiceSpy.start.and.returnValue(
        throwError(() => ({ message: 'Start failed' }))
      );

      component.startTournament();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Start failed');
    }));
  });

  describe('finishTournament', () => {
    it('should show confirmation and finish tournament when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );

      component.finishTournament();
      tick();

      expect(tournamentServiceSpy.finish).toHaveBeenCalledWith(1);
      expect(toastrSpy.success).toHaveBeenCalledWith('Tournament finished successfully');
    }));

    it('should handle error when finishing tournament', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      tournamentServiceSpy.finish.and.returnValue(
        throwError(() => ({ message: 'Finish failed' }))
      );

      component.finishTournament();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Finish failed');
    }));
  });

  describe('openRegisterTeamModal', () => {
    it('should reset form and open modal', () => {
      const mockModalRef = { dismiss: jasmine.createSpy('dismiss') } as unknown as NgbModalRef;
      modalServiceSpy.open.and.returnValue(mockModalRef);
      const content = {};

      component.openRegisterTeamModal(content);

      expect(modalServiceSpy.open).toHaveBeenCalledWith(content, {
        ariaLabelledBy: 'modal-register-title',
        size: 'lg',
      });
      expect(component.availableTeams.length).toBe(0);
    });
  });

  describe('selectTeam', () => {
    it('should set teamId and keep only selected team visible', () => {
      component.selectTeam(mockTeam);

      expect(component.registerTeamForm.value.teamId).toBe(201);
      expect(component.availableTeams.length).toBe(1);
      expect(component.availableTeams[0]).toEqual(mockTeam);
    });
  });

  describe('onRegisterTeamSave', () => {
    it('should not save if form is invalid', () => {
      component.registerTeamForm.controls['teamId'].setValue(null);

      component.onRegisterTeamSave();

      expect(tournamentTeamServiceSpy.registerTeam).not.toHaveBeenCalled();
    });

    it('should register team successfully', () => {
      component.registerTeamForm.controls['teamId'].setValue(201);
      component.registerTeamForm.controls['notes'].setValue('Test notes');

      component.onRegisterTeamSave();

      expect(tournamentTeamServiceSpy.registerTeam).toHaveBeenCalledWith(1, {
        teamId: 201,
        notes: 'Test notes',
      });
      expect(toastrSpy.success).toHaveBeenCalledWith('Team registered successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
    });

    it('should handle error when registering team', () => {
      tournamentTeamServiceSpy.registerTeam.and.returnValue(
        throwError(() => ({ message: 'Registration failed' }))
      );
      component.registerTeamForm.controls['teamId'].setValue(201);

      component.onRegisterTeamSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('Registration failed');
    });

    it('should handle string error when registering team', () => {
      tournamentTeamServiceSpy.registerTeam.and.returnValue(
        throwError(() => 'String error')
      );
      component.registerTeamForm.controls['teamId'].setValue(201);

      component.onRegisterTeamSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('String error');
    });
  });

  describe('approveTeam', () => {
    it('should show confirmation and approve team when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );

      component.approveTeam(mockTournamentTeam);
      tick();

      expect(tournamentTeamServiceSpy.approve).toHaveBeenCalledWith(1, 1);
      expect(toastrSpy.success).toHaveBeenCalledWith('Team approved successfully');
    }));

    it('should not approve when cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );

      component.approveTeam(mockTournamentTeam);
      tick();

      expect(tournamentTeamServiceSpy.approve).not.toHaveBeenCalled();
    }));

    it('should handle error when approving team', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      tournamentTeamServiceSpy.approve.and.returnValue(
        throwError(() => ({ message: 'Approve failed' }))
      );

      component.approveTeam(mockTournamentTeam);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Approve failed');
    }));
  });

  describe('openRejectModal', () => {
    it('should set selected team and action type to reject', () => {
      const mockModalRef = { dismiss: jasmine.createSpy('dismiss') } as unknown as NgbModalRef;
      modalServiceSpy.open.and.returnValue(mockModalRef);
      const content = {};

      component.openRejectModal(content, mockTournamentTeam);

      expect(component.selectedTeamRegistration).toEqual(mockTournamentTeam);
      expect(component.actionType).toBe('reject');
      expect(modalServiceSpy.open).toHaveBeenCalledWith(content, {
        ariaLabelledBy: 'modal-reject-title',
        size: 'md',
      });
    });
  });

  describe('openWithdrawModal', () => {
    it('should set selected team and action type to withdraw', () => {
      const mockModalRef = { dismiss: jasmine.createSpy('dismiss') } as unknown as NgbModalRef;
      modalServiceSpy.open.and.returnValue(mockModalRef);
      const content = {};

      component.openWithdrawModal(content, mockTournamentTeam);

      expect(component.selectedTeamRegistration).toEqual(mockTournamentTeam);
      expect(component.actionType).toBe('withdraw');
    });
  });

  describe('onRejectWithdrawSave', () => {
    it('should not save if form is invalid', () => {
      component.rejectForm.controls['reason'].setValue('');
      component.selectedTeamRegistration = mockTournamentTeam;

      component.onRejectWithdrawSave();

      expect(tournamentTeamServiceSpy.reject).not.toHaveBeenCalled();
      expect(tournamentTeamServiceSpy.withdraw).not.toHaveBeenCalled();
    });

    it('should not save if no team is selected', () => {
      component.rejectForm.controls['reason'].setValue('Valid reason here');
      component.selectedTeamRegistration = null;

      component.onRejectWithdrawSave();

      expect(tournamentTeamServiceSpy.reject).not.toHaveBeenCalled();
    });

    it('should reject team successfully', () => {
      component.selectedTeamRegistration = mockTournamentTeam;
      component.actionType = 'reject';
      component.rejectForm.controls['reason'].setValue('Documentos incompletos');

      component.onRejectWithdrawSave();

      expect(tournamentTeamServiceSpy.reject).toHaveBeenCalledWith(1, 1, { reason: 'Documentos incompletos' });
      expect(toastrSpy.success).toHaveBeenCalledWith('Team rejected successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
      expect(component.selectedTeamRegistration).toBeNull();
    });

    it('should withdraw team successfully', () => {
      component.selectedTeamRegistration = mockTournamentTeam;
      component.actionType = 'withdraw';
      component.rejectForm.controls['reason'].setValue('Solicitud del club');

      component.onRejectWithdrawSave();

      expect(tournamentTeamServiceSpy.withdraw).toHaveBeenCalledWith(1, 1, { reason: 'Solicitud del club' });
      expect(toastrSpy.success).toHaveBeenCalledWith('Team withdrawn successfully');
    });

    it('should handle error when rejecting team', () => {
      tournamentTeamServiceSpy.reject.and.returnValue(
        throwError(() => ({ message: 'Reject failed' }))
      );
      component.selectedTeamRegistration = mockTournamentTeam;
      component.actionType = 'reject';
      component.rejectForm.controls['reason'].setValue('Valid reason');

      component.onRejectWithdrawSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('Reject failed');
    });
  });

  describe('deleteTeamRegistration', () => {
    it('should show confirmation and delete when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );

      component.deleteTeamRegistration(mockTournamentTeam);
      tick();

      expect(tournamentTeamServiceSpy.delete).toHaveBeenCalledWith(1, 1);
      expect(toastrSpy.success).toHaveBeenCalledWith('Team registration deleted successfully');
    }));

    it('should not delete when cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );

      component.deleteTeamRegistration(mockTournamentTeam);
      tick();

      expect(tournamentTeamServiceSpy.delete).not.toHaveBeenCalled();
    }));

    it('should handle error when deleting', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      tournamentTeamServiceSpy.delete.and.returnValue(
        throwError(() => ({ message: 'Delete failed' }))
      );

      component.deleteTeamRegistration(mockTournamentTeam);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Delete failed');
    }));
  });

  describe('getStatusClass', () => {
    it('should return correct class for PENDING status', () => {
      expect(component.getStatusClass('PENDING')).toBe('bg-warning');
    });

    it('should return correct class for APPROVED status', () => {
      expect(component.getStatusClass('APPROVED')).toBe('bg-success');
    });

    it('should return correct class for REJECTED status', () => {
      expect(component.getStatusClass('REJECTED')).toBe('bg-danger');
    });

    it('should return correct class for WITHDRAWN status', () => {
      expect(component.getStatusClass('WITHDRAWN')).toBe('bg-secondary');
    });

    it('should return correct class for DISQUALIFIED status', () => {
      expect(component.getStatusClass('DISQUALIFIED')).toBe('bg-dark');
    });

    it('should return default class for unknown status', () => {
      expect(component.getStatusClass('UNKNOWN')).toBe('bg-secondary');
    });
  });

  describe('getStatusLabel', () => {
    it('should return correct label for PENDING status', () => {
      expect(component.getStatusLabel('PENDING')).toBe('Pendiente');
    });

    it('should return correct label for APPROVED status', () => {
      expect(component.getStatusLabel('APPROVED')).toBe('Aprobado');
    });

    it('should return value for unknown status', () => {
      expect(component.getStatusLabel('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('canRegisterTeams', () => {
    it('should return true when status is REGISTRATION_OPEN', () => {
      component.tournament = { ...mockTournament, status: 'REGISTRATION_OPEN' };
      expect(component.canRegisterTeams()).toBeTrue();
    });

    it('should return false when status is DRAFT', () => {
      component.tournament = { ...mockTournament, status: 'DRAFT' };
      expect(component.canRegisterTeams()).toBeFalse();
    });

    it('should return false when status is IN_PROGRESS', () => {
      component.tournament = { ...mockTournament, status: 'IN_PROGRESS' };
      expect(component.canRegisterTeams()).toBeFalse();
    });

    it('should return false when tournament is null', () => {
      component.tournament = null;
      expect(component.canRegisterTeams()).toBeFalse();
    });
  });

  describe('canApproveReject', () => {
    it('should return true when status is REGISTRATION_OPEN', () => {
      component.tournament = { ...mockTournament, status: 'REGISTRATION_OPEN' };
      expect(component.canApproveReject()).toBeTrue();
    });

    it('should return true when status is DRAFT', () => {
      component.tournament = { ...mockTournament, status: 'DRAFT' };
      expect(component.canApproveReject()).toBeTrue();
    });

    it('should return false when status is FINISHED', () => {
      component.tournament = { ...mockTournament, status: 'FINISHED' };
      expect(component.canApproveReject()).toBeFalse();
    });

    it('should return false when tournament is null', () => {
      component.tournament = null;
      expect(component.canApproveReject()).toBeFalse();
    });
  });

  describe('goBack', () => {
    it('should navigate to tournaments list', () => {
      const navigateSpy = spyOn(router, 'navigate');

      component.goBack();

      expect(navigateSpy).toHaveBeenCalledWith(['/tournaments/list']);
    });
  });

  describe('Form Validation', () => {
    it('should have invalid registerTeamForm when teamId is null', () => {
      component.registerTeamForm.controls['teamId'].setValue(null);
      expect(component.registerTeamForm.controls['teamId'].valid).toBeFalse();
    });

    it('should have valid registerTeamForm when teamId is set', () => {
      component.registerTeamForm.controls['teamId'].setValue(1);
      expect(component.registerTeamForm.controls['teamId'].valid).toBeTrue();
    });

    it('should have invalid rejectForm when reason is empty', () => {
      component.rejectForm.controls['reason'].setValue('');
      expect(component.rejectForm.controls['reason'].valid).toBeFalse();
    });

    it('should have invalid rejectForm when reason is too short', () => {
      component.rejectForm.controls['reason'].setValue('Short');
      expect(component.rejectForm.controls['reason'].valid).toBeFalse();
    });

    it('should have invalid rejectForm when reason exceeds max length', () => {
      component.rejectForm.controls['reason'].setValue('A'.repeat(501));
      expect(component.rejectForm.controls['reason'].valid).toBeFalse();
    });

    it('should have valid rejectForm when reason is valid', () => {
      component.rejectForm.controls['reason'].setValue('Esta es una razon valida para el rechazo');
      expect(component.rejectForm.controls['reason'].valid).toBeTrue();
    });
  });

  describe('Registration statuses', () => {
    it('should have all registration status options', () => {
      expect(component.registrationStatuses.length).toBe(5);
      expect(component.registrationStatuses.some(s => s.value === 'PENDING')).toBeTrue();
      expect(component.registrationStatuses.some(s => s.value === 'APPROVED')).toBeTrue();
      expect(component.registrationStatuses.some(s => s.value === 'REJECTED')).toBeTrue();
      expect(component.registrationStatuses.some(s => s.value === 'WITHDRAWN')).toBeTrue();
      expect(component.registrationStatuses.some(s => s.value === 'DISQUALIFIED')).toBeTrue();
    });
  });

  describe('Phase Status and Advancement', () => {
    const mockGroupStageTournament: TournamentResponse = {
      ...mockTournament,
      format: 'GROUP_STAGE',
      status: 'IN_PROGRESS',
    };

    describe('isGroupStageFormat', () => {
      it('should return true for GROUP_STAGE format', () => {
        component.tournament = { ...mockTournament, format: 'GROUP_STAGE' };
        expect(component.isGroupStageFormat()).toBeTrue();
      });

      it('should return true for GROUP_STAGE_SINGLE format', () => {
        component.tournament = { ...mockTournament, format: 'GROUP_STAGE_SINGLE' };
        expect(component.isGroupStageFormat()).toBeTrue();
      });

      it('should return true for GROUP_STAGE_DOUBLE format', () => {
        component.tournament = { ...mockTournament, format: 'GROUP_STAGE_DOUBLE' };
        expect(component.isGroupStageFormat()).toBeTrue();
      });

      it('should return false for LEAGUE format', () => {
        component.tournament = { ...mockTournament, format: 'LEAGUE' };
        expect(component.isGroupStageFormat()).toBeFalse();
      });

      it('should return false when tournament is null', () => {
        component.tournament = null;
        expect(component.isGroupStageFormat()).toBeFalse();
      });
    });

    describe('isInGroupStage', () => {
      it('should return true when current phase type is GROUP_STAGE', () => {
        component.phaseStatus = { ...mockPhaseStatus, currentPhaseType: 'GROUP_STAGE' };
        expect(component.isInGroupStage()).toBeTrue();
      });

      it('should return false when current phase type is QUARTER_FINALS', () => {
        component.phaseStatus = { ...mockPhaseStatus, currentPhaseType: 'QUARTER_FINALS' };
        expect(component.isInGroupStage()).toBeFalse();
      });

      it('should return false when phaseStatus is null', () => {
        component.phaseStatus = null;
        expect(component.isInGroupStage()).toBeFalse();
      });
    });

    describe('isInKnockout', () => {
      it('should return true for QUARTER_FINALS phase', () => {
        component.phaseStatus = { ...mockPhaseStatus, currentPhaseType: 'QUARTER_FINALS' };
        expect(component.isInKnockout()).toBeTrue();
      });

      it('should return true for SEMI_FINALS phase', () => {
        component.phaseStatus = { ...mockPhaseStatus, currentPhaseType: 'SEMI_FINALS' };
        expect(component.isInKnockout()).toBeTrue();
      });

      it('should return true for FINAL phase', () => {
        component.phaseStatus = { ...mockPhaseStatus, currentPhaseType: 'FINAL' };
        expect(component.isInKnockout()).toBeTrue();
      });

      it('should return false for GROUP_STAGE phase', () => {
        component.phaseStatus = { ...mockPhaseStatus, currentPhaseType: 'GROUP_STAGE' };
        expect(component.isInKnockout()).toBeFalse();
      });

      it('should return false when phaseStatus is null', () => {
        component.phaseStatus = null;
        expect(component.isInKnockout()).toBeFalse();
      });
    });

    describe('loadPhaseStatus', () => {
      it('should load phase status for GROUP_STAGE tournament', () => {
        component.tournament = mockGroupStageTournament;
        component.tournamentId = 1;

        component['loadPhaseStatus']();

        expect(tournamentServiceSpy.getPhaseStatus).toHaveBeenCalledWith(1);
        expect(component.phaseStatus).toEqual(mockPhaseStatus);
        expect(component.loadingPhaseStatus).toBeFalse();
      });

      it('should set canAdvancePhase from phaseStatus', () => {
        component.tournament = mockGroupStageTournament;
        component.tournamentId = 1;

        component['loadPhaseStatus']();

        expect(component.canAdvancePhase).toBeTrue();
      });

      it('should handle error and call fallback', () => {
        component.tournament = mockGroupStageTournament;
        component.tournamentId = 1;
        tournamentServiceSpy.getPhaseStatus.and.returnValue(throwError(() => new Error('Error')));
        spyOn(console, 'error');

        component['loadPhaseStatus']();

        expect(console.error).toHaveBeenCalled();
        expect(component.loadingPhaseStatus).toBeFalse();
      });
    });

    describe('onMatchFinished', () => {
      it('should reload phase status for GROUP_STAGE tournament in progress', () => {
        component.tournament = mockGroupStageTournament;
        component.tournamentId = 1;
        tournamentServiceSpy.getPhaseStatus.calls.reset();

        component.onMatchFinished();

        expect(tournamentServiceSpy.getPhaseStatus).toHaveBeenCalledWith(1);
      });

      it('should not reload phase status for non GROUP_STAGE tournament', () => {
        component.tournament = { ...mockTournament, format: 'LEAGUE', status: 'IN_PROGRESS' };
        tournamentServiceSpy.getPhaseStatus.calls.reset();

        component.onMatchFinished();

        expect(tournamentServiceSpy.getPhaseStatus).not.toHaveBeenCalled();
      });

      it('should not reload phase status when tournament is not IN_PROGRESS', () => {
        component.tournament = { ...mockTournament, format: 'GROUP_STAGE', status: 'FINISHED' };
        tournamentServiceSpy.getPhaseStatus.calls.reset();

        component.onMatchFinished();

        expect(tournamentServiceSpy.getPhaseStatus).not.toHaveBeenCalled();
      });
    });

    describe('advancePhase', () => {
      it('should call advanceFromGroupStage when in group stage', fakeAsync(() => {
        component.tournament = mockGroupStageTournament;
        component.tournamentId = 1;
        component.phaseStatus = { ...mockPhaseStatus, currentPhaseType: 'GROUP_STAGE' };
        spyOn(Swal, 'fire').and.returnValues(
          Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult),
          Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
        );

        component.advancePhase();
        tick();

        expect(tournamentServiceSpy.advanceFromGroupStage).toHaveBeenCalledWith(1);
      }));

      it('should call advanceKnockout when in knockout phase', fakeAsync(() => {
        component.tournament = mockGroupStageTournament;
        component.tournamentId = 1;
        component.phaseStatus = { ...mockPhaseStatus, currentPhaseType: 'QUARTER_FINALS' };
        spyOn(Swal, 'fire').and.returnValues(
          Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult),
          Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
        );

        component.advancePhase();
        tick();

        expect(tournamentServiceSpy.advanceKnockout).toHaveBeenCalledWith(1);
      }));

      it('should not advance when cancelled', fakeAsync(() => {
        component.tournament = mockGroupStageTournament;
        component.phaseStatus = mockPhaseStatus;
        spyOn(Swal, 'fire').and.returnValue(
          Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
        );

        component.advancePhase();
        tick();

        expect(tournamentServiceSpy.advanceFromGroupStage).not.toHaveBeenCalled();
        expect(tournamentServiceSpy.advanceKnockout).not.toHaveBeenCalled();
      }));

      it('should handle error when advancing phase', fakeAsync(() => {
        component.tournament = mockGroupStageTournament;
        component.tournamentId = 1;
        component.phaseStatus = { ...mockPhaseStatus, currentPhaseType: 'GROUP_STAGE' };
        tournamentServiceSpy.advanceFromGroupStage.and.returnValue(
          throwError(() => ({ message: 'Advance failed' }))
        );
        spyOn(Swal, 'fire').and.returnValue(
          Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
        );

        component.advancePhase();
        tick();

        expect(toastrSpy.error).toHaveBeenCalledWith('Advance failed');
      }));
    });

    describe('canEditMatches', () => {
      it('should return true when status is SCHEDULED', () => {
        component.tournament = { ...mockTournament, status: 'SCHEDULED' };
        expect(component.canEditMatches()).toBeTrue();
      });

      it('should return true when status is IN_PROGRESS', () => {
        component.tournament = { ...mockTournament, status: 'IN_PROGRESS' };
        expect(component.canEditMatches()).toBeTrue();
      });

      it('should return false when status is FINISHED', () => {
        component.tournament = { ...mockTournament, status: 'FINISHED' };
        expect(component.canEditMatches()).toBeFalse();
      });
    });
  });
});
