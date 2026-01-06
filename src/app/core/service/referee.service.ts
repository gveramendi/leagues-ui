import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  RefereeResponse,
  CreateRefereeRequest,
  UpdateRefereeRequest,
  RefereeCategory,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class RefereeService {
  private apiUrl = `${environment.apiUrl}/api/referees`;

  constructor(private http: HttpClient) {}

  /**
   * POST /api/referees
   * Create a new referee
   */
  create(request: CreateRefereeRequest): Observable<ApiResponse<RefereeResponse>> {
    return this.http.post<ApiResponse<RefereeResponse>>(this.apiUrl, request);
  }

  /**
   * GET /api/referees/{id}
   * Get referee by ID
   */
  getById(id: number): Observable<ApiResponse<RefereeResponse>> {
    return this.http.get<ApiResponse<RefereeResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/referees
   * Get all referees with pagination
   */
  getAll(
    page: number = 0,
    size: number = 20,
    sort: string = 'lastName,asc'
  ): Observable<ApiResponse<RefereeResponse[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<ApiResponse<RefereeResponse[]>>(this.apiUrl, { params });
  }

  /**
   * GET /api/referees/search
   * Search referees by name
   */
  search(
    query: string,
    page: number = 0,
    size: number = 20,
    sort: string = 'lastName,asc'
  ): Observable<ApiResponse<RefereeResponse[]>> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<ApiResponse<RefereeResponse[]>>(
      `${this.apiUrl}/search`,
      { params }
    );
  }

  /**
   * GET /api/referees/category/{category}
   * Get referees by category
   */
  getByCategory(
    category: RefereeCategory,
    page: number = 0,
    size: number = 20,
    sort: string = 'lastName,asc'
  ): Observable<ApiResponse<RefereeResponse[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<ApiResponse<RefereeResponse[]>>(
      `${this.apiUrl}/category/${category}`,
      { params }
    );
  }

  /**
   * PUT /api/referees/{id}
   * Update referee
   */
  update(id: number, request: UpdateRefereeRequest): Observable<ApiResponse<RefereeResponse>> {
    return this.http.put<ApiResponse<RefereeResponse>>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * DELETE /api/referees/{id}
   * Delete referee
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
