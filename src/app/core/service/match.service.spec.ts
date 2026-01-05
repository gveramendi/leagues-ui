import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatchService } from './match.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  MatchResponse,
  MatchSummaryResponse,
  MatchEventResponse,
  MatchRefereeResponse,
  CreateMatchRequest,
  UpdateMatchRequest,
  UpdateMatchScoreRequest,
  CreateMatchEventRequest,
  AssignRefereeRequest,
} from '../models/response';

describe('MatchService', () => {
  let service: MatchService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/matches`;

  const mockMatch: MatchResponse = {
    id: 1,
    tournamentId: 1,
    tournamentName: 'Liga Apertura 2024',
    tournamentCode: 'LA2024',
    homeTeamId: 10,
    homeTeamName: 'FC Barcelona',
    homeTeamShortName: 'FCB',
    homeTeamLogoUrl: 'https://example.com/fcb.png',
    awayTeamId: 20,
    awayTeamName: 'Real Madrid',
    awayTeamShortName: 'RMA',
    awayTeamLogoUrl: 'https://example.com/rma.png',
    matchday: 1,
    matchDate: '2024-01-15',
    matchTime: '20:00',
    venue: 'Camp Nou',
    status: 'SCHEDULED',
    statusDisplayName: 'Scheduled',
    homeScore: 0,
    awayScore: 0,
    createdAt: '2024-01-01T10:00:00',
    updatedAt: '2024-01-01T10:00:00',
  };

  const mockMatchSummary: MatchSummaryResponse = {
    id: 1,
    tournamentId: 1,
    tournamentName: 'Liga Apertura 2024',
    homeTeamId: 10,
    homeTeamName: 'FC Barcelona',
    homeTeamShortName: 'FCB',
    homeTeamLogoUrl: 'https://example.com/fcb.png',
    awayTeamId: 20,
    awayTeamName: 'Real Madrid',
    awayTeamShortName: 'RMA',
    awayTeamLogoUrl: 'https://example.com/rma.png',
    matchday: 1,
    matchDate: '2024-01-15',
    matchTime: '20:00',
    venue: 'Camp Nou',
    status: 'SCHEDULED',
    statusDisplayName: 'Scheduled',
    homeScore: 0,
    awayScore: 0,
  };

  const mockMatchEvent: MatchEventResponse = {
    id: 1,
    matchId: 1,
    eventType: 'GOAL',
    eventTypeDisplayName: 'Goal',
    minute: 45,
    additionalTime: 2,
    teamId: 10,
    teamName: 'FC Barcelona',
    playerId: 100,
    playerName: 'Lionel Messi',
    playerNumber: 10,
    assistPlayerId: 101,
    assistPlayerName: 'Andres Iniesta',
    createdAt: '2024-01-15T21:00:00',
  };

  const mockMatchReferee: MatchRefereeResponse = {
    id: 1,
    matchId: 1,
    refereeId: 50,
    refereeFullName: 'Howard Webb',
    refereeLicenseNumber: 'FIFA-001',
    refereeCategory: 'FIFA',
    refereeCategoryDisplayName: 'FIFA',
    role: 'MAIN',
    roleDisplayName: 'Main Referee',
  };

  const createApiResponse = <T>(data: T): ApiResponse<T> => ({
    header: {
      success: true,
      statusCode: 200,
      message: 'Success',
    },
    body: {
      data,
    },
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MatchService],
    });
    service = TestBed.inject(MatchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should create a new match', () => {
      const request: CreateMatchRequest = {
        tournamentId: 1,
        homeTeamId: 10,
        awayTeamId: 20,
        matchday: 1,
        matchDate: '2024-01-15',
        matchTime: '20:00',
        venue: 'Camp Nou',
      };

      service.create(request).subscribe((response) => {
        expect(response.body.data).toEqual(mockMatch);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(createApiResponse(mockMatch));
    });
  });

  describe('getById', () => {
    it('should get match by ID', () => {
      service.getById(1).subscribe((response) => {
        expect(response.body.data).toEqual(mockMatch);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse(mockMatch));
    });
  });

  describe('getByTournament', () => {
    it('should get matches by tournament with pagination', () => {
      service.getByTournament(1, 0, 20).subscribe((response) => {
        expect(response.body.data).toEqual([mockMatchSummary]);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1?page=0&size=20`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockMatchSummary]));
    });
  });

  describe('getByMatchday', () => {
    it('should get matches by matchday', () => {
      service.getByMatchday(1, 5).subscribe((response) => {
        expect(response.body.data).toEqual([mockMatchSummary]);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1/matchday/5`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockMatchSummary]));
    });
  });

  describe('getByStatus', () => {
    it('should get matches by status', () => {
      service.getByStatus(1, 'SCHEDULED').subscribe((response) => {
        expect(response.body.data).toEqual([mockMatchSummary]);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1/status/SCHEDULED`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockMatchSummary]));
    });
  });

  describe('getByTeam', () => {
    it('should get matches by team', () => {
      service.getByTeam(10).subscribe((response) => {
        expect(response.body.data).toEqual([mockMatchSummary]);
      });

      const req = httpMock.expectOne(`${apiUrl}/team/10`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockMatchSummary]));
    });
  });

  describe('getByDateRange', () => {
    it('should get matches by date range', () => {
      service.getByDateRange('2024-01-01', '2024-01-31').subscribe((response) => {
        expect(response.body.data).toEqual([mockMatchSummary]);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/date-range?startDate=2024-01-01&endDate=2024-01-31`
      );
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockMatchSummary]));
    });
  });

  describe('getUpcoming', () => {
    it('should get upcoming matches', () => {
      service.getUpcoming(1, 5).subscribe((response) => {
        expect(response.body.data).toEqual([mockMatchSummary]);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1/upcoming?limit=5`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockMatchSummary]));
    });
  });

  describe('getRecent', () => {
    it('should get recent matches', () => {
      service.getRecent(1, 5).subscribe((response) => {
        expect(response.body.data).toEqual([mockMatchSummary]);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1/recent?limit=5`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockMatchSummary]));
    });
  });

  describe('update', () => {
    it('should update match details', () => {
      const request: UpdateMatchRequest = {
        matchDate: '2024-01-20',
        matchTime: '18:00',
        venue: 'Santiago Bernabeu',
      };

      service.update(1, request).subscribe((response) => {
        expect(response.body.data).toEqual(mockMatch);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(createApiResponse(mockMatch));
    });
  });

  describe('updateScore', () => {
    it('should update match score', () => {
      const request: UpdateMatchScoreRequest = {
        homeScore: 2,
        awayScore: 1,
        homeScoreHalftime: 1,
        awayScoreHalftime: 0,
      };

      service.updateScore(1, request).subscribe((response) => {
        expect(response.body.data).toEqual(mockMatch);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/score`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(request);
      req.flush(createApiResponse(mockMatch));
    });
  });

  describe('start', () => {
    it('should start a match', () => {
      service.start(1).subscribe((response) => {
        expect(response.body.data).toEqual(mockMatch);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/start`);
      expect(req.request.method).toBe('POST');
      req.flush(createApiResponse(mockMatch));
    });
  });

  describe('finish', () => {
    it('should finish a match', () => {
      service.finish(1).subscribe((response) => {
        expect(response.body.data).toEqual(mockMatch);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/finish`);
      expect(req.request.method).toBe('POST');
      req.flush(createApiResponse(mockMatch));
    });
  });

  describe('updateStatus', () => {
    it('should update match status', () => {
      service.updateStatus(1, 'IN_PROGRESS').subscribe((response) => {
        expect(response.body.data).toEqual(mockMatch);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/status?status=IN_PROGRESS`);
      expect(req.request.method).toBe('PATCH');
      req.flush(createApiResponse(mockMatch));
    });
  });

  describe('delete', () => {
    it('should delete a match', () => {
      service.delete(1).subscribe((response) => {
        expect(response.header.success).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(createApiResponse(null));
    });
  });

  // Match Event tests

  describe('addEvent', () => {
    it('should add an event to a match', () => {
      const request: CreateMatchEventRequest = {
        eventType: 'GOAL',
        minute: 45,
        additionalTime: 2,
        teamId: 10,
        playerId: 100,
        assistPlayerId: 101,
      };

      service.addEvent(1, request).subscribe((response) => {
        expect(response.body.data).toEqual(mockMatchEvent);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/events`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(createApiResponse(mockMatchEvent));
    });
  });

  describe('getEvents', () => {
    it('should get all events for a match', () => {
      service.getEvents(1).subscribe((response) => {
        expect(response.body.data).toEqual([mockMatchEvent]);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/events`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockMatchEvent]));
    });
  });

  describe('getGoals', () => {
    it('should get goal events for a match', () => {
      service.getGoals(1).subscribe((response) => {
        expect(response.body.data).toEqual([mockMatchEvent]);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/events/goals`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockMatchEvent]));
    });
  });

  describe('getCards', () => {
    it('should get card events for a match', () => {
      service.getCards(1).subscribe((response) => {
        expect(response.body.data).toEqual([mockMatchEvent]);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/events/cards`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockMatchEvent]));
    });
  });

  describe('deleteEvent', () => {
    it('should delete a match event', () => {
      service.deleteEvent(1, 5).subscribe((response) => {
        expect(response.header.success).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/1/events/5`);
      expect(req.request.method).toBe('DELETE');
      req.flush(createApiResponse(null));
    });
  });

  // Match Referee tests

  describe('assignReferee', () => {
    it('should assign a referee to a match', () => {
      const request: AssignRefereeRequest = {
        refereeId: 50,
        role: 'MAIN',
      };

      service.assignReferee(1, request).subscribe((response) => {
        expect(response.body.data).toEqual(mockMatchReferee);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/referees`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(createApiResponse(mockMatchReferee));
    });
  });

  describe('getReferees', () => {
    it('should get all referees for a match', () => {
      service.getReferees(1).subscribe((response) => {
        expect(response.body.data).toEqual([mockMatchReferee]);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/referees`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockMatchReferee]));
    });
  });

  describe('removeReferee', () => {
    it('should remove a referee from a match', () => {
      service.removeReferee(1, 50).subscribe((response) => {
        expect(response.header.success).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/1/referees/50`);
      expect(req.request.method).toBe('DELETE');
      req.flush(createApiResponse(null));
    });
  });
});
