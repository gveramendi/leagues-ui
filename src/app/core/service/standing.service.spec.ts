import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { StandingService } from './standing.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  StandingResponse,
  StandingSummaryResponse,
  StandingTableResponse,
} from '../models/response';

describe('StandingService', () => {
  let service: StandingService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/standings`;

  const mockStanding: StandingResponse = {
    id: 1,
    tournamentId: 1,
    tournamentName: 'Liga Apertura 2024',
    teamId: 10,
    teamName: 'FC Barcelona',
    teamCode: 'FCB',
    teamLogoUrl: 'https://example.com/fcb.png',
    position: 1,
    played: 10,
    won: 8,
    drawn: 1,
    lost: 1,
    goalsFor: 25,
    goalsAgainst: 8,
    goalDifference: 17,
    points: 25,
    homePlayed: 5,
    homeWon: 5,
    homeDrawn: 0,
    homeLost: 0,
    homeGoalsFor: 15,
    homeGoalsAgainst: 3,
    homeGoalDifference: 12,
    awayPlayed: 5,
    awayWon: 3,
    awayDrawn: 1,
    awayLost: 1,
    awayGoalsFor: 10,
    awayGoalsAgainst: 5,
    awayGoalDifference: 5,
    form: 'WWWDW',
    currentStreak: 3,
    streakType: 'WIN',
    yellowCards: 12,
    redCards: 1,
    fairPlayPoints: 13,
    qualified: true,
    relegated: false,
    promotionPlayoff: false,
    relegationPlayoff: false,
    pointsPerGame: 2.5,
    goalsPerGame: 2.5,
    goalsAgainstPerGame: 0.8,
    winPercentage: 80,
    updatedAt: '2024-01-15T10:00:00',
  };

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StandingService],
    });
    service = TestBed.inject(StandingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getByTournament', () => {
    it('should return standings table for a tournament', () => {
      const mockResponse: ApiResponse<StandingTableResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Standings retrieved successfully',
        },
        body: {
          data: mockStandingTable,
        },
      };

      service.getByTournament(1).subscribe((response) => {
        expect(response.body.data.tournamentId).toBe(1);
        expect(response.body.data.standings.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByTournamentAndTeam', () => {
    it('should return standing for a specific team in a tournament', () => {
      const mockResponse: ApiResponse<StandingResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Standing retrieved successfully',
        },
        body: {
          data: mockStanding,
        },
      };

      service.getByTournamentAndTeam(1, 10).subscribe((response) => {
        expect(response.body.data.teamId).toBe(10);
        expect(response.body.data.position).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1/team/10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByTeam', () => {
    it('should return standing history for a team', () => {
      const mockResponse: ApiResponse<StandingResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Standings retrieved successfully',
        },
        body: {
          data: [mockStanding],
        },
      };

      service.getByTeam(10).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].teamId).toBe(10);
      });

      const req = httpMock.expectOne(`${apiUrl}/team/10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getQualifiedTeams', () => {
    it('should return qualified teams from a tournament', () => {
      const mockResponse: ApiResponse<StandingSummaryResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Qualified teams retrieved successfully',
        },
        body: {
          data: [mockStandingSummary],
        },
      };

      service.getQualifiedTeams(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].qualified).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1/qualified`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getRelegatedTeams', () => {
    it('should return relegated teams from a tournament', () => {
      const relegatedTeam: StandingSummaryResponse = {
        ...mockStandingSummary,
        relegated: true,
        qualified: false,
        position: 18,
      };
      const mockResponse: ApiResponse<StandingSummaryResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Relegated teams retrieved successfully',
        },
        body: {
          data: [relegatedTeam],
        },
      };

      service.getRelegatedTeams(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].relegated).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1/relegated`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getLeaders', () => {
    it('should return leaders of a tournament', () => {
      const mockResponse: ApiResponse<StandingSummaryResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Leaders retrieved successfully',
        },
        body: {
          data: [mockStandingSummary],
        },
      };

      service.getLeaders(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].position).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1/leaders`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getTopScoringTeams', () => {
    it('should return top scoring teams with default limit', () => {
      const mockResponse: ApiResponse<StandingSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockStandingSummary] },
      };

      service.getTopScoringTeams(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/top-scorers` &&
        request.params.get('limit') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return top scoring teams with custom limit', () => {
      const mockResponse: ApiResponse<StandingSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockStandingSummary] },
      };

      service.getTopScoringTeams(1, 5).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/top-scorers` &&
        request.params.get('limit') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getBestDefenses', () => {
    it('should return best defenses with default limit', () => {
      const mockResponse: ApiResponse<StandingSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockStandingSummary] },
      };

      service.getBestDefenses(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/best-defenses` &&
        request.params.get('limit') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return best defenses with custom limit', () => {
      const mockResponse: ApiResponse<StandingSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockStandingSummary] },
      };

      service.getBestDefenses(1, 3).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/best-defenses` &&
        request.params.get('limit') === '3'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getBestHomeTeams', () => {
    it('should return best home teams with default limit', () => {
      const mockResponse: ApiResponse<StandingSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockStandingSummary] },
      };

      service.getBestHomeTeams(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/best-home` &&
        request.params.get('limit') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return best home teams with custom limit', () => {
      const mockResponse: ApiResponse<StandingSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockStandingSummary] },
      };

      service.getBestHomeTeams(1, 5).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/best-home` &&
        request.params.get('limit') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getBestAwayTeams', () => {
    it('should return best away teams with default limit', () => {
      const mockResponse: ApiResponse<StandingSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockStandingSummary] },
      };

      service.getBestAwayTeams(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/best-away` &&
        request.params.get('limit') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return best away teams with custom limit', () => {
      const mockResponse: ApiResponse<StandingSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockStandingSummary] },
      };

      service.getBestAwayTeams(1, 5).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/best-away` &&
        request.params.get('limit') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getFairPlayRanking', () => {
    it('should return fair play ranking with default limit', () => {
      const mockResponse: ApiResponse<StandingSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockStandingSummary] },
      };

      service.getFairPlayRanking(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/fair-play` &&
        request.params.get('limit') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return fair play ranking with custom limit', () => {
      const mockResponse: ApiResponse<StandingSummaryResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockStandingSummary] },
      };

      service.getFairPlayRanking(1, 20).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/fair-play` &&
        request.params.get('limit') === '20'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('initializeStandings', () => {
    it('should initialize standings for a tournament', () => {
      const mockResponse: ApiResponse<void> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Standings initialized successfully',
        },
        body: {
          data: undefined as unknown as void,
        },
      };

      service.initializeStandings(1).subscribe((response) => {
        expect(response.header.message).toBe('Standings initialized successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1/initialize`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('recalculateStandings', () => {
    it('should recalculate standings for a tournament', () => {
      const mockResponse: ApiResponse<void> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Standings recalculated successfully',
        },
        body: {
          data: undefined as unknown as void,
        },
      };

      service.recalculateStandings(1).subscribe((response) => {
        expect(response.header.message).toBe('Standings recalculated successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1/recalculate`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });
});
