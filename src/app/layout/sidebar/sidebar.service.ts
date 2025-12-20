import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RouteInfo } from './sidebar.metadata';
import { AuthService, User } from '@core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Get sidebar menu items from user menus (login response)
   * Falls back to static routes.json if no menus available
   * @returns Observable<RouteInfo[]>
   */
  getRouteInfo(): Observable<RouteInfo[]> {
    const user: User = this.authService.currentUserValue;
    const menus: RouteInfo[] = user?.menus || [];

    // If user has menus from backend, use them directly
    if (menus.length > 0) {
      return of(menus);
    }

    // Fallback to static routes from JSON file
    return this.http
      .get<{ routes: RouteInfo[] }>('assets/data/routes.json')
      .pipe(map((response) => response.routes));
  }
}
