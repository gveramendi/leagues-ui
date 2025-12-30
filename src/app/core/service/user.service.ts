import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/users
   * Get all users
   */
  getAll(): Observable<ApiResponse<UserResponse[]>> {
    return this.http.get<ApiResponse<UserResponse[]>>(this.apiUrl);
  }

  /**
   * GET /api/users/{id}
   * Get user by id
   */
  getById(id: number): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/users/email/{email}
   * Get user by email
   */
  getByEmail(email: string): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(
      `${this.apiUrl}/email/${email}`
    );
  }

  /**
   * GET /api/users/search
   * Search users with pagination
   */
  searchUsers(
    search: string = '',
    page: number = 0,
    size: number = 10,
    sort: string = 'firstName,asc'
  ): Observable<ApiResponse<UserResponse[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<UserResponse[]>>(
      `${this.apiUrl}/search`,
      { params }
    );
  }

  /**
   * POST /api/users
   * Create a new user
   */
  create(request: CreateUserRequest): Observable<ApiResponse<UserResponse>> {
    return this.http.post<ApiResponse<UserResponse>>(this.apiUrl, request);
  }

  /**
   * PUT /api/users/{id}
   * Update an existing user
   */
  update(
    id: number,
    request: UpdateUserRequest
  ): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  /**
   * DELETE /api/users/{id}
   * Delete a user
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/users/exists/{email}
   * Check if user email exists
   */
  existsByEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${email}`);
  }

  /**
   * POST /api/users/{userId}/roles/{roleId}
   * Add a role to a user
   */
  addRole(userId: number, roleId: number): Observable<ApiResponse<UserResponse>> {
    return this.http.post<ApiResponse<UserResponse>>(
      `${this.apiUrl}/${userId}/roles/${roleId}`,
      {}
    );
  }

  /**
   * DELETE /api/users/{userId}/roles/{roleId}
   * Remove a role from a user
   */
  removeRole(userId: number, roleId: number): Observable<ApiResponse<UserResponse>> {
    return this.http.delete<ApiResponse<UserResponse>>(
      `${this.apiUrl}/${userId}/roles/${roleId}`
    );
  }
}
