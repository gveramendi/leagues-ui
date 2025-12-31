import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PermissionService } from './permission.service';
import { environment } from '../../../environments/environment';
import { ApiResponse, PermissionResponse } from '../models/response';

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
});
