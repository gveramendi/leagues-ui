import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  StaffMemberResponse,
  CreateStaffMemberRequest,
  UpdateStaffMemberRequest,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class StaffMemberService {
  private apiUrl = `${environment.apiUrl}/api/staff-members`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/staff-members/{id}
   * Get staff member by id
   */
  getById(id: number): Observable<ApiResponse<StaffMemberResponse>> {
    return this.http.get<ApiResponse<StaffMemberResponse>>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * GET /api/staff-members/team/{teamId}
   * Get staff members by team
   */
  getByTeam(teamId: number): Observable<ApiResponse<StaffMemberResponse[]>> {
    return this.http.get<ApiResponse<StaffMemberResponse[]>>(
      `${this.apiUrl}/team/${teamId}`
    );
  }

  /**
   * POST /api/staff-members
   * Create a new staff member
   */
  create(
    request: CreateStaffMemberRequest
  ): Observable<ApiResponse<StaffMemberResponse>> {
    return this.http.post<ApiResponse<StaffMemberResponse>>(
      this.apiUrl,
      request
    );
  }

  /**
   * PUT /api/staff-members/{id}
   * Update an existing staff member
   */
  update(
    id: number,
    request: UpdateStaffMemberRequest
  ): Observable<ApiResponse<StaffMemberResponse>> {
    return this.http.put<ApiResponse<StaffMemberResponse>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  /**
   * DELETE /api/staff-members/{id}
   * Delete a staff member
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
