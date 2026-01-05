import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TeamService } from './team.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  TeamResponse,
  CreateTeamRequest,
  UpdateTeamRequest,
} from '../models/response';

describe('TeamService', () => {
  let service: TeamService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/teams`;

  const mockTeam: TeamResponse = {
    id: 1,
    code: 'FCB-A',
    name: 'FC Barcelona A',
    clubId: 1,
    clubName: 'FC Barcelona',
    category: 'PRIMERA',
    gender: 'MALE',
    footballType: 'FOOTBALL_11',
    seasonYear: 2024,
    status: 'ACTIVE',
    homeVenue: 'Camp Nou',
    primaryColor: '#004D98',
    secondaryColor: '#A50044',
    description: 'First team',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeamService],
    });
    service = TestBed.inject(TeamService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return all teams', () => {
      const mockResponse: ApiResponse<TeamResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockTeam] },
      };

      service.getAll().subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].name).toBe('FC Barcelona A');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should return a team by id', () => {
      const mockResponse: ApiResponse<TeamResponse> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockTeam },
      };

      service.getById(1).subscribe((response) => {
        expect(response.body.data).toEqual(mockTeam);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByCode', () => {
    it('should return a team by code', () => {
      const mockResponse: ApiResponse<TeamResponse> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockTeam },
      };

      service.getByCode('FCB-A').subscribe((response) => {
        expect(response.body.data.code).toBe('FCB-A');
      });

      const req = httpMock.expectOne(`${apiUrl}/code/FCB-A`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByClub', () => {
    it('should return teams by club id', () => {
      const mockResponse: ApiResponse<TeamResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockTeam] },
      };

      service.getByClub(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].clubId).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/club/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('searchTeams', () => {
    const mockSearchResponse: ApiResponse<TeamResponse[]> = {
      header: { success: true, statusCode: 200, message: 'Success' },
      body: {
        data: [mockTeam],
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

    it('should search teams with default parameters', () => {
      service.searchTeams().subscribe((response) => {
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

    it('should search teams with search term', () => {
      service.searchTeams('barcelona', 0, 10, 'name,asc').subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/search` &&
        request.params.get('search') === 'barcelona'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSearchResponse);
    });

    it('should search teams without search param when empty', () => {
      service.searchTeams('', 1, 20, 'code,desc').subscribe();

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
    it('should create a new team', () => {
      const createRequest: CreateTeamRequest = {
        code: 'FCB-B',
        name: 'FC Barcelona B',
        clubId: 1,
        category: 'RESERVA',
        gender: 'MALE',
        footballType: 'FOOTBALL_11',
        seasonYear: 2024,
        status: 'ACTIVE',
      };
      const mockResponse: ApiResponse<TeamResponse> = {
        header: { success: true, statusCode: 201, message: 'Team created successfully' },
        body: { data: { ...mockTeam, id: 2, code: 'FCB-B', name: 'FC Barcelona B' } },
      };

      service.create(createRequest).subscribe((response) => {
        expect(response.body.data.name).toBe('FC Barcelona B');
        expect(response.header.message).toBe('Team created successfully');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing team', () => {
      const updateRequest: UpdateTeamRequest = {
        name: 'FC Barcelona A Updated',
      };
      const mockResponse: ApiResponse<TeamResponse> = {
        header: { success: true, statusCode: 200, message: 'Team updated successfully' },
        body: { data: { ...mockTeam, name: 'FC Barcelona A Updated' } },
      };

      service.update(1, updateRequest).subscribe((response) => {
        expect(response.body.data.name).toBe('FC Barcelona A Updated');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a team', () => {
      const mockResponse: ApiResponse<void> = {
        header: { success: true, statusCode: 200, message: 'Team deleted successfully' },
        body: { data: undefined as unknown as void },
      };

      service.delete(1).subscribe((response) => {
        expect(response.header.message).toBe('Team deleted successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('existsByCode', () => {
    it('should return true if team code exists', () => {
      const mockResponse: ApiResponse<boolean> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: true },
      };

      service.existsByCode('FCB-A').subscribe((response) => {
        expect(response.body.data).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/exists/FCB-A`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return false if team code does not exist', () => {
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
