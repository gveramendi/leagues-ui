import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { MenuItemService } from './menu-item.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreateMenuItemRequest,
  MenuItemResponse,
  UpdateMenuItemRequest,
} from '../models/response';

describe('MenuItemService', () => {
  let service: MenuItemService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/menu-items`;

  const mockMenuItem: MenuItemResponse = {
    id: 1,
    menuId: 1,
    menuCode: 'ADMIN',
    parentId: undefined,
    resourceId: 5,
    resourceCode: 'DASHBOARD',
    title: 'Dashboard',
    icon: 'home',
    path: '/dashboard',
    iconType: 'feather',
    className: 'menu-item',
    groupTitle: false,
    badge: undefined,
    badgeClass: undefined,
    displayOrder: 1,
    children: [],
  };

  const mockChildMenuItem: MenuItemResponse = {
    id: 2,
    menuId: 1,
    menuCode: 'ADMIN',
    parentId: 1,
    resourceId: 6,
    resourceCode: 'ANALYTICS',
    title: 'Analytics',
    icon: 'bar-chart',
    path: '/dashboard/analytics',
    iconType: 'feather',
    displayOrder: 1,
    children: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MenuItemService],
    });
    service = TestBed.inject(MenuItemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return all menu items wrapped in ApiResponse', () => {
      const mockResponse: ApiResponse<MenuItemResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Menu items retrieved successfully',
        },
        body: {
          data: [mockMenuItem, mockChildMenuItem],
        },
      };

      service.getAll().subscribe((response) => {
        expect(response.body.data.length).toBe(2);
        expect(response.header.success).toBeTrue();
        expect(response.body.data[0].title).toBe('Dashboard');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should return a menu item by id wrapped in ApiResponse', () => {
      const mockResponse: ApiResponse<MenuItemResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Menu item retrieved successfully',
        },
        body: {
          data: mockMenuItem,
        },
      };

      service.getById(1).subscribe((response) => {
        expect(response.body.data.id).toBe(1);
        expect(response.body.data.title).toBe('Dashboard');
        expect(response.body.data.menuCode).toBe('ADMIN');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByMenuId', () => {
    it('should return all menu items for a specific menu', () => {
      const mockResponse: ApiResponse<MenuItemResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Menu items retrieved successfully',
        },
        body: {
          data: [mockMenuItem, mockChildMenuItem],
        },
      };

      service.getByMenuId(1).subscribe((response) => {
        expect(response.body.data.length).toBe(2);
        expect(response.body.data[0].menuId).toBe(1);
        expect(response.body.data[1].menuId).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/menu/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return empty array when menu has no items', () => {
      const mockResponse: ApiResponse<MenuItemResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Menu items retrieved successfully',
        },
        body: {
          data: [],
        },
      };

      service.getByMenuId(999).subscribe((response) => {
        expect(response.body.data.length).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/menu/999`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByParentId', () => {
    it('should return child menu items of a parent', () => {
      const mockResponse: ApiResponse<MenuItemResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Child menu items retrieved successfully',
        },
        body: {
          data: [mockChildMenuItem],
        },
      };

      service.getByParentId(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].parentId).toBe(1);
        expect(response.body.data[0].title).toBe('Analytics');
      });

      const req = httpMock.expectOne(`${apiUrl}/parent/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getRootItemsByMenuId', () => {
    it('should return root-level menu items for a menu', () => {
      const mockResponse: ApiResponse<MenuItemResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Root menu items retrieved successfully',
        },
        body: {
          data: [mockMenuItem],
        },
      };

      service.getRootItemsByMenuId(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].parentId).toBeUndefined();
        expect(response.body.data[0].title).toBe('Dashboard');
      });

      const req = httpMock.expectOne(`${apiUrl}/menu/1/root`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('create', () => {
    it('should create a new menu item wrapped in ApiResponse', () => {
      const createRequest: CreateMenuItemRequest = {
        menuId: 1,
        title: 'New Item',
        path: '/new-item',
        icon: 'star',
        iconType: 'feather',
        displayOrder: 5,
      };

      const mockResponse: ApiResponse<MenuItemResponse> = {
        header: {
          success: true,
          statusCode: 201,
          message: 'Menu item created successfully',
        },
        body: {
          data: {
            id: 3,
            menuId: 1,
            menuCode: 'ADMIN',
            title: 'New Item',
            path: '/new-item',
            icon: 'star',
            iconType: 'feather',
            displayOrder: 5,
            children: [],
          },
        },
      };

      service.create(createRequest).subscribe((response) => {
        expect(response.header.success).toBeTrue();
        expect(response.header.statusCode).toBe(201);
        expect(response.body.data.title).toBe('New Item');
        expect(response.body.data.displayOrder).toBe(5);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });

    it('should create a child menu item with parentId', () => {
      const createRequest: CreateMenuItemRequest = {
        menuId: 1,
        parentId: 1,
        title: 'Child Item',
        path: '/dashboard/child',
        displayOrder: 2,
      };

      const mockResponse: ApiResponse<MenuItemResponse> = {
        header: {
          success: true,
          statusCode: 201,
          message: 'Menu item created successfully',
        },
        body: {
          data: {
            id: 4,
            menuId: 1,
            parentId: 1,
            title: 'Child Item',
            path: '/dashboard/child',
            displayOrder: 2,
            children: [],
          },
        },
      };

      service.create(createRequest).subscribe((response) => {
        expect(response.body.data.parentId).toBe(1);
        expect(response.body.data.title).toBe('Child Item');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.parentId).toBe(1);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing menu item wrapped in ApiResponse', () => {
      const updateRequest: UpdateMenuItemRequest = {
        title: 'Updated Title',
        path: '/updated-path',
        displayOrder: 10,
      };

      const mockResponse: ApiResponse<MenuItemResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Menu item updated successfully',
        },
        body: {
          data: {
            ...mockMenuItem,
            title: 'Updated Title',
            path: '/updated-path',
            displayOrder: 10,
          },
        },
      };

      service.update(1, updateRequest).subscribe((response) => {
        expect(response.header.success).toBeTrue();
        expect(response.body.data.title).toBe('Updated Title');
        expect(response.body.data.path).toBe('/updated-path');
        expect(response.body.data.displayOrder).toBe(10);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResponse);
    });

    it('should update menu item parent (move to different parent)', () => {
      const updateRequest: UpdateMenuItemRequest = {
        parentId: 5,
      };

      const mockResponse: ApiResponse<MenuItemResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Menu item updated successfully',
        },
        body: {
          data: {
            ...mockChildMenuItem,
            parentId: 5,
          },
        },
      };

      service.update(2, updateRequest).subscribe((response) => {
        expect(response.body.data.parentId).toBe(5);
      });

      const req = httpMock.expectOne(`${apiUrl}/2`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.parentId).toBe(5);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a menu item and return ApiResponse', () => {
      const mockResponse: ApiResponse<void> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Menu item deleted successfully',
        },
        body: {
          data: undefined as unknown as void,
        },
      };

      service.delete(1).subscribe((response) => {
        expect(response.header.success).toBeTrue();
        expect(response.header.message).toBe('Menu item deleted successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('hierarchical structure', () => {
    it('should handle menu items with nested children', () => {
      const menuItemWithChildren: MenuItemResponse = {
        ...mockMenuItem,
        children: [
          mockChildMenuItem,
          {
            ...mockChildMenuItem,
            id: 3,
            title: 'Reports',
            path: '/dashboard/reports',
          },
        ],
      };

      const mockResponse: ApiResponse<MenuItemResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Menu items retrieved successfully',
        },
        body: {
          data: [menuItemWithChildren],
        },
      };

      service.getByMenuId(1).subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].children?.length).toBe(2);
        expect(response.body.data[0].children?.[0].title).toBe('Analytics');
        expect(response.body.data[0].children?.[1].title).toBe('Reports');
      });

      const req = httpMock.expectOne(`${apiUrl}/menu/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
