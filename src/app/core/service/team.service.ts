import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  TeamResponse,
  CreateTeamRequest,
  UpdateTeamRequest,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiUrl = `${environment.apiUrl}/api/teams`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/teams
   * Get all teams
   */
  getAll(): Observable<ApiResponse<TeamResponse[]>> {
    return this.http.get<ApiResponse<TeamResponse[]>>(this.apiUrl);
  }

  /**
   * GET /api/teams/{id}
   * Get team by id
   */
  getById(id: number): Observable<ApiResponse<TeamResponse>> {
    return this.http.get<ApiResponse<TeamResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/teams/code/{code}
   * Get team by code
   */
  getByCode(code: string): Observable<ApiResponse<TeamResponse>> {
    return this.http.get<ApiResponse<TeamResponse>>(
      `${this.apiUrl}/code/${code}`
    );
  }

  /**
   * GET /api/teams/club/{clubId}
   * Get teams by club
   */
  getByClub(clubId: number): Observable<ApiResponse<TeamResponse[]>> {
    return this.http.get<ApiResponse<TeamResponse[]>>(
      `${this.apiUrl}/club/${clubId}`
    );
  }

  /**
   * GET /api/teams/search
   * Search teams with pagination
   */
  searchTeams(
    search: string = '',
    page: number = 0,
    size: number = 10,
    sort: string = 'name,asc'
  ): Observable<ApiResponse<TeamResponse[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<TeamResponse[]>>(
      `${this.apiUrl}/search`,
      { params }
    );
  }

  /**
   * POST /api/teams
   * Create a new team
   */
  create(request: CreateTeamRequest): Observable<ApiResponse<TeamResponse>> {
    return this.http.post<ApiResponse<TeamResponse>>(this.apiUrl, request);
  }

  /**
   * PUT /api/teams/{id}
   * Update an existing team
   */
  update(
    id: number,
    request: UpdateTeamRequest
  ): Observable<ApiResponse<TeamResponse>> {
    return this.http.put<ApiResponse<TeamResponse>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  /**
   * DELETE /api/teams/{id}
   * Delete a team
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/teams/exists/{code}
   * Check if team code exists
   */
  existsByCode(code: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/exists/${code}`);
  }
}
