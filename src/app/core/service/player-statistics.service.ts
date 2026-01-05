import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  AssistTableResponse,
  CardStatsResponse,
  PlayerStatisticsResponse,
  ScorerTableResponse,
  TopAssistResponse,
  TopCleanSheetResponse,
  TopContributorResponse,
  TopScorerResponse,
} from '../models/response';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerStatisticsService {
  private apiUrl = `${environment.apiUrl}/api/statistics`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/statistics/{id}
   * Get player statistics by ID
   */
  getById(id: number): Observable<ApiResponse<PlayerStatisticsResponse>> {
    return this.http.get<ApiResponse<PlayerStatisticsResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/statistics/tournament/{tournamentId}/player/{playerId}
   * Get statistics for a player in a specific tournament
   */
  getByTournamentAndPlayer(
    tournamentId: number,
    playerId: number
  ): Observable<ApiResponse<PlayerStatisticsResponse>> {
    return this.http.get<ApiResponse<PlayerStatisticsResponse>>(
      `${this.apiUrl}/tournament/${tournamentId}/player/${playerId}`
    );
  }

  /**
   * GET /api/statistics/tournament/{tournamentId}/team/{teamId}
   * Get statistics for all players of a team in a tournament
   */
  getByTournamentAndTeam(
    tournamentId: number,
    teamId: number
  ): Observable<ApiResponse<PlayerStatisticsResponse[]>> {
    return this.http.get<ApiResponse<PlayerStatisticsResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/team/${teamId}`
    );
  }

  /**
   * GET /api/statistics/player/{playerId}
   * Get statistics history for a player across all tournaments
   */
  getByPlayer(playerId: number): Observable<ApiResponse<PlayerStatisticsResponse[]>> {
    return this.http.get<ApiResponse<PlayerStatisticsResponse[]>>(
      `${this.apiUrl}/player/${playerId}`
    );
  }

  /**
   * GET /api/statistics/tournament/{tournamentId}/scorers
   * Get top scorers table for the tournament
   */
  getTopScorers(
    tournamentId: number,
    limit: number = 20
  ): Observable<ApiResponse<ScorerTableResponse>> {
    return this.http.get<ApiResponse<ScorerTableResponse>>(
      `${this.apiUrl}/tournament/${tournamentId}/scorers`,
      { params: { limit: limit.toString() } }
    );
  }

  /**
   * GET /api/statistics/tournament/{tournamentId}/scorers/paged
   * Get top scorers table with pagination
   */
  getTopScorersPaged(
    tournamentId: number,
    page: number = 0,
    size: number = 20,
    sort: string = 'goals,desc'
  ): Observable<ApiResponse<PageResponse<TopScorerResponse>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ApiResponse<PageResponse<TopScorerResponse>>>(
      `${this.apiUrl}/tournament/${tournamentId}/scorers/paged`,
      { params }
    );
  }

  /**
   * GET /api/statistics/tournament/{tournamentId}/assists
   * Get top assists table for the tournament
   */
  getTopAssists(
    tournamentId: number,
    limit: number = 20
  ): Observable<ApiResponse<AssistTableResponse>> {
    return this.http.get<ApiResponse<AssistTableResponse>>(
      `${this.apiUrl}/tournament/${tournamentId}/assists`,
      { params: { limit: limit.toString() } }
    );
  }

  /**
   * GET /api/statistics/tournament/{tournamentId}/assists/paged
   * Get top assists table with pagination
   */
  getTopAssistsPaged(
    tournamentId: number,
    page: number = 0,
    size: number = 20,
    sort: string = 'assists,desc'
  ): Observable<ApiResponse<PageResponse<TopAssistResponse>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ApiResponse<PageResponse<TopAssistResponse>>>(
      `${this.apiUrl}/tournament/${tournamentId}/assists/paged`,
      { params }
    );
  }

  /**
   * GET /api/statistics/tournament/{tournamentId}/contributors
   * Get players with most goals + assists
   */
  getTopContributors(
    tournamentId: number,
    limit: number = 20
  ): Observable<ApiResponse<TopContributorResponse[]>> {
    return this.http.get<ApiResponse<TopContributorResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/contributors`,
      { params: { limit: limit.toString() } }
    );
  }

  /**
   * GET /api/statistics/tournament/{tournamentId}/clean-sheets
   * Get goalkeepers with most clean sheets
   */
  getTopCleanSheets(
    tournamentId: number,
    limit: number = 10
  ): Observable<ApiResponse<TopCleanSheetResponse[]>> {
    return this.http.get<ApiResponse<TopCleanSheetResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/clean-sheets`,
      { params: { limit: limit.toString() } }
    );
  }

  /**
   * GET /api/statistics/tournament/{tournamentId}/yellow-cards
   * Get players with most yellow cards
   */
  getMostYellowCards(
    tournamentId: number,
    limit: number = 20
  ): Observable<ApiResponse<CardStatsResponse[]>> {
    return this.http.get<ApiResponse<CardStatsResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/yellow-cards`,
      { params: { limit: limit.toString() } }
    );
  }

  /**
   * GET /api/statistics/tournament/{tournamentId}/red-cards
   * Get players with most red cards
   */
  getMostRedCards(
    tournamentId: number,
    limit: number = 20
  ): Observable<ApiResponse<CardStatsResponse[]>> {
    return this.http.get<ApiResponse<CardStatsResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/red-cards`,
      { params: { limit: limit.toString() } }
    );
  }

  /**
   * GET /api/statistics/tournament/{tournamentId}/most-matches
   * Get players with most matches played
   */
  getMostMatchesPlayed(
    tournamentId: number,
    limit: number = 20
  ): Observable<ApiResponse<PlayerStatisticsResponse[]>> {
    return this.http.get<ApiResponse<PlayerStatisticsResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/most-matches`,
      { params: { limit: limit.toString() } }
    );
  }

  /**
   * GET /api/statistics/tournament/{tournamentId}/most-minutes
   * Get players with most minutes played
   */
  getMostMinutesPlayed(
    tournamentId: number,
    limit: number = 20
  ): Observable<ApiResponse<PlayerStatisticsResponse[]>> {
    return this.http.get<ApiResponse<PlayerStatisticsResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/most-minutes`,
      { params: { limit: limit.toString() } }
    );
  }

  /**
   * GET /api/statistics/tournament/{tournamentId}/mvp
   * Get players with most MVP awards
   */
  getMostManOfTheMatch(
    tournamentId: number,
    limit: number = 10
  ): Observable<ApiResponse<PlayerStatisticsResponse[]>> {
    return this.http.get<ApiResponse<PlayerStatisticsResponse[]>>(
      `${this.apiUrl}/tournament/${tournamentId}/mvp`,
      { params: { limit: limit.toString() } }
    );
  }

  /**
   * POST /api/statistics/tournament/{tournamentId}/player/{playerId}/initialize
   * Initialize statistics for a player in a tournament
   */
  initializePlayerStats(
    tournamentId: number,
    playerId: number,
    teamId: number
  ): Observable<ApiResponse<PlayerStatisticsResponse>> {
    return this.http.post<ApiResponse<PlayerStatisticsResponse>>(
      `${this.apiUrl}/tournament/${tournamentId}/player/${playerId}/initialize`,
      null,
      { params: { teamId: teamId.toString() } }
    );
  }

  /**
   * POST /api/statistics/tournament/{tournamentId}/update-rankings
   * Update the scorer and assist rankings
   */
  updateRankings(tournamentId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/tournament/${tournamentId}/update-rankings`,
      {}
    );
  }

  /**
   * GET /api/statistics/tournament/{tournamentId}/count
   * Get the number of players with statistics
   */
  countByTournament(tournamentId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/tournament/${tournamentId}/count`
    );
  }

  /**
   * GET /api/statistics/tournament/{tournamentId}/count/scorers
   * Get the number of players with goals
   */
  countScorers(tournamentId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/tournament/${tournamentId}/count/scorers`
    );
  }
}
