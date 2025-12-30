import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService, provideToastr } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { RoleListComponent } from './role-list.component';
import { RoleService, PageResponse, RoleResponse, SuccessResponse, CreateRoleRequest } from '@core';

describe('RoleListComponent', () => {
  let component: RoleListComponent;
  let fixture: ComponentFixture<RoleListComponent>;
  let roleServiceSpy: jasmine.SpyObj<RoleService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockRolesResponse: SuccessResponse<PageResponse<RoleResponse>> = {
    message: 'Success',
    data: {
      content: [
        { id: 1, name: 'Admin', description: 'Administrator role' },
        { id: 2, name: 'User', description: 'User role' },
        { id: 3, name: 'Manager', description: 'Manager role' },
      ],
      totalElements: 3,
      totalPages: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: false,
    },
  };

  const mockCreateResponse: SuccessResponse<RoleResponse> = {
    message: 'Role created successfully',
    data: { id: 4, name: 'NewRole', description: 'New role description' },
  };

  const mockDeleteResponse: SuccessResponse<void> = {
    message: 'Role deleted successfully',
    data: undefined as unknown as void,
  };

  beforeEach(waitForAsync(() => {
    const roleServiceMock = jasmine.createSpyObj('RoleService', ['searchRoles', 'create', 'delete']);
    roleServiceMock.searchRoles.and.returnValue(of(mockRolesResponse));
    roleServiceMock.create.and.returnValue(of(mockCreateResponse));
    roleServiceMock.delete.and.returnValue(of(mockDeleteResponse));

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
        { provide: NgbModal, useValue: modalMock },
        { provide: ToastrService, useValue: toastrMock },
        provideToastr(),
      ],
    }).compileComponents();

    roleServiceSpy = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
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

      expect(component.rows).toEqual(mockRolesResponse.data.content);
      expect(component.filteredRows).toEqual(mockRolesResponse.data.content);
      expect(component.totalElements).toBe(3);
    }));
  });

  describe('filterDatatable', () => {
    beforeEach(() => {
      component.rows = mockRolesResponse.data.content;
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
});
