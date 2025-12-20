import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RouteInfo } from './sidebar.metadata';
import { AuthService, User, Resource } from '@core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Get sidebar menu items from JSON file and filter by user permissions
   * @returns Observable<RouteInfo[]>
   */
  getRouteInfo(): Observable<RouteInfo[]> {
    const user: User = this.authService.currentUserValue;

    // Get user resources (if available from permissions)
    const resources: Resource[] = user.resources || [];

    // If no resources available, return base routes from JSON
    if (resources.length === 0) {
      return this.http
        .get<{ routes: RouteInfo[] }>('assets/data/routes.json')
        .pipe(map((response) => response.routes));
    }

    // Sort resources by order
    const sortedResources = resources
      .filter(r => r.order !== undefined)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Build dynamic menu from user resources
    return this.http
      .get<{ routes: RouteInfo[] }>('assets/data/routes.json')
      .pipe(map((response) => {
        sortedResources.forEach(resource => {
          if (resource.groupName) {
            // Add to existing group
            const menuItem: RouteInfo | undefined = response.routes.find(
              item => item.groupName === resource.groupName
            );
            if (menuItem) {
              menuItem.submenu.push(this.buildSubmenuItem(resource));
            }
          } else {
            // Add as top-level menu item
            response.routes.push(this.buildSubmenuItem(resource));
          }
        });
        return response.routes;
      }));
  }

  /**
   * Build a menu item from a resource
   * @param resource The resource to convert to a menu item
   * @returns RouteInfo menu item
   */
  buildSubmenuItem(resource: Resource): RouteInfo {
    return {
      path: resource.path || '',
      title: resource.title || resource.name,
      groupName: '',
      groupTitle: false,
      class: '',
      badge: resource.badge || '',
      badgeClass: resource.badgeClass || '',
      icon: resource.icon || '',
      iconType: resource.iconType || 'feather',
      submenu: [],
    };
  }
}
