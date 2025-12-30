import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RoleService } from './role.service';
import { environment } from '../../../environments/environment';
import { Role } from '../models/role';
import { PageResponse, RoleResponse, SuccessResponse } from '../models/response';

describe('RoleService', () => {
  let service: RoleService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/roles`;

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
    it('should return all roles', () => {
      const mockRoles: Role[] = [
        { id: 1, name: 'Admin', description: 'Administrator role' },
        { id: 2, name: 'User', description: 'User role' },
      ];

      service.getAll().subscribe((roles) => {
        expect(roles.length).toBe(2);
        expect(roles).toEqual(mockRoles);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockRoles);
    });
  });

  describe('getById', () => {
    it('should return a role by id', () => {
      const mockRole: Role = { id: 1, name: 'Admin', description: 'Administrator role' };

      service.getById(1).subscribe((role) => {
        expect(role).toEqual(mockRole);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRole);
    });
  });

  describe('create', () => {
    it('should create a new role', () => {
      const newRole: Role = { id: 0, name: 'NewRole', description: 'New role description' };
      const createdRole: Role = { ...newRole, id: 3 };

      service.create(newRole).subscribe((role) => {
        expect(role).toEqual(createdRole);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newRole);
      req.flush(createdRole);
    });
  });

  describe('update', () => {
    it('should update an existing role', () => {
      const updatedRole: Role = { id: 1, name: 'UpdatedAdmin', description: 'Updated description' };

      service.update(1, updatedRole).subscribe((role) => {
        expect(role).toEqual(updatedRole);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedRole);
      req.flush(updatedRole);
    });
  });

  describe('delete', () => {
    it('should delete a role', () => {
      service.delete(1).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('searchRoles', () => {
    const mockResponse: SuccessResponse<PageResponse<RoleResponse>> = {
      message: 'Success',
      data: {
        content: [
          { id: 1, name: 'Admin', description: 'Administrator role' },
          { id: 2, name: 'User', description: 'User role' },
        ],
        totalElements: 2,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false,
      },
    };

    it('should search roles with default parameters', () => {
      service.searchRoles().subscribe((response) => {
        expect(response.data.content.length).toBe(2);
        expect(response.data.totalElements).toBe(2);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/search` &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '10' &&
        request.params.get('sort') === 'name,asc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should search roles with custom parameters', () => {
      service.searchRoles('admin', 1, 20, 'name,desc').subscribe((response) => {
        expect(response.data.content.length).toBe(2);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/search` &&
        request.params.get('search') === 'admin' &&
        request.params.get('page') === '1' &&
        request.params.get('size') === '20' &&
        request.params.get('sort') === 'name,desc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should not include search param when search is empty', () => {
      service.searchRoles('', 0, 10, 'name,asc').subscribe();

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/search` &&
        !request.params.has('search')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
