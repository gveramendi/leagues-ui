import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { StaffMemberService } from './staff-member.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  StaffMemberResponse,
  CreateStaffMemberRequest,
  UpdateStaffMemberRequest,
} from '../models/response';

describe('StaffMemberService', () => {
  let service: StaffMemberService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/staff-members`;

  const mockStaffMember: StaffMemberResponse = {
    id: 1,
    teamId: 1,
    teamName: 'FC Barcelona A',
    firstName: 'Xavi',
    lastName: 'Hernandez',
    fullName: 'Xavi Hernandez',
    role: 'HEAD_COACH',
    roleDisplayName: 'Head Coach',
    nationality: 'Spanish',
    birthDate: '1980-01-25',
    email: 'xavi@fcbarcelona.com',
    phone: '+34 123456789',
    documentType: 'DNI',
    documentNumber: '12345678A',
    licenseNumber: 'UEFA-PRO-001',
    startDate: '2021-11-01',
    currentlyActive: true,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StaffMemberService],
    });
    service = TestBed.inject(StaffMemberService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getById', () => {
    it('should return a staff member by id', () => {
      const mockResponse: ApiResponse<StaffMemberResponse> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: mockStaffMember },
      };

      service.getById(1).subscribe((response) => {
        expect(response.body.data).toEqual(mockStaffMember);
        expect(response.body.data.fullName).toBe('Xavi Hernandez');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByTeam', () => {
    it('should return staff members by team id', () => {
      const mockResponse: ApiResponse<StaffMemberResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockStaffMember] },
      };

      service.getByTeam(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].teamId).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/team/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('create', () => {
    it('should create a new staff member', () => {
      const createRequest: CreateStaffMemberRequest = {
        teamId: 1,
        firstName: 'Jordi',
        lastName: 'Cruyff',
        role: 'ASSISTANT_COACH',
        nationality: 'Dutch',
        documentType: 'PASSPORT',
        documentNumber: 'AB123456',
        startDate: '2024-01-01',
      };
      const mockResponse: ApiResponse<StaffMemberResponse> = {
        header: { success: true, statusCode: 201, message: 'Staff member created successfully' },
        body: {
          data: {
            ...mockStaffMember,
            id: 2,
            firstName: 'Jordi',
            lastName: 'Cruyff',
            fullName: 'Jordi Cruyff',
            role: 'ASSISTANT_COACH',
          },
        },
      };

      service.create(createRequest).subscribe((response) => {
        expect(response.body.data.firstName).toBe('Jordi');
        expect(response.header.message).toBe('Staff member created successfully');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing staff member', () => {
      const updateRequest: UpdateStaffMemberRequest = {
        role: 'TEAM_MANAGER',
        licenseNumber: 'UEFA-PRO-002',
      };
      const mockResponse: ApiResponse<StaffMemberResponse> = {
        header: { success: true, statusCode: 200, message: 'Staff member updated successfully' },
        body: { data: { ...mockStaffMember, role: 'TEAM_MANAGER', licenseNumber: 'UEFA-PRO-002' } },
      };

      service.update(1, updateRequest).subscribe((response) => {
        expect(response.body.data.role).toBe('TEAM_MANAGER');
        expect(response.body.data.licenseNumber).toBe('UEFA-PRO-002');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a staff member', () => {
      const mockResponse: ApiResponse<void> = {
        header: { success: true, statusCode: 200, message: 'Staff member deleted successfully' },
        body: { data: undefined as unknown as void },
      };

      service.delete(1).subscribe((response) => {
        expect(response.header.message).toBe('Staff member deleted successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });
});
