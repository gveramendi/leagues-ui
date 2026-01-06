import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  SanctionResponse,
  CreateSanctionRequest,
  UpdateSanctionRequest,
  AppealSanctionRequest,
  ResolveAppealRequest,
  SanctionStatus,
  SanctionType,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class SanctionService {
  private apiUrl = `${environment.apiUrl}/api/sanctions`;

  constructor(private http: HttpClient) {}

  // ==================== QUERIES ====================

  /**
   * GET /api/sanctions/{id}
   * Get sanction by ID
   */
  getById(id: number): Observable<ApiResponse<SanctionResponse>> {
    return this.http.get<ApiResponse<SanctionResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/sanctions/tournament/{tournamentId}
   * Get sanctions by tournament with pagination
   */
  getByTournament(
    tournamentId: number,
    page: number = 0,
    size: number = 20,
    sort: string = 'createdAt,desc'
  ): Observable<ApiResponse<SanctionResponse[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<ApiResponse<SanctionResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}`,
      { params }
    );
  }

  /**
   * GET /api/sanctions/player/{playerId}
   * Get sanctions by player
   */
  getByPlayer(playerId: number): Observable<ApiResponse<SanctionResponse[]>> {
    return this.http.get<ApiResponse<SanctionResponse[]>>(
      `${this.apiUrl}/player/${playerId}`
    );
  }

  /**
   * GET /api/sanctions/team/{teamId}
   * Get sanctions by team
   */
  getByTeam(teamId: number): Observable<ApiResponse<SanctionResponse[]>> {
    return this.http.get<ApiResponse<SanctionResponse[]>>(
      `${this.apiUrl}/team/${teamId}`
    );
  }

  /**
   * GET /api/sanctions/tournament/{tournamentId}/player/{playerId}
   * Get sanctions by tournament and player
   */
  getByTournamentAndPlayer(
    tournamentId: number,
    playerId: number
  ): Observable<ApiResponse<SanctionResponse[]>> {
    return this.http.get<ApiResponse<SanctionResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/player/${playerId}`
    );
  }

  /**
   * GET /api/sanctions/tournament/{tournamentId}/status/{status}
   * Get sanctions by tournament and status
   */
  getByStatus(
    tournamentId: number,
    status: SanctionStatus
  ): Observable<ApiResponse<SanctionResponse[]>> {
    return this.http.get<ApiResponse<SanctionResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/status/${status}`
    );
  }

  /**
   * GET /api/sanctions/tournament/{tournamentId}/pending
   * Get pending sanctions for a tournament
   */
  getPending(tournamentId: number): Observable<ApiResponse<SanctionResponse[]>> {
    return this.http.get<ApiResponse<SanctionResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/pending`
    );
  }

  /**
   * GET /api/sanctions/tournament/{tournamentId}/appealed
   * Get appealed sanctions for a tournament
   */
  getAppealed(tournamentId: number): Observable<ApiResponse<SanctionResponse[]>> {
    return this.http.get<ApiResponse<SanctionResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/appealed`
    );
  }

  /**
   * GET /api/sanctions/tournament/{tournamentId}/player/{playerId}/is-suspended
   * Check if player is suspended
   */
  isPlayerSuspended(
    tournamentId: number,
    playerId: number
  ): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${this.apiUrl}/tournament/${tournamentId}/player/${playerId}/is-suspended`
    );
  }

  // ==================== CREATE ====================

  /**
   * POST /api/sanctions
   * Create a new sanction
   */
  create(request: CreateSanctionRequest): Observable<ApiResponse<SanctionResponse>> {
    return this.http.post<ApiResponse<SanctionResponse>>(this.apiUrl, request);
  }

  // ==================== UPDATE ====================

  /**
   * PUT /api/sanctions/{id}
   * Update a sanction
   */
  update(id: number, request: UpdateSanctionRequest): Observable<ApiResponse<SanctionResponse>> {
    return this.http.put<ApiResponse<SanctionResponse>>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * POST /api/sanctions/{id}/activate
   * Activate a pending sanction
   */
  activate(id: number): Observable<ApiResponse<SanctionResponse>> {
    return this.http.post<ApiResponse<SanctionResponse>>(
      `${this.apiUrl}/${id}/activate`,
      {}
    );
  }

  /**
   * POST /api/sanctions/{id}/appeal
   * Register an appeal for a sanction
   */
  appeal(id: number, request: AppealSanctionRequest): Observable<ApiResponse<SanctionResponse>> {
    return this.http.post<ApiResponse<SanctionResponse>>(
      `${this.apiUrl}/${id}/appeal`,
      request
    );
  }

  /**
   * POST /api/sanctions/{id}/resolve-appeal
   * Resolve a sanction appeal
   */
  resolveAppeal(id: number, request: ResolveAppealRequest): Observable<ApiResponse<SanctionResponse>> {
    return this.http.post<ApiResponse<SanctionResponse>>(
      `${this.apiUrl}/${id}/resolve-appeal`,
      request
    );
  }

  /**
   * POST /api/sanctions/{id}/cancel
   * Cancel a sanction
   */
  cancel(id: number, reason: string): Observable<ApiResponse<SanctionResponse>> {
    const params = new HttpParams().set('reason', reason);
    return this.http.post<ApiResponse<SanctionResponse>>(
      `${this.apiUrl}/${id}/cancel`,
      {},
      { params }
    );
  }

  /**
   * POST /api/sanctions/{id}/mark-fine-paid
   * Mark the fine of a sanction as paid
   */
  markFinePaid(id: number): Observable<ApiResponse<SanctionResponse>> {
    return this.http.post<ApiResponse<SanctionResponse>>(
      `${this.apiUrl}/${id}/mark-fine-paid`,
      {}
    );
  }

  /**
   * POST /api/sanctions/tournament/{tournamentId}/player/{playerId}/serve-match
   * Register that a player served a match of their sanction
   */
  serveMatch(tournamentId: number, playerId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/tournament/${tournamentId}/player/${playerId}/serve-match`,
      {}
    );
  }

  // ==================== DELETE ====================

  /**
   * DELETE /api/sanctions/{id}
   * Delete a sanction
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // ==================== ENUMS ====================

  /**
   * GET /api/sanctions/types
   * Get all sanction types
   */
  getSanctionTypes(): Observable<ApiResponse<SanctionType[]>> {
    return this.http.get<ApiResponse<SanctionType[]>>(`${this.apiUrl}/types`);
  }

  /**
   * GET /api/sanctions/statuses
   * Get all sanction statuses
   */
  getSanctionStatuses(): Observable<ApiResponse<SanctionStatus[]>> {
    return this.http.get<ApiResponse<SanctionStatus[]>>(`${this.apiUrl}/statuses`);
  }
}
