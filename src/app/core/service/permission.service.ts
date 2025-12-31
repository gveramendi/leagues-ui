import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PermissionResponse } from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/api/permissions`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/permissions/role/{roleId}
   * Get all permissions for a role
   */
  getByRoleId(roleId: number): Observable<ApiResponse<PermissionResponse[]>> {
    return this.http.get<ApiResponse<PermissionResponse[]>>(
      `${this.apiUrl}/role/${roleId}`
    );
  }
}
