import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RoleService } from './role.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreateRoleRequest,
  RoleResponse,
  UpdateRoleRequest,
} from '../models/response';

describe('RoleService', () => {
  let service: RoleService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/roles`;

  const mockRole: RoleResponse = {
    id: 1,
    name: 'Admin',
    description: 'Administrator role',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RoleService],
    });
    service = TestBed.inject(RoleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return all roles wrapped in ApiResponse', () => {
      const mockResponse: ApiResponse<RoleResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Roles retrieved successfully',
        },
        body: {
          data: [mockRole, { ...mockRole, id: 2, name: 'User' }],
        },
      };

      service.getAll().subscribe((response) => {
        expect(response.body.data.length).toBe(2);
        expect(response.header.message).toBe('Roles retrieved successfully');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should return a role by id wrapped in ApiResponse', () => {
      const mockResponse: ApiResponse<RoleResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Role retrieved successfully',
        },
        body: {
          data: mockRole,
        },
      };

      service.getById(1).subscribe((response) => {
        expect(response.body.data).toEqual(mockRole);
        expect(response.header.message).toBe('Role retrieved successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByName', () => {
    it('should return a role by name wrapped in ApiResponse', () => {
      const mockResponse: ApiResponse<RoleResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Role retrieved successfully',
        },
        body: {
          data: mockRole,
        },
      };

      service.getByName('Admin').subscribe((response) => {
        expect(response.body.data).toEqual(mockRole);
        expect(response.body.data.name).toBe('Admin');
      });

      const req = httpMock.expectOne(`${apiUrl}/name/Admin`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('searchRoles', () => {
    const mockSearchResponse: ApiResponse<RoleResponse[]> = {
      header: {
        success: true,
        statusCode: 200,
        message: 'Success',
      },
      body: {
        pagination: {
          totalElements: 2,
          totalPages: 1,
          size: 10,
          number: 0,
          first: true,
          last: true,
          empty: false,
        },
        data: [mockRole, { ...mockRole, id: 2, name: 'User' }],
      },
    };

    it('should search roles with default parameters', () => {
      service.searchRoles().subscribe((response) => {
        expect(response.body.data.length).toBe(2);
        expect(response.body.pagination?.totalElements).toBe(2);
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

    it('should search roles with custom parameters', () => {
      service.searchRoles('admin', 1, 20, 'name,desc').subscribe((response) => {
        expect(response.body.data.length).toBe(2);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/search` &&
        request.params.get('search') === 'admin' &&
        request.params.get('page') === '1' &&
        request.params.get('size') === '20' &&
        request.params.get('sort') === 'name,desc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSearchResponse);
    });

    it('should not include search param when search is empty', () => {
      service.searchRoles('', 0, 10, 'name,asc').subscribe();

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/search` && !request.params.has('search')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSearchResponse);
    });
  });

  describe('create', () => {
    it('should create a new role', () => {
      const createRequest: CreateRoleRequest = {
        name: 'NewRole',
        description: 'New role description',
      };
      const mockResponse: ApiResponse<RoleResponse> = {
        header: {
          success: true,
          statusCode: 201,
          message: 'Role created successfully',
        },
        body: {
          data: { ...mockRole, id: 3, name: 'NewRole', description: 'New role description' },
        },
      };

      service.create(createRequest).subscribe((response) => {
        expect(response.body.data.name).toBe('NewRole');
        expect(response.header.message).toBe('Role created successfully');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing role', () => {
      const updateRequest: UpdateRoleRequest = {
        description: 'Updated description',
      };
      const mockResponse: ApiResponse<RoleResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Role updated successfully',
        },
        body: {
          data: { ...mockRole, description: 'Updated description' },
        },
      };

      service.update(1, updateRequest).subscribe((response) => {
        expect(response.body.data.description).toBe('Updated description');
        expect(response.header.message).toBe('Role updated successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a role', () => {
      const mockResponse: ApiResponse<void> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Role deleted successfully',
        },
        body: {
          data: undefined as unknown as void,
        },
      };

      service.delete(1).subscribe((response) => {
        expect(response.header.message).toBe('Role deleted successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('existsByName', () => {
    it('should return true if role name exists', () => {
      service.existsByName('Admin').subscribe((exists) => {
        expect(exists).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/exists/Admin`);
      expect(req.request.method).toBe('GET');
      req.flush(true);
    });

    it('should return false if role name does not exist', () => {
      service.existsByName('NonExistent').subscribe((exists) => {
        expect(exists).toBeFalse();
      });

      const req = httpMock.expectOne(`${apiUrl}/exists/NonExistent`);
      expect(req.request.method).toBe('GET');
      req.flush(false);
    });
  });
});
