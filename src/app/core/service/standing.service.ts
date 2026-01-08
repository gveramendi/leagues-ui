import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  StandingResponse,
  StandingSummaryResponse,
  StandingTableResponse,
  GroupStandingsResponse,
  GroupStandingEntryResponse,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class StandingService {
  private apiUrl = `${environment.apiUrl}/api/standings`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/standings/tournament/{tournamentId}
   * Get standings table for a tournament
   */
  getByTournament(tournamentId: number): Observable<ApiResponse<StandingTableResponse>> {
    return this.http.get<ApiResponse<StandingTableResponse>>(
      `${this.apiUrl}/tournament/${tournamentId}`
    );
  }

  /**
   * GET /api/standings/tournament/{tournamentId}/team/{teamId}
   * Get standing for a specific team in a tournament
   */
  getByTournamentAndTeam(
    tournamentId: number,
    teamId: number
  ): Observable<ApiResponse<StandingResponse>> {
    return this.http.get<ApiResponse<StandingResponse>>(
      `${this.apiUrl}/tournament/${tournamentId}/team/${teamId}`
    );
  }

  /**
   * GET /api/standings/team/{teamId}
   * Get standing history for a team across all tournaments
   */
  getByTeam(teamId: number): Observable<ApiResponse<StandingResponse[]>> {
    return this.http.get<ApiResponse<StandingResponse[]>>(`${this.apiUrl}/team/${teamId}`);
  }

  /**
   * GET /api/standings/tournament/{tournamentId}/qualified
   * Get qualified teams from the tournament
   */
  getQualifiedTeams(tournamentId: number): Observable<ApiResponse<StandingSummaryResponse[]>> {
    return this.http.get<ApiResponse<StandingSummaryResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/qualified`
    );
  }

  /**
   * GET /api/standings/tournament/{tournamentId}/relegated
   * Get relegated teams from the tournament
   */
  getRelegatedTeams(tournamentId: number): Observable<ApiResponse<StandingSummaryResponse[]>> {
    return this.http.get<ApiResponse<StandingSummaryResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/relegated`
    );
  }

  /**
   * GET /api/standings/tournament/{tournamentId}/leaders
   * Get leader(s) of the tournament
   */
  getLeaders(tournamentId: number): Observable<ApiResponse<StandingSummaryResponse[]>> {
    return this.http.get<ApiResponse<StandingSummaryResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/leaders`
    );
  }

  /**
   * GET /api/standings/tournament/{tournamentId}/top-scorers
   * Get teams with most goals scored
   */
  getTopScoringTeams(
    tournamentId: number,
    limit: number = 10
  ): Observable<ApiResponse<StandingSummaryResponse[]>> {
    return this.http.get<ApiResponse<StandingSummaryResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/top-scorers`,
      { params: { limit: limit.toString() } }
    );
  }

  /**
   * GET /api/standings/tournament/{tournamentId}/best-defenses
   * Get teams with fewest goals conceded
   */
  getBestDefenses(
    tournamentId: number,
    limit: number = 10
  ): Observable<ApiResponse<StandingSummaryResponse[]>> {
    return this.http.get<ApiResponse<StandingSummaryResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/best-defenses`,
      { params: { limit: limit.toString() } }
    );
  }

  /**
   * GET /api/standings/tournament/{tournamentId}/best-home
   * Get best performing teams at home
   */
  getBestHomeTeams(
    tournamentId: number,
    limit: number = 10
  ): Observable<ApiResponse<StandingSummaryResponse[]>> {
    return this.http.get<ApiResponse<StandingSummaryResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/best-home`,
      { params: { limit: limit.toString() } }
    );
  }

  /**
   * GET /api/standings/tournament/{tournamentId}/best-away
   * Get best performing teams away
   */
  getBestAwayTeams(
    tournamentId: number,
    limit: number = 10
  ): Observable<ApiResponse<StandingSummaryResponse[]>> {
    return this.http.get<ApiResponse<StandingSummaryResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/best-away`,
      { params: { limit: limit.toString() } }
    );
  }

  /**
   * GET /api/standings/tournament/{tournamentId}/fair-play
   * Get fair play ranking (fewest cards)
   */
  getFairPlayRanking(
    tournamentId: number,
    limit: number = 10
  ): Observable<ApiResponse<StandingSummaryResponse[]>> {
    return this.http.get<ApiResponse<StandingSummaryResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/fair-play`,
      { params: { limit: limit.toString() } }
    );
  }

  /**
   * POST /api/standings/tournament/{tournamentId}/initialize
   * Initialize standings table for a tournament
   */
  initializeStandings(tournamentId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/tournament/${tournamentId}/initialize`,
      {}
    );
  }

  /**
   * POST /api/standings/tournament/{tournamentId}/recalculate
   * Recalculate entire standings table based on match results
   */
  recalculateStandings(tournamentId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/tournament/${tournamentId}/recalculate`,
      {}
    );
  }

  /**
   * GET /api/standings/tournament/{tournamentId}/groups
   * Get all group standings for a GROUP_STAGE tournament
   */
  getGroupStandings(tournamentId: number): Observable<ApiResponse<GroupStandingsResponse>> {
    return this.http.get<ApiResponse<GroupStandingsResponse>>(
      `${this.apiUrl}/tournament/${tournamentId}/groups`
    );
  }

  /**
   * GET /api/standings/tournament/{tournamentId}/groups/{groupCode}
   * Get standings for a specific group in a GROUP_STAGE tournament
   */
  getGroupStandingsByCode(
    tournamentId: number,
    groupCode: string
  ): Observable<ApiResponse<GroupStandingEntryResponse>> {
    return this.http.get<ApiResponse<GroupStandingEntryResponse>>(
      `${this.apiUrl}/tournament/${tournamentId}/groups/${groupCode}`
    );
  }
}
