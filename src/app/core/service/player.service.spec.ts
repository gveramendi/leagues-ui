import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PlayerService } from './player.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  PlayerResponse,
  CreatePlayerRequest,
  UpdatePlayerRequest,
} from '../models/response';

describe('PlayerService', () => {
  let service: PlayerService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/players`;

  const mockPlayer: PlayerResponse = {
    id: 1,
    firstName: 'Lionel',
    lastName: 'Messi',
    fullName: 'Lionel Messi',
    documentType: 'DNI',
    documentNumber: '12345678',
    birthDate: '1987-06-24',
    birthPlace: 'Rosario',
    nationality: 'Argentina',
    secondNationality: 'Spain',
    gender: 'MALE',
    height: 170,
    weight: 72,
    footPreference: 'LEFT',
    primaryPosition: 'RIGHT_WINGER',
    secondaryPosition: 'ATTACKING_MIDFIELDER',
    email: 'messi@example.com',
    phone: '+54 123456789',
    address: 'Miami, USA',
    photoUrl: 'https://example.com/messi.jpg',
    age: 36,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PlayerService],
    });
    service = TestBed.inject(PlayerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should create a new player', () => {
      const createRequest: CreatePlayerRequest = {
        firstName: 'Cristiano',
        lastName: 'Ronaldo',
        documentType: 'PASSPORT',
        documentNumber: 'AB123456',
        birthDate: '1985-02-05',
        nationality: 'Portugal',
        gender: 'MALE',
      };
      const mockResponse: ApiResponse<PlayerResponse> = {
        header: { success: true, statusCode: 201, message: 'Player created successfully' },
        body: {
          data: {
            ...mockPlayer,
            id: 2,
            firstName: 'Cristiano',
            lastName: 'Ronaldo',
            fullName: 'Cristiano Ronaldo',
          },
        },
      };

      service.create(createRequest).subscribe((response) => {
        expect(response.body.data.firstName).toBe('Cristiano');
        expect(response.header.message).toBe('Player created successfully');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should return a player by id', () => {
      const mockResponse: ApiResponse<PlayerResponse> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockPlayer },
      };

      service.getById(1).subscribe((response) => {
        expect(response.body.data).toEqual(mockPlayer);
        expect(response.body.data.fullName).toBe('Lionel Messi');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByDocument', () => {
    it('should return a player by document type and number', () => {
      const mockResponse: ApiResponse<PlayerResponse> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockPlayer },
      };

      service.getByDocument('DNI', '12345678').subscribe((response) => {
        expect(response.body.data.documentType).toBe('DNI');
        expect(response.body.data.documentNumber).toBe('12345678');
      });

      const req = httpMock.expectOne(`${apiUrl}/document/DNI/12345678`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('search', () => {
    const mockSearchResponse: ApiResponse<PlayerResponse[]> = {
      header: { success: true, statusCode: 200, message: 'Success' },
      body: {
        data: [mockPlayer],
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

    it('should search players with default parameters', () => {
      service.search().subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/search` &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '10' &&
        request.params.get('sort') === 'lastName,asc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSearchResponse);
    });

    it('should search players with search term', () => {
      service.search('messi', 0, 10, 'lastName,asc').subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/search` &&
        request.params.get('search') === 'messi'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSearchResponse);
    });

    it('should search players without search param when undefined', () => {
      service.search(undefined, 1, 20, 'firstName,desc').subscribe();

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/search` &&
        !request.params.has('search') &&
        request.params.get('page') === '1' &&
        request.params.get('size') === '20'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSearchResponse);
    });
  });

  describe('update', () => {
    it('should update an existing player', () => {
      const updateRequest: UpdatePlayerRequest = {
        height: 171,
        weight: 73,
        address: 'Barcelona, Spain',
      };
      const mockResponse: ApiResponse<PlayerResponse> = {
        header: { success: true, statusCode: 200, message: 'Player updated successfully' },
        body: { data: { ...mockPlayer, height: 171, weight: 73, address: 'Barcelona, Spain' } },
      };

      service.update(1, updateRequest).subscribe((response) => {
        expect(response.body.data.height).toBe(171);
        expect(response.body.data.address).toBe('Barcelona, Spain');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a player', () => {
      const mockResponse: ApiResponse<void> = {
        header: { success: true, statusCode: 200, message: 'Player deleted successfully' },
        body: { data: undefined as unknown as void },
      };

      service.delete(1).subscribe((response) => {
        expect(response.header.message).toBe('Player deleted successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });
});
