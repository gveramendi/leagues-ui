import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateRoleRequest,
  PageResponse,
  RoleResponse,
  SuccessResponse,
  UpdateRoleRequest,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/api/roles`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/roles
   * Get all roles
   */
  getAll(): Observable<SuccessResponse<RoleResponse[]>> {
    return this.http.get<SuccessResponse<RoleResponse[]>>(this.apiUrl);
  }

  /**
   * GET /api/roles/{id}
   * Get role by id
   */
  getById(id: number): Observable<SuccessResponse<RoleResponse>> {
    return this.http.get<SuccessResponse<RoleResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/roles/name/{name}
   * Get role by name
   */
  getByName(name: string): Observable<SuccessResponse<RoleResponse>> {
    return this.http.get<SuccessResponse<RoleResponse>>(
      `${this.apiUrl}/name/${name}`
    );
  }

  /**
   * GET /api/roles/search
   * Search roles with pagination
   */
  searchRoles(
    search: string = '',
    page: number = 0,
    size: number = 10,
    sort: string = 'name,asc'
  ): Observable<SuccessResponse<PageResponse<RoleResponse>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<SuccessResponse<PageResponse<RoleResponse>>>(
      `${this.apiUrl}/search`,
      { params }
    );
  }

  /**
   * POST /api/roles
   * Create a new role
   */
  create(request: CreateRoleRequest): Observable<SuccessResponse<RoleResponse>> {
    return this.http.post<SuccessResponse<RoleResponse>>(this.apiUrl, request);
  }

  /**
   * PUT /api/roles/{id}
   * Update an existing role
   */
  update(
    id: number,
    request: UpdateRoleRequest
  ): Observable<SuccessResponse<RoleResponse>> {
    return this.http.put<SuccessResponse<RoleResponse>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  /**
   * DELETE /api/roles/{id}
   * Delete a role
   */
  delete(id: number): Observable<SuccessResponse<void>> {
    return this.http.delete<SuccessResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/roles/exists/{name}
   * Check if role name exists
   */
  existsByName(name: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${name}`);
  }
}
