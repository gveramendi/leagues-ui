import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  TournamentTeamResponse,
  RegisterTeamRequest,
  RejectTeamRequest,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class TournamentTeamService {
  private apiUrl = `${environment.apiUrl}/api/tournaments`;

  constructor(private http: HttpClient) {}

  /**
   * POST /api/tournaments/{tournamentId}/teams
   * Register a team to participate in the tournament
   */
  registerTeam(
    tournamentId: number,
    request: RegisterTeamRequest
  ): Observable<ApiResponse<TournamentTeamResponse>> {
    return this.http.post<ApiResponse<TournamentTeamResponse>>(
      `${this.apiUrl}/${tournamentId}/teams`,
      request
    );
  }

  /**
   * GET /api/tournaments/{tournamentId}/teams
   * Get all teams registered in the tournament with pagination
   */
  getAll(
    tournamentId: number,
    page: number = 0,
    size: number = 10,
    sort: string = 'registrationNumber,asc'
  ): Observable<ApiResponse<TournamentTeamResponse[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ApiResponse<TournamentTeamResponse[]>>(
      `${this.apiUrl}/${tournamentId}/teams`,
      { params }
    );
  }

  /**
   * GET /api/tournaments/{tournamentId}/teams/approved
   * Get all approved teams in the tournament
   */
  getApproved(tournamentId: number): Observable<ApiResponse<TournamentTeamResponse[]>> {
    return this.http.get<ApiResponse<TournamentTeamResponse[]>>(
      `${this.apiUrl}/${tournamentId}/teams/approved`
    );
  }

  /**
   * GET /api/tournaments/{tournamentId}/teams/pending
   * Get all pending teams in the tournament
   */
  getPending(tournamentId: number): Observable<ApiResponse<TournamentTeamResponse[]>> {
    return this.http.get<ApiResponse<TournamentTeamResponse[]>>(
      `${this.apiUrl}/${tournamentId}/teams/pending`
    );
  }

  /**
   * POST /api/tournaments/{tournamentId}/teams/{id}/approve
   * Approve a pending team registration
   */
  approve(
    tournamentId: number,
    registrationId: number
  ): Observable<ApiResponse<TournamentTeamResponse>> {
    return this.http.post<ApiResponse<TournamentTeamResponse>>(
      `${this.apiUrl}/${tournamentId}/teams/${registrationId}/approve`,
      {}
    );
  }

  /**
   * POST /api/tournaments/{tournamentId}/teams/{id}/reject
   * Reject a pending team registration
   */
  reject(
    tournamentId: number,
    registrationId: number,
    request: RejectTeamRequest
  ): Observable<ApiResponse<TournamentTeamResponse>> {
    return this.http.post<ApiResponse<TournamentTeamResponse>>(
      `${this.apiUrl}/${tournamentId}/teams/${registrationId}/reject`,
      request
    );
  }

  /**
   * POST /api/tournaments/{tournamentId}/teams/{id}/withdraw
   * Withdraw a team from the tournament
   */
  withdraw(
    tournamentId: number,
    registrationId: number,
    request: RejectTeamRequest
  ): Observable<ApiResponse<TournamentTeamResponse>> {
    return this.http.post<ApiResponse<TournamentTeamResponse>>(
      `${this.apiUrl}/${tournamentId}/teams/${registrationId}/withdraw`,
      request
    );
  }

  /**
   * DELETE /api/tournaments/{tournamentId}/teams/{id}
   * Soft delete a team registration
   */
  delete(
    tournamentId: number,
    registrationId: number
  ): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${tournamentId}/teams/${registrationId}`
    );
  }
}
