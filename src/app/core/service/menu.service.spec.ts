import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { MenuService } from './menu.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreateMenuRequest,
  MenuResponse,
  UpdateMenuRequest,
} from '../models/response';

describe('MenuService', () => {
  let service: MenuService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/menus`;

  const mockMenu: MenuResponse = {
    id: 1,
    code: 'DASHBOARD',
    title: 'Dashboard',
    resourceId: 1,
    resourceCode: 'DASHBOARD_VIEW',
    path: '/dashboard',
    iconType: 'fontawesome',
    icon: 'fas fa-home',
    className: 'menu-item',
    groupTitle: false,
    groupName: 'Main',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MenuService],
    });
    service = TestBed.inject(MenuService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return all menus wrapped in ApiResponse', () => {
      const mockResponse: ApiResponse<MenuResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Menus retrieved successfully',
        },
        body: {
          data: [
            mockMenu,
            { ...mockMenu, id: 2, code: 'SETTINGS', title: 'Settings' },
          ],
        },
      };

      service.getAll().subscribe((response) => {
        expect(response.body.data.length).toBe(2);
        expect(response.header.success).toBeTrue();
        expect(response.body.data[0].code).toBe('DASHBOARD');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getById', () => {
    it('should return a menu by id wrapped in ApiResponse', () => {
      const mockResponse: ApiResponse<MenuResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Menu retrieved successfully',
        },
        body: {
          data: mockMenu,
        },
      };

      service.getById(1).subscribe((response) => {
        expect(response.body.data.id).toBe(1);
        expect(response.body.data.code).toBe('DASHBOARD');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getByCode', () => {
    it('should return a menu by code wrapped in ApiResponse', () => {
      const mockResponse: ApiResponse<MenuResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Menu retrieved successfully',
        },
        body: {
          data: mockMenu,
        },
      };

      service.getByCode('DASHBOARD').subscribe((response) => {
        expect(response.body.data.code).toBe('DASHBOARD');
        expect(response.body.data.title).toBe('Dashboard');
      });

      const req = httpMock.expectOne(`${apiUrl}/code/DASHBOARD`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('searchMenus', () => {
    it('should search menus with pagination wrapped in ApiResponse', () => {
      const mockResponse: ApiResponse<MenuResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Menus retrieved successfully',
        },
        body: {
          pagination: {
            totalElements: 1,
            totalPages: 1,
            size: 10,
            number: 0,
            first: true,
            last: true,
            empty: false,
          },
          data: [mockMenu],
        },
      };

      service.searchMenus('Dashboard', 0, 10, 'title,asc').subscribe((response) => {
        expect(response.body.data.length).toBe(1);
        expect(response.body.pagination?.totalElements).toBe(1);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/search?page=0&size=10&sort=title,asc&search=Dashboard`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should search menus without search term', () => {
      const mockResponse: ApiResponse<MenuResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Menus retrieved successfully',
        },
        body: {
          data: [mockMenu],
        },
      };

      service.searchMenus('', 0, 10, 'title,asc').subscribe((response) => {
        expect(response.body.data.length).toBe(1);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/search?page=0&size=10&sort=title,asc`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('create', () => {
    it('should create a new menu wrapped in ApiResponse', () => {
      const createRequest: CreateMenuRequest = {
        code: 'NEW_MENU',
        title: 'New Menu',
        resourceId: 1,
        path: '/new-menu',
        iconType: 'fontawesome',
        icon: 'fas fa-star',
      };

      const mockResponse: ApiResponse<MenuResponse> = {
        header: {
          success: true,
          statusCode: 201,
          message: 'Menu created successfully',
        },
        body: {
          data: {
            id: 3,
            code: 'NEW_MENU',
            title: 'New Menu',
            resourceId: 1,
            resourceCode: 'DASHBOARD_VIEW',
            path: '/new-menu',
            iconType: 'fontawesome',
            icon: 'fas fa-star',
          },
        },
      };

      service.create(createRequest).subscribe((response) => {
        expect(response.header.success).toBeTrue();
        expect(response.header.statusCode).toBe(201);
        expect(response.body.data.code).toBe('NEW_MENU');
        expect(response.body.data.resourceId).toBe(1);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing menu wrapped in ApiResponse', () => {
      const updateRequest: UpdateMenuRequest = {
        title: 'Updated Title',
        path: '/updated-path',
      };

      const mockResponse: ApiResponse<MenuResponse> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Menu updated successfully',
        },
        body: {
          data: {
            ...mockMenu,
            title: 'Updated Title',
            path: '/updated-path',
          },
        },
      };

      service.update(1, updateRequest).subscribe((response) => {
        expect(response.header.success).toBeTrue();
        expect(response.body.data.title).toBe('Updated Title');
        expect(response.body.data.path).toBe('/updated-path');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a menu and return ApiResponse', () => {
      const mockResponse: ApiResponse<void> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Menu deleted successfully',
        },
        body: {
          data: undefined as unknown as void,
        },
      };

      service.delete(1).subscribe((response) => {
        expect(response.header.success).toBeTrue();
        expect(response.header.message).toBe('Menu deleted successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('existsByCode', () => {
    it('should check if menu code exists and return true', () => {
      service.existsByCode('DASHBOARD').subscribe((exists) => {
        expect(exists).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/exists/DASHBOARD`);
      expect(req.request.method).toBe('GET');
      req.flush(true);
    });

    it('should check if menu code exists and return false', () => {
      service.existsByCode('NONEXISTENT').subscribe((exists) => {
        expect(exists).toBeFalse();
      });

      const req = httpMock.expectOne(`${apiUrl}/exists/NONEXISTENT`);
      expect(req.request.method).toBe('GET');
      req.flush(false);
    });
  });
});
