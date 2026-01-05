import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  PlayerRegistrationResponse,
  CreatePlayerRegistrationRequest,
  UpdatePlayerRegistrationRequest,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class PlayerRegistrationService {
  private apiUrl = `${environment.apiUrl}/api/player-registrations`;

  constructor(private http: HttpClient) {}

  /**
   * POST /api/player-registrations
   * Register a player to a team for a specific season
   */
  create(
    request: CreatePlayerRegistrationRequest
  ): Observable<ApiResponse<PlayerRegistrationResponse>> {
    return this.http.post<ApiResponse<PlayerRegistrationResponse>>(
      this.apiUrl,
      request
    );
  }

  /**
   * GET /api/player-registrations/{id}
   * Get player registration by ID
   */
  getById(id: number): Observable<ApiResponse<PlayerRegistrationResponse>> {
    return this.http.get<ApiResponse<PlayerRegistrationResponse>>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * GET /api/player-registrations/team/{teamId}?seasonYear={year}
   * Get player registrations by team and season
   */
  getByTeam(
    teamId: number,
    seasonYear: number
  ): Observable<ApiResponse<PlayerRegistrationResponse[]>> {
    const params = new HttpParams().set('seasonYear', seasonYear.toString());
    return this.http.get<ApiResponse<PlayerRegistrationResponse[]>>(
      `${this.apiUrl}/team/${teamId}`,
      { params }
    );
  }

  /**
   * GET /api/player-registrations/player/{playerId}
   * Get all registrations for a specific player
   */
  getByPlayer(
    playerId: number
  ): Observable<ApiResponse<PlayerRegistrationResponse[]>> {
    return this.http.get<ApiResponse<PlayerRegistrationResponse[]>>(
      `${this.apiUrl}/player/${playerId}`
    );
  }

  /**
   * PUT /api/player-registrations/{id}
   * Update an existing player registration
   */
  update(
    id: number,
    request: UpdatePlayerRegistrationRequest
  ): Observable<ApiResponse<PlayerRegistrationResponse>> {
    return this.http.put<ApiResponse<PlayerRegistrationResponse>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  /**
   * DELETE /api/player-registrations/{id}
   * Soft delete a player registration
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
