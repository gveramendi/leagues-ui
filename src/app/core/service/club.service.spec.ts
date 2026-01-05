import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ClubService } from './club.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  ClubResponse,
  CreateClubRequest,
  UpdateClubRequest,
} from '../models/response';

describe('ClubService', () => {
  let service: ClubService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/clubs`;

  const mockClub: ClubResponse = {
    id: 1,
    code: 'FCB',
    name: 'FC Barcelona',
    shortName: 'Barcelona',
    foundationDate: '1899-11-29',
    colors: 'Blue and Red',
    logoUrl: 'https://example.com/logo.png',
    stadiumName: 'Camp Nou',
    stadiumCapacity: 99354,
    website: 'https://www.fcbarcelona.com',
    address: {
      street: 'Carrer d\'Aristides Maillol',
      city: 'Barcelona',
      state: 'Catalonia',
      country: 'Spain',
    },
    contactInfo: {
      email: 'info@fcbarcelona.com',
      phone: '+34 123456789',
    },
    taxId: 'B12345678',
    legalRepresentative: 'Joan Laporta',
    description: 'One of the greatest football clubs',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClubService],
    });
    service = TestBed.inject(ClubService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return all clubs', () => {
      const mockResponse: ApiResponse<ClubResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockClub] },
      };

      service.getAll().subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].name).toBe('FC Barcelona');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should return a club by id', () => {
      const mockResponse: ApiResponse<ClubResponse> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockClub },
      };

      service.getById(1).subscribe((response) => {
        expect(response.body.data).toEqual(mockClub);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByCode', () => {
    it('should return a club by code', () => {
      const mockResponse: ApiResponse<ClubResponse> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockClub },
      };

      service.getByCode('FCB').subscribe((response) => {
        expect(response.body.data.code).toBe('FCB');
      });

      const req = httpMock.expectOne(`${apiUrl}/code/FCB`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('searchClubs', () => {
    const mockSearchResponse: ApiResponse<ClubResponse[]> = {
      header: { success: true, statusCode: 200, message: 'Success' },
      body: {
        data: [mockClub],
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

    it('should search clubs with default parameters', () => {
      service.searchClubs().subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/search` &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '10' &&
        request.params.get('sort') === 'name,asc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSearchResponse);
    });

    it('should search clubs with search term', () => {
      service.searchClubs('barcelona', 0, 10, 'name,asc').subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/search` &&
        request.params.get('search') === 'barcelona'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSearchResponse);
    });

    it('should search clubs without search param when empty', () => {
      service.searchClubs('', 1, 20, 'code,desc').subscribe();

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

  describe('create', () => {
    it('should create a new club', () => {
      const createRequest: CreateClubRequest = {
        code: 'RMA',
        name: 'Real Madrid',
      };
      const mockResponse: ApiResponse<ClubResponse> = {
        header: { success: true, statusCode: 201, message: 'Club created successfully' },
        body: { data: { ...mockClub, id: 2, code: 'RMA', name: 'Real Madrid' } },
      };

      service.create(createRequest).subscribe((response) => {
        expect(response.body.data.name).toBe('Real Madrid');
        expect(response.header.message).toBe('Club created successfully');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing club', () => {
      const updateRequest: UpdateClubRequest = {
        name: 'FC Barcelona Updated',
      };
      const mockResponse: ApiResponse<ClubResponse> = {
        header: { success: true, statusCode: 200, message: 'Club updated successfully' },
        body: { data: { ...mockClub, name: 'FC Barcelona Updated' } },
      };

      service.update(1, updateRequest).subscribe((response) => {
        expect(response.body.data.name).toBe('FC Barcelona Updated');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a club', () => {
      const mockResponse: ApiResponse<void> = {
        header: { success: true, statusCode: 200, message: 'Club deleted successfully' },
        body: { data: undefined as unknown as void },
      };

      service.delete(1).subscribe((response) => {
        expect(response.header.message).toBe('Club deleted successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('existsByCode', () => {
    it('should return true if club code exists', () => {
      const mockResponse: ApiResponse<boolean> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: true },
      };

      service.existsByCode('FCB').subscribe((response) => {
        expect(response.body.data).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/exists/FCB`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return false if club code does not exist', () => {
      const mockResponse: ApiResponse<boolean> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: false },
      };

      service.existsByCode('NONEXISTENT').subscribe((response) => {
        expect(response.body.data).toBeFalse();
      });

      const req = httpMock.expectOne(`${apiUrl}/exists/NONEXISTENT`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
