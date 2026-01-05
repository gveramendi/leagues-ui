import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PlayerStatisticsService, PageResponse } from './player-statistics.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  AssistTableResponse,
  CardStatsResponse,
  PlayerStatisticsResponse,
  ScorerTableResponse,
  TopAssistResponse,
  TopCleanSheetResponse,
  TopContributorResponse,
  TopScorerResponse,
} from '../models/response';

describe('PlayerStatisticsService', () => {
  let service: PlayerStatisticsService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/statistics`;

  const mockPlayerStats: PlayerStatisticsResponse = {
    id: 1,
    tournamentId: 1,
    tournamentName: 'Liga Apertura 2024',
    playerId: 100,
    playerName: 'Lionel Messi',
    playerPhotoUrl: 'https://example.com/messi.png',
    playerPosition: 'RIGHT_WINGER',
    teamId: 10,
    teamName: 'Inter Miami',
    teamLogoUrl: 'https://example.com/miami.png',
    matchesPlayed: 15,
    matchesStarted: 14,
    minutesPlayed: 1250,
    goals: 12,
    assists: 8,
    goalContributions: 20,
    penaltyGoals: 2,
    penaltyMissed: 0,
    ownGoals: 0,
    yellowCards: 2,
    redCards: 0,
    secondYellowCards: 0,
    totalCards: 2,
    cleanSheets: 0,
    goalsConceded: 0,
    saves: 0,
    penaltiesSaved: 0,
    goalsRank: 1,
    assistsRank: 2,
    manOfTheMatch: 5,
    goalsPerGame: 0.8,
    assistsPerGame: 0.53,
    minutesPerGoal: 104.17,
    updatedAt: '2024-01-15T10:00:00',
  };

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

  const mockTopAssist: TopAssistResponse = {
    rank: 1,
    playerId: 100,
    playerName: 'Lionel Messi',
    playerPhotoUrl: 'https://example.com/messi.png',
    teamId: 10,
    teamName: 'Inter Miami',
    teamLogoUrl: 'https://example.com/miami.png',
    assists: 8,
    goals: 12,
    matchesPlayed: 15,
    assistsPerGame: 0.53,
  };

  const mockTopContributor: TopContributorResponse = {
    rank: 1,
    playerId: 100,
    playerName: 'Lionel Messi',
    playerPhotoUrl: 'https://example.com/messi.png',
    teamId: 10,
    teamName: 'Inter Miami',
    teamLogoUrl: 'https://example.com/miami.png',
    goals: 12,
    assists: 8,
    contributions: 20,
    matchesPlayed: 15,
  };

  const mockTopCleanSheet: TopCleanSheetResponse = {
    rank: 1,
    playerId: 200,
    playerName: 'Goalkeeper Pro',
    playerPhotoUrl: 'https://example.com/gk.png',
    teamId: 10,
    teamName: 'Inter Miami',
    teamLogoUrl: 'https://example.com/miami.png',
    cleanSheets: 8,
    goalsConceded: 10,
    matchesPlayed: 15,
  };

  const mockCardStats: CardStatsResponse = {
    rank: 1,
    playerId: 300,
    playerName: 'Tough Player',
    playerPhotoUrl: 'https://example.com/tough.png',
    teamId: 10,
    teamName: 'Inter Miami',
    teamLogoUrl: 'https://example.com/miami.png',
    yellowCards: 8,
    redCards: 2,
    secondYellowCards: 1,
    totalCards: 11,
    matchesPlayed: 15,
  };

  const mockScorerTable: ScorerTableResponse = {
    tournamentId: 1,
    tournamentName: 'Liga Apertura 2024',
    scorers: [mockTopScorer],
    lastUpdated: '2024-01-15T10:00:00',
  };

  const mockAssistTable: AssistTableResponse = {
    tournamentId: 1,
    tournamentName: 'Liga Apertura 2024',
    assists: [mockTopAssist],
    lastUpdated: '2024-01-15T10:00:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PlayerStatisticsService],
    });
    service = TestBed.inject(PlayerStatisticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getById', () => {
    it('should return player statistics by id', () => {
      const mockResponse: ApiResponse<PlayerStatisticsResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Statistics retrieved successfully',
        },
        body: {
          data: mockPlayerStats,
        },
      };

      service.getById(1).subscribe((response) => {
        expect(response.body.data.id).toBe(1);
        expect(response.body.data.playerName).toBe('Lionel Messi');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByTournamentAndPlayer', () => {
    it('should return statistics for a player in a tournament', () => {
      const mockResponse: ApiResponse<PlayerStatisticsResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Statistics retrieved successfully',
        },
        body: {
          data: mockPlayerStats,
        },
      };

      service.getByTournamentAndPlayer(1, 100).subscribe((response) => {
        expect(response.body.data.tournamentId).toBe(1);
        expect(response.body.data.playerId).toBe(100);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1/player/100`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByTournamentAndTeam', () => {
    it('should return statistics for all players of a team in a tournament', () => {
      const mockResponse: ApiResponse<PlayerStatisticsResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Statistics retrieved successfully',
        },
        body: {
          data: [mockPlayerStats],
        },
      };

      service.getByTournamentAndTeam(1, 10).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].teamId).toBe(10);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1/team/10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByPlayer', () => {
    it('should return statistics history for a player', () => {
      const mockResponse: ApiResponse<PlayerStatisticsResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Statistics retrieved successfully',
        },
        body: {
          data: [mockPlayerStats],
        },
      };

      service.getByPlayer(100).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].playerId).toBe(100);
      });

      const req = httpMock.expectOne(`${apiUrl}/player/100`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getTopScorers', () => {
    it('should return top scorers with default limit', () => {
      const mockResponse: ApiResponse<ScorerTableResponse> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockScorerTable },
      };

      service.getTopScorers(1).subscribe((response) => {
        expect(response.body.data.scorers.length).toBe(1);
        expect(response.body.data.scorers[0].goals).toBe(12);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/scorers` &&
        request.params.get('limit') === '20'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return top scorers with custom limit', () => {
      const mockResponse: ApiResponse<ScorerTableResponse> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockScorerTable },
      };

      service.getTopScorers(1, 10).subscribe((response) => {
        expect(response.body.data.scorers.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/scorers` &&
        request.params.get('limit') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getTopScorersPaged', () => {
    it('should return paginated top scorers with default parameters', () => {
      const mockPageResponse: PageResponse<TopScorerResponse> = {
        content: [mockTopScorer],
        totalElements: 1,
        totalPages: 1,
        size: 20,
        number: 0,
        first: true,
        last: true,
        empty: false,
      };
      const mockResponse: ApiResponse<PageResponse<TopScorerResponse>> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockPageResponse },
      };

      service.getTopScorersPaged(1).subscribe((response) => {
        expect(response.body.data.content.length).toBe(1);
        expect(response.body.data.totalElements).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/scorers/paged` &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '20' &&
        request.params.get('sort') === 'goals,desc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return paginated top scorers with custom parameters', () => {
      const mockPageResponse: PageResponse<TopScorerResponse> = {
        content: [mockTopScorer],
        totalElements: 50,
        totalPages: 5,
        size: 10,
        number: 2,
        first: false,
        last: false,
        empty: false,
      };
      const mockResponse: ApiResponse<PageResponse<TopScorerResponse>> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockPageResponse },
      };

      service.getTopScorersPaged(1, 2, 10, 'goals,asc').subscribe((response) => {
        expect(response.body.data.number).toBe(2);
        expect(response.body.data.size).toBe(10);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/scorers/paged` &&
        request.params.get('page') === '2' &&
        request.params.get('size') === '10' &&
        request.params.get('sort') === 'goals,asc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getTopAssists', () => {
    it('should return top assists with default limit', () => {
      const mockResponse: ApiResponse<AssistTableResponse> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockAssistTable },
      };

      service.getTopAssists(1).subscribe((response) => {
        expect(response.body.data.assists.length).toBe(1);
        expect(response.body.data.assists[0].assists).toBe(8);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/assists` &&
        request.params.get('limit') === '20'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return top assists with custom limit', () => {
      const mockResponse: ApiResponse<AssistTableResponse> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockAssistTable },
      };

      service.getTopAssists(1, 10).subscribe((response) => {
        expect(response.body.data.assists.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/assists` &&
        request.params.get('limit') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getTopAssistsPaged', () => {
    it('should return paginated top assists with default parameters', () => {
      const mockPageResponse: PageResponse<TopAssistResponse> = {
        content: [mockTopAssist],
        totalElements: 1,
        totalPages: 1,
        size: 20,
        number: 0,
        first: true,
        last: true,
        empty: false,
      };
      const mockResponse: ApiResponse<PageResponse<TopAssistResponse>> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockPageResponse },
      };

      service.getTopAssistsPaged(1).subscribe((response) => {
        expect(response.body.data.content.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/assists/paged` &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '20' &&
        request.params.get('sort') === 'assists,desc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getTopContributors', () => {
    it('should return top contributors with default limit', () => {
      const mockResponse: ApiResponse<TopContributorResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockTopContributor] },
      };

      service.getTopContributors(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].contributions).toBe(20);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/contributors` &&
        request.params.get('limit') === '20'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return top contributors with custom limit', () => {
      const mockResponse: ApiResponse<TopContributorResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockTopContributor] },
      };

      service.getTopContributors(1, 5).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/contributors` &&
        request.params.get('limit') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getTopCleanSheets', () => {
    it('should return top clean sheets with default limit', () => {
      const mockResponse: ApiResponse<TopCleanSheetResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockTopCleanSheet] },
      };

      service.getTopCleanSheets(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].cleanSheets).toBe(8);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/clean-sheets` &&
        request.params.get('limit') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return top clean sheets with custom limit', () => {
      const mockResponse: ApiResponse<TopCleanSheetResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockTopCleanSheet] },
      };

      service.getTopCleanSheets(1, 5).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/clean-sheets` &&
        request.params.get('limit') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getMostYellowCards', () => {
    it('should return players with most yellow cards with default limit', () => {
      const mockResponse: ApiResponse<CardStatsResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockCardStats] },
      };

      service.getMostYellowCards(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].yellowCards).toBe(8);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/yellow-cards` &&
        request.params.get('limit') === '20'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return players with most yellow cards with custom limit', () => {
      const mockResponse: ApiResponse<CardStatsResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockCardStats] },
      };

      service.getMostYellowCards(1, 10).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/yellow-cards` &&
        request.params.get('limit') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getMostRedCards', () => {
    it('should return players with most red cards with default limit', () => {
      const mockResponse: ApiResponse<CardStatsResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockCardStats] },
      };

      service.getMostRedCards(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].redCards).toBe(2);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/red-cards` &&
        request.params.get('limit') === '20'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return players with most red cards with custom limit', () => {
      const mockResponse: ApiResponse<CardStatsResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockCardStats] },
      };

      service.getMostRedCards(1, 10).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/red-cards` &&
        request.params.get('limit') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getMostMatchesPlayed', () => {
    it('should return players with most matches played with default limit', () => {
      const mockResponse: ApiResponse<PlayerStatisticsResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockPlayerStats] },
      };

      service.getMostMatchesPlayed(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].matchesPlayed).toBe(15);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/most-matches` &&
        request.params.get('limit') === '20'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return players with most matches played with custom limit', () => {
      const mockResponse: ApiResponse<PlayerStatisticsResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockPlayerStats] },
      };

      service.getMostMatchesPlayed(1, 10).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/most-matches` &&
        request.params.get('limit') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getMostMinutesPlayed', () => {
    it('should return players with most minutes played with default limit', () => {
      const mockResponse: ApiResponse<PlayerStatisticsResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockPlayerStats] },
      };

      service.getMostMinutesPlayed(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].minutesPlayed).toBe(1250);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/most-minutes` &&
        request.params.get('limit') === '20'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return players with most minutes played with custom limit', () => {
      const mockResponse: ApiResponse<PlayerStatisticsResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockPlayerStats] },
      };

      service.getMostMinutesPlayed(1, 10).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/most-minutes` &&
        request.params.get('limit') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getMostManOfTheMatch', () => {
    it('should return players with most MVP awards with default limit', () => {
      const mockResponse: ApiResponse<PlayerStatisticsResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockPlayerStats] },
      };

      service.getMostManOfTheMatch(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].manOfTheMatch).toBe(5);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/mvp` &&
        request.params.get('limit') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return players with most MVP awards with custom limit', () => {
      const mockResponse: ApiResponse<PlayerStatisticsResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockPlayerStats] },
      };

      service.getMostManOfTheMatch(1, 5).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/mvp` &&
        request.params.get('limit') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('initializePlayerStats', () => {
    it('should initialize statistics for a player in a tournament', () => {
      const mockResponse: ApiResponse<PlayerStatisticsResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Statistics initialized successfully',
        },
        body: {
          data: mockPlayerStats,
        },
      };

      service.initializePlayerStats(1, 100, 10).subscribe((response) => {
        expect(response.body.data.playerId).toBe(100);
        expect(response.header.message).toBe('Statistics initialized successfully');
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/tournament/1/player/100/initialize` &&
        request.params.get('teamId') === '10'
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('updateRankings', () => {
    it('should update rankings for a tournament', () => {
      const mockResponse: ApiResponse<void> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Rankings updated successfully',
        },
        body: {
          data: undefined as unknown as void,
        },
      };

      service.updateRankings(1).subscribe((response) => {
        expect(response.header.message).toBe('Rankings updated successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1/update-rankings`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('countByTournament', () => {
    it('should return count of players with statistics in a tournament', () => {
      const mockResponse: ApiResponse<number> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: 150 },
      };

      service.countByTournament(1).subscribe((response) => {
        expect(response.body.data).toBe(150);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1/count`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('countScorers', () => {
    it('should return count of players with goals in a tournament', () => {
      const mockResponse: ApiResponse<number> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: 45 },
      };

      service.countScorers(1).subscribe((response) => {
        expect(response.body.data).toBe(45);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/1/count/scorers`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
