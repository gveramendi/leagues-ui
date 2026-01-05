import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PlayerRegistrationService } from './player-registration.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  PlayerRegistrationResponse,
  CreatePlayerRegistrationRequest,
  UpdatePlayerRegistrationRequest,
} from '../models/response';

describe('PlayerRegistrationService', () => {
  let service: PlayerRegistrationService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/player-registrations`;

  const mockRegistration: PlayerRegistrationResponse = {
    id: 1,
    playerId: 1,
    playerFullName: 'Lionel Messi',
    teamId: 1,
    teamName: 'FC Barcelona A',
    seasonYear: 2024,
    jerseyNumber: 10,
    position: 'RIGHT_WINGER',
    positionDisplayName: 'Right Winger',
    status: 'ACTIVE',
    statusDisplayName: 'Active',
    registrationDate: '2024-01-01',
    isCaptain: true,
    isViceCaptain: false,
    contractStart: '2024-01-01',
    contractEnd: '2025-06-30',
    isCurrentlyActive: true,
    isOnLoan: false,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PlayerRegistrationService],
    });
    service = TestBed.inject(PlayerRegistrationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should create a new player registration', () => {
      const createRequest: CreatePlayerRegistrationRequest = {
        playerId: 2,
        teamId: 1,
        seasonYear: 2024,
        jerseyNumber: 7,
        position: 'STRIKER',
        status: 'ACTIVE',
        registrationDate: '2024-01-15',
      };
      const mockResponse: ApiResponse<PlayerRegistrationResponse> = {
        header: { success: true, statusCode: 201, message: 'Player registered successfully' },
        body: {
          data: {
            ...mockRegistration,
            id: 2,
            playerId: 2,
            jerseyNumber: 7,
            position: 'STRIKER',
          },
        },
      };

      service.create(createRequest).subscribe((response) => {
        expect(response.body.data.playerId).toBe(2);
        expect(response.body.data.jerseyNumber).toBe(7);
        expect(response.header.message).toBe('Player registered successfully');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should return a player registration by id', () => {
      const mockResponse: ApiResponse<PlayerRegistrationResponse> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockRegistration },
      };

      service.getById(1).subscribe((response) => {
        expect(response.body.data).toEqual(mockRegistration);
        expect(response.body.data.playerFullName).toBe('Lionel Messi');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByTeam', () => {
    it('should return player registrations by team and season', () => {
      const mockResponse: ApiResponse<PlayerRegistrationResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockRegistration] },
      };

      service.getByTeam(1, 2024).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].teamId).toBe(1);
        expect(response.body.data[0].seasonYear).toBe(2024);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/team/1` &&
        request.params.get('seasonYear') === '2024'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByPlayer', () => {
    it('should return all registrations for a player', () => {
      const mockResponse: ApiResponse<PlayerRegistrationResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockRegistration] },
      };

      service.getByPlayer(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].playerId).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/player/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing player registration', () => {
      const updateRequest: UpdatePlayerRegistrationRequest = {
        jerseyNumber: 30,
        isCaptain: false,
        isViceCaptain: true,
      };
      const mockResponse: ApiResponse<PlayerRegistrationResponse> = {
        header: { success: true, statusCode: 200, message: 'Registration updated successfully' },
        body: {
          data: {
            ...mockRegistration,
            jerseyNumber: 30,
            isCaptain: false,
            isViceCaptain: true,
          },
        },
      };

      service.update(1, updateRequest).subscribe((response) => {
        expect(response.body.data.jerseyNumber).toBe(30);
        expect(response.body.data.isCaptain).toBeFalse();
        expect(response.body.data.isViceCaptain).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a player registration', () => {
      const mockResponse: ApiResponse<void> = {
        header: { success: true, statusCode: 200, message: 'Registration deleted successfully' },
        body: { data: undefined as unknown as void },
      };

      service.delete(1).subscribe((response) => {
        expect(response.header.message).toBe('Registration deleted successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });
});
