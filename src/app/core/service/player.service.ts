import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  PlayerResponse,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  DocumentType,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private apiUrl = `${environment.apiUrl}/api/players`;

  constructor(private http: HttpClient) {}

  /**
   * POST /api/players
   * Create a new player
   */
  create(request: CreatePlayerRequest): Observable<ApiResponse<PlayerResponse>> {
    return this.http.post<ApiResponse<PlayerResponse>>(this.apiUrl, request);
  }

  /**
   * GET /api/players/{id}
   * Get player by ID
   */
  getById(id: number): Observable<ApiResponse<PlayerResponse>> {
    return this.http.get<ApiResponse<PlayerResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/players/document/{documentType}/{documentNumber}
   * Get player by document
   */
  getByDocument(
    documentType: DocumentType,
    documentNumber: string
  ): Observable<ApiResponse<PlayerResponse>> {
    return this.http.get<ApiResponse<PlayerResponse>>(
      `${this.apiUrl}/document/${documentType}/${documentNumber}`
    );
  }

  /**
   * GET /api/players/search
   * Search players with pagination
   */
  search(
    search?: string,
    page: number = 0,
    size: number = 10,
    sort: string = 'lastName,asc'
  ): Observable<ApiResponse<PlayerResponse[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<PlayerResponse[]>>(
      `${this.apiUrl}/search`,
      { params }
    );
  }

  /**
   * PUT /api/players/{id}
   * Update an existing player
   */
  update(
    id: number,
    request: UpdatePlayerRequest
  ): Observable<ApiResponse<PlayerResponse>> {
    return this.http.put<ApiResponse<PlayerResponse>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  /**
   * DELETE /api/players/{id}
   * Soft delete a player
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
