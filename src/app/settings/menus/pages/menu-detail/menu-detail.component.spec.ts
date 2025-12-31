import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { MenuDetailComponent } from './menu-detail.component';
import {
  MenuService,
  MenuItemService,
  ResourceService,
  ApiResponse,
  MenuResponse,
  MenuItemResponse,
  ResourceResponse,
} from '@core';

describe('MenuDetailComponent', () => {
  let component: MenuDetailComponent;
  let fixture: ComponentFixture<MenuDetailComponent>;
  let menuServiceSpy: jasmine.SpyObj<MenuService>;
  let menuItemServiceSpy: jasmine.SpyObj<MenuItemService>;
  let resourceServiceSpy: jasmine.SpyObj<ResourceService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let router: Router;

  const mockMenu: MenuResponse = {
    id: 1,
    code: 'ADMIN',
    title: 'Admin Menu',
    resourceId: 1,
    path: '/admin',
  };

  const mockMenuItems: MenuItemResponse[] = [
    {
      id: 1,
      menuId: 1,
      title: 'Dashboard',
      path: '/dashboard',
      displayOrder: 1,
    },
    {
      id: 2,
      menuId: 1,
      parentId: 1,
      title: 'Analytics',
      path: '/dashboard/analytics',
      displayOrder: 1,
    },
  ];

  const mockResources: ResourceResponse[] = [
    { id: 1, code: 'DASHBOARD_VIEW', name: 'Dashboard View', type: 'VIEW' },
    { id: 2, code: 'SETTINGS_VIEW', name: 'Settings View', type: 'VIEW' },
  ];

  const mockMenuResponse: ApiResponse<MenuResponse> = {
    header: { success: true, statusCode: 200, message: 'Menu retrieved' },
    body: { data: mockMenu },
  };

  const mockMenuItemsResponse: ApiResponse<MenuItemResponse[]> = {
    header: { success: true, statusCode: 200, message: 'Menu items retrieved' },
    body: { data: mockMenuItems },
  };

  const mockResourcesResponse: ApiResponse<ResourceResponse[]> = {
    header: { success: true, statusCode: 200, message: 'Resources retrieved' },
    body: { data: mockResources },
  };

  const mockCreateResponse: ApiResponse<MenuItemResponse> = {
    header: { success: true, statusCode: 201, message: 'Menu item created successfully' },
    body: { data: mockMenuItems[0] },
  };

  const mockUpdateResponse: ApiResponse<MenuItemResponse> = {
    header: { success: true, statusCode: 200, message: 'Menu item updated successfully' },
    body: { data: { ...mockMenuItems[0], title: 'Updated Dashboard' } },
  };

  const mockDeleteResponse: ApiResponse<void> = {
    header: { success: true, statusCode: 200, message: 'Menu item deleted successfully' },
    body: { data: undefined as unknown as void },
  };

  beforeEach(waitForAsync(() => {
    const menuServiceMock = jasmine.createSpyObj('MenuService', ['getById']);
    menuServiceMock.getById.and.returnValue(of(mockMenuResponse));

    const menuItemServiceMock = jasmine.createSpyObj('MenuItemService', [
      'getByMenuId',
      'create',
      'update',
      'delete',
    ]);
    menuItemServiceMock.getByMenuId.and.returnValue(of(mockMenuItemsResponse));
    menuItemServiceMock.create.and.returnValue(of(mockCreateResponse));
    menuItemServiceMock.update.and.returnValue(of(mockUpdateResponse));
    menuItemServiceMock.delete.and.returnValue(of(mockDeleteResponse));

    const resourceServiceMock = jasmine.createSpyObj('ResourceService', ['getAll']);
    resourceServiceMock.getAll.and.returnValue(of(mockResourcesResponse));

    const modalMock = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);
    const toastrMock = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [
        MenuDetailComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        provideRouter([]),
        { provide: MenuService, useValue: menuServiceMock },
        { provide: MenuItemService, useValue: menuItemServiceMock },
        { provide: ResourceService, useValue: resourceServiceMock },
        { provide: NgbModal, useValue: modalMock },
        { provide: ToastrService, useValue: toastrMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' }),
          },
        },
      ],
    }).compileComponents();

    menuServiceSpy = TestBed.inject(MenuService) as jasmine.SpyObj<MenuService>;
    menuItemServiceSpy = TestBed.inject(MenuItemService) as jasmine.SpyObj<MenuItemService>;
    resourceServiceSpy = TestBed.inject(ResourceService) as jasmine.SpyObj<ResourceService>;
    modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load menu on init', () => {
      expect(menuServiceSpy.getById).toHaveBeenCalledWith(1);
      expect(component.menu).toEqual(mockMenu);
    });

    it('should load menu items on init', () => {
      expect(menuItemServiceSpy.getByMenuId).toHaveBeenCalledWith(1);
      expect(component.menuItems.length).toBe(2);
    });

    it('should load resources on init', () => {
      expect(resourceServiceSpy.getAll).toHaveBeenCalled();
      expect(component.resources.length).toBe(2);
    });
  });

  describe('filterDatatable', () => {
    it('should filter by title (exact match)', () => {
      component.menuItems = mockMenuItems;
      component.filteredMenuItems = [...mockMenuItems];

      const event = { target: { value: 'Analytics' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredMenuItems.length).toBe(1);
      expect(component.filteredMenuItems[0].title).toBe('Analytics');
    });

    it('should filter by path', () => {
      component.menuItems = mockMenuItems;
      component.filteredMenuItems = [...mockMenuItems];

      const event = { target: { value: 'analytics' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredMenuItems.length).toBe(1);
      expect(component.filteredMenuItems[0].path).toBe('/dashboard/analytics');
    });

    it('should return multiple results when search matches multiple items', () => {
      component.menuItems = mockMenuItems;
      component.filteredMenuItems = [...mockMenuItems];

      const event = { target: { value: 'dashboard' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredMenuItems.length).toBe(2);
    });
  });

  describe('getRootMenuItems', () => {
    it('should return only root items', () => {
      component.menuItems = mockMenuItems;

      const rootItems = component.getRootMenuItems();

      expect(rootItems.length).toBe(1);
      expect(rootItems[0].parentId).toBeUndefined();
    });
  });

  describe('openAddModal', () => {
    it('should reset form and open modal', () => {
      const mockModalRef = { dismiss: jasmine.createSpy('dismiss') } as unknown as NgbModalRef;
      modalServiceSpy.open.and.returnValue(mockModalRef);
      const content = {};

      component.openAddModal(content);

      expect(modalServiceSpy.open).toHaveBeenCalledWith(content, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg',
      });
    });
  });

  describe('onAddMenuItemSave', () => {
    it('should not save if form is invalid', () => {
      component.menuItemForm.controls['title'].setValue('');

      component.onAddMenuItemSave();

      expect(menuItemServiceSpy.create).not.toHaveBeenCalled();
    });

    it('should create menu item successfully', () => {
      component.menuItemForm.controls['title'].setValue('New Item');
      component.menuItemForm.controls['displayOrder'].setValue(1);

      component.onAddMenuItemSave();

      expect(menuItemServiceSpy.create).toHaveBeenCalled();
      expect(toastrSpy.success).toHaveBeenCalledWith('Menu item created successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
    });

    it('should handle error when creating menu item', () => {
      menuItemServiceSpy.create.and.returnValue(
        throwError(() => ({ message: 'Creation failed' }))
      );
      component.menuItemForm.controls['title'].setValue('New Item');
      component.menuItemForm.controls['displayOrder'].setValue(1);

      component.onAddMenuItemSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('Creation failed');
    });
  });

  describe('openEditModal', () => {
    it('should set editing menu item and open modal', () => {
      const mockModalRef = { dismiss: jasmine.createSpy('dismiss') } as unknown as NgbModalRef;
      modalServiceSpy.open.and.returnValue(mockModalRef);
      const content = {};

      component.openEditModal(content, mockMenuItems[0]);

      expect(component.editingMenuItem).toEqual(mockMenuItems[0]);
      expect(component.editMenuItemForm.value.title).toBe('Dashboard');
    });
  });

  describe('onEditMenuItemSave', () => {
    it('should not save if form is invalid', () => {
      component.editMenuItemForm.controls['title'].setValue('');
      component.editingMenuItem = mockMenuItems[0];

      component.onEditMenuItemSave();

      expect(menuItemServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should update menu item successfully', () => {
      component.editingMenuItem = mockMenuItems[0];
      component.editMenuItemForm.controls['title'].setValue('Updated Dashboard');
      component.editMenuItemForm.controls['displayOrder'].setValue(1);

      component.onEditMenuItemSave();

      expect(menuItemServiceSpy.update).toHaveBeenCalledWith(1, jasmine.any(Object));
      expect(toastrSpy.success).toHaveBeenCalledWith('Menu item updated successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
    });

    it('should handle error when updating menu item', () => {
      menuItemServiceSpy.update.and.returnValue(
        throwError(() => ({ message: 'Update failed' }))
      );
      component.editingMenuItem = mockMenuItems[0];
      component.editMenuItemForm.controls['title'].setValue('Updated Dashboard');
      component.editMenuItemForm.controls['displayOrder'].setValue(1);

      component.onEditMenuItemSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('Update failed');
    });
  });

  describe('deleteMenuItem', () => {
    it('should show confirmation dialog and delete on confirm', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );

      component.deleteMenuItem(mockMenuItems[0]);
      tick();

      expect(menuItemServiceSpy.delete).toHaveBeenCalledWith(1);
      expect(toastrSpy.success).toHaveBeenCalledWith('Menu item deleted successfully');
    }));

    it('should not delete when cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );

      component.deleteMenuItem(mockMenuItems[0]);
      tick();

      expect(menuItemServiceSpy.delete).not.toHaveBeenCalled();
    }));
  });

  describe('getParentTitle', () => {
    it('should return parent title when parent exists', () => {
      component.menuItems = mockMenuItems;

      const title = component.getParentTitle(1);

      expect(title).toBe('Dashboard');
    });

    it('should return dash when no parent', () => {
      const title = component.getParentTitle(undefined);

      expect(title).toBe('-');
    });
  });

  describe('goBack', () => {
    it('should navigate to menu list', () => {
      const navigateSpy = spyOn(router, 'navigate');

      component.goBack();

      expect(navigateSpy).toHaveBeenCalledWith(['/settings/menus/list']);
    });
  });

  describe('Form Validation', () => {
    it('should have invalid form when title is empty', () => {
      component.menuItemForm.controls['title'].setValue('');
      expect(component.menuItemForm.controls['title'].valid).toBeFalse();
    });

    it('should have invalid form when displayOrder is missing', () => {
      component.menuItemForm.controls['displayOrder'].setValue(null);
      expect(component.menuItemForm.controls['displayOrder'].valid).toBeFalse();
    });

    it('should have valid form when required fields are filled', () => {
      component.menuItemForm.controls['title'].setValue('Valid Title');
      component.menuItemForm.controls['displayOrder'].setValue(1);
      expect(component.menuItemForm.valid).toBeTrue();
    });
  });
});
