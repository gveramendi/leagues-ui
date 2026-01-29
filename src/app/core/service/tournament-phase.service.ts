import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  TournamentPhaseResponse,
  CreateTournamentPhaseRequest,
  UpdateTournamentPhaseRequest,
  AssignMatchesToPhaseRequest,
  PhaseConfigResponse,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class TournamentPhaseService {
  private apiUrl = `${environment.apiUrl}/api/tournaments`;

  constructor(private http: HttpClient) {}

  /**
   * POST /api/tournaments/{tournamentId}/phases
   * Create a new phase
   */
  create(
    tournamentId: number,
    request: CreateTournamentPhaseRequest
  ): Observable<ApiResponse<TournamentPhaseResponse>> {
    return this.http.post<ApiResponse<TournamentPhaseResponse>>(
      `${this.apiUrl}/${tournamentId}/phases`,
      request
    );
  }

  /**
   * GET /api/tournaments/{tournamentId}/phases
   * Get all phases for a tournament
   */
  getAll(tournamentId: number): Observable<ApiResponse<TournamentPhaseResponse[]>> {
    return this.http.get<ApiResponse<TournamentPhaseResponse[]>>(
      `${this.apiUrl}/${tournamentId}/phases`
    );
  }

  /**
   * GET /api/tournaments/{tournamentId}/phases/{phaseId}
   * Get a specific phase
   */
  getById(
    tournamentId: number,
    phaseId: number
  ): Observable<ApiResponse<TournamentPhaseResponse>> {
    return this.http.get<ApiResponse<TournamentPhaseResponse>>(
      `${this.apiUrl}/${tournamentId}/phases/${phaseId}`
    );
  }

  /**
   * PUT /api/tournaments/{tournamentId}/phases/{phaseId}
   * Update a phase
   */
  update(
    tournamentId: number,
    phaseId: number,
    request: UpdateTournamentPhaseRequest
  ): Observable<ApiResponse<TournamentPhaseResponse>> {
    return this.http.put<ApiResponse<TournamentPhaseResponse>>(
      `${this.apiUrl}/${tournamentId}/phases/${phaseId}`,
      request
    );
  }

  /**
   * DELETE /api/tournaments/{tournamentId}/phases/{phaseId}
   * Delete a phase
   */
  delete(tournamentId: number, phaseId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${tournamentId}/phases/${phaseId}`
    );
  }

  /**
   * PUT /api/tournaments/{tournamentId}/phases/{phaseId}/config
   * Create or update phase configuration
   */
  updateConfig(
    tournamentId: number,
    phaseId: number,
    config: Partial<PhaseConfigResponse>
  ): Observable<ApiResponse<PhaseConfigResponse>> {
    return this.http.put<ApiResponse<PhaseConfigResponse>>(
      `${this.apiUrl}/${tournamentId}/phases/${phaseId}/config`,
      config
    );
  }

  /**
   * GET /api/tournaments/{tournamentId}/phases/{phaseId}/config
   * Get phase configuration
   */
  getConfig(
    tournamentId: number,
    phaseId: number
  ): Observable<ApiResponse<PhaseConfigResponse>> {
    return this.http.get<ApiResponse<PhaseConfigResponse>>(
      `${this.apiUrl}/${tournamentId}/phases/${phaseId}/config`
    );
  }

  /**
   * DELETE /api/tournaments/{tournamentId}/phases/{phaseId}/config
   * Delete phase configuration
   */
  deleteConfig(tournamentId: number, phaseId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${tournamentId}/phases/${phaseId}/config`
    );
  }

  /**
   * POST /api/tournaments/{tournamentId}/phases/{phaseId}/matches
   * Assign matches to a phase
   */
  assignMatches(
    tournamentId: number,
    phaseId: number,
    request: AssignMatchesToPhaseRequest
  ): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/${tournamentId}/phases/${phaseId}/matches`,
      request
    );
  }

  /**
   * DELETE /api/tournaments/{tournamentId}/phases/{phaseId}/matches
   * Remove all matches from a phase
   */
  removeMatches(tournamentId: number, phaseId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${tournamentId}/phases/${phaseId}/matches`
    );
  }
}
