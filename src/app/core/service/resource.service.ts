import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreateResourceRequest,
  ResourceResponse,
  UpdateResourceRequest,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private apiUrl = `${environment.apiUrl}/api/resources`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/resources
   * Get all resources
   */
  getAll(): Observable<ApiResponse<ResourceResponse[]>> {
    return this.http.get<ApiResponse<ResourceResponse[]>>(this.apiUrl);
  }

  /**
   * GET /api/resources/{id}
   * Get resource by id
   */
  getById(id: number): Observable<ApiResponse<ResourceResponse>> {
    return this.http.get<ApiResponse<ResourceResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/resources/code/{code}
   * Get resource by code
   */
  getByCode(code: string): Observable<ApiResponse<ResourceResponse>> {
    return this.http.get<ApiResponse<ResourceResponse>>(
      `${this.apiUrl}/code/${code}`
    );
  }

  /**
   * POST /api/resources
   * Create a new resource
   */
  create(request: CreateResourceRequest): Observable<ApiResponse<ResourceResponse>> {
    return this.http.post<ApiResponse<ResourceResponse>>(this.apiUrl, request);
  }

  /**
   * PUT /api/resources/{id}
   * Update an existing resource
   */
  update(
    id: number,
    request: UpdateResourceRequest
  ): Observable<ApiResponse<ResourceResponse>> {
    return this.http.put<ApiResponse<ResourceResponse>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  /**
   * DELETE /api/resources/{id}
   * Delete a resource
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/resources/exists/{code}
   * Check if resource code exists
   */
  existsByCode(code: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/exists/${code}`);
  }
}
