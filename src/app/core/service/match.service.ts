import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  MatchResponse,
  MatchSummaryResponse,
  MatchEventResponse,
  MatchRefereeResponse,
  MatchLineupResponse,
  TeamLineupResponse,
  CreateMatchRequest,
  UpdateMatchRequest,
  UpdateMatchScoreRequest,
  CreateMatchEventRequest,
  AssignRefereeRequest,
  AddPlayerToLineupRequest,
  SetTeamLineupRequest,
  UpdateMatchLineupRequest,
  GenerateFixtureRequest,
  MatchStatus,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  private apiUrl = `${environment.apiUrl}/api/matches`;

  constructor(private http: HttpClient) {}

  /**
   * POST /api/matches
   * Create a new match
   */
  create(request: CreateMatchRequest): Observable<ApiResponse<MatchResponse>> {
    return this.http.post<ApiResponse<MatchResponse>>(this.apiUrl, request);
  }

  /**
   * GET /api/matches/{id}
   * Get match by ID
   */
  getById(id: number): Observable<ApiResponse<MatchResponse>> {
    return this.http.get<ApiResponse<MatchResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/matches/tournament/{tournamentId}
   * Get matches by tournament with pagination
   */
  getByTournament(
    tournamentId: number,
    page: number = 0,
    size: number = 20
  ): Observable<ApiResponse<MatchSummaryResponse[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ApiResponse<MatchSummaryResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}`,
      { params }
    );
  }

  /**
   * GET /api/matches/tournament/{tournamentId}/matchday/{matchday}
   * Get matches by matchday
   */
  getByMatchday(
    tournamentId: number,
    matchday: number
  ): Observable<ApiResponse<MatchSummaryResponse[]>> {
    return this.http.get<ApiResponse<MatchSummaryResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/matchday/${matchday}`
    );
  }

  /**
   * GET /api/matches/tournament/{tournamentId}/status/{status}
   * Get matches by status
   */
  getByStatus(
    tournamentId: number,
    status: MatchStatus
  ): Observable<ApiResponse<MatchSummaryResponse[]>> {
    return this.http.get<ApiResponse<MatchSummaryResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/status/${status}`
    );
  }

  /**
   * GET /api/matches/team/{teamId}
   * Get matches by team
   */
  getByTeam(teamId: number): Observable<ApiResponse<MatchSummaryResponse[]>> {
    return this.http.get<ApiResponse<MatchSummaryResponse[]>>(
      `${this.apiUrl}/team/${teamId}`
    );
  }

  /**
   * GET /api/matches/date-range
   * Get matches by date range
   */
  getByDateRange(
    startDate: string,
    endDate: string
  ): Observable<ApiResponse<MatchSummaryResponse[]>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ApiResponse<MatchSummaryResponse[]>>(
      `${this.apiUrl}/date-range`,
      { params }
    );
  }

  /**
   * GET /api/matches/tournament/{tournamentId}/upcoming
   * Get upcoming matches for a tournament
   */
  getUpcoming(
    tournamentId: number,
    limit: number = 5
  ): Observable<ApiResponse<MatchSummaryResponse[]>> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ApiResponse<MatchSummaryResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/upcoming`,
      { params }
    );
  }

  /**
   * GET /api/matches/tournament/{tournamentId}/recent
   * Get recent matches for a tournament
   */
  getRecent(
    tournamentId: number,
    limit: number = 5
  ): Observable<ApiResponse<MatchSummaryResponse[]>> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ApiResponse<MatchSummaryResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/recent`,
      { params }
    );
  }

  /**
   * PUT /api/matches/{id}
   * Update match details
   */
  update(id: number, request: UpdateMatchRequest): Observable<ApiResponse<MatchResponse>> {
    return this.http.put<ApiResponse<MatchResponse>>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * PATCH /api/matches/{id}/score
   * Update match score
   */
  updateScore(
    id: number,
    request: UpdateMatchScoreRequest
  ): Observable<ApiResponse<MatchResponse>> {
    return this.http.patch<ApiResponse<MatchResponse>>(
      `${this.apiUrl}/${id}/score`,
      request
    );
  }

  /**
   * POST /api/matches/{id}/start
   * Start a match (change status to IN_PROGRESS)
   */
  start(id: number): Observable<ApiResponse<MatchResponse>> {
    return this.http.post<ApiResponse<MatchResponse>>(
      `${this.apiUrl}/${id}/start`,
      {}
    );
  }

  /**
   * POST /api/matches/{id}/finish
   * Finish a match (change status to FINISHED)
   */
  finish(id: number): Observable<ApiResponse<MatchResponse>> {
    return this.http.post<ApiResponse<MatchResponse>>(
      `${this.apiUrl}/${id}/finish`,
      {}
    );
  }

  /**
   * PATCH /api/matches/{id}/status
   * Update match status
   */
  updateStatus(id: number, status: MatchStatus): Observable<ApiResponse<MatchResponse>> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<ApiResponse<MatchResponse>>(
      `${this.apiUrl}/${id}/status`,
      {},
      { params }
    );
  }

  /**
   * DELETE /api/matches/{id}
   * Delete a match
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * POST /api/matches/generate-fixture
   * Generate fixtures for a tournament
   */
  generateFixture(request: GenerateFixtureRequest): Observable<ApiResponse<MatchSummaryResponse[]>> {
    return this.http.post<ApiResponse<MatchSummaryResponse[]>>(
      `${this.apiUrl}/generate-fixture`,
      request
    );
  }

  // ==================== Match Event endpoints ====================

  /**
   * POST /api/matches/{matchId}/events
   * Add an event to a match
   */
  addEvent(
    matchId: number,
    request: CreateMatchEventRequest
  ): Observable<ApiResponse<MatchEventResponse>> {
    return this.http.post<ApiResponse<MatchEventResponse>>(
      `${this.apiUrl}/${matchId}/events`,
      request
    );
  }

  /**
   * GET /api/matches/{matchId}/events
   * Get all events for a match
   */
  getEvents(matchId: number): Observable<ApiResponse<MatchEventResponse[]>> {
    return this.http.get<ApiResponse<MatchEventResponse[]>>(
      `${this.apiUrl}/${matchId}/events`
    );
  }

  /**
   * GET /api/matches/{matchId}/events/goals
   * Get only goal events for a match
   */
  getGoals(matchId: number): Observable<ApiResponse<MatchEventResponse[]>> {
    return this.http.get<ApiResponse<MatchEventResponse[]>>(
      `${this.apiUrl}/${matchId}/events/goals`
    );
  }

  /**
   * GET /api/matches/{matchId}/events/cards
   * Get only card events for a match
   */
  getCards(matchId: number): Observable<ApiResponse<MatchEventResponse[]>> {
    return this.http.get<ApiResponse<MatchEventResponse[]>>(
      `${this.apiUrl}/${matchId}/events/cards`
    );
  }

  /**
   * DELETE /api/matches/{matchId}/events/{eventId}
   * Delete a match event
   */
  deleteEvent(matchId: number, eventId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${matchId}/events/${eventId}`
    );
  }

  // ==================== Match Referee endpoints ====================

  /**
   * POST /api/matches/{matchId}/referees
   * Assign a referee to a match
   */
  assignReferee(
    matchId: number,
    request: AssignRefereeRequest
  ): Observable<ApiResponse<MatchRefereeResponse>> {
    return this.http.post<ApiResponse<MatchRefereeResponse>>(
      `${this.apiUrl}/${matchId}/referees`,
      request
    );
  }

  /**
   * GET /api/matches/{matchId}/referees
   * Get all referees assigned to a match
   */
  getReferees(matchId: number): Observable<ApiResponse<MatchRefereeResponse[]>> {
    return this.http.get<ApiResponse<MatchRefereeResponse[]>>(
      `${this.apiUrl}/${matchId}/referees`
    );
  }

  /**
   * DELETE /api/matches/{matchId}/referees/{refereeId}
   * Remove a referee from a match
   */
  removeReferee(matchId: number, refereeId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${matchId}/referees/${refereeId}`
    );
  }

  // ==================== Match Lineup endpoints ====================

  /**
   * POST /api/matches/{matchId}/lineups
   * Add a player to the match lineup
   */
  addPlayerToLineup(
    matchId: number,
    request: AddPlayerToLineupRequest
  ): Observable<ApiResponse<MatchLineupResponse>> {
    return this.http.post<ApiResponse<MatchLineupResponse>>(
      `${this.apiUrl}/${matchId}/lineups`,
      request
    );
  }

  /**
   * POST /api/matches/{matchId}/lineups/team/{teamId}
   * Set complete team lineup
   */
  setTeamLineup(
    matchId: number,
    teamId: number,
    request: SetTeamLineupRequest
  ): Observable<ApiResponse<TeamLineupResponse>> {
    return this.http.post<ApiResponse<TeamLineupResponse>>(
      `${this.apiUrl}/${matchId}/lineups/team/${teamId}`,
      request
    );
  }

  /**
   * GET /api/matches/{matchId}/lineups
   * Get all match lineups
   */
  getMatchLineups(matchId: number): Observable<ApiResponse<MatchLineupResponse[]>> {
    return this.http.get<ApiResponse<MatchLineupResponse[]>>(
      `${this.apiUrl}/${matchId}/lineups`
    );
  }

  /**
   * GET /api/matches/{matchId}/lineups/team/{teamId}
   * Get team lineup
   */
  getTeamLineup(matchId: number, teamId: number): Observable<ApiResponse<TeamLineupResponse>> {
    return this.http.get<ApiResponse<TeamLineupResponse>>(
      `${this.apiUrl}/${matchId}/lineups/team/${teamId}`
    );
  }

  /**
   * GET /api/matches/{matchId}/lineups/team/{teamId}/starters
   * Get team starters
   */
  getTeamStarters(matchId: number, teamId: number): Observable<ApiResponse<MatchLineupResponse[]>> {
    return this.http.get<ApiResponse<MatchLineupResponse[]>>(
      `${this.apiUrl}/${matchId}/lineups/team/${teamId}/starters`
    );
  }

  /**
   * GET /api/matches/{matchId}/lineups/team/{teamId}/substitutes
   * Get team substitutes
   */
  getTeamSubstitutes(matchId: number, teamId: number): Observable<ApiResponse<MatchLineupResponse[]>> {
    return this.http.get<ApiResponse<MatchLineupResponse[]>>(
      `${this.apiUrl}/${matchId}/lineups/team/${teamId}/substitutes`
    );
  }

  /**
   * PUT /api/matches/{matchId}/lineups/{lineupId}
   * Update lineup entry
   */
  updateLineupEntry(
    matchId: number,
    lineupId: number,
    request: UpdateMatchLineupRequest
  ): Observable<ApiResponse<MatchLineupResponse>> {
    return this.http.put<ApiResponse<MatchLineupResponse>>(
      `${this.apiUrl}/${matchId}/lineups/${lineupId}`,
      request
    );
  }

  /**
   * DELETE /api/matches/{matchId}/lineups/{lineupId}
   * Remove player from lineup
   */
  removePlayerFromLineup(matchId: number, lineupId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${matchId}/lineups/${lineupId}`
    );
  }
}
