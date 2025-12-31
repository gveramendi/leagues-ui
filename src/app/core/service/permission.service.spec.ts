import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PermissionService } from './permission.service';
import { environment } from '../../../environments/environment';
import { ApiResponse, CreatePermissionRequest, PermissionResponse } from '../models/response';

describe('PermissionService', () => {
  let service: PermissionService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/permissions`;

  const mockPermission: PermissionResponse = {
    id: 1,
    roleId: 1,
    roleName: 'Admin',
    resourceId: 1,
    resourceCode: 'USER_MANAGEMENT',
    resourceName: 'User Management',
    canCreate: true,
    canRead: true,
    canWrite: false,
    canDelete: false,
    canExecute: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PermissionService],
    });
    service = TestBed.inject(PermissionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getByRoleId', () => {
    it('should return permissions for a role wrapped in ApiResponse', () => {
      const mockResponse: ApiResponse<PermissionResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Permissions retrieved successfully',
        },
        body: {
          data: [
            mockPermission,
            {
              ...mockPermission,
              id: 2,
              resourceId: 2,
              resourceCode: 'ROLE_MANAGEMENT',
              resourceName: 'Role Management',
            },
          ],
        },
      };

      service.getByRoleId(1).subscribe((response) => {
        expect(response.body.data.length).toBe(2);
        expect(response.header.message).toBe('Permissions retrieved successfully');
        expect(response.body.data[0].resourceCode).toBe('USER_MANAGEMENT');
      });

      const req = httpMock.expectOne(`${apiUrl}/role/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return empty array when role has no permissions', () => {
      const mockResponse: ApiResponse<PermissionResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Permissions retrieved successfully',
        },
        body: {
          data: [],
        },
      };

      service.getByRoleId(999).subscribe((response) => {
        expect(response.body.data.length).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/role/999`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('create', () => {
    it('should create a new permission wrapped in ApiResponse', () => {
      const createRequest: CreatePermissionRequest = {
        roleId: 1,
        resourceId: 3,
        canCreate: true,
        canRead: true,
        canWrite: false,
        canDelete: false,
        canExecute: false,
      };

      const mockResponse: ApiResponse<PermissionResponse> = {
        header: {
          success: true,
          statusCode: 201,
          message: 'Permission created successfully',
        },
        body: {
          data: {
            id: 3,
            roleId: 1,
            roleName: 'Admin',
            resourceId: 3,
            resourceCode: 'SETTINGS',
            resourceName: 'Settings',
            canCreate: true,
            canRead: true,
            canWrite: false,
            canDelete: false,
            canExecute: false,
          },
        },
      };

      service.create(createRequest).subscribe((response) => {
        expect(response.header.success).toBeTrue();
        expect(response.header.message).toBe('Permission created successfully');
        expect(response.body.data.id).toBe(3);
        expect(response.body.data.resourceCode).toBe('SETTINGS');
        expect(response.body.data.canCreate).toBeTrue();
        expect(response.body.data.canRead).toBeTrue();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });

    it('should send all permission flags correctly', () => {
      const createRequest: CreatePermissionRequest = {
        roleId: 2,
        resourceId: 5,
        canCreate: false,
        canRead: true,
        canWrite: true,
        canDelete: true,
        canExecute: true,
      };

      const mockResponse: ApiResponse<PermissionResponse> = {
        header: {
          success: true,
          statusCode: 201,
          message: 'Permission created successfully',
        },
        body: {
          data: {
            id: 4,
            roleId: 2,
            roleName: 'Editor',
            resourceId: 5,
            resourceCode: 'CONTENT',
            resourceName: 'Content Management',
            canCreate: false,
            canRead: true,
            canWrite: true,
            canDelete: true,
            canExecute: true,
          },
        },
      };

      service.create(createRequest).subscribe((response) => {
        expect(response.body.data.canCreate).toBeFalse();
        expect(response.body.data.canRead).toBeTrue();
        expect(response.body.data.canWrite).toBeTrue();
        expect(response.body.data.canDelete).toBeTrue();
        expect(response.body.data.canExecute).toBeTrue();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.canCreate).toBeFalse();
      expect(req.request.body.canWrite).toBeTrue();
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a permission and return ApiResponse', () => {
      const mockResponse: ApiResponse<void> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Permission deleted successfully',
        },
        body: {
          data: undefined as unknown as void,
        },
      };

      service.delete(1, 3).subscribe((response) => {
        expect(response.header.success).toBeTrue();
        expect(response.header.message).toBe('Permission deleted successfully');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/roles/1/resources/3`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should call correct URL with roleId and resourceId', () => {
      const mockResponse: ApiResponse<void> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Permission deleted successfully',
        },
        body: {
          data: undefined as unknown as void,
        },
      };

      service.delete(5, 10).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/api/roles/5/resources/10`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });
});
