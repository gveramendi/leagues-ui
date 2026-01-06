import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SanctionService } from './sanction.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  SanctionResponse,
  CreateSanctionRequest,
  UpdateSanctionRequest,
  AppealSanctionRequest,
  ResolveAppealRequest,
  SanctionType,
  SanctionStatus,
} from '../models/response';

describe('SanctionService', () => {
  let service: SanctionService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/sanctions`;

  const mockSanction: SanctionResponse = {
    id: 1,
    tournamentId: 10,
    tournamentName: 'Liga Premier 2024',
    playerId: 100,
    playerName: 'John Doe',
    playerPhotoUrl: 'https://example.com/player.png',
    teamId: 50,
    teamName: 'FC Barcelona',
    teamLogoUrl: 'https://example.com/team.png',
    matchId: 200,
    matchDescription: 'FC Barcelona vs Real Madrid - Jornada 10',
    sanctionType: 'RED_CARD_DIRECT',
    sanctionTypeDisplayName: 'Tarjeta Roja Directa',
    status: 'ACTIVE',
    statusDisplayName: 'Activa',
    description: 'Conducta violenta hacia un rival',
    matchesSuspended: 3,
    matchesServed: 1,
    remainingMatches: 2,
    fullyServed: false,
    fineAmount: 500,
    fineCurrency: 'USD',
    finePaid: false,
    infractionDate: '2024-03-15',
    effectiveDate: '2024-03-16',
    isAutomatic: true,
    createdAt: '2024-03-15T10:00:00',
    updatedAt: '2024-03-15T10:00:00',
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
      providers: [SanctionService],
    });
    service = TestBed.inject(SanctionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ==================== QUERIES ====================

  describe('getById', () => {
    it('should get sanction by ID', () => {
      service.getById(1).subscribe((response) => {
        expect(response.body.data).toEqual(mockSanction);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse(mockSanction));
    });
  });

  describe('getByTournament', () => {
    it('should get sanctions by tournament with pagination', () => {
      service.getByTournament(10, 0, 20).subscribe((response) => {
        expect(response.body.data).toEqual([mockSanction]);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/10?page=0&size=20&sort=createdAt,desc`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockSanction]));
    });

    it('should use default pagination values', () => {
      service.getByTournament(10).subscribe((response) => {
        expect(response.body.data).toEqual([mockSanction]);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/10?page=0&size=20&sort=createdAt,desc`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockSanction]));
    });
  });

  describe('getByPlayer', () => {
    it('should get sanctions by player', () => {
      service.getByPlayer(100).subscribe((response) => {
        expect(response.body.data).toEqual([mockSanction]);
      });

      const req = httpMock.expectOne(`${apiUrl}/player/100`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockSanction]));
    });
  });

  describe('getByTeam', () => {
    it('should get sanctions by team', () => {
      service.getByTeam(50).subscribe((response) => {
        expect(response.body.data).toEqual([mockSanction]);
      });

      const req = httpMock.expectOne(`${apiUrl}/team/50`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockSanction]));
    });
  });

  describe('getByTournamentAndPlayer', () => {
    it('should get sanctions by tournament and player', () => {
      service.getByTournamentAndPlayer(10, 100).subscribe((response) => {
        expect(response.body.data).toEqual([mockSanction]);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/10/player/100`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockSanction]));
    });
  });

  describe('getByStatus', () => {
    it('should get sanctions by tournament and status', () => {
      service.getByStatus(10, 'ACTIVE').subscribe((response) => {
        expect(response.body.data).toEqual([mockSanction]);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/10/status/ACTIVE`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockSanction]));
    });

    it('should get sanctions with PENDING status', () => {
      service.getByStatus(10, 'PENDING').subscribe((response) => {
        expect(response.body.data).toEqual([mockSanction]);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/10/status/PENDING`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockSanction]));
    });
  });

  describe('getPending', () => {
    it('should get pending sanctions for a tournament', () => {
      service.getPending(10).subscribe((response) => {
        expect(response.body.data).toEqual([mockSanction]);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/10/pending`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockSanction]));
    });
  });

  describe('getAppealed', () => {
    it('should get appealed sanctions for a tournament', () => {
      service.getAppealed(10).subscribe((response) => {
        expect(response.body.data).toEqual([mockSanction]);
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/10/appealed`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockSanction]));
    });
  });

  describe('isPlayerSuspended', () => {
    it('should check if player is suspended', () => {
      service.isPlayerSuspended(10, 100).subscribe((response) => {
        expect(response.body.data).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/10/player/100/is-suspended`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse(true));
    });

    it('should return false if player is not suspended', () => {
      service.isPlayerSuspended(10, 100).subscribe((response) => {
        expect(response.body.data).toBeFalse();
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/10/player/100/is-suspended`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse(false));
    });
  });

  // ==================== CREATE ====================

  describe('create', () => {
    it('should create a new sanction', () => {
      const request: CreateSanctionRequest = {
        tournamentId: 10,
        playerId: 100,
        teamId: 50,
        matchId: 200,
        sanctionType: 'RED_CARD_DIRECT',
        description: 'Conducta violenta hacia un rival',
        matchesSuspended: 3,
        fineAmount: 500,
        fineCurrency: 'USD',
      };

      service.create(request).subscribe((response) => {
        expect(response.body.data).toEqual(mockSanction);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(createApiResponse(mockSanction));
    });
  });

  // ==================== UPDATE ====================

  describe('update', () => {
    it('should update a sanction', () => {
      const request: UpdateSanctionRequest = {
        description: 'Updated description',
        matchesSuspended: 2,
        fineAmount: 300,
      };

      service.update(1, request).subscribe((response) => {
        expect(response.body.data).toEqual(mockSanction);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(createApiResponse(mockSanction));
    });
  });

  describe('activate', () => {
    it('should activate a pending sanction', () => {
      service.activate(1).subscribe((response) => {
        expect(response.body.data).toEqual(mockSanction);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/activate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(createApiResponse(mockSanction));
    });
  });

  describe('appeal', () => {
    it('should register an appeal for a sanction', () => {
      const request: AppealSanctionRequest = {
        appealNotes: 'The player did not commit the infraction',
      };

      service.appeal(1, request).subscribe((response) => {
        expect(response.body.data).toEqual(mockSanction);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/appeal`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(createApiResponse(mockSanction));
    });
  });

  describe('resolveAppeal', () => {
    it('should resolve a sanction appeal', () => {
      const request: ResolveAppealRequest = {
        resolution: 'Appeal accepted, sanction reduced',
        newMatchesSuspended: 1,
        resolvedBy: 'Discipline Committee',
      };

      service.resolveAppeal(1, request).subscribe((response) => {
        expect(response.body.data).toEqual(mockSanction);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/resolve-appeal`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(createApiResponse(mockSanction));
    });
  });

  describe('cancel', () => {
    it('should cancel a sanction', () => {
      const reason = 'Sanction issued in error';

      service.cancel(1, reason).subscribe((response) => {
        expect(response.body.data).toEqual(mockSanction);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/cancel?reason=${encodeURIComponent(reason)}`);
      expect(req.request.method).toBe('POST');
      req.flush(createApiResponse(mockSanction));
    });
  });

  describe('markFinePaid', () => {
    it('should mark the fine as paid', () => {
      service.markFinePaid(1).subscribe((response) => {
        expect(response.body.data).toEqual(mockSanction);
      });

      const req = httpMock.expectOne(`${apiUrl}/1/mark-fine-paid`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(createApiResponse(mockSanction));
    });
  });

  describe('serveMatch', () => {
    it('should register that a player served a match', () => {
      service.serveMatch(10, 100).subscribe((response) => {
        expect(response.header.success).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/tournament/10/player/100/serve-match`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(createApiResponse(null));
    });
  });

  // ==================== DELETE ====================

  describe('delete', () => {
    it('should delete a sanction', () => {
      service.delete(1).subscribe((response) => {
        expect(response.header.success).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(createApiResponse(null));
    });
  });

  // ==================== ENUMS ====================

  describe('getSanctionTypes', () => {
    it('should get all sanction types', () => {
      const types: SanctionType[] = ['RED_CARD_DIRECT', 'YELLOW_CARD_ACCUMULATION', 'VIOLENT_CONDUCT'];

      service.getSanctionTypes().subscribe((response) => {
        expect(response.body.data).toEqual(types);
      });

      const req = httpMock.expectOne(`${apiUrl}/types`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse(types));
    });
  });

  describe('getSanctionStatuses', () => {
    it('should get all sanction statuses', () => {
      const statuses: SanctionStatus[] = ['PENDING', 'ACTIVE', 'SERVED', 'APPEALED', 'CANCELLED'];

      service.getSanctionStatuses().subscribe((response) => {
        expect(response.body.data).toEqual(statuses);
      });

      const req = httpMock.expectOne(`${apiUrl}/statuses`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse(statuses));
    });
  });
});
