import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  TournamentResponse,
  TournamentSummaryResponse,
  CreateTournamentRequest,
  UpdateTournamentRequest,
  TournamentStatus,
  TournamentFormat,
  Category,
  Gender,
  FootballType,
  PhaseStatusResponse,
  PhaseAdvancementResponse,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  private apiUrl = `${environment.apiUrl}/api/tournaments`;

  constructor(private http: HttpClient) {}

  /**
   * POST /api/tournaments
   * Create a new tournament
   */
  create(request: CreateTournamentRequest): Observable<ApiResponse<TournamentResponse>> {
    return this.http.post<ApiResponse<TournamentResponse>>(this.apiUrl, request);
  }

  /**
   * GET /api/tournaments/{id}
   * Get tournament by ID
   */
  getById(id: number): Observable<ApiResponse<TournamentResponse>> {
    return this.http.get<ApiResponse<TournamentResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/tournaments/code/{code}
   * Get tournament by code
   */
  getByCode(code: string): Observable<ApiResponse<TournamentResponse>> {
    return this.http.get<ApiResponse<TournamentResponse>>(`${this.apiUrl}/code/${code}`);
  }

  /**
   * GET /api/tournaments
   * Get all tournaments with pagination
   */
  getAll(
    page: number = 0,
    size: number = 10,
    sort: string = 'createdAt,desc'
  ): Observable<ApiResponse<TournamentSummaryResponse[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ApiResponse<TournamentSummaryResponse[]>>(this.apiUrl, { params });
  }

  /**
   * GET /api/tournaments/search
   * Search tournaments with pagination
   */
  search(
    query?: string,
    page: number = 0,
    size: number = 10,
    sort: string = 'createdAt,desc'
  ): Observable<ApiResponse<TournamentSummaryResponse[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (query) {
      params = params.set('query', query);
    }

    return this.http.get<ApiResponse<TournamentSummaryResponse[]>>(
      `${this.apiUrl}/search`,
      { params }
    );
  }

  /**
   * GET /api/tournaments/status/{status}
   * Get tournaments by status
   */
  getByStatus(
    status: TournamentStatus,
    page: number = 0,
    size: number = 10,
    sort: string = 'createdAt,desc'
  ): Observable<ApiResponse<TournamentSummaryResponse[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ApiResponse<TournamentSummaryResponse[]>>(
      `${this.apiUrl}/status/${status}`,
      { params }
    );
  }

  /**
   * GET /api/tournaments/season/{year}
   * Get tournaments by season year
   */
  getBySeason(
    year: number,
    page: number = 0,
    size: number = 10,
    sort: string = 'createdAt,desc'
  ): Observable<ApiResponse<TournamentSummaryResponse[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ApiResponse<TournamentSummaryResponse[]>>(
      `${this.apiUrl}/season/${year}`,
      { params }
    );
  }

  /**
   * GET /api/tournaments/category/{category}
   * Get tournaments by category
   */
  getByCategory(
    category: Category,
    page: number = 0,
    size: number = 10,
    sort: string = 'createdAt,desc'
  ): Observable<ApiResponse<TournamentSummaryResponse[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ApiResponse<TournamentSummaryResponse[]>>(
      `${this.apiUrl}/category/${category}`,
      { params }
    );
  }

  /**
   * GET /api/tournaments/gender/{gender}
   * Get tournaments by gender
   */
  getByGender(
    gender: Gender,
    page: number = 0,
    size: number = 10,
    sort: string = 'createdAt,desc'
  ): Observable<ApiResponse<TournamentSummaryResponse[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ApiResponse<TournamentSummaryResponse[]>>(
      `${this.apiUrl}/gender/${gender}`,
      { params }
    );
  }

  /**
   * GET /api/tournaments/football-type/{footballType}
   * Get tournaments by football type
   */
  getByFootballType(
    footballType: FootballType,
    page: number = 0,
    size: number = 10,
    sort: string = 'createdAt,desc'
  ): Observable<ApiResponse<TournamentSummaryResponse[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ApiResponse<TournamentSummaryResponse[]>>(
      `${this.apiUrl}/football-type/${footballType}`,
      { params }
    );
  }

  /**
   * GET /api/tournaments/format/{format}
   * Get tournaments by format
   */
  getByFormat(
    format: TournamentFormat,
    page: number = 0,
    size: number = 10,
    sort: string = 'createdAt,desc'
  ): Observable<ApiResponse<TournamentSummaryResponse[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ApiResponse<TournamentSummaryResponse[]>>(
      `${this.apiUrl}/format/${format}`,
      { params }
    );
  }

  /**
   * GET /api/tournaments/active
   * Get active tournaments (in progress)
   */
  getActive(
    page: number = 0,
    size: number = 10,
    sort: string = 'startDate,asc'
  ): Observable<ApiResponse<TournamentSummaryResponse[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ApiResponse<TournamentSummaryResponse[]>>(
      `${this.apiUrl}/active`,
      { params }
    );
  }

  /**
   * GET /api/tournaments/open-registration
   * Get tournaments with open registration
   */
  getOpenRegistration(
    page: number = 0,
    size: number = 10,
    sort: string = 'registrationEnd,asc'
  ): Observable<ApiResponse<TournamentSummaryResponse[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ApiResponse<TournamentSummaryResponse[]>>(
      `${this.apiUrl}/open-registration`,
      { params }
    );
  }

  /**
   * GET /api/tournaments/team/{teamId}
   * Get tournaments by team
   */
  getByTeam(
    teamId: number,
    page: number = 0,
    size: number = 10,
    sort: string = 'createdAt,desc'
  ): Observable<ApiResponse<TournamentSummaryResponse[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ApiResponse<TournamentSummaryResponse[]>>(
      `${this.apiUrl}/team/${teamId}`,
      { params }
    );
  }

  /**
   * GET /api/tournaments/seasons
   * Get all season years with tournaments
   */
  getSeasons(): Observable<ApiResponse<number[]>> {
    return this.http.get<ApiResponse<number[]>>(`${this.apiUrl}/seasons`);
  }

  /**
   * PUT /api/tournaments/{id}
   * Update an existing tournament
   */
  update(
    id: number,
    request: UpdateTournamentRequest
  ): Observable<ApiResponse<TournamentResponse>> {
    return this.http.put<ApiResponse<TournamentResponse>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  /**
   * POST /api/tournaments/{id}/open-registration
   * Open registration for a tournament
   */
  openRegistration(id: number): Observable<ApiResponse<TournamentResponse>> {
    return this.http.post<ApiResponse<TournamentResponse>>(
      `${this.apiUrl}/${id}/open-registration`,
      {}
    );
  }

  /**
   * POST /api/tournaments/{id}/close-registration
   * Close registration for a tournament
   */
  closeRegistration(id: number): Observable<ApiResponse<TournamentResponse>> {
    return this.http.post<ApiResponse<TournamentResponse>>(
      `${this.apiUrl}/${id}/close-registration`,
      {}
    );
  }

  /**
   * POST /api/tournaments/{id}/schedule
   * Schedule a tournament (REGISTRATION_CLOSED → SCHEDULED)
   */
  schedule(id: number): Observable<ApiResponse<TournamentResponse>> {
    return this.http.post<ApiResponse<TournamentResponse>>(
      `${this.apiUrl}/${id}/schedule`,
      {}
    );
  }

  /**
   * POST /api/tournaments/{id}/start
   * Start a tournament (SCHEDULED → IN_PROGRESS)
   */
  start(id: number): Observable<ApiResponse<TournamentResponse>> {
    return this.http.post<ApiResponse<TournamentResponse>>(
      `${this.apiUrl}/${id}/start`,
      {}
    );
  }

  /**
   * POST /api/tournaments/{id}/finish
   * Finish a tournament
   */
  finish(id: number): Observable<ApiResponse<TournamentResponse>> {
    return this.http.post<ApiResponse<TournamentResponse>>(
      `${this.apiUrl}/${id}/finish`,
      {}
    );
  }

  /**
   * DELETE /api/tournaments/{id}
   * Soft delete a tournament
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/tournaments/{id}/can-advance
   * Check if tournament can advance to next phase
   */
  canAdvance(id: number): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/${id}/can-advance`);
  }

  /**
   * POST /api/tournaments/{id}/advance-phase
   * Advance tournament to next phase
   */
  advancePhase(id: number): Observable<ApiResponse<TournamentResponse>> {
    return this.http.post<ApiResponse<TournamentResponse>>(
      `${this.apiUrl}/${id}/advance-phase`,
      {}
    );
  }

  /**
   * GET /api/tournaments/{id}/phase-status
   * Get current phase status with statistics
   */
  getPhaseStatus(id: number): Observable<ApiResponse<PhaseStatusResponse>> {
    return this.http.get<ApiResponse<PhaseStatusResponse>>(
      `${this.apiUrl}/${id}/phase-status`
    );
  }

  /**
   * GET /api/tournaments/{id}/can-advance-group-stage
   * Check if tournament can advance from group stage
   */
  canAdvanceGroupStage(id: number): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${this.apiUrl}/${id}/can-advance-group-stage`
    );
  }

  /**
   * GET /api/tournaments/{id}/can-advance-knockout
   * Check if tournament can advance the current knockout phase
   */
  canAdvanceKnockout(id: number): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${this.apiUrl}/${id}/can-advance-knockout`
    );
  }

  /**
   * POST /api/tournaments/{id}/advance-from-group-stage
   * Advance from group stage to first knockout round
   */
  advanceFromGroupStage(id: number): Observable<ApiResponse<PhaseAdvancementResponse>> {
    return this.http.post<ApiResponse<PhaseAdvancementResponse>>(
      `${this.apiUrl}/${id}/advance-from-group-stage`,
      {}
    );
  }

  /**
   * POST /api/tournaments/{id}/advance-knockout
   * Advance between knockout phases (QF→SF→FINAL)
   */
  advanceKnockout(id: number): Observable<ApiResponse<PhaseAdvancementResponse>> {
    return this.http.post<ApiResponse<PhaseAdvancementResponse>>(
      `${this.apiUrl}/${id}/advance-knockout`,
      {}
    );
  }
}
