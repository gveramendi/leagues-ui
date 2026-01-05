import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TournamentTeamService } from './tournament-team.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  RegisterTeamRequest,
  RejectTeamRequest,
  TournamentTeamResponse,
} from '../models/response';

describe('TournamentTeamService', () => {
  let service: TournamentTeamService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/tournaments`;
  const tournamentId = 1;

  const mockTournamentTeam: TournamentTeamResponse = {
    id: 1,
    tournamentId: 1,
    tournamentName: 'Liga Apertura 2024',
    teamId: 10,
    teamName: 'FC Barcelona',
    teamCode: 'FCB',
    clubName: 'Barcelona FC',
    status: 'PENDING',
    registrationDate: '2024-01-15T10:00:00',
    registrationNumber: 1,
    totalPlayed: 0,
    totalWon: 0,
    totalDrawn: 0,
    totalLost: 0,
    totalGoalsFor: 0,
    totalGoalsAgainst: 0,
    totalGoalDifference: 0,
    isChampion: false,
    createdAt: '2024-01-15T10:00:00',
    updatedAt: '2024-01-15T10:00:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TournamentTeamService],
    });
    service = TestBed.inject(TournamentTeamService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registerTeam', () => {
    it('should register a team to a tournament', () => {
      const registerRequest: RegisterTeamRequest = {
        teamId: 10,
        notes: 'Registration notes',
      };
      const mockResponse: ApiResponse<TournamentTeamResponse> = {
        header: {
          success: true,
          statusCode: 201,
          message: 'Team registered successfully',
        },
        body: {
          data: mockTournamentTeam,
        },
      };

      service.registerTeam(tournamentId, registerRequest).subscribe((response) => {
        expect(response.body.data.teamId).toBe(10);
        expect(response.header.message).toBe('Team registered successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/${tournamentId}/teams`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequest);
      req.flush(mockResponse);
    });
  });

  describe('getAll', () => {
    it('should return all teams in a tournament with default pagination', () => {
      const mockResponse: ApiResponse<TournamentTeamResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Teams retrieved successfully',
        },
        body: {
          data: [mockTournamentTeam],
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

      service.getAll(tournamentId).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/${tournamentId}/teams` &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '10' &&
        request.params.get('sort') === 'registrationNumber,asc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return all teams with custom pagination', () => {
      const mockResponse: ApiResponse<TournamentTeamResponse[]> = {
        header: { success: true, statusCode: 200, message: 'Success' },
        body: { data: [mockTournamentTeam] },
      };

      service.getAll(tournamentId, 1, 20, 'teamName,asc').subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${apiUrl}/${tournamentId}/teams` &&
        request.params.get('page') === '1' &&
        request.params.get('size') === '20' &&
        request.params.get('sort') === 'teamName,asc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getApproved', () => {
    it('should return all approved teams in a tournament', () => {
      const approvedTeam = { ...mockTournamentTeam, status: 'APPROVED' as const };
      const mockResponse: ApiResponse<TournamentTeamResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Approved teams retrieved successfully',
        },
        body: {
          data: [approvedTeam],
        },
      };

      service.getApproved(tournamentId).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].status).toBe('APPROVED');
      });

      const req = httpMock.expectOne(`${apiUrl}/${tournamentId}/teams/approved`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPending', () => {
    it('should return all pending teams in a tournament', () => {
      const mockResponse: ApiResponse<TournamentTeamResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Pending teams retrieved successfully',
        },
        body: {
          data: [mockTournamentTeam],
        },
      };

      service.getPending(tournamentId).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].status).toBe('PENDING');
      });

      const req = httpMock.expectOne(`${apiUrl}/${tournamentId}/teams/pending`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('approve', () => {
    it('should approve a team registration', () => {
      const registrationId = 1;
      const approvedTeam = {
        ...mockTournamentTeam,
        status: 'APPROVED' as const,
        approvalDate: '2024-01-16T10:00:00',
      };
      const mockResponse: ApiResponse<TournamentTeamResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Team approved successfully',
        },
        body: {
          data: approvedTeam,
        },
      };

      service.approve(tournamentId, registrationId).subscribe((response) => {
        expect(response.body.data.status).toBe('APPROVED');
        expect(response.body.data.approvalDate).toBeTruthy();
        expect(response.header.message).toBe('Team approved successfully');
      });

      const req = httpMock.expectOne(
        `${apiUrl}/${tournamentId}/teams/${registrationId}/approve`
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('reject', () => {
    it('should reject a team registration', () => {
      const registrationId = 1;
      const rejectRequest: RejectTeamRequest = {
        reason: 'Incomplete documentation',
      };
      const rejectedTeam = {
        ...mockTournamentTeam,
        status: 'REJECTED' as const,
        rejectionReason: 'Incomplete documentation',
      };
      const mockResponse: ApiResponse<TournamentTeamResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Team rejected successfully',
        },
        body: {
          data: rejectedTeam,
        },
      };

      service.reject(tournamentId, registrationId, rejectRequest).subscribe((response) => {
        expect(response.body.data.status).toBe('REJECTED');
        expect(response.body.data.rejectionReason).toBe('Incomplete documentation');
        expect(response.header.message).toBe('Team rejected successfully');
      });

      const req = httpMock.expectOne(
        `${apiUrl}/${tournamentId}/teams/${registrationId}/reject`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(rejectRequest);
      req.flush(mockResponse);
    });
  });

  describe('withdraw', () => {
    it('should withdraw a team from a tournament', () => {
      const registrationId = 1;
      const withdrawRequest: RejectTeamRequest = {
        reason: 'Team withdrew due to financial issues',
      };
      const withdrawnTeam = {
        ...mockTournamentTeam,
        status: 'WITHDRAWN' as const,
        withdrawalReason: 'Team withdrew due to financial issues',
      };
      const mockResponse: ApiResponse<TournamentTeamResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Team withdrawn successfully',
        },
        body: {
          data: withdrawnTeam,
        },
      };

      service.withdraw(tournamentId, registrationId, withdrawRequest).subscribe((response) => {
        expect(response.body.data.status).toBe('WITHDRAWN');
        expect(response.body.data.withdrawalReason).toBe('Team withdrew due to financial issues');
        expect(response.header.message).toBe('Team withdrawn successfully');
      });

      const req = httpMock.expectOne(
        `${apiUrl}/${tournamentId}/teams/${registrationId}/withdraw`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(withdrawRequest);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a team registration', () => {
      const registrationId = 1;
      const mockResponse: ApiResponse<void> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Team registration deleted successfully',
        },
        body: {
          data: undefined as unknown as void,
        },
      };

      service.delete(tournamentId, registrationId).subscribe((response) => {
        expect(response.header.message).toBe('Team registration deleted successfully');
      });

      const req = httpMock.expectOne(
        `${apiUrl}/${tournamentId}/teams/${registrationId}`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });
});
