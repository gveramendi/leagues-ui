import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TournamentService } from './tournament.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreateTournamentRequest,
  TournamentResponse,
  TournamentSummaryResponse,
  UpdateTournamentRequest,
  PhaseStatusResponse,
  PhaseAdvancementResponse,
} from '../models/response';

describe('TournamentService', () => {
  let service: TournamentService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/tournaments`;

  const mockTournament: TournamentResponse = {
    id: 1,
    name: 'Liga Apertura 2024',
    code: 'LA2024',
    shortName: 'Apertura',
    description: 'Torneo de apertura 2024',
    format: 'LEAGUE',
    status: 'DRAFT',
    category: 'PRIMERA',
    gender: 'MALE',
    footballType: 'FOOTBALL_11',
    seasonYear: 2024,
    startDate: '2024-03-01',
    endDate: '2024-06-30',
    registrationStart: '2024-01-15',
    registrationEnd: '2024-02-28',
    maxTeams: 16,
    minTeams: 8,
    registeredTeamsCount: 10,
    approvedTeamsCount: 8,
    isRegistrationOpen: true,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  };

  const mockTournamentSummary: TournamentSummaryResponse = {
    id: 1,
    name: 'Liga Apertura 2024',
    code: 'LA2024',
    shortName: 'Apertura',
    format: 'LEAGUE',
    status: 'DRAFT',
    category: 'PRIMERA',
    gender: 'MALE',
    footballType: 'FOOTBALL_11',
    seasonYear: 2024,
    startDate: '2024-03-01',
    endDate: '2024-06-30',
    registeredTeamsCount: 10,
    approvedTeamsCount: 8,
    isRegistrationOpen: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TournamentService],
    });
    service = TestBed.inject(TournamentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should create a new tournament', () => {
      const createRequest: CreateTournamentRequest = {
        name: 'Liga Apertura 2024',
        code: 'LA2024',
        format: 'LEAGUE',
        category: 'PRIMERA',
        gender: 'MALE',
        footballType: 'FOOTBALL_11',
        seasonYear: 2024,
      };
      const mockResponse: ApiResponse<TournamentResponse> = {
        header: {
          success: true,
          statusCode: 201,
          message: 'Tournament created successfully',
        },
        body: {
          data: mockTournament,
        },
      };

      service.create(createRequest).subscribe((response) => {
        expect(response.body.data.name).toBe('Liga Apertura 2024');
        expect(response.header.message).toBe('Tournament created successfully');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should return a tournament by id', () => {
      const mockResponse: ApiResponse<TournamentResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Tournament retrieved successfully',
        },
        body: {
          data: mockTournament,
        },
      };

      service.getById(1).subscribe((response) => {
        expect(response.body.data).toEqual(mockTournament);
        expect(response.header.message).toBe('Tournament retrieved successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByCode', () => {
    it('should return a tournament by code', () => {
      const mockResponse: ApiResponse<TournamentResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Tournament retrieved successfully',
        },
        body: {
          data: mockTournament,
        },
      };

      service.getByCode('LA2024').subscribe((response) => {
        expect(response.body.data.code).toBe('LA2024');
      });

      const req = httpMock.expectOne(`${apiUrl}/code/LA2024`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getAll', () => {
    it('should return all tournaments with default pagination', () => {
      const mockResponse: ApiResponse<TournamentSummaryResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Tournaments retrieved successfully',
        },
        body: {
          data: [mockTournamentSummary],
          pagination: {
            totalElements: 1,
            totalPages: 1,
            size: 10,
            number: 0,
            first: true,
            last: true,
            empty: false,
          },
        },
      };

      service.getAll().subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === apiUrl &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '10' &&
        request.params.get('sort') === 'createdAt,desc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return all tournaments with custom pagination', () => {
      const mockResponse: ApiResponse<TournamentSummaryResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Success',
        },
        body: {
          data: [mockTournamentSummary],
        },
      };

      service.getAll(1, 20, 'name,asc').subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === apiUrl &&
        request.params.get('page') === '1' &&
        request.params.get('size') === '20' &&
        request.params.get('sort') === 'name,asc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('search', () => {
    const mockSearchResponse: ApiResponse<TournamentSummaryResponse[]> = {
      header: {
        success: true,
        statusCode: 200,
        message: 'Success',
      },
      body: {
        data: [mockTournamentSummary],
        pagination: {
          totalElements: 1,
          totalPages: 1,
          size: 10,
          number: 0,
          first: true,
          last: true,
          empty: false,
        },
      },
    };

    it('should search tournaments with query', () => {
      service.search('apertura').subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/search` &&
        request.params.get('query') === 'apertura'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSearchResponse);
    });

    it('should search without query', () => {
      service.search().subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/search` && !request.params.has('query')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSearchResponse);
    });
  });

  describe('getByStatus', () => {
    it('should return tournaments by status', () => {
      const mockResponse: ApiResponse<TournamentSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockTournamentSummary] },
      };

      service.getByStatus('IN_PROGRESS').subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/status/IN_PROGRESS`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getBySeason', () => {
    it('should return tournaments by season year', () => {
      const mockResponse: ApiResponse<TournamentSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockTournamentSummary] },
      };

      service.getBySeason(2024).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/season/2024`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByCategory', () => {
    it('should return tournaments by category', () => {
      const mockResponse: ApiResponse<TournamentSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockTournamentSummary] },
      };

      service.getByCategory('PRIMERA').subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/category/PRIMERA`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByGender', () => {
    it('should return tournaments by gender', () => {
      const mockResponse: ApiResponse<TournamentSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockTournamentSummary] },
      };

      service.getByGender('MALE').subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/gender/MALE`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByFootballType', () => {
    it('should return tournaments by football type', () => {
      const mockResponse: ApiResponse<TournamentSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockTournamentSummary] },
      };

      service.getByFootballType('FOOTBALL_11').subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/football-type/FOOTBALL_11`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByFormat', () => {
    it('should return tournaments by format', () => {
      const mockResponse: ApiResponse<TournamentSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockTournamentSummary] },
      };

      service.getByFormat('LEAGUE').subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/format/LEAGUE`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getActive', () => {
    it('should return active tournaments', () => {
      const mockResponse: ApiResponse<TournamentSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockTournamentSummary] },
      };

      service.getActive().subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/active` &&
        request.params.get('sort') === 'startDate,asc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getOpenRegistration', () => {
    it('should return tournaments with open registration', () => {
      const mockResponse: ApiResponse<TournamentSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockTournamentSummary] },
      };

      service.getOpenRegistration().subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/open-registration` &&
        request.params.get('sort') === 'registrationEnd,asc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByTeam', () => {
    it('should return tournaments by team id', () => {
      const mockResponse: ApiResponse<TournamentSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockTournamentSummary] },
      };

      service.getByTeam(5).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/team/5`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getSeasons', () => {
    it('should return list of season years', () => {
      const mockResponse: ApiResponse<number[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [2024, 2023, 2022] },
      };

      service.getSeasons().subscribe((response) => {
        expect(response.body.data).toEqual([2024, 2023, 2022]);
      });

      const req = httpMock.expectOne(`${apiUrl}/seasons`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing tournament', () => {
      const updateRequest: UpdateTournamentRequest = {
        name: 'Liga Apertura 2024 Updated',
        description: 'Updated description',
      };
      const mockResponse: ApiResponse<TournamentResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Tournament updated successfully',
        },
        body: {
          data: { ...mockTournament, name: 'Liga Apertura 2024 Updated' },
        },
      };

      service.update(1, updateRequest).subscribe((response) => {
        expect(response.body.data.name).toBe('Liga Apertura 2024 Updated');
        expect(response.header.message).toBe('Tournament updated successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResponse);
    });
  });

  describe('openRegistration', () => {
    it('should open registration for a tournament', () => {
      const mockResponse: ApiResponse<TournamentResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Registration opened successfully',
        },
        body: {
          data: { ...mockTournament, status: 'REGISTRATION_OPEN' },
        },
      };

      service.openRegistration(1).subscribe((response) => {
        expect(response.body.data.status).toBe('REGISTRATION_OPEN');
      });

      const req = httpMock.expectOne(`${apiUrl}/1/open-registration`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('closeRegistration', () => {
    it('should close registration for a tournament', () => {
      const mockResponse: ApiResponse<TournamentResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Registration closed successfully',
        },
        body: {
          data: { ...mockTournament, status: 'REGISTRATION_CLOSED' },
        },
      };

      service.closeRegistration(1).subscribe((response) => {
        expect(response.body.data.status).toBe('REGISTRATION_CLOSED');
      });

      const req = httpMock.expectOne(`${apiUrl}/1/close-registration`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('start', () => {
    it('should start a tournament', () => {
      const mockResponse: ApiResponse<TournamentResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Tournament started successfully',
        },
        body: {
          data: { ...mockTournament, status: 'IN_PROGRESS' },
        },
      };

      service.start(1).subscribe((response) => {
        expect(response.body.data.status).toBe('IN_PROGRESS');
      });

      const req = httpMock.expectOne(`${apiUrl}/1/start`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('finish', () => {
    it('should finish a tournament', () => {
      const mockResponse: ApiResponse<TournamentResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Tournament finished successfully',
        },
        body: {
          data: { ...mockTournament, status: 'FINISHED' },
        },
      };

      service.finish(1).subscribe((response) => {
        expect(response.body.data.status).toBe('FINISHED');
      });

      const req = httpMock.expectOne(`${apiUrl}/1/finish`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a tournament', () => {
      const mockResponse: ApiResponse<void> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Tournament deleted successfully',
        },
        body: {
          data: undefined as unknown as void,
        },
      };

      service.delete(1).subscribe((response) => {
        expect(response.header.message).toBe('Tournament deleted successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('getPhaseStatus', () => {
    it('should return phase status for a tournament', () => {
      const mockPhaseStatus: PhaseStatusResponse = {
        tournamentId: 1,
        tournamentName: 'Liga 2024',
        currentPhaseId: 5,
        currentPhaseName: 'Fase de Grupos',
        currentPhaseType: 'GROUP_STAGE',
        currentPhaseStatus: 'IN_PROGRESS',
        totalMatches: 24,
        finishedMatches: 18,
        pendingMatches: 4,
        inProgressMatches: 2,
        canAdvance: false,
        nextPhaseType: 'QUARTER_FINALS',
        nextPhaseName: 'Cuartos de Final',
        tournamentComplete: false,
      };
      const mockResponse: ApiResponse<PhaseStatusResponse> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockPhaseStatus },
      };

      service.getPhaseStatus(1).subscribe((response) => {
        expect(response.body.data.currentPhaseType).toBe('GROUP_STAGE');
        expect(response.body.data.canAdvance).toBeFalse();
        expect(response.body.data.nextPhaseName).toBe('Cuartos de Final');
      });

      const req = httpMock.expectOne(`${apiUrl}/1/phase-status`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('canAdvanceGroupStage', () => {
    it('should check if tournament can advance from group stage', () => {
      const mockResponse: ApiResponse<boolean> = {
        header: { success: true, statusCode: 200, message: 'Verificación completada' },
        body: { data: true },
      };

      service.canAdvanceGroupStage(1).subscribe((response) => {
        expect(response.body.data).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/1/can-advance-group-stage`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return false when group stage is not complete', () => {
      const mockResponse: ApiResponse<boolean> = {
        header: { success: true, statusCode: 200, message: 'Verificación completada' },
        body: { data: false },
      };

      service.canAdvanceGroupStage(1).subscribe((response) => {
        expect(response.body.data).toBeFalse();
      });

      const req = httpMock.expectOne(`${apiUrl}/1/can-advance-group-stage`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('canAdvanceKnockout', () => {
    it('should check if tournament can advance knockout phase', () => {
      const mockResponse: ApiResponse<boolean> = {
        header: { success: true, statusCode: 200, message: 'Verificación completada' },
        body: { data: true },
      };

      service.canAdvanceKnockout(1).subscribe((response) => {
        expect(response.body.data).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/1/can-advance-knockout`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('advanceFromGroupStage', () => {
    it('should advance tournament from group stage to knockout', () => {
      const mockAdvancement: PhaseAdvancementResponse = {
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
      const mockResponse: ApiResponse<PhaseAdvancementResponse> = {
        header: { success: true, statusCode: 200, message: 'Fase avanzada exitosamente' },
        body: { data: mockAdvancement },
      };

      service.advanceFromGroupStage(1).subscribe((response) => {
        expect(response.body.data.previousPhaseType).toBe('GROUP_STAGE');
        expect(response.body.data.newPhaseType).toBe('QUARTER_FINALS');
        expect(response.body.data.totalQualifiedTeams).toBe(8);
        expect(response.body.data.totalMatchesGenerated).toBe(4);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/advance-from-group-stage`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('advanceKnockout', () => {
    it('should advance tournament between knockout phases', () => {
      const mockAdvancement: PhaseAdvancementResponse = {
        tournamentId: 1,
        tournamentName: 'Liga 2024',
        previousPhaseId: 6,
        previousPhaseName: 'Cuartos de Final',
        previousPhaseType: 'QUARTER_FINALS',
        newPhaseId: 7,
        newPhaseName: 'Semifinales',
        newPhaseType: 'SEMI_FINALS',
        qualifiedTeams: [
          { teamId: 10, teamName: 'Equipo A', groupPosition: 1 },
          { teamId: 15, teamName: 'Equipo C', groupPosition: 1 },
        ],
        totalQualifiedTeams: 4,
        generatedMatches: [
          { matchId: 105, matchNumber: 1, homeTeamName: 'Equipo A', awayTeamName: 'Equipo C', round: 'SEMI_FINALS' },
        ],
        totalMatchesGenerated: 2,
      };
      const mockResponse: ApiResponse<PhaseAdvancementResponse> = {
        header: { success: true, statusCode: 200, message: 'Fase avanzada exitosamente' },
        body: { data: mockAdvancement },
      };

      service.advanceKnockout(1).subscribe((response) => {
        expect(response.body.data.previousPhaseType).toBe('QUARTER_FINALS');
        expect(response.body.data.newPhaseType).toBe('SEMI_FINALS');
        expect(response.body.data.totalQualifiedTeams).toBe(4);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/advance-knockout`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should advance from semi finals to final', () => {
      const mockAdvancement: PhaseAdvancementResponse = {
        tournamentId: 1,
        tournamentName: 'Liga 2024',
        previousPhaseId: 7,
        previousPhaseName: 'Semifinales',
        previousPhaseType: 'SEMI_FINALS',
        newPhaseId: 8,
        newPhaseName: 'Final',
        newPhaseType: 'FINAL',
        qualifiedTeams: [
          { teamId: 10, teamName: 'Equipo A' },
          { teamId: 20, teamName: 'Equipo F' },
        ],
        totalQualifiedTeams: 2,
        generatedMatches: [
          { matchId: 107, matchNumber: 1, homeTeamName: 'Equipo A', awayTeamName: 'Equipo F', round: 'FINAL' },
        ],
        totalMatchesGenerated: 1,
      };
      const mockResponse: ApiResponse<PhaseAdvancementResponse> = {
        header: { success: true, statusCode: 200, message: 'Final generada exitosamente' },
        body: { data: mockAdvancement },
      };

      service.advanceKnockout(1).subscribe((response) => {
        expect(response.body.data.newPhaseType).toBe('FINAL');
        expect(response.body.data.totalMatchesGenerated).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/advance-knockout`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });
});
