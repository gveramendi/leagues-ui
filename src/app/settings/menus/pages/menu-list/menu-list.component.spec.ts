import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { MenuListComponent } from './menu-list.component';
import { MenuService, ResourceService, ApiResponse, MenuResponse, ResourceResponse } from '@core';

describe('MenuListComponent', () => {
  let component: MenuListComponent;
  let fixture: ComponentFixture<MenuListComponent>;
  let menuServiceSpy: jasmine.SpyObj<MenuService>;
  let resourceServiceSpy: jasmine.SpyObj<ResourceService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockResources: ResourceResponse[] = [
    { id: 1, code: 'DASHBOARD_VIEW', name: 'Dashboard View', type: 'VIEW' },
    { id: 2, code: 'SETTINGS_VIEW', name: 'Settings View', type: 'VIEW' },
  ];

  const mockResourcesResponse: ApiResponse<ResourceResponse[]> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Resources retrieved successfully',
    },
    body: {
      data: mockResources,
    },
  };

  const mockMenu: MenuResponse = {
    id: 1,
    code: 'DASHBOARD',
    title: 'Dashboard',
    resourceId: 1,
    resourceCode: 'DASHBOARD_VIEW',
    path: '/dashboard',
    iconType: 'fontawesome',
    icon: 'fas fa-home',
    groupName: 'Main',
    groupTitle: false,
  };

  const mockMenus: MenuResponse[] = [
    mockMenu,
    { id: 2, code: 'SETTINGS', title: 'Settings', resourceId: 2, path: '/settings' },
  ];

  const mockSearchResponse: ApiResponse<MenuResponse[]> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Menus retrieved successfully',
    },
    body: {
      pagination: {
        totalElements: 2,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false,
      },
      data: mockMenus,
    },
  };

  const mockCreateResponse: ApiResponse<MenuResponse> = {
    header: {
      success: true,
      statusCode: 201,
      message: 'Menu created successfully',
    },
    body: {
      data: mockMenu,
    },
  };

  const mockUpdateResponse: ApiResponse<MenuResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Menu updated successfully',
    },
    body: {
      data: { ...mockMenu, title: 'Updated Dashboard' },
    },
  };

  const mockDeleteResponse: ApiResponse<void> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Menu deleted successfully',
    },
    body: {
      data: undefined as unknown as void,
    },
  };

  beforeEach(waitForAsync(() => {
    const menuServiceMock = jasmine.createSpyObj('MenuService', [
      'searchMenus',
      'create',
      'update',
      'delete',
    ]);
    menuServiceMock.searchMenus.and.returnValue(of(mockSearchResponse));
    menuServiceMock.create.and.returnValue(of(mockCreateResponse));
    menuServiceMock.update.and.returnValue(of(mockUpdateResponse));
    menuServiceMock.delete.and.returnValue(of(mockDeleteResponse));

    const resourceServiceMock = jasmine.createSpyObj('ResourceService', ['getAll']);
    resourceServiceMock.getAll.and.returnValue(of(mockResourcesResponse));

    const modalMock = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);
    const toastrMock = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [
        MenuListComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: MenuService, useValue: menuServiceMock },
        { provide: ResourceService, useValue: resourceServiceMock },
        { provide: NgbModal, useValue: modalMock },
        { provide: ToastrService, useValue: toastrMock },
      ],
    }).compileComponents();

    menuServiceSpy = TestBed.inject(MenuService) as jasmine.SpyObj<MenuService>;
    resourceServiceSpy = TestBed.inject(ResourceService) as jasmine.SpyObj<ResourceService>;
    modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load menus on init', () => {
      expect(menuServiceSpy.searchMenus).toHaveBeenCalledWith('', 0, 10, 'title,asc');
      expect(component.rows.length).toBe(2);
      expect(component.filteredRows.length).toBe(2);
    });

    it('should load resources on init', () => {
      expect(resourceServiceSpy.getAll).toHaveBeenCalled();
      expect(component.resources.length).toBe(2);
    });
  });

  describe('loadMenus', () => {
    it('should load menus successfully', () => {
      component.loadMenus();

      expect(component.loading).toBeFalse();
      expect(component.rows).toEqual(mockMenus);
      expect(component.totalElements).toBe(2);
    });

    it('should handle error when loading menus', () => {
      menuServiceSpy.searchMenus.and.returnValue(throwError(() => new Error('Error')));
      spyOn(console, 'error');

      component.loadMenus();

      expect(component.loading).toBeFalse();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('filterDatatable', () => {
    it('should filter rows by code', () => {
      component.rows = mockMenus;
      component.filteredRows = [...mockMenus];

      const event = { target: { value: 'DASHBOARD' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].code).toBe('DASHBOARD');
    });

    it('should filter rows by title', () => {
      component.rows = mockMenus;
      component.filteredRows = [...mockMenus];

      const event = { target: { value: 'Settings' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].title).toBe('Settings');
    });

    it('should filter rows by path', () => {
      component.rows = mockMenus;
      component.filteredRows = [...mockMenus];

      const event = { target: { value: '/settings' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].path).toBe('/settings');
    });

    it('should filter rows by id', () => {
      component.rows = mockMenus;
      component.filteredRows = [...mockMenus];

      const event = { target: { value: '1' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].id).toBe(1);
    });
  });

  describe('onPageChange', () => {
    it('should update page and reload menus', () => {
      component.onPageChange({ offset: 2 });

      expect(component.page).toBe(2);
      expect(menuServiceSpy.searchMenus).toHaveBeenCalled();
    });
  });

  describe('onSort', () => {
    it('should update sort and reload menus', () => {
      component.onSort({ sorts: [{ prop: 'code', dir: 'desc' }] });

      expect(component.sort).toBe('code,desc');
      expect(component.page).toBe(0);
      expect(menuServiceSpy.searchMenus).toHaveBeenCalled();
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

  describe('onAddMenuSave', () => {
    it('should not save if form is invalid', () => {
      component.menuForm.controls['code'].setValue('');
      component.menuForm.controls['title'].setValue('');
      component.menuForm.controls['resourceId'].setValue(null);

      component.onAddMenuSave();

      expect(menuServiceSpy.create).not.toHaveBeenCalled();
    });

    it('should not save if resourceId is not selected', () => {
      component.menuForm.controls['code'].setValue('NEW_MENU');
      component.menuForm.controls['title'].setValue('New Menu');
      component.menuForm.controls['resourceId'].setValue(null);

      component.onAddMenuSave();

      expect(menuServiceSpy.create).not.toHaveBeenCalled();
    });

    it('should create menu successfully', () => {
      component.menuForm.controls['code'].setValue('NEW_MENU');
      component.menuForm.controls['title'].setValue('New Menu');
      component.menuForm.controls['resourceId'].setValue(1);

      component.onAddMenuSave();

      expect(menuServiceSpy.create).toHaveBeenCalled();
      expect(toastrSpy.success).toHaveBeenCalledWith('Menu created successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
    });

    it('should include resourceId in create request', () => {
      component.menuForm.controls['code'].setValue('NEW_MENU');
      component.menuForm.controls['title'].setValue('New Menu');
      component.menuForm.controls['resourceId'].setValue(1);

      component.onAddMenuSave();

      const callArgs = menuServiceSpy.create.calls.mostRecent().args[0];
      expect(callArgs.resourceId).toBe(1);
    });

    it('should handle error when creating menu', () => {
      menuServiceSpy.create.and.returnValue(
        throwError(() => ({ message: 'Creation failed' }))
      );
      component.menuForm.controls['code'].setValue('NEW_MENU');
      component.menuForm.controls['title'].setValue('New Menu');
      component.menuForm.controls['resourceId'].setValue(1);

      component.onAddMenuSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('Creation failed');
    });
  });

  describe('openEditModal', () => {
    it('should set editing menu and open modal', () => {
      const mockModalRef = { dismiss: jasmine.createSpy('dismiss') } as unknown as NgbModalRef;
      modalServiceSpy.open.and.returnValue(mockModalRef);
      const content = {};

      component.openEditModal(content, mockMenu);

      expect(component.editingMenu).toEqual(mockMenu);
      expect(modalServiceSpy.open).toHaveBeenCalledWith(content, {
        ariaLabelledBy: 'modal-edit-title',
        size: 'lg',
      });
    });
  });

  describe('onEditMenuSave', () => {
    it('should not save if form is invalid', () => {
      component.editMenuForm.controls['title'].setValue('');
      component.editingMenu = mockMenu;

      component.onEditMenuSave();

      expect(menuServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should not save if no menu is being edited', () => {
      component.editMenuForm.controls['title'].setValue('Updated Title');
      component.editingMenu = null;

      component.onEditMenuSave();

      expect(menuServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should update menu successfully', () => {
      component.editingMenu = mockMenu;
      component.editMenuForm.controls['title'].setValue('Updated Dashboard');

      component.onEditMenuSave();

      expect(menuServiceSpy.update).toHaveBeenCalledWith(1, jasmine.any(Object));
      expect(toastrSpy.success).toHaveBeenCalledWith('Menu updated successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
      expect(component.editingMenu).toBeNull();
    });

    it('should handle error when updating menu', () => {
      menuServiceSpy.update.and.returnValue(
        throwError(() => ({ message: 'Update failed' }))
      );
      component.editingMenu = mockMenu;
      component.editMenuForm.controls['title'].setValue('Updated Dashboard');

      component.onEditMenuSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('Update failed');
    });
  });

  describe('deleteMenu', () => {
    it('should show confirmation dialog', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );

      component.deleteMenu(mockMenu);
      tick();

      expect(Swal.fire).toHaveBeenCalled();
    }));

    it('should delete menu when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );

      component.deleteMenu(mockMenu);
      tick();

      expect(menuServiceSpy.delete).toHaveBeenCalledWith(1);
      expect(toastrSpy.success).toHaveBeenCalledWith('Menu deleted successfully');
    }));

    it('should not delete when cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );

      component.deleteMenu(mockMenu);
      tick();

      expect(menuServiceSpy.delete).not.toHaveBeenCalled();
    }));

    it('should handle error when deleting menu', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      menuServiceSpy.delete.and.returnValue(
        throwError(() => ({ message: 'Delete failed' }))
      );

      component.deleteMenu(mockMenu);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Delete failed');
    }));
  });

  describe('Form Validation', () => {
    it('should have invalid form when code is empty', () => {
      component.menuForm.controls['code'].setValue('');
      expect(component.menuForm.controls['code'].valid).toBeFalse();
    });

    it('should have invalid form when title is empty', () => {
      component.menuForm.controls['title'].setValue('');
      expect(component.menuForm.controls['title'].valid).toBeFalse();
    });

    it('should have invalid form when resourceId is null', () => {
      component.menuForm.controls['resourceId'].setValue(null);
      expect(component.menuForm.controls['resourceId'].valid).toBeFalse();
    });

    it('should have invalid form when code is too short', () => {
      component.menuForm.controls['code'].setValue('A');
      expect(component.menuForm.controls['code'].valid).toBeFalse();
    });

    it('should have invalid form when title is too short', () => {
      component.menuForm.controls['title'].setValue('A');
      expect(component.menuForm.controls['title'].valid).toBeFalse();
    });

    it('should have valid form when required fields are filled correctly', () => {
      component.menuForm.controls['code'].setValue('VALID_CODE');
      component.menuForm.controls['title'].setValue('Valid Title');
      component.menuForm.controls['resourceId'].setValue(1);
      expect(component.menuForm.valid).toBeTrue();
    });

    it('should have valid edit form when title is filled', () => {
      component.editMenuForm.controls['title'].setValue('Valid Title');
      expect(component.editMenuForm.valid).toBeTrue();
    });

    it('should have invalid form when code exceeds max length', () => {
      component.menuForm.controls['code'].setValue('A'.repeat(51));
      expect(component.menuForm.controls['code'].valid).toBeFalse();
    });

    it('should have invalid form when title exceeds max length', () => {
      component.menuForm.controls['title'].setValue('A'.repeat(101));
      expect(component.menuForm.controls['title'].valid).toBeFalse();
    });
  });

  describe('filterDatatable - additional cases', () => {
    it('should filter rows by groupName', () => {
      component.rows = [
        { ...mockMenu, groupName: 'Main' },
        { ...mockMenus[1], groupName: 'Settings Group' },
      ];
      component.filteredRows = [...component.rows];

      const event = { target: { value: 'Main' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].groupName).toBe('Main');
    });

    it('should return all rows when filter is empty', () => {
      component.rows = mockMenus;
      component.filteredRows = [...mockMenus];

      const event = { target: { value: '' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(2);
    });

    it('should be case insensitive', () => {
      component.rows = mockMenus;
      component.filteredRows = [...mockMenus];

      const event = { target: { value: 'dashboard' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].code).toBe('DASHBOARD');
    });
  });

  describe('openEditModal - form values', () => {
    it('should patch all form values from menu', () => {
      const mockModalRef = { dismiss: jasmine.createSpy('dismiss') } as unknown as NgbModalRef;
      modalServiceSpy.open.and.returnValue(mockModalRef);
      const content = {};
      const fullMenu: MenuResponse = {
        id: 1,
        code: 'TEST',
        title: 'Test Menu',
        resourceId: 1,
        resourceCode: 'TEST_VIEW',
        path: '/test',
        iconType: 'fontawesome',
        icon: 'fas fa-test',
        className: 'test-class',
        groupTitle: true,
        groupName: 'Test Group',
        badge: 'New',
        badgeClass: 'badge-primary',
      };

      component.openEditModal(content, fullMenu);

      expect(component.editMenuForm.value.title).toBe('Test Menu');
      expect(component.editMenuForm.value.path).toBe('/test');
      expect(component.editMenuForm.value.iconType).toBe('fontawesome');
      expect(component.editMenuForm.value.icon).toBe('fas fa-test');
      expect(component.editMenuForm.value.className).toBe('test-class');
      expect(component.editMenuForm.value.groupTitle).toBeTrue();
      expect(component.editMenuForm.value.groupName).toBe('Test Group');
      expect(component.editMenuForm.value.badge).toBe('New');
      expect(component.editMenuForm.value.badgeClass).toBe('badge-primary');
    });
  });

  describe('onAddMenuSave - with optional fields', () => {
    it('should create menu with all optional fields', () => {
      component.menuForm.controls['code'].setValue('NEW_MENU');
      component.menuForm.controls['title'].setValue('New Menu');
      component.menuForm.controls['resourceId'].setValue(1);
      component.menuForm.controls['path'].setValue('/new-path');
      component.menuForm.controls['iconType'].setValue('fontawesome');
      component.menuForm.controls['icon'].setValue('fas fa-star');
      component.menuForm.controls['className'].setValue('custom-class');
      component.menuForm.controls['groupTitle'].setValue(true);
      component.menuForm.controls['groupName'].setValue('Custom Group');
      component.menuForm.controls['badge'].setValue('Hot');
      component.menuForm.controls['badgeClass'].setValue('badge-danger');

      component.onAddMenuSave();

      expect(menuServiceSpy.create).toHaveBeenCalled();
      const callArgs = menuServiceSpy.create.calls.mostRecent().args[0];
      expect(callArgs.code).toBe('NEW_MENU');
      expect(callArgs.title).toBe('New Menu');
      expect(callArgs.resourceId).toBe(1);
      expect(callArgs.path).toBe('/new-path');
      expect(callArgs.iconType).toBe('fontawesome');
      expect(callArgs.icon).toBe('fas fa-star');
      expect(callArgs.className).toBe('custom-class');
      expect(callArgs.groupTitle).toBeTrue();
      expect(callArgs.groupName).toBe('Custom Group');
      expect(callArgs.badge).toBe('Hot');
      expect(callArgs.badgeClass).toBe('badge-danger');
    });
  });

  describe('Error handling - string errors', () => {
    it('should handle string error when creating menu', () => {
      menuServiceSpy.create.and.returnValue(
        throwError(() => 'String error message')
      );
      component.menuForm.controls['code'].setValue('NEW_MENU');
      component.menuForm.controls['title'].setValue('New Menu');
      component.menuForm.controls['resourceId'].setValue(1);

      component.onAddMenuSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('String error message');
    });

    it('should handle string error when updating menu', () => {
      menuServiceSpy.update.and.returnValue(
        throwError(() => 'String update error')
      );
      component.editingMenu = mockMenu;
      component.editMenuForm.controls['title'].setValue('Updated Dashboard');

      component.onEditMenuSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('String update error');
    });

    it('should handle string error when deleting menu', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      menuServiceSpy.delete.and.returnValue(
        throwError(() => 'String delete error')
      );

      component.deleteMenu(mockMenu);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('String delete error');
    }));

    it('should use default error message when error is undefined', () => {
      menuServiceSpy.create.and.returnValue(
        throwError(() => undefined)
      );
      component.menuForm.controls['code'].setValue('NEW_MENU');
      component.menuForm.controls['title'].setValue('New Menu');
      component.menuForm.controls['resourceId'].setValue(1);

      component.onAddMenuSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('Error creating menu');
    });
  });

  describe('onSort - ascending direction', () => {
    it('should handle ascending sort', () => {
      component.onSort({ sorts: [{ prop: 'title', dir: 'asc' }] });

      expect(component.sort).toBe('title,asc');
      expect(component.page).toBe(0);
    });
  });

  describe('loadMenus - without pagination', () => {
    it('should handle response without pagination info', () => {
      const responseWithoutPagination: ApiResponse<MenuResponse[]> = {
        header: {
          success: true,
          statusCode: 200,
          message: 'Success',
        },
        body: {
          data: mockMenus,
        },
      };
      menuServiceSpy.searchMenus.and.returnValue(of(responseWithoutPagination));

      component.loadMenus();

      expect(component.totalElements).toBe(0);
      expect(component.rows).toEqual(mockMenus);
    });
  });
});
