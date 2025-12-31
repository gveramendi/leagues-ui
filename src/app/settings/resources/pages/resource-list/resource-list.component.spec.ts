import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService, provideToastr } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { ResourceListComponent } from './resource-list.component';
import { ResourceService, PermissionService, ApiResponse, ResourceResponse, PermissionResponse } from '@core';

describe('ResourceListComponent', () => {
  let component: ResourceListComponent;
  let fixture: ComponentFixture<ResourceListComponent>;
  let resourceServiceSpy: jasmine.SpyObj<ResourceService>;
  let permissionServiceSpy: jasmine.SpyObj<PermissionService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockResources: ResourceResponse[] = [
    { id: 1, code: 'USERS_VIEW', name: 'Users View', type: 'VIEW' },
    { id: 2, code: 'USERS_API', name: 'Users API', type: 'API' },
    { id: 3, code: 'ROLES_VIEW', name: 'Roles View', type: 'VIEW' },
  ];

  const mockPermissions: PermissionResponse[] = [
    { id: 1, roleId: 1, roleName: 'ADMIN', resourceId: 1, resourceCode: 'USERS_VIEW', resourceName: 'Users View', canCreate: true, canRead: true, canWrite: true, canDelete: true, canExecute: true },
    { id: 2, roleId: 1, roleName: 'ADMIN', resourceId: 2, resourceCode: 'USERS_API', resourceName: 'Users API', canCreate: true, canRead: true, canWrite: true, canDelete: true, canExecute: true },
    { id: 3, roleId: 2, roleName: 'USER', resourceId: 1, resourceCode: 'USERS_VIEW', resourceName: 'Users View', canCreate: false, canRead: true, canWrite: false, canDelete: false, canExecute: false },
  ];

  const mockResourcesResponse: ApiResponse<ResourceResponse[]> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Success',
    },
    body: {
      data: mockResources,
    },
  };

  const mockPermissionsResponse: ApiResponse<PermissionResponse[]> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Success',
    },
    body: {
      data: mockPermissions,
    },
  };

  const mockCreateResponse: ApiResponse<ResourceResponse> = {
    header: {
      success: true,
      statusCode: 201,
      message: 'Resource created successfully',
    },
    body: {
      data: { id: 4, code: 'NEW_RESOURCE', name: 'New Resource', type: 'API' },
    },
  };

  const mockDeleteResponse: ApiResponse<void> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Resource deleted successfully',
    },
    body: {
      data: undefined as unknown as void,
    },
  };

  const mockUpdateResponse: ApiResponse<ResourceResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Resource updated successfully',
    },
    body: {
      data: { id: 1, code: 'USERS_VIEW', name: 'Updated Name', type: 'API' },
    },
  };

  beforeEach(waitForAsync(() => {
    const resourceServiceMock = jasmine.createSpyObj('ResourceService', ['getAll', 'create', 'update', 'delete']);
    resourceServiceMock.getAll.and.returnValue(of(mockResourcesResponse));
    resourceServiceMock.create.and.returnValue(of(mockCreateResponse));
    resourceServiceMock.update.and.returnValue(of(mockUpdateResponse));
    resourceServiceMock.delete.and.returnValue(of(mockDeleteResponse));

    const permissionServiceMock = jasmine.createSpyObj('PermissionService', ['getAll']);
    permissionServiceMock.getAll.and.returnValue(of(mockPermissionsResponse));

    const modalMock = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);
    const toastrMock = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [
        ResourceListComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: ResourceService, useValue: resourceServiceMock },
        { provide: PermissionService, useValue: permissionServiceMock },
        { provide: NgbModal, useValue: modalMock },
        { provide: ToastrService, useValue: toastrMock },
        provideToastr(),
      ],
    }).compileComponents();

    resourceServiceSpy = TestBed.inject(ResourceService) as jasmine.SpyObj<ResourceService>;
    permissionServiceSpy = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have resourceTypes defined', () => {
    expect(component.resourceTypes).toEqual(['API', 'VIEW']);
  });

  describe('ngOnInit', () => {
    it('should load resources on init', () => {
      expect(resourceServiceSpy.getAll).toHaveBeenCalled();
      expect(component.rows.length).toBe(3);
      expect(component.filteredRows.length).toBe(3);
      expect(component.loading).toBeFalse();
    });
  });

  describe('loadResources', () => {
    it('should set loading to false after fetching', fakeAsync(() => {
      resourceServiceSpy.getAll.and.returnValue(of(mockResourcesResponse));
      permissionServiceSpy.getAll.and.returnValue(of(mockPermissionsResponse));

      component.loading = true;
      component.loadResources();
      tick();

      expect(component.loading).toBeFalse();
    }));

    it('should handle error when loading resources fails', fakeAsync(() => {
      const consoleSpy = spyOn(console, 'error');
      resourceServiceSpy.getAll.and.returnValue(throwError(() => new Error('Network error')));
      permissionServiceSpy.getAll.and.returnValue(of(mockPermissionsResponse));

      component.loadResources();
      tick();

      expect(consoleSpy).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    }));

    it('should update rows and filteredRows on successful load', fakeAsync(() => {
      resourceServiceSpy.getAll.and.returnValue(of(mockResourcesResponse));
      permissionServiceSpy.getAll.and.returnValue(of(mockPermissionsResponse));

      component.loadResources();
      tick();

      // Resources should be enriched with roles
      expect(component.rows.length).toBe(3);
      expect(component.rows[0].roles).toEqual([{ id: 1, name: 'ADMIN' }, { id: 2, name: 'USER' }]);
      expect(component.rows[1].roles).toEqual([{ id: 1, name: 'ADMIN' }]);
      expect(component.rows[2].roles).toEqual([]);
      expect(component.filteredRows.length).toBe(3);
    }));
  });

  describe('filterDatatable', () => {
    beforeEach(() => {
      component.rows = mockResources;
      component.filteredRows = [...component.rows];
    });

    it('should filter rows by code', () => {
      const event = { target: { value: 'users' } } as unknown as Event;

      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(2);
    });

    it('should filter rows by name', () => {
      const event = { target: { value: 'roles' } } as unknown as Event;

      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].code).toBe('ROLES_VIEW');
    });

    it('should filter rows by type', () => {
      const event = { target: { value: 'api' } } as unknown as Event;

      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].type).toBe('API');
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
      const event = { target: { value: 'USERS' } } as unknown as Event;

      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(2);
    });
  });

  describe('resourceForm', () => {
    it('should initialize with default type API', () => {
      expect(component.resourceForm.get('type')?.value).toBe('API');
    });

    it('should be invalid when code is empty', () => {
      component.resourceForm.patchValue({ code: '', name: 'Valid Name', type: 'API' });
      expect(component.resourceForm.invalid).toBeTrue();
    });

    it('should be invalid when name is empty', () => {
      component.resourceForm.patchValue({ code: 'VALID_CODE', name: '', type: 'API' });
      expect(component.resourceForm.invalid).toBeTrue();
    });

    it('should be invalid when code is too short', () => {
      component.resourceForm.patchValue({ code: 'A', name: 'Valid Name', type: 'API' });
      expect(component.resourceForm.get('code')?.errors?.['minlength']).toBeTruthy();
    });

    it('should be invalid when code exceeds max length', () => {
      component.resourceForm.patchValue({ code: 'A'.repeat(51), name: 'Valid Name', type: 'API' });
      expect(component.resourceForm.get('code')?.errors?.['maxlength']).toBeTruthy();
    });

    it('should be invalid when name is too short', () => {
      component.resourceForm.patchValue({ code: 'VALID_CODE', name: 'A', type: 'API' });
      expect(component.resourceForm.get('name')?.errors?.['minlength']).toBeTruthy();
    });

    it('should be invalid when name exceeds max length', () => {
      component.resourceForm.patchValue({ code: 'VALID_CODE', name: 'A'.repeat(101), type: 'API' });
      expect(component.resourceForm.get('name')?.errors?.['maxlength']).toBeTruthy();
    });

    it('should be valid with correct values', () => {
      component.resourceForm.patchValue({ code: 'VALID_CODE', name: 'Valid Name', type: 'API' });
      expect(component.resourceForm.valid).toBeTrue();
    });
  });

  describe('openAddModal', () => {
    it('should reset form and open modal', () => {
      component.resourceForm.patchValue({ code: 'OldCode', name: 'OldName', type: 'VIEW' });
      const mockContent = {};

      component.openAddModal(mockContent);

      expect(component.resourceForm.get('code')?.value).toBeFalsy();
      expect(component.resourceForm.get('name')?.value).toBeFalsy();
      expect(component.resourceForm.get('type')?.value).toBe('API');
      expect(modalServiceSpy.open).toHaveBeenCalledWith(mockContent, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg',
      });
    });
  });

  describe('onAddResourceSave', () => {
    it('should not call service if form is invalid', () => {
      component.resourceForm.patchValue({ code: '', name: '', type: 'API' });
      resourceServiceSpy.create.calls.reset();

      component.onAddResourceSave();

      expect(resourceServiceSpy.create).not.toHaveBeenCalled();
    });

    it('should call service with correct data when form is valid', fakeAsync(() => {
      component.resourceForm.patchValue({ code: 'NEW_CODE', name: 'New Name', type: 'VIEW' });
      resourceServiceSpy.getAll.calls.reset();

      component.onAddResourceSave();
      tick();

      expect(resourceServiceSpy.create).toHaveBeenCalledWith({
        code: 'NEW_CODE',
        name: 'New Name',
        type: 'VIEW',
      });
    }));

    it('should show success toast and reload resources on successful creation', fakeAsync(() => {
      component.resourceForm.patchValue({ code: 'NEW_CODE', name: 'New Name', type: 'API' });
      resourceServiceSpy.getAll.calls.reset();

      component.onAddResourceSave();
      tick();

      expect(toastrSpy.success).toHaveBeenCalledWith('Resource created successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
      expect(resourceServiceSpy.getAll).toHaveBeenCalled();
    }));

    it('should show error toast on creation failure with string error', fakeAsync(() => {
      component.resourceForm.patchValue({ code: 'NEW_CODE', name: 'New Name', type: 'API' });
      resourceServiceSpy.create.and.returnValue(throwError(() => 'Creation failed'));

      component.onAddResourceSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Creation failed');
    }));

    it('should show error toast on creation failure with object error', fakeAsync(() => {
      component.resourceForm.patchValue({ code: 'NEW_CODE', name: 'New Name', type: 'API' });
      resourceServiceSpy.create.and.returnValue(throwError(() => ({ message: 'Creation failed' })));

      component.onAddResourceSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Creation failed');
    }));

    it('should show default error toast on creation failure with undefined error', fakeAsync(() => {
      component.resourceForm.patchValue({ code: 'NEW_CODE', name: 'New Name', type: 'API' });
      resourceServiceSpy.create.and.returnValue(throwError(() => undefined));

      component.onAddResourceSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Error creating resource');
    }));
  });

  describe('editResourceForm', () => {
    it('should be invalid when name is empty', () => {
      component.editResourceForm.patchValue({ name: '', type: 'API' });
      expect(component.editResourceForm.get('name')?.errors?.['required']).toBeTruthy();
    });

    it('should be invalid when name is too short', () => {
      component.editResourceForm.patchValue({ name: 'A', type: 'API' });
      expect(component.editResourceForm.get('name')?.errors?.['minlength']).toBeTruthy();
    });

    it('should be invalid when name exceeds max length', () => {
      component.editResourceForm.patchValue({ name: 'A'.repeat(101), type: 'API' });
      expect(component.editResourceForm.get('name')?.errors?.['maxlength']).toBeTruthy();
    });

    it('should be valid with correct values', () => {
      component.editResourceForm.patchValue({ name: 'Valid Name', type: 'VIEW' });
      expect(component.editResourceForm.valid).toBeTrue();
    });
  });

  describe('openEditModal', () => {
    it('should set editingResource and populate form', () => {
      const mockResource: ResourceResponse = { id: 1, code: 'TEST', name: 'Test Resource', type: 'API' };
      const mockContent = {};

      component.openEditModal(mockContent, mockResource);

      expect(component.editingResource).toEqual(mockResource);
      expect(component.editResourceForm.get('name')?.value).toBe('Test Resource');
      expect(component.editResourceForm.get('type')?.value).toBe('API');
      expect(modalServiceSpy.open).toHaveBeenCalledWith(mockContent, {
        ariaLabelledBy: 'modal-edit-title',
        size: 'lg',
      });
    });

    it('should handle resource with no name', () => {
      const mockResource: ResourceResponse = { id: 1, code: 'TEST', name: '', type: 'VIEW' };
      const mockContent = {};

      component.openEditModal(mockContent, mockResource);

      expect(component.editingResource).toEqual(mockResource);
      expect(component.editResourceForm.get('name')?.value).toBe('');
    });
  });

  describe('onEditResourceSave', () => {
    const mockResource: ResourceResponse = { id: 1, code: 'TEST', name: 'Test Resource', type: 'VIEW' };

    beforeEach(() => {
      component.editingResource = mockResource;
    });

    it('should not call service if form is invalid', () => {
      component.editResourceForm.patchValue({ name: '', type: 'API' });
      resourceServiceSpy.update.calls.reset();

      component.onEditResourceSave();

      expect(resourceServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should not call service if editingResource is null', () => {
      component.editingResource = null;
      component.editResourceForm.patchValue({ name: 'New Name', type: 'API' });
      resourceServiceSpy.update.calls.reset();

      component.onEditResourceSave();

      expect(resourceServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should call service with correct data when form is valid', fakeAsync(() => {
      component.editResourceForm.patchValue({ name: 'Updated Name', type: 'API' });
      resourceServiceSpy.getAll.calls.reset();

      component.onEditResourceSave();
      tick();

      expect(resourceServiceSpy.update).toHaveBeenCalledWith(1, {
        name: 'Updated Name',
        type: 'API',
      });
    }));

    it('should show success toast and reload resources on successful update', fakeAsync(() => {
      component.editResourceForm.patchValue({ name: 'Updated Name', type: 'API' });
      resourceServiceSpy.getAll.calls.reset();

      component.onEditResourceSave();
      tick();

      expect(toastrSpy.success).toHaveBeenCalledWith('Resource updated successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
      expect(component.editingResource).toBeNull();
      expect(resourceServiceSpy.getAll).toHaveBeenCalled();
    }));

    it('should show error toast on update failure with string error', fakeAsync(() => {
      component.editResourceForm.patchValue({ name: 'Updated Name', type: 'API' });
      resourceServiceSpy.update.and.returnValue(throwError(() => 'Update failed'));

      component.onEditResourceSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Update failed');
    }));

    it('should show error toast on update failure with object error', fakeAsync(() => {
      component.editResourceForm.patchValue({ name: 'Updated Name', type: 'API' });
      resourceServiceSpy.update.and.returnValue(throwError(() => ({ message: 'Update failed' })));

      component.onEditResourceSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Update failed');
    }));

    it('should show default error toast on update failure with undefined error', fakeAsync(() => {
      component.editResourceForm.patchValue({ name: 'Updated Name', type: 'API' });
      resourceServiceSpy.update.and.returnValue(throwError(() => undefined));

      component.onEditResourceSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Error updating resource');
    }));
  });

  describe('deleteResource', () => {
    const mockResource: ResourceResponse = { id: 1, code: 'TEST', name: 'Test Resource', type: 'API' };

    it('should show confirmation dialog when deleting', fakeAsync(() => {
      const swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );

      component.deleteResource(mockResource);
      tick();

      expect(swalSpy).toHaveBeenCalled();
    }));

    it('should call delete service when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      resourceServiceSpy.getAll.calls.reset();

      component.deleteResource(mockResource);
      tick();

      expect(resourceServiceSpy.delete).toHaveBeenCalledWith(1);
      expect(toastrSpy.success).toHaveBeenCalledWith('Resource deleted successfully');
      expect(resourceServiceSpy.getAll).toHaveBeenCalled();
    }));

    it('should not call delete service when cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );
      resourceServiceSpy.delete.calls.reset();

      component.deleteResource(mockResource);
      tick();

      expect(resourceServiceSpy.delete).not.toHaveBeenCalled();
    }));

    it('should show error toast on delete failure with string error', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      resourceServiceSpy.delete.and.returnValue(throwError(() => 'Delete failed'));

      component.deleteResource(mockResource);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Delete failed');
    }));

    it('should show error toast on delete failure with object error', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      resourceServiceSpy.delete.and.returnValue(throwError(() => ({ message: 'Delete failed' })));

      component.deleteResource(mockResource);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Delete failed');
    }));

    it('should show default error toast on delete failure with undefined error', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      resourceServiceSpy.delete.and.returnValue(throwError(() => undefined));

      component.deleteResource(mockResource);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Error deleting resource');
    }));
  });
});
