import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

import { RoleDetailComponent } from './role-detail.component';
import {
  RoleService,
  PermissionService,
  ResourceService,
  ApiResponse,
  RoleResponse,
  PermissionResponse,
  ResourceResponse,
} from '@core';

describe('RoleDetailComponent', () => {
  let component: RoleDetailComponent;
  let fixture: ComponentFixture<RoleDetailComponent>;
  let roleServiceSpy: jasmine.SpyObj<RoleService>;
  let permissionServiceSpy: jasmine.SpyObj<PermissionService>;
  let resourceServiceSpy: jasmine.SpyObj<ResourceService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let router: Router;

  const mockRole: RoleResponse = {
    id: 1,
    name: 'ADMIN',
    description: 'Administrator role',
  };

  const mockPermissions: PermissionResponse[] = [
    {
      id: 1,
      roleId: 1,
      roleName: 'ADMIN',
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
      roleName: 'ADMIN',
      resourceId: 2,
      resourceCode: 'ROLES',
      resourceName: 'Roles Management',
      canCreate: false,
      canRead: true,
      canWrite: false,
      canDelete: false,
      canExecute: false,
    },
  ];

  const mockResources: ResourceResponse[] = [
    { id: 1, code: 'USERS', name: 'Users Management', type: 'VIEW' },
    { id: 2, code: 'ROLES', name: 'Roles Management', type: 'VIEW' },
    { id: 3, code: 'SETTINGS', name: 'Settings', type: 'VIEW' },
  ];

  const mockRoleResponse: ApiResponse<RoleResponse> = {
    header: { success: true, statusCode: 200, message: 'Role retrieved' },
    body: { data: mockRole },
  };

  const mockPermissionsResponse: ApiResponse<PermissionResponse[]> = {
    header: { success: true, statusCode: 200, message: 'Permissions retrieved' },
    body: { data: mockPermissions },
  };

  const mockResourcesResponse: ApiResponse<ResourceResponse[]> = {
    header: { success: true, statusCode: 200, message: 'Resources retrieved' },
    body: { data: mockResources },
  };

  const mockCreateResponse: ApiResponse<PermissionResponse> = {
    header: { success: true, statusCode: 201, message: 'Permission created successfully' },
    body: { data: mockPermissions[0] },
  };

  const mockUpdateResponse: ApiResponse<PermissionResponse> = {
    header: { success: true, statusCode: 200, message: 'Permission updated successfully' },
    body: { data: { ...mockPermissions[0], canExecute: true } },
  };

  const mockDeleteResponse: ApiResponse<void> = {
    header: { success: true, statusCode: 200, message: 'Permission deleted successfully' },
    body: { data: undefined as unknown as void },
  };

  beforeEach(waitForAsync(() => {
    const roleServiceMock = jasmine.createSpyObj('RoleService', ['getById']);
    roleServiceMock.getById.and.returnValue(of(mockRoleResponse));

    const permissionServiceMock = jasmine.createSpyObj('PermissionService', [
      'getByRoleId',
      'create',
      'update',
      'delete',
    ]);
    permissionServiceMock.getByRoleId.and.returnValue(of(mockPermissionsResponse));
    permissionServiceMock.create.and.returnValue(of(mockCreateResponse));
    permissionServiceMock.update.and.returnValue(of(mockUpdateResponse));
    permissionServiceMock.delete.and.returnValue(of(mockDeleteResponse));

    const resourceServiceMock = jasmine.createSpyObj('ResourceService', ['getAll']);
    resourceServiceMock.getAll.and.returnValue(of(mockResourcesResponse));

    const modalMock = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);
    const toastrMock = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [
        RoleDetailComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        provideRouter([]),
        { provide: RoleService, useValue: roleServiceMock },
        { provide: PermissionService, useValue: permissionServiceMock },
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

    roleServiceSpy = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
    permissionServiceSpy = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    resourceServiceSpy = TestBed.inject(ResourceService) as jasmine.SpyObj<ResourceService>;
    modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    router = TestBed.inject(Router);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load role on init', () => {
      expect(roleServiceSpy.getById).toHaveBeenCalledWith(1);
      expect(component.role).toEqual(mockRole);
    });

    it('should load permissions on init', () => {
      expect(permissionServiceSpy.getByRoleId).toHaveBeenCalledWith(1);
      expect(component.permissions.length).toBe(2);
    });

    it('should load resources on init', () => {
      expect(resourceServiceSpy.getAll).toHaveBeenCalled();
      expect(component.resources.length).toBe(3);
    });
  });

  describe('filterDatatable', () => {
    it('should filter by resource code', () => {
      component.permissions = mockPermissions;
      component.filteredPermissions = [...mockPermissions];

      const event = { target: { value: 'USERS' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredPermissions.length).toBe(1);
      expect(component.filteredPermissions[0].resourceCode).toBe('USERS');
    });

    it('should filter by resource name', () => {
      component.permissions = mockPermissions;
      component.filteredPermissions = [...mockPermissions];

      const event = { target: { value: 'Roles' } } as unknown as Event;
      component.filterDatatable(event);

      expect(component.filteredPermissions.length).toBe(1);
      expect(component.filteredPermissions[0].resourceName).toBe('Roles Management');
    });
  });

  describe('getAvailableResources', () => {
    it('should return only unassigned resources', () => {
      component.permissions = mockPermissions;
      component.resources = mockResources;

      const available = component.getAvailableResources();

      expect(available.length).toBe(1);
      expect(available[0].code).toBe('SETTINGS');
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

  describe('onAddPermissionSave', () => {
    it('should not save if form is invalid', () => {
      component.permissionForm.controls['resourceId'].setValue('');

      component.onAddPermissionSave();

      expect(permissionServiceSpy.create).not.toHaveBeenCalled();
    });

    it('should create permission successfully', () => {
      component.permissionForm.controls['resourceId'].setValue('3');
      component.permissionForm.controls['canRead'].setValue(true);

      component.onAddPermissionSave();

      expect(permissionServiceSpy.create).toHaveBeenCalled();
      expect(toastrSpy.success).toHaveBeenCalledWith('Permission created successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
    });

    it('should handle error when creating permission', () => {
      permissionServiceSpy.create.and.returnValue(
        throwError(() => ({ message: 'Creation failed' }))
      );
      component.permissionForm.controls['resourceId'].setValue('3');

      component.onAddPermissionSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('Creation failed');
    });
  });

  describe('openEditModal', () => {
    it('should set editing permission and open modal', () => {
      const mockModalRef = { dismiss: jasmine.createSpy('dismiss') } as unknown as NgbModalRef;
      modalServiceSpy.open.and.returnValue(mockModalRef);
      const content = {};

      component.openEditModal(content, mockPermissions[0]);

      expect(component.editingPermission).toEqual(mockPermissions[0]);
      expect(component.editPermissionForm.value.canCreate).toBe(true);
      expect(component.editPermissionForm.value.canRead).toBe(true);
    });
  });

  describe('onEditPermissionSave', () => {
    it('should not save if editingPermission is null', () => {
      component.editingPermission = null;

      component.onEditPermissionSave();

      expect(permissionServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should update permission successfully', () => {
      component.editingPermission = mockPermissions[0];
      component.editPermissionForm.controls['canExecute'].setValue(true);

      component.onEditPermissionSave();

      expect(permissionServiceSpy.update).toHaveBeenCalledWith(1, 1, jasmine.any(Object));
      expect(toastrSpy.success).toHaveBeenCalledWith('Permission updated successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
    });

    it('should handle error when updating permission', () => {
      permissionServiceSpy.update.and.returnValue(
        throwError(() => ({ message: 'Update failed' }))
      );
      component.editingPermission = mockPermissions[0];

      component.onEditPermissionSave();

      expect(toastrSpy.error).toHaveBeenCalledWith('Update failed');
    });
  });

  describe('deletePermission', () => {
    it('should show confirmation dialog and delete on confirm', fakeAsync(() => {
      component.role = mockRole;
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );

      component.deletePermission(mockPermissions[0]);
      tick();

      expect(permissionServiceSpy.delete).toHaveBeenCalledWith(1, 1);
      expect(toastrSpy.success).toHaveBeenCalledWith('Permission deleted successfully');
    }));

    it('should not delete when cancelled', fakeAsync(() => {
      component.role = mockRole;
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );

      component.deletePermission(mockPermissions[0]);
      tick();

      expect(permissionServiceSpy.delete).not.toHaveBeenCalled();
    }));
  });

  describe('goBack', () => {
    it('should navigate to role list', () => {
      const navigateSpy = spyOn(router, 'navigate');

      component.goBack();

      expect(navigateSpy).toHaveBeenCalledWith(['/settings/roles/list']);
    });
  });
});
