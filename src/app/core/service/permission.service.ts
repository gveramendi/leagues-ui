import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreatePermissionRequest,
  PermissionResponse,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/api/permissions`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/permissions
   * Get all permissions
   */
  getAll(): Observable<ApiResponse<PermissionResponse[]>> {
    return this.http.get<ApiResponse<PermissionResponse[]>>(this.apiUrl);
  }

  /**
   * GET /api/permissions/role/{roleId}
   * Get all permissions for a role
   */
  getByRoleId(roleId: number): Observable<ApiResponse<PermissionResponse[]>> {
    return this.http.get<ApiResponse<PermissionResponse[]>>(
      `${this.apiUrl}/role/${roleId}`
    );
  }

  /**
   * POST /api/permissions
   * Create a new permission (assign resource to role)
   */
  create(request: CreatePermissionRequest): Observable<ApiResponse<PermissionResponse>> {
    return this.http.post<ApiResponse<PermissionResponse>>(this.apiUrl, request);
  }

  /**
   * PUT /api/roles/{roleId}/resources/{resourceId}
   * Update a permission (modify resource permissions for role)
   */
  update(
    roleId: number,
    resourceId: number,
    request: CreatePermissionRequest
  ): Observable<ApiResponse<PermissionResponse>> {
    return this.http.put<ApiResponse<PermissionResponse>>(
      `${environment.apiUrl}/api/roles/${roleId}/resources/${resourceId}`,
      request
    );
  }

  /**
   * DELETE /api/roles/{roleId}/resources/{resourceId}
   * Delete a permission (remove resource from role)
   */
  delete(roleId: number, resourceId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${environment.apiUrl}/api/roles/${roleId}/resources/${resourceId}`
    );
  }
}
