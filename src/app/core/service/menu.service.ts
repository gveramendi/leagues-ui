import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreateMenuRequest,
  MenuResponse,
  UpdateMenuRequest,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private apiUrl = `${environment.apiUrl}/api/menus`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/menus
   * Get all menus
   */
  getAll(): Observable<ApiResponse<MenuResponse[]>> {
    return this.http.get<ApiResponse<MenuResponse[]>>(this.apiUrl);
  }

  /**
   * GET /api/menus/{id}
   * Get menu by id
   */
  getById(id: number): Observable<ApiResponse<MenuResponse>> {
    return this.http.get<ApiResponse<MenuResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/menus/code/{code}
   * Get menu by code
   */
  getByCode(code: string): Observable<ApiResponse<MenuResponse>> {
    return this.http.get<ApiResponse<MenuResponse>>(
      `${this.apiUrl}/code/${code}`
    );
  }

  /**
   * GET /api/menus/search
   * Search menus with pagination
   */
  searchMenus(
    search: string = '',
    page: number = 0,
    size: number = 10,
    sort: string = 'title,asc'
  ): Observable<ApiResponse<MenuResponse[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<MenuResponse[]>>(
      `${this.apiUrl}/search`,
      { params }
    );
  }

  /**
   * POST /api/menus
   * Create a new menu
   */
  create(request: CreateMenuRequest): Observable<ApiResponse<MenuResponse>> {
    return this.http.post<ApiResponse<MenuResponse>>(this.apiUrl, request);
  }

  /**
   * PUT /api/menus/{id}
   * Update an existing menu
   */
  update(
    id: number,
    request: UpdateMenuRequest
  ): Observable<ApiResponse<MenuResponse>> {
    return this.http.put<ApiResponse<MenuResponse>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  /**
   * DELETE /api/menus/{id}
   * Delete a menu
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/menus/exists/{code}
   * Check if menu code exists
   */
  existsByCode(code: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${code}`);
  }
}
