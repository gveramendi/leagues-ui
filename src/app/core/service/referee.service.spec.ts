import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RefereeService } from './referee.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  RefereeResponse,
  CreateRefereeRequest,
  UpdateRefereeRequest,
} from '../models/response';

describe('RefereeService', () => {
  let service: RefereeService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/referees`;

  const mockReferee: RefereeResponse = {
    id: 1,
    firstName: 'Howard',
    lastName: 'Webb',
    fullName: 'Howard Webb',
    documentNumber: '12345678',
    licenseNumber: 'FIFA-001',
    category: 'FIFA',
    categoryDisplayName: 'FIFA',
    dateOfBirth: '1971-07-14',
    nationality: 'English',
    photoUrl: 'https://example.com/webb.png',
    phone: '+44123456789',
    email: 'howard.webb@fifa.com',
    licenseExpiration: '2025-12-31',
    isLicenseValid: true,
    totalMatchesAsMain: 150,
    totalMatchesAsAssistant: 50,
    totalYellowCardsGiven: 500,
    totalRedCardsGiven: 25,
    createdAt: '2024-01-01T10:00:00',
    updatedAt: '2024-01-01T10:00:00',
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
      providers: [RefereeService],
    });
    service = TestBed.inject(RefereeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should create a new referee', () => {
      const request: CreateRefereeRequest = {
        firstName: 'Howard',
        lastName: 'Webb',
        licenseNumber: 'FIFA-001',
        category: 'FIFA',
        dateOfBirth: '1971-07-14',
        nationality: 'English',
        email: 'howard.webb@fifa.com',
      };

      service.create(request).subscribe((response) => {
        expect(response.body.data).toEqual(mockReferee);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(createApiResponse(mockReferee));
    });
  });

  describe('getById', () => {
    it('should get referee by ID', () => {
      service.getById(1).subscribe((response) => {
        expect(response.body.data).toEqual(mockReferee);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse(mockReferee));
    });
  });

  describe('getAll', () => {
    it('should get all referees with pagination', () => {
      service.getAll(0, 20).subscribe((response) => {
        expect(response.body.data).toEqual([mockReferee]);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20&sort=lastName,asc`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockReferee]));
    });

    it('should use default pagination values', () => {
      service.getAll().subscribe((response) => {
        expect(response.body.data).toEqual([mockReferee]);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=20&sort=lastName,asc`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockReferee]));
    });
  });

  describe('search', () => {
    it('should search referees by query', () => {
      service.search('Webb', 0, 20).subscribe((response) => {
        expect(response.body.data).toEqual([mockReferee]);
      });

      const req = httpMock.expectOne(`${apiUrl}/search?query=Webb&page=0&size=20&sort=lastName,asc`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockReferee]));
    });

    it('should use default pagination values for search', () => {
      service.search('Howard').subscribe((response) => {
        expect(response.body.data).toEqual([mockReferee]);
      });

      const req = httpMock.expectOne(`${apiUrl}/search?query=Howard&page=0&size=20&sort=lastName,asc`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockReferee]));
    });
  });

  describe('getByCategory', () => {
    it('should get referees by category', () => {
      service.getByCategory('FIFA', 0, 20).subscribe((response) => {
        expect(response.body.data).toEqual([mockReferee]);
      });

      const req = httpMock.expectOne(`${apiUrl}/category/FIFA?page=0&size=20&sort=lastName,asc`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockReferee]));
    });

    it('should get referees by NATIONAL category', () => {
      service.getByCategory('NATIONAL').subscribe((response) => {
        expect(response.body.data).toEqual([mockReferee]);
      });

      const req = httpMock.expectOne(`${apiUrl}/category/NATIONAL?page=0&size=20&sort=lastName,asc`);
      expect(req.request.method).toBe('GET');
      req.flush(createApiResponse([mockReferee]));
    });
  });

  describe('update', () => {
    it('should update referee', () => {
      const request: UpdateRefereeRequest = {
        firstName: 'Howard',
        lastName: 'Webb Jr.',
        phone: '+44987654321',
      };

      service.update(1, request).subscribe((response) => {
        expect(response.body.data).toEqual(mockReferee);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(createApiResponse(mockReferee));
    });
  });

  describe('delete', () => {
    it('should delete referee', () => {
      service.delete(1).subscribe((response) => {
        expect(response.header.success).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(createApiResponse(null));
    });
  });
});
