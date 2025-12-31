import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService, provideToastr } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { RoleListComponent } from './role-list.component';
import { RoleService, PermissionService, ApiResponse, RoleResponse, PermissionResponse } from '@core';

describe('RoleListComponent', () => {
  let component: RoleListComponent;
  let fixture: ComponentFixture<RoleListComponent>;
  let roleServiceSpy: jasmine.SpyObj<RoleService>;
  let permissionServiceSpy: jasmine.SpyObj<PermissionService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockRoles: RoleResponse[] = [
    { id: 1, name: 'Admin', description: 'Administrator role' },
    { id: 2, name: 'User', description: 'User role' },
    { id: 3, name: 'Manager', description: 'Manager role' },
  ];

  const mockPermissionsRole1: PermissionResponse[] = [
    {
      id: 1,
      roleId: 1,
      roleName: 'Admin',
      resourceId: 1,
      resourceCode: 'USERS',
      resourceName: 'Users Management',
      canCreate: true,
      canRead: true,
      canWrite: true,
      canDelete: true,
      canExecute: false,
    },
    {
      id: 2,
      roleId: 1,
      roleName: 'Admin',
      resourceId: 2,
      resourceCode: 'ROLES',
      resourceName: 'Roles Management',
      canCreate: true,
      canRead: true,
      canWrite: true,
      canDelete: true,
      canExecute: false,
    },
  ];

  const mockPermissionsRole2: PermissionResponse[] = [
    {
      id: 3,
      roleId: 2,
      roleName: 'User',
      resourceId: 1,
      resourceCode: 'USERS',
      resourceName: 'Users Management',
      canCreate: false,
      canRead: true,
      canWrite: false,
      canDelete: false,
      canExecute: false,
    },
  ];

  const mockPermissionsRole3: PermissionResponse[] = [];

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

  const mockPermissionsResponse1: ApiResponse<PermissionResponse[]> = {
    header: { success: true, statusCode: 200, message: 'Success' },
    body: { data: mockPermissionsRole1 },
  };

  const mockPermissionsResponse2: ApiResponse<PermissionResponse[]> = {
    header: { success: true, statusCode: 200, message: 'Success' },
    body: { data: mockPermissionsRole2 },
  };

  const mockPermissionsResponse3: ApiResponse<PermissionResponse[]> = {
    header: { success: true, statusCode: 200, message: 'Success' },
    body: { data: mockPermissionsRole3 },
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

  beforeEach(waitForAsync(() => {
    const roleServiceMock = jasmine.createSpyObj('RoleService', ['searchRoles', 'create', 'update', 'delete']);
    roleServiceMock.searchRoles.and.returnValue(of(mockRolesResponse));
    roleServiceMock.create.and.returnValue(of(mockCreateResponse));
    roleServiceMock.update.and.returnValue(of(mockUpdateResponse));
    roleServiceMock.delete.and.returnValue(of(mockDeleteResponse));

    const permissionServiceMock = jasmine.createSpyObj('PermissionService', ['getByRoleId']);
    permissionServiceMock.getByRoleId.and.callFake((roleId: number) => {
      if (roleId === 1) return of(mockPermissionsResponse1);
      if (roleId === 2) return of(mockPermissionsResponse2);
      return of(mockPermissionsResponse3);
    });

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
        { provide: NgbModal, useValue: modalMock },
        { provide: ToastrService, useValue: toastrMock },
        provideToastr(),
      ],
    }).compileComponents();

    roleServiceSpy = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
    permissionServiceSpy = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
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
    });

    it('should load resources for each role', () => {
      expect(permissionServiceSpy.getByRoleId).toHaveBeenCalledWith(1);
      expect(permissionServiceSpy.getByRoleId).toHaveBeenCalledWith(2);
      expect(permissionServiceSpy.getByRoleId).toHaveBeenCalledWith(3);
    });

    it('should populate resources for roles', () => {
      expect(component.rows[0].resources?.length).toBe(2);
      expect(component.rows[0].resources?.[0].name).toBe('Users Management');
      expect(component.rows[0].resources?.[1].name).toBe('Roles Management');
      expect(component.rows[1].resources?.length).toBe(1);
      expect(component.rows[2].resources?.length).toBe(0);
    });
  });

  describe('loadRoles', () => {
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

      expect(component.rows.length).toBe(3);
      expect(component.filteredRows.length).toBe(3);
      expect(component.totalElements).toBe(3);
    }));

    it('should handle error when loading resources fails', fakeAsync(() => {
      const consoleSpy = spyOn(console, 'error');
      permissionServiceSpy.getByRoleId.and.returnValue(throwError(() => new Error('Network error')));
      roleServiceSpy.searchRoles.and.returnValue(of(mockRolesResponse));

      component.loadRoles();
      tick();

      expect(consoleSpy).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
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

    it('should return all rows when filter is empty', () => {
      const event = { target: { value: '' } } as unknown as Event;

      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(3);
    });
  });

  describe('onPageChange', () => {
    it('should update page and reload roles', fakeAsync(() => {
      roleServiceSpy.searchRoles.calls.reset();
      permissionServiceSpy.getByRoleId.calls.reset();
      roleServiceSpy.searchRoles.and.returnValue(of(mockRolesResponse));

      component.onPageChange({ offset: 2 });
      tick();

      expect(component.page).toBe(2);
      expect(roleServiceSpy.searchRoles).toHaveBeenCalledWith('', 2, 10, 'name,asc');
    }));
  });

  describe('onSort', () => {
    it('should update sort and reload roles', fakeAsync(() => {
      roleServiceSpy.searchRoles.calls.reset();
      permissionServiceSpy.getByRoleId.calls.reset();
      roleServiceSpy.searchRoles.and.returnValue(of(mockRolesResponse));

      component.onSort({ sorts: [{ prop: 'name', dir: 'asc' }] });
      tick();

      expect(component.sort).toBe('name,asc');
      expect(component.page).toBe(0);
      expect(roleServiceSpy.searchRoles).toHaveBeenCalledWith('', 0, 10, 'name,asc');
    }));
  });

  describe('roleForm', () => {
    it('should be invalid when name is empty', () => {
      component.roleForm.patchValue({ name: '', description: '' });
      expect(component.roleForm.invalid).toBeTrue();
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

    it('should show success toast on successful creation', fakeAsync(() => {
      component.roleForm.patchValue({ name: 'NewRole', description: 'New description' });
      roleServiceSpy.searchRoles.calls.reset();

      component.onAddRoleSave();
      tick();

      expect(toastrSpy.success).toHaveBeenCalledWith('Role created successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
    }));

    it('should show error toast on creation failure', fakeAsync(() => {
      component.roleForm.patchValue({ name: 'NewRole', description: 'New description' });
      roleServiceSpy.create.and.returnValue(throwError(() => ({ message: 'Creation failed' })));

      component.onAddRoleSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Creation failed');
    }));
  });

  describe('deleteRole', () => {
    const mockRole: RoleResponse = { id: 1, name: 'Admin', description: 'Administrator role' };

    it('should call delete service when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      roleServiceSpy.searchRoles.calls.reset();

      component.deleteRole(mockRole);
      tick();

      expect(roleServiceSpy.delete).toHaveBeenCalledWith(1);
      expect(toastrSpy.success).toHaveBeenCalledWith('Role deleted successfully');
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
  });

  describe('editRoleForm', () => {
    it('should be valid with correct values', () => {
      component.editRoleForm.patchValue({ description: 'Valid description' });
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
  });

  describe('onEditRoleSave', () => {
    const mockRole: RoleResponse = { id: 1, name: 'Admin', description: 'Administrator role' };

    beforeEach(() => {
      component.editingRole = mockRole;
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

    it('should show success toast on successful update', fakeAsync(() => {
      component.editRoleForm.patchValue({ description: 'Updated description' });
      roleServiceSpy.searchRoles.calls.reset();

      component.onEditRoleSave();
      tick();

      expect(toastrSpy.success).toHaveBeenCalledWith('Role updated successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
    }));
  });
});
