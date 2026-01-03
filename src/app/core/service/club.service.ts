import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  ClubResponse,
  CreateClubRequest,
  UpdateClubRequest,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class ClubService {
  private apiUrl = `${environment.apiUrl}/api/clubs`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/clubs
   * Get all clubs
   */
  getAll(): Observable<ApiResponse<ClubResponse[]>> {
    return this.http.get<ApiResponse<ClubResponse[]>>(this.apiUrl);
  }

  /**
   * GET /api/clubs/{id}
   * Get club by id
   */
  getById(id: number): Observable<ApiResponse<ClubResponse>> {
    return this.http.get<ApiResponse<ClubResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/clubs/code/{code}
   * Get club by code
   */
  getByCode(code: string): Observable<ApiResponse<ClubResponse>> {
    return this.http.get<ApiResponse<ClubResponse>>(
      `${this.apiUrl}/code/${code}`
    );
  }

  /**
   * GET /api/clubs/search
   * Search clubs with pagination
   */
  searchClubs(
    search: string = '',
    page: number = 0,
    size: number = 10,
    sort: string = 'name,asc'
  ): Observable<ApiResponse<ClubResponse[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<ClubResponse[]>>(
      `${this.apiUrl}/search`,
      { params }
    );
  }

  /**
   * POST /api/clubs
   * Create a new club
   */
  create(request: CreateClubRequest): Observable<ApiResponse<ClubResponse>> {
    return this.http.post<ApiResponse<ClubResponse>>(this.apiUrl, request);
  }

  /**
   * PUT /api/clubs/{id}
   * Update an existing club
   */
  update(
    id: number,
    request: UpdateClubRequest
  ): Observable<ApiResponse<ClubResponse>> {
    return this.http.put<ApiResponse<ClubResponse>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  /**
   * DELETE /api/clubs/{id}
   * Delete a club
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/clubs/exists/{code}
   * Check if club code exists
   */
  existsByCode(code: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/exists/${code}`);
  }
}
