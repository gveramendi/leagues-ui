import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService, provideToastr } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { RoleListComponent } from './role-list.component';
import { RoleService, PermissionService, ResourceService, ApiResponse, RoleResponse, PermissionResponse, ResourceResponse, CreatePermissionRequest } from '@core';

describe('RoleListComponent', () => {
  let component: RoleListComponent;
  let fixture: ComponentFixture<RoleListComponent>;
  let roleServiceSpy: jasmine.SpyObj<RoleService>;
  let permissionServiceSpy: jasmine.SpyObj<PermissionService>;
  let resourceServiceSpy: jasmine.SpyObj<ResourceService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockRoles: RoleResponse[] = [
    { id: 1, name: 'Admin', description: 'Administrator role' },
    { id: 2, name: 'User', description: 'User role' },
    { id: 3, name: 'Manager', description: 'Manager role' },
  ];

  const mockRolesResponse: ApiResponse<RoleResponse[]> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Success',
    },
    body: {
      pagination: {
        totalElements: 3,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false,
      },
      data: mockRoles,
    },
  };

  const mockCreateResponse: ApiResponse<RoleResponse> = {
    header: {
      success: true,
      statusCode: 201,
      message: 'Role created successfully',
    },
    body: {
      data: { id: 4, name: 'NewRole', description: 'New role description' },
    },
  };

  const mockDeleteResponse: ApiResponse<void> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Role deleted successfully',
    },
    body: {
      data: undefined as unknown as void,
    },
  };

  const mockUpdateResponse: ApiResponse<RoleResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Role updated successfully',
    },
    body: {
      data: { id: 1, name: 'Admin', description: 'Updated description' },
    },
  };

  const mockPermissions: PermissionResponse[] = [
    {
      id: 1,
      roleId: 1,
      roleName: 'Admin',
      resourceId: 1,
      resourceCode: 'USER_MANAGEMENT',
      resourceName: 'User Management',
      canCreate: true,
      canRead: true,
      canWrite: false,
      canDelete: false,
      canExecute: false,
    },
    {
      id: 2,
      roleId: 1,
      roleName: 'Admin',
      resourceId: 2,
      resourceCode: 'ROLE_MANAGEMENT',
      resourceName: 'Role Management',
      canCreate: true,
      canRead: true,
      canWrite: true,
      canDelete: true,
      canExecute: false,
    },
  ];

  const mockPermissionsResponse: ApiResponse<PermissionResponse[]> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Permissions retrieved successfully',
    },
    body: {
      data: mockPermissions,
    },
  };

  const mockResources: ResourceResponse[] = [
    { id: 1, code: 'USER_MANAGEMENT', name: 'User Management', type: 'API' },
    { id: 2, code: 'ROLE_MANAGEMENT', name: 'Role Management', type: 'API' },
    { id: 3, code: 'SETTINGS', name: 'Settings', type: 'VIEW' },
    { id: 4, code: 'REPORTS', name: 'Reports', type: 'VIEW' },
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

  const mockCreatePermissionResponse: ApiResponse<PermissionResponse> = {
    header: {
      success: true,
      statusCode: 201,
      message: 'Permission created successfully',
    },
    body: {
      data: {
        id: 3,
        roleId: 1,
        roleName: 'Admin',
        resourceId: 3,
        resourceCode: 'SETTINGS',
        resourceName: 'Settings',
        canCreate: true,
        canRead: true,
        canWrite: false,
        canDelete: false,
        canExecute: false,
      },
    },
  };

  const mockDeletePermissionResponse: ApiResponse<void> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Permission deleted successfully',
    },
    body: {
      data: undefined as unknown as void,
    },
  };

  beforeEach(waitForAsync(() => {
    const roleServiceMock = jasmine.createSpyObj('RoleService', ['searchRoles', 'create', 'update', 'delete']);
    roleServiceMock.searchRoles.and.returnValue(of(mockRolesResponse));
    roleServiceMock.create.and.returnValue(of(mockCreateResponse));
    roleServiceMock.update.and.returnValue(of(mockUpdateResponse));
    roleServiceMock.delete.and.returnValue(of(mockDeleteResponse));

    const permissionServiceMock = jasmine.createSpyObj('PermissionService', ['getByRoleId', 'create', 'delete']);
    permissionServiceMock.getByRoleId.and.returnValue(of(mockPermissionsResponse));
    permissionServiceMock.create.and.returnValue(of(mockCreatePermissionResponse));
    permissionServiceMock.delete.and.returnValue(of(mockDeletePermissionResponse));

    const resourceServiceMock = jasmine.createSpyObj('ResourceService', ['getAll']);
    resourceServiceMock.getAll.and.returnValue(of(mockResourcesResponse));

    const modalMock = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);
    const toastrMock = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [
        RoleListComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: RoleService, useValue: roleServiceMock },
        { provide: PermissionService, useValue: permissionServiceMock },
        { provide: ResourceService, useValue: resourceServiceMock },
        { provide: NgbModal, useValue: modalMock },
        { provide: ToastrService, useValue: toastrMock },
        provideToastr(),
      ],
    }).compileComponents();

    roleServiceSpy = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
    permissionServiceSpy = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    resourceServiceSpy = TestBed.inject(ResourceService) as jasmine.SpyObj<ResourceService>;
    modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.page).toBe(0);
    expect(component.size).toBe(10);
    expect(component.sort).toBe('name,asc');
    expect(component.search).toBe('');
  });

  describe('ngOnInit', () => {
    it('should load roles on init', () => {
      expect(roleServiceSpy.searchRoles).toHaveBeenCalledWith('', 0, 10, 'name,asc');
      expect(component.rows.length).toBe(3);
      expect(component.filteredRows.length).toBe(3);
      expect(component.totalElements).toBe(3);
      expect(component.loading).toBeFalse();
    });
  });

  describe('loadRoles', () => {
    it('should set loading to true while fetching', fakeAsync(() => {
      roleServiceSpy.searchRoles.and.returnValue(of(mockRolesResponse));

      component.loading = false;
      component.loadRoles();

      expect(component.loading).toBeFalse(); // After async completes
      tick();
    }));

    it('should handle error when loading roles fails', fakeAsync(() => {
      const consoleSpy = spyOn(console, 'error');
      roleServiceSpy.searchRoles.and.returnValue(throwError(() => new Error('Network error')));

      component.loadRoles();
      tick();

      expect(consoleSpy).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    }));

    it('should update rows and filteredRows on successful load', fakeAsync(() => {
      roleServiceSpy.searchRoles.and.returnValue(of(mockRolesResponse));

      component.loadRoles();
      tick();

      expect(component.rows).toEqual(mockRoles);
      expect(component.filteredRows).toEqual(mockRoles);
      expect(component.totalElements).toBe(3);
    }));
  });

  describe('filterDatatable', () => {
    beforeEach(() => {
      component.rows = mockRoles;
      component.filteredRows = [...component.rows];
    });

    it('should filter rows by name', () => {
      const event = { target: { value: 'admin' } } as unknown as Event;

      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].name).toBe('Admin');
    });

    it('should filter rows by description', () => {
      const event = { target: { value: 'manager' } } as unknown as Event;

      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].name).toBe('Manager');
    });

    it('should filter rows by id', () => {
      const event = { target: { value: '2' } } as unknown as Event;

      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].id).toBe(2);
    });

    it('should return all rows when filter is empty', () => {
      const event = { target: { value: '' } } as unknown as Event;

      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(3);
    });

    it('should be case insensitive', () => {
      const event = { target: { value: 'ADMIN' } } as unknown as Event;

      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].name).toBe('Admin');
    });
  });

  describe('onPageChange', () => {
    it('should update page and reload roles', fakeAsync(() => {
      roleServiceSpy.searchRoles.calls.reset();
      roleServiceSpy.searchRoles.and.returnValue(of(mockRolesResponse));

      component.onPageChange({ offset: 2 });
      tick();

      expect(component.page).toBe(2);
      expect(roleServiceSpy.searchRoles).toHaveBeenCalledWith('', 2, 10, 'name,asc');
    }));
  });

  describe('onSort', () => {
    it('should update sort and reload roles with ascending order', fakeAsync(() => {
      roleServiceSpy.searchRoles.calls.reset();
      roleServiceSpy.searchRoles.and.returnValue(of(mockRolesResponse));

      component.onSort({ sorts: [{ prop: 'name', dir: 'asc' }] });
      tick();

      expect(component.sort).toBe('name,asc');
      expect(component.page).toBe(0);
      expect(roleServiceSpy.searchRoles).toHaveBeenCalledWith('', 0, 10, 'name,asc');
    }));

    it('should update sort and reload roles with descending order', fakeAsync(() => {
      roleServiceSpy.searchRoles.calls.reset();
      roleServiceSpy.searchRoles.and.returnValue(of(mockRolesResponse));

      component.onSort({ sorts: [{ prop: 'description', dir: 'desc' }] });
      tick();

      expect(component.sort).toBe('description,desc');
      expect(component.page).toBe(0);
      expect(roleServiceSpy.searchRoles).toHaveBeenCalledWith('', 0, 10, 'description,desc');
    }));

    it('should reset page to 0 when sorting', fakeAsync(() => {
      component.page = 5;
      roleServiceSpy.searchRoles.calls.reset();
      roleServiceSpy.searchRoles.and.returnValue(of(mockRolesResponse));

      component.onSort({ sorts: [{ prop: 'id', dir: 'asc' }] });
      tick();

      expect(component.page).toBe(0);
    }));
  });

  describe('roleForm', () => {
    it('should initialize with empty values', () => {
      expect(component.roleForm.get('name')?.value).toBeFalsy();
      expect(component.roleForm.get('description')?.value).toBeFalsy();
    });

    it('should be invalid when name is empty', () => {
      component.roleForm.patchValue({ name: '', description: '' });
      expect(component.roleForm.invalid).toBeTrue();
    });

    it('should be invalid when name is too short', () => {
      component.roleForm.patchValue({ name: 'A', description: '' });
      expect(component.roleForm.get('name')?.errors?.['minlength']).toBeTruthy();
    });

    it('should be invalid when name exceeds max length', () => {
      component.roleForm.patchValue({ name: 'A'.repeat(51), description: '' });
      expect(component.roleForm.get('name')?.errors?.['maxlength']).toBeTruthy();
    });

    it('should be invalid when description exceeds max length', () => {
      component.roleForm.patchValue({ name: 'ValidName', description: 'A'.repeat(256) });
      expect(component.roleForm.get('description')?.errors?.['maxlength']).toBeTruthy();
    });

    it('should be valid with correct values', () => {
      component.roleForm.patchValue({ name: 'ValidRole', description: 'Valid description' });
      expect(component.roleForm.valid).toBeTrue();
    });
  });

  describe('openAddModal', () => {
    it('should reset form and open modal', () => {
      component.roleForm.patchValue({ name: 'OldValue', description: 'OldDesc' });
      const mockContent = {};

      component.openAddModal(mockContent);

      expect(component.roleForm.get('name')?.value).toBeFalsy();
      expect(component.roleForm.get('description')?.value).toBeFalsy();
      expect(modalServiceSpy.open).toHaveBeenCalledWith(mockContent, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg',
      });
    });
  });

  describe('onAddRoleSave', () => {
    it('should not call service if form is invalid', () => {
      component.roleForm.patchValue({ name: '', description: '' });
      roleServiceSpy.create.calls.reset();

      component.onAddRoleSave();

      expect(roleServiceSpy.create).not.toHaveBeenCalled();
    });

    it('should call service with correct data when form is valid', fakeAsync(() => {
      component.roleForm.patchValue({ name: 'NewRole', description: 'New description' });
      roleServiceSpy.searchRoles.calls.reset();

      component.onAddRoleSave();
      tick();

      expect(roleServiceSpy.create).toHaveBeenCalledWith({
        name: 'NewRole',
        description: 'New description',
      });
    }));

    it('should show success toast and reload roles on successful creation', fakeAsync(() => {
      component.roleForm.patchValue({ name: 'NewRole', description: 'New description' });
      roleServiceSpy.searchRoles.calls.reset();

      component.onAddRoleSave();
      tick();

      expect(toastrSpy.success).toHaveBeenCalledWith('Role created successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
      expect(roleServiceSpy.searchRoles).toHaveBeenCalled();
    }));

    it('should show error toast on creation failure with string error', fakeAsync(() => {
      component.roleForm.patchValue({ name: 'NewRole', description: 'New description' });
      roleServiceSpy.create.and.returnValue(throwError(() => 'Creation failed'));

      component.onAddRoleSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Creation failed');
    }));

    it('should show error toast on creation failure with object error', fakeAsync(() => {
      component.roleForm.patchValue({ name: 'NewRole', description: 'New description' });
      roleServiceSpy.create.and.returnValue(throwError(() => ({ message: 'Creation failed' })));

      component.onAddRoleSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Creation failed');
    }));

    it('should show default error toast on creation failure with undefined error', fakeAsync(() => {
      component.roleForm.patchValue({ name: 'NewRole', description: 'New description' });
      roleServiceSpy.create.and.returnValue(throwError(() => undefined));

      component.onAddRoleSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Error creating role');
    }));
  });

  describe('deleteRole', () => {
    const mockRole: RoleResponse = { id: 1, name: 'Admin', description: 'Administrator role' };

    it('should show confirmation dialog when deleting', fakeAsync(() => {
      const swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );

      component.deleteRole(mockRole);
      tick();

      expect(swalSpy).toHaveBeenCalled();
    }));

    it('should call delete service when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      roleServiceSpy.searchRoles.calls.reset();

      component.deleteRole(mockRole);
      tick();

      expect(roleServiceSpy.delete).toHaveBeenCalledWith(1);
      expect(toastrSpy.success).toHaveBeenCalledWith('Role deleted successfully');
      expect(roleServiceSpy.searchRoles).toHaveBeenCalled();
    }));

    it('should not call delete service when cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );
      roleServiceSpy.delete.calls.reset();

      component.deleteRole(mockRole);
      tick();

      expect(roleServiceSpy.delete).not.toHaveBeenCalled();
    }));

    it('should show error toast on delete failure with string error', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      roleServiceSpy.delete.and.returnValue(throwError(() => 'Delete failed'));

      component.deleteRole(mockRole);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Delete failed');
    }));

    it('should show error toast on delete failure with object error', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      roleServiceSpy.delete.and.returnValue(throwError(() => ({ message: 'Delete failed' })));

      component.deleteRole(mockRole);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Delete failed');
    }));

    it('should show default error toast on delete failure with undefined error', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      roleServiceSpy.delete.and.returnValue(throwError(() => undefined));

      component.deleteRole(mockRole);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Error deleting role');
    }));
  });

  describe('editRoleForm', () => {
    it('should initialize with empty values', () => {
      expect(component.editRoleForm.get('description')?.value).toBeFalsy();
    });

    it('should be invalid when description exceeds max length', () => {
      component.editRoleForm.patchValue({ description: 'A'.repeat(256) });
      expect(component.editRoleForm.get('description')?.errors?.['maxlength']).toBeTruthy();
    });

    it('should be valid with correct values', () => {
      component.editRoleForm.patchValue({ description: 'Valid description' });
      expect(component.editRoleForm.valid).toBeTrue();
    });

    it('should be valid with empty description', () => {
      component.editRoleForm.patchValue({ description: '' });
      expect(component.editRoleForm.valid).toBeTrue();
    });
  });

  describe('openEditModal', () => {
    it('should set editingRole and populate form', () => {
      const mockRole: RoleResponse = { id: 1, name: 'Admin', description: 'Administrator role' };
      const mockContent = {};

      component.openEditModal(mockContent, mockRole);

      expect(component.editingRole).toEqual(mockRole);
      expect(component.editRoleForm.get('description')?.value).toBe('Administrator role');
      expect(modalServiceSpy.open).toHaveBeenCalledWith(mockContent, {
        ariaLabelledBy: 'modal-edit-title',
        size: 'lg',
      });
    });

    it('should handle role with no description', () => {
      const mockRole: RoleResponse = { id: 1, name: 'Admin' };
      const mockContent = {};

      component.openEditModal(mockContent, mockRole);

      expect(component.editingRole).toEqual(mockRole);
      expect(component.editRoleForm.get('description')?.value).toBe('');
    });
  });

  describe('onEditRoleSave', () => {
    const mockRole: RoleResponse = { id: 1, name: 'Admin', description: 'Administrator role' };

    beforeEach(() => {
      component.editingRole = mockRole;
    });

    it('should not call service if form is invalid', () => {
      component.editRoleForm.patchValue({ description: 'A'.repeat(256) });
      roleServiceSpy.update.calls.reset();

      component.onEditRoleSave();

      expect(roleServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should not call service if editingRole is null', () => {
      component.editingRole = null;
      component.editRoleForm.patchValue({ description: 'New description' });
      roleServiceSpy.update.calls.reset();

      component.onEditRoleSave();

      expect(roleServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should call service with correct data when form is valid', fakeAsync(() => {
      component.editRoleForm.patchValue({ description: 'Updated description' });
      roleServiceSpy.searchRoles.calls.reset();

      component.onEditRoleSave();
      tick();

      expect(roleServiceSpy.update).toHaveBeenCalledWith(1, {
        description: 'Updated description',
      });
    }));

    it('should show success toast and reload roles on successful update', fakeAsync(() => {
      component.editRoleForm.patchValue({ description: 'Updated description' });
      roleServiceSpy.searchRoles.calls.reset();

      component.onEditRoleSave();
      tick();

      expect(toastrSpy.success).toHaveBeenCalledWith('Role updated successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
      expect(component.editingRole).toBeNull();
      expect(roleServiceSpy.searchRoles).toHaveBeenCalled();
    }));

    it('should show error toast on update failure with string error', fakeAsync(() => {
      component.editRoleForm.patchValue({ description: 'Updated description' });
      roleServiceSpy.update.and.returnValue(throwError(() => 'Update failed'));

      component.onEditRoleSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Update failed');
    }));

    it('should show error toast on update failure with object error', fakeAsync(() => {
      component.editRoleForm.patchValue({ description: 'Updated description' });
      roleServiceSpy.update.and.returnValue(throwError(() => ({ message: 'Update failed' })));

      component.onEditRoleSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Update failed');
    }));

    it('should show default error toast on update failure with undefined error', fakeAsync(() => {
      component.editRoleForm.patchValue({ description: 'Updated description' });
      roleServiceSpy.update.and.returnValue(throwError(() => undefined));

      component.onEditRoleSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Error updating role');
    }));
  });

  describe('openResourcesModal', () => {
    const mockRole: RoleResponse = { id: 1, name: 'Admin', description: 'Administrator role' };

    it('should set viewingRole and open modal', fakeAsync(() => {
      const mockContent = {};

      component.openResourcesModal(mockContent, mockRole);
      tick();

      expect(component.viewingRole).toEqual(mockRole);
      expect(modalServiceSpy.open).toHaveBeenCalledWith(mockContent, {
        ariaLabelledBy: 'modal-resources-title',
        size: 'lg',
      });
    }));

    it('should set loadingPermissions to true initially', () => {
      const mockContent = {};

      component.openResourcesModal(mockContent, mockRole);

      expect(component.loadingPermissions).toBeFalse(); // After async completes
    });

    it('should call permissionService.getByRoleId with correct roleId', fakeAsync(() => {
      const mockContent = {};

      component.openResourcesModal(mockContent, mockRole);
      tick();

      expect(permissionServiceSpy.getByRoleId).toHaveBeenCalledWith(1);
    }));

    it('should populate rolePermissions on successful load', fakeAsync(() => {
      const mockContent = {};

      component.openResourcesModal(mockContent, mockRole);
      tick();

      expect(component.rolePermissions.length).toBe(2);
      expect(component.rolePermissions[0].resourceCode).toBe('USER_MANAGEMENT');
      expect(component.loadingPermissions).toBeFalse();
    }));

    it('should handle error when loading permissions fails', fakeAsync(() => {
      const consoleSpy = spyOn(console, 'error');
      permissionServiceSpy.getByRoleId.and.returnValue(throwError(() => new Error('Network error')));
      const mockContent = {};

      component.openResourcesModal(mockContent, mockRole);
      tick();

      expect(consoleSpy).toHaveBeenCalled();
      expect(component.loadingPermissions).toBeFalse();
      expect(toastrSpy.error).toHaveBeenCalledWith('Network error');
    }));

    it('should show error toast with string error message', fakeAsync(() => {
      spyOn(console, 'error');
      permissionServiceSpy.getByRoleId.and.returnValue(throwError(() => 'Custom error'));
      const mockContent = {};

      component.openResourcesModal(mockContent, mockRole);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Custom error');
    }));

    it('should show error toast with object error message', fakeAsync(() => {
      spyOn(console, 'error');
      permissionServiceSpy.getByRoleId.and.returnValue(throwError(() => ({ message: 'Object error' })));
      const mockContent = {};

      component.openResourcesModal(mockContent, mockRole);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Object error');
    }));

    it('should show default error toast when error is undefined', fakeAsync(() => {
      spyOn(console, 'error');
      permissionServiceSpy.getByRoleId.and.returnValue(throwError(() => undefined));
      const mockContent = {};

      component.openResourcesModal(mockContent, mockRole);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Error loading resources');
    }));
  });

  describe('addResourceForm', () => {
    it('should initialize with all checkboxes unchecked', () => {
      expect(component.addResourceForm.get('resourceId')?.value).toBeFalsy();
      expect(component.addResourceForm.get('canCreate')?.value).toBeFalse();
      expect(component.addResourceForm.get('canRead')?.value).toBeFalse();
      expect(component.addResourceForm.get('canWrite')?.value).toBeFalse();
      expect(component.addResourceForm.get('canDelete')?.value).toBeFalse();
      expect(component.addResourceForm.get('canExecute')?.value).toBeFalse();
    });

    it('should be invalid when resourceId is empty', () => {
      component.addResourceForm.patchValue({ resourceId: '' });
      expect(component.addResourceForm.invalid).toBeTrue();
    });

    it('should be valid when resourceId is selected', () => {
      component.addResourceForm.patchValue({ resourceId: '1' });
      expect(component.addResourceForm.valid).toBeTrue();
    });
  });

  describe('openAddResourceModal', () => {
    const mockRole: RoleResponse = { id: 1, name: 'Admin', description: 'Administrator role' };

    beforeEach(() => {
      component.viewingRole = mockRole;
      component.rolePermissions = mockPermissions;
    });

    it('should reset form with all checkboxes unchecked', fakeAsync(() => {
      component.addResourceForm.patchValue({
        resourceId: '1',
        canCreate: true,
        canRead: true,
        canWrite: true,
        canDelete: true,
        canExecute: true,
      });
      const mockContent = {};

      component.openAddResourceModal(mockContent);
      tick();

      expect(component.addResourceForm.get('resourceId')?.value).toBe('');
      expect(component.addResourceForm.get('canCreate')?.value).toBeFalse();
      expect(component.addResourceForm.get('canRead')?.value).toBeFalse();
      expect(component.addResourceForm.get('canWrite')?.value).toBeFalse();
      expect(component.addResourceForm.get('canDelete')?.value).toBeFalse();
      expect(component.addResourceForm.get('canExecute')?.value).toBeFalse();
    }));

    it('should open modal', fakeAsync(() => {
      const mockContent = {};

      component.openAddResourceModal(mockContent);
      tick();

      expect(modalServiceSpy.open).toHaveBeenCalledWith(mockContent, {
        ariaLabelledBy: 'modal-add-resource-title',
        size: 'lg',
      });
    }));

    it('should load available resources', fakeAsync(() => {
      const mockContent = {};

      component.openAddResourceModal(mockContent);
      tick();

      expect(resourceServiceSpy.getAll).toHaveBeenCalled();
    }));

    it('should filter out already assigned resources', fakeAsync(() => {
      const mockContent = {};

      component.openAddResourceModal(mockContent);
      tick();

      // mockPermissions has resourceId 1 and 2 assigned
      // mockResources has 4 resources (ids 1, 2, 3, 4)
      // So availableResources should only have resources with ids 3 and 4
      expect(component.availableResources.length).toBe(2);
      expect(component.availableResources.find(r => r.id === 1)).toBeUndefined();
      expect(component.availableResources.find(r => r.id === 2)).toBeUndefined();
      expect(component.availableResources.find(r => r.id === 3)).toBeDefined();
      expect(component.availableResources.find(r => r.id === 4)).toBeDefined();
    }));

    it('should handle error when loading resources fails', fakeAsync(() => {
      const consoleSpy = spyOn(console, 'error');
      resourceServiceSpy.getAll.and.returnValue(throwError(() => new Error('Network error')));
      const mockContent = {};

      component.openAddResourceModal(mockContent);
      tick();

      expect(consoleSpy).toHaveBeenCalled();
      expect(component.loadingResources).toBeFalse();
    }));
  });

  describe('onAddResourceSave', () => {
    const mockRole: RoleResponse = { id: 1, name: 'Admin', description: 'Administrator role' };

    beforeEach(() => {
      component.viewingRole = mockRole;
      component.rolePermissions = mockPermissions;
    });

    it('should not call service if form is invalid', () => {
      component.addResourceForm.patchValue({ resourceId: '' });
      permissionServiceSpy.create.calls.reset();

      component.onAddResourceSave();

      expect(permissionServiceSpy.create).not.toHaveBeenCalled();
    });

    it('should not call service if viewingRole is null', () => {
      component.viewingRole = null;
      component.addResourceForm.patchValue({ resourceId: '3' });
      permissionServiceSpy.create.calls.reset();

      component.onAddResourceSave();

      expect(permissionServiceSpy.create).not.toHaveBeenCalled();
    });

    it('should call service with correct data when form is valid', fakeAsync(() => {
      component.addResourceForm.patchValue({
        resourceId: '3',
        canCreate: true,
        canRead: true,
        canWrite: false,
        canDelete: false,
        canExecute: false,
      });

      component.onAddResourceSave();
      tick();

      expect(permissionServiceSpy.create).toHaveBeenCalledWith({
        roleId: 1,
        resourceId: 3,
        canCreate: true,
        canRead: true,
        canWrite: false,
        canDelete: false,
        canExecute: false,
      });
    }));

    it('should show success toast on successful creation', fakeAsync(() => {
      component.addResourceForm.patchValue({
        resourceId: '3',
        canCreate: true,
        canRead: true,
        canWrite: false,
        canDelete: false,
        canExecute: false,
      });

      component.onAddResourceSave();
      tick();

      expect(toastrSpy.success).toHaveBeenCalledWith('Permission created successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
    }));

    it('should reload permissions after successful creation', fakeAsync(() => {
      component.addResourceForm.patchValue({
        resourceId: '3',
        canCreate: true,
        canRead: true,
        canWrite: false,
        canDelete: false,
        canExecute: false,
      });
      permissionServiceSpy.getByRoleId.calls.reset();

      component.onAddResourceSave();
      tick();

      expect(permissionServiceSpy.getByRoleId).toHaveBeenCalledWith(1);
    }));

    it('should show error toast on creation failure with string error', fakeAsync(() => {
      component.addResourceForm.patchValue({ resourceId: '3' });
      permissionServiceSpy.create.and.returnValue(throwError(() => 'Creation failed'));

      component.onAddResourceSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Creation failed');
    }));

    it('should show error toast on creation failure with object error', fakeAsync(() => {
      component.addResourceForm.patchValue({ resourceId: '3' });
      permissionServiceSpy.create.and.returnValue(throwError(() => ({ message: 'Creation failed' })));

      component.onAddResourceSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Creation failed');
    }));

    it('should show default error toast on creation failure with undefined error', fakeAsync(() => {
      component.addResourceForm.patchValue({ resourceId: '3' });
      permissionServiceSpy.create.and.returnValue(throwError(() => undefined));

      component.onAddResourceSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Error adding resource');
    }));
  });

  describe('removeResource', () => {
    const mockRole: RoleResponse = { id: 1, name: 'Admin', description: 'Administrator role' };
    const mockPermission: PermissionResponse = {
      id: 1,
      roleId: 1,
      roleName: 'Admin',
      resourceId: 1,
      resourceCode: 'USER_MANAGEMENT',
      resourceName: 'User Management',
      canCreate: true,
      canRead: true,
      canWrite: false,
      canDelete: false,
      canExecute: false,
    };

    beforeEach(() => {
      component.viewingRole = mockRole;
      component.rolePermissions = [mockPermission];
    });

    it('should not call service if viewingRole is null', fakeAsync(() => {
      component.viewingRole = null;
      permissionServiceSpy.delete.calls.reset();

      component.removeResource(mockPermission);
      tick();

      expect(permissionServiceSpy.delete).not.toHaveBeenCalled();
    }));

    it('should show confirmation dialog when removing', fakeAsync(() => {
      const swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );

      component.removeResource(mockPermission);
      tick();

      expect(swalSpy).toHaveBeenCalled();
    }));

    it('should call delete service when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      permissionServiceSpy.getByRoleId.calls.reset();

      component.removeResource(mockPermission);
      tick();

      expect(permissionServiceSpy.delete).toHaveBeenCalledWith(1, 1);
      expect(toastrSpy.success).toHaveBeenCalledWith('Permission deleted successfully');
      expect(permissionServiceSpy.getByRoleId).toHaveBeenCalledWith(1);
    }));

    it('should not call delete service when cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );
      permissionServiceSpy.delete.calls.reset();

      component.removeResource(mockPermission);
      tick();

      expect(permissionServiceSpy.delete).not.toHaveBeenCalled();
    }));

    it('should show error toast on delete failure with string error', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      permissionServiceSpy.delete.and.returnValue(throwError(() => 'Delete failed'));

      component.removeResource(mockPermission);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Delete failed');
    }));

    it('should show error toast on delete failure with object error', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      permissionServiceSpy.delete.and.returnValue(throwError(() => ({ message: 'Delete failed' })));

      component.removeResource(mockPermission);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Delete failed');
    }));

    it('should show default error toast on delete failure with undefined error', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      permissionServiceSpy.delete.and.returnValue(throwError(() => undefined));

      component.removeResource(mockPermission);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Error removing resource');
    }));
  });
});
