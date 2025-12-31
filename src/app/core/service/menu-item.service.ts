import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreateMenuItemRequest,
  MenuItemResponse,
  UpdateMenuItemRequest,
} from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class MenuItemService {
  private apiUrl = `${environment.apiUrl}/api/menu-items`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/menu-items
   * Get all menu items
   */
  getAll(): Observable<ApiResponse<MenuItemResponse[]>> {
    return this.http.get<ApiResponse<MenuItemResponse[]>>(this.apiUrl);
  }

  /**
   * GET /api/menu-items/{id}
   * Get menu item by id
   */
  getById(id: number): Observable<ApiResponse<MenuItemResponse>> {
    return this.http.get<ApiResponse<MenuItemResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * GET /api/menu-items/menu/{menuId}
   * Get all menu items for a specific menu
   */
  getByMenuId(menuId: number): Observable<ApiResponse<MenuItemResponse[]>> {
    return this.http.get<ApiResponse<MenuItemResponse[]>>(
      `${this.apiUrl}/menu/${menuId}`
    );
  }

  /**
   * GET /api/menu-items/parent/{parentId}
   * Get child menu items of a parent
   */
  getByParentId(parentId: number): Observable<ApiResponse<MenuItemResponse[]>> {
    return this.http.get<ApiResponse<MenuItemResponse[]>>(
      `${this.apiUrl}/parent/${parentId}`
    );
  }

  /**
   * GET /api/menu-items/menu/{menuId}/root
   * Get root-level menu items for a menu (items without parent)
   */
  getRootItemsByMenuId(menuId: number): Observable<ApiResponse<MenuItemResponse[]>> {
    return this.http.get<ApiResponse<MenuItemResponse[]>>(
      `${this.apiUrl}/menu/${menuId}/root`
    );
  }

  /**
   * POST /api/menu-items
   * Create a new menu item
   */
  create(request: CreateMenuItemRequest): Observable<ApiResponse<MenuItemResponse>> {
    return this.http.post<ApiResponse<MenuItemResponse>>(this.apiUrl, request);
  }

  /**
   * PUT /api/menu-items/{id}
   * Update an existing menu item
   */
  update(
    id: number,
    request: UpdateMenuItemRequest
  ): Observable<ApiResponse<MenuItemResponse>> {
    return this.http.put<ApiResponse<MenuItemResponse>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  /**
   * DELETE /api/menu-items/{id}
   * Delete a menu item (soft delete)
   */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
