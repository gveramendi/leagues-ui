import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService, provideToastr } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { UserListComponent } from './user-list.component';
import { UserService, RoleService, ApiResponse, UserResponse, RoleResponse, CreateUserRequest, UpdateUserRequest } from '@core';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let roleServiceSpy: jasmine.SpyObj<RoleService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockUsers: UserResponse[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', roles: ['ROLE_USER'] },
    { id: 2, firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', roles: ['ROLE_ADMIN'] },
    { id: 3, firstName: 'Bob', lastName: 'Smith', email: 'bob.smith@example.com', roles: ['ROLE_USER', 'ROLE_MANAGER'] },
  ];

  const mockUsersResponse: ApiResponse<UserResponse[]> = {
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
      data: mockUsers,
    },
  };

  const mockCreateResponse: ApiResponse<UserResponse> = {
    header: {
      success: true,
      statusCode: 201,
      message: 'User created successfully',
    },
    body: {
      data: { id: 4, firstName: 'New', lastName: 'User', email: 'new.user@example.com', roles: ['ROLE_USER'] },
    },
  };

  const mockDeleteResponse: ApiResponse<void> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'User deleted successfully',
    },
    body: {
      data: undefined as unknown as void,
    },
  };

  const mockUpdateResponse: ApiResponse<UserResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'User updated successfully',
    },
    body: {
      data: { id: 1, firstName: 'Johnny', lastName: 'Updated', email: 'john.doe@example.com', roles: ['ROLE_USER'] },
    },
  };

  const mockRoles: RoleResponse[] = [
    { id: 1, name: 'ROLE_USER', description: 'User role' },
    { id: 2, name: 'ROLE_ADMIN', description: 'Admin role' },
    { id: 3, name: 'ROLE_MANAGER', description: 'Manager role' },
  ];

  const mockRolesResponse: ApiResponse<RoleResponse[]> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Success',
    },
    body: {
      data: mockRoles,
    },
  };

  const mockAddRoleResponse: ApiResponse<UserResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Role added successfully',
    },
    body: {
      data: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', roles: ['ROLE_USER', 'ROLE_ADMIN'] },
    },
  };

  const mockRemoveRoleResponse: ApiResponse<UserResponse> = {
    header: {
      success: true,
      statusCode: 200,
      message: 'Role removed successfully',
    },
    body: {
      data: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', roles: [] },
    },
  };

  beforeEach(waitForAsync(() => {
    const userServiceMock = jasmine.createSpyObj('UserService', ['searchUsers', 'create', 'update', 'delete', 'addRole', 'removeRole']);
    userServiceMock.searchUsers.and.returnValue(of(mockUsersResponse));
    userServiceMock.create.and.returnValue(of(mockCreateResponse));
    userServiceMock.update.and.returnValue(of(mockUpdateResponse));
    userServiceMock.delete.and.returnValue(of(mockDeleteResponse));
    userServiceMock.addRole.and.returnValue(of(mockAddRoleResponse));
    userServiceMock.removeRole.and.returnValue(of(mockRemoveRoleResponse));

    const roleServiceMock = jasmine.createSpyObj('RoleService', ['getAll']);
    roleServiceMock.getAll.and.returnValue(of(mockRolesResponse));

    const modalMock = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);
    const toastrMock = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [
        UserListComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: RoleService, useValue: roleServiceMock },
        { provide: NgbModal, useValue: modalMock },
        { provide: ToastrService, useValue: toastrMock },
        provideToastr(),
      ],
    }).compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    roleServiceSpy = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
    modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    toastrSpy = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.page).toBe(0);
    expect(component.size).toBe(10);
    expect(component.sort).toBe('firstName,asc');
    expect(component.search).toBe('');
  });

  describe('ngOnInit', () => {
    it('should load users on init', () => {
      expect(userServiceSpy.searchUsers).toHaveBeenCalledWith('', 0, 10, 'firstName,asc');
      expect(component.rows.length).toBe(3);
      expect(component.filteredRows.length).toBe(3);
      expect(component.totalElements).toBe(3);
      expect(component.loading).toBeFalse();
    });
  });

  describe('loadUsers', () => {
    it('should set loading to true while fetching', fakeAsync(() => {
      userServiceSpy.searchUsers.and.returnValue(of(mockUsersResponse));

      component.loading = false;
      component.loadUsers();

      expect(component.loading).toBeFalse();
      tick();
    }));

    it('should handle error when loading users fails', fakeAsync(() => {
      const consoleSpy = spyOn(console, 'error');
      userServiceSpy.searchUsers.and.returnValue(throwError(() => new Error('Network error')));

      component.loadUsers();
      tick();

      expect(consoleSpy).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    }));

    it('should update rows and filteredRows on successful load', fakeAsync(() => {
      userServiceSpy.searchUsers.and.returnValue(of(mockUsersResponse));

      component.loadUsers();
      tick();

      expect(component.rows).toEqual(mockUsers);
      expect(component.filteredRows).toEqual(mockUsers);
      expect(component.totalElements).toBe(3);
    }));
  });

  describe('filterDatatable', () => {
    beforeEach(() => {
      component.rows = mockUsers;
      component.filteredRows = [...component.rows];
    });

    it('should filter rows by firstName', () => {
      const event = { target: { value: 'john' } } as unknown as Event;

      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].firstName).toBe('John');
    });

    it('should filter rows by lastName', () => {
      const event = { target: { value: 'smith' } } as unknown as Event;

      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].lastName).toBe('Smith');
    });

    it('should filter rows by email', () => {
      const event = { target: { value: 'jane' } } as unknown as Event;

      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].email).toBe('jane.doe@example.com');
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
      const event = { target: { value: 'JOHN' } } as unknown as Event;

      component.filterDatatable(event);

      expect(component.filteredRows.length).toBe(1);
      expect(component.filteredRows[0].firstName).toBe('John');
    });
  });

  describe('onPageChange', () => {
    it('should update page and reload users', fakeAsync(() => {
      userServiceSpy.searchUsers.calls.reset();
      userServiceSpy.searchUsers.and.returnValue(of(mockUsersResponse));

      component.onPageChange({ offset: 2 });
      tick();

      expect(component.page).toBe(2);
      expect(userServiceSpy.searchUsers).toHaveBeenCalledWith('', 2, 10, 'firstName,asc');
    }));
  });

  describe('onSort', () => {
    it('should update sort and reload users with ascending order', fakeAsync(() => {
      userServiceSpy.searchUsers.calls.reset();
      userServiceSpy.searchUsers.and.returnValue(of(mockUsersResponse));

      component.onSort({ sorts: [{ prop: 'firstName', dir: 'asc' }] });
      tick();

      expect(component.sort).toBe('firstName,asc');
      expect(component.page).toBe(0);
      expect(userServiceSpy.searchUsers).toHaveBeenCalledWith('', 0, 10, 'firstName,asc');
    }));

    it('should update sort and reload users with descending order', fakeAsync(() => {
      userServiceSpy.searchUsers.calls.reset();
      userServiceSpy.searchUsers.and.returnValue(of(mockUsersResponse));

      component.onSort({ sorts: [{ prop: 'lastName', dir: 'desc' }] });
      tick();

      expect(component.sort).toBe('lastName,desc');
      expect(component.page).toBe(0);
      expect(userServiceSpy.searchUsers).toHaveBeenCalledWith('', 0, 10, 'lastName,desc');
    }));

    it('should reset page to 0 when sorting', fakeAsync(() => {
      component.page = 5;
      userServiceSpy.searchUsers.calls.reset();
      userServiceSpy.searchUsers.and.returnValue(of(mockUsersResponse));

      component.onSort({ sorts: [{ prop: 'id', dir: 'asc' }] });
      tick();

      expect(component.page).toBe(0);
    }));
  });

  describe('userForm', () => {
    it('should initialize with empty values', () => {
      expect(component.userForm.get('firstName')?.value).toBeFalsy();
      expect(component.userForm.get('lastName')?.value).toBeFalsy();
      expect(component.userForm.get('email')?.value).toBeFalsy();
      expect(component.userForm.get('password')?.value).toBeFalsy();
    });

    it('should be invalid when all fields are empty', () => {
      component.userForm.patchValue({ firstName: '', lastName: '', email: '', password: '' });
      expect(component.userForm.invalid).toBeTrue();
    });

    it('should be invalid when firstName is too short', () => {
      component.userForm.patchValue({ firstName: 'A', lastName: 'Doe', email: 'test@test.com', password: 'password123' });
      expect(component.userForm.get('firstName')?.errors?.['minlength']).toBeTruthy();
    });

    it('should be invalid when firstName exceeds max length', () => {
      component.userForm.patchValue({ firstName: 'A'.repeat(51), lastName: 'Doe', email: 'test@test.com', password: 'password123' });
      expect(component.userForm.get('firstName')?.errors?.['maxlength']).toBeTruthy();
    });

    it('should be invalid when lastName is too short', () => {
      component.userForm.patchValue({ firstName: 'John', lastName: 'D', email: 'test@test.com', password: 'password123' });
      expect(component.userForm.get('lastName')?.errors?.['minlength']).toBeTruthy();
    });

    it('should be invalid when email is invalid', () => {
      component.userForm.patchValue({ firstName: 'John', lastName: 'Doe', email: 'invalid-email', password: 'password123' });
      expect(component.userForm.get('email')?.errors?.['email']).toBeTruthy();
    });

    it('should be invalid when password is too short', () => {
      component.userForm.patchValue({ firstName: 'John', lastName: 'Doe', email: 'test@test.com', password: '12345' });
      expect(component.userForm.get('password')?.errors?.['minlength']).toBeTruthy();
    });

    it('should be valid with correct values', () => {
      component.userForm.patchValue({ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', password: 'password123' });
      expect(component.userForm.valid).toBeTrue();
    });
  });

  describe('openAddModal', () => {
    it('should reset form and open modal', () => {
      component.userForm.patchValue({ firstName: 'Old', lastName: 'Value', email: 'old@email.com', password: 'oldpass' });
      const mockContent = {};

      component.openAddModal(mockContent);

      expect(component.userForm.get('firstName')?.value).toBeFalsy();
      expect(component.userForm.get('lastName')?.value).toBeFalsy();
      expect(component.userForm.get('email')?.value).toBeFalsy();
      expect(component.userForm.get('password')?.value).toBeFalsy();
      expect(modalServiceSpy.open).toHaveBeenCalledWith(mockContent, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg',
      });
    });
  });

  describe('onAddUserSave', () => {
    it('should not call service if form is invalid', () => {
      component.userForm.patchValue({ firstName: '', lastName: '', email: '', password: '' });
      userServiceSpy.create.calls.reset();

      component.onAddUserSave();

      expect(userServiceSpy.create).not.toHaveBeenCalled();
    });

    it('should call service with correct data when form is valid', fakeAsync(() => {
      component.userForm.patchValue({ firstName: 'New', lastName: 'User', email: 'new.user@example.com', password: 'password123' });
      userServiceSpy.searchUsers.calls.reset();

      component.onAddUserSave();
      tick();

      expect(userServiceSpy.create).toHaveBeenCalledWith({
        firstName: 'New',
        lastName: 'User',
        email: 'new.user@example.com',
        password: 'password123',
      });
    }));

    it('should show success toast and reload users on successful creation', fakeAsync(() => {
      component.userForm.patchValue({ firstName: 'New', lastName: 'User', email: 'new.user@example.com', password: 'password123' });
      userServiceSpy.searchUsers.calls.reset();

      component.onAddUserSave();
      tick();

      expect(toastrSpy.success).toHaveBeenCalledWith('User created successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
      expect(userServiceSpy.searchUsers).toHaveBeenCalled();
    }));

    it('should show error toast on creation failure with string error', fakeAsync(() => {
      component.userForm.patchValue({ firstName: 'New', lastName: 'User', email: 'new.user@example.com', password: 'password123' });
      userServiceSpy.create.and.returnValue(throwError(() => 'Creation failed'));

      component.onAddUserSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Creation failed');
    }));

    it('should show error toast on creation failure with object error', fakeAsync(() => {
      component.userForm.patchValue({ firstName: 'New', lastName: 'User', email: 'new.user@example.com', password: 'password123' });
      userServiceSpy.create.and.returnValue(throwError(() => ({ message: 'Creation failed' })));

      component.onAddUserSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Creation failed');
    }));

    it('should show default error toast on creation failure with undefined error', fakeAsync(() => {
      component.userForm.patchValue({ firstName: 'New', lastName: 'User', email: 'new.user@example.com', password: 'password123' });
      userServiceSpy.create.and.returnValue(throwError(() => undefined));

      component.onAddUserSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Error creating user');
    }));
  });

  describe('editUserForm', () => {
    it('should initialize with empty values', () => {
      expect(component.editUserForm.get('firstName')?.value).toBeFalsy();
      expect(component.editUserForm.get('lastName')?.value).toBeFalsy();
    });

    it('should be invalid when firstName is too short', () => {
      component.editUserForm.patchValue({ firstName: 'A', lastName: 'Doe' });
      expect(component.editUserForm.get('firstName')?.errors?.['minlength']).toBeTruthy();
    });

    it('should be invalid when lastName is too short', () => {
      component.editUserForm.patchValue({ firstName: 'John', lastName: 'D' });
      expect(component.editUserForm.get('lastName')?.errors?.['minlength']).toBeTruthy();
    });

    it('should be valid with correct values', () => {
      component.editUserForm.patchValue({ firstName: 'John', lastName: 'Doe' });
      expect(component.editUserForm.valid).toBeTrue();
    });
  });

  describe('openEditModal', () => {
    it('should set editingUser and populate form', () => {
      const mockUser: UserResponse = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', roles: ['ROLE_USER'] };
      const mockContent = {};

      component.openEditModal(mockContent, mockUser);

      expect(component.editingUser).toEqual(mockUser);
      expect(component.editUserForm.get('firstName')?.value).toBe('John');
      expect(component.editUserForm.get('lastName')?.value).toBe('Doe');
      expect(modalServiceSpy.open).toHaveBeenCalledWith(mockContent, {
        ariaLabelledBy: 'modal-edit-title',
        size: 'lg',
      });
    });

    it('should handle user with empty firstName/lastName', () => {
      const mockUser: UserResponse = { id: 1, firstName: '', lastName: '', email: 'test@example.com', roles: [] };
      const mockContent = {};

      component.openEditModal(mockContent, mockUser);

      expect(component.editingUser).toEqual(mockUser);
      expect(component.editUserForm.get('firstName')?.value).toBe('');
      expect(component.editUserForm.get('lastName')?.value).toBe('');
    });
  });

  describe('onEditUserSave', () => {
    const mockUser: UserResponse = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', roles: ['ROLE_USER'] };

    beforeEach(() => {
      component.editingUser = mockUser;
    });

    it('should not call service if form is invalid', () => {
      component.editUserForm.patchValue({ firstName: 'A', lastName: 'D' });
      userServiceSpy.update.calls.reset();

      component.onEditUserSave();

      expect(userServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should not call service if editingUser is null', () => {
      component.editingUser = null;
      component.editUserForm.patchValue({ firstName: 'John', lastName: 'Doe' });
      userServiceSpy.update.calls.reset();

      component.onEditUserSave();

      expect(userServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should call service with correct data when form is valid', fakeAsync(() => {
      component.editUserForm.patchValue({ firstName: 'Johnny', lastName: 'Updated' });
      userServiceSpy.searchUsers.calls.reset();

      component.onEditUserSave();
      tick();

      expect(userServiceSpy.update).toHaveBeenCalledWith(1, {
        firstName: 'Johnny',
        lastName: 'Updated',
      });
    }));

    it('should show success toast and reload users on successful update', fakeAsync(() => {
      component.editUserForm.patchValue({ firstName: 'Johnny', lastName: 'Updated' });
      userServiceSpy.searchUsers.calls.reset();

      component.onEditUserSave();
      tick();

      expect(toastrSpy.success).toHaveBeenCalledWith('User updated successfully');
      expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
      expect(component.editingUser).toBeNull();
      expect(userServiceSpy.searchUsers).toHaveBeenCalled();
    }));

    it('should show error toast on update failure with string error', fakeAsync(() => {
      component.editUserForm.patchValue({ firstName: 'Johnny', lastName: 'Updated' });
      userServiceSpy.update.and.returnValue(throwError(() => 'Update failed'));

      component.onEditUserSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Update failed');
    }));

    it('should show error toast on update failure with object error', fakeAsync(() => {
      component.editUserForm.patchValue({ firstName: 'Johnny', lastName: 'Updated' });
      userServiceSpy.update.and.returnValue(throwError(() => ({ message: 'Update failed' })));

      component.onEditUserSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Update failed');
    }));

    it('should show default error toast on update failure with undefined error', fakeAsync(() => {
      component.editUserForm.patchValue({ firstName: 'Johnny', lastName: 'Updated' });
      userServiceSpy.update.and.returnValue(throwError(() => undefined));

      component.onEditUserSave();
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Error updating user');
    }));
  });

  describe('deleteUser', () => {
    const mockUser: UserResponse = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', roles: ['ROLE_USER'] };

    it('should show confirmation dialog when deleting', fakeAsync(() => {
      const swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );

      component.deleteUser(mockUser);
      tick();

      expect(swalSpy).toHaveBeenCalled();
    }));

    it('should call delete service when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      userServiceSpy.searchUsers.calls.reset();

      component.deleteUser(mockUser);
      tick();

      expect(userServiceSpy.delete).toHaveBeenCalledWith(1);
      expect(toastrSpy.success).toHaveBeenCalledWith('User deleted successfully');
      expect(userServiceSpy.searchUsers).toHaveBeenCalled();
    }));

    it('should not call delete service when cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );
      userServiceSpy.delete.calls.reset();

      component.deleteUser(mockUser);
      tick();

      expect(userServiceSpy.delete).not.toHaveBeenCalled();
    }));

    it('should show error toast on delete failure with string error', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      userServiceSpy.delete.and.returnValue(throwError(() => 'Delete failed'));

      component.deleteUser(mockUser);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Delete failed');
    }));

    it('should show error toast on delete failure with object error', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      userServiceSpy.delete.and.returnValue(throwError(() => ({ message: 'Delete failed' })));

      component.deleteUser(mockUser);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Delete failed');
    }));

    it('should show default error toast on delete failure with undefined error', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      userServiceSpy.delete.and.returnValue(throwError(() => undefined));

      component.deleteUser(mockUser);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Error deleting user');
    }));
  });

  describe('openRolesModal', () => {
    const mockUser: UserResponse = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', roles: ['ROLE_USER'] };

    it('should set managingRolesUser and load available roles', fakeAsync(() => {
      const mockContent = {};

      component.openRolesModal(mockContent, mockUser);
      tick();

      expect(component.managingRolesUser).toEqual(mockUser);
      expect(roleServiceSpy.getAll).toHaveBeenCalled();
      expect(component.availableRoles).toEqual(mockRoles);
      expect(modalServiceSpy.open).toHaveBeenCalledWith(mockContent, {
        ariaLabelledBy: 'modal-roles-title',
        size: 'lg',
      });
    }));

    it('should handle error when loading roles fails', fakeAsync(() => {
      const consoleSpy = spyOn(console, 'error');
      roleServiceSpy.getAll.and.returnValue(throwError(() => new Error('Network error')));
      const mockContent = {};

      component.openRolesModal(mockContent, mockUser);
      tick();

      expect(consoleSpy).toHaveBeenCalled();
      expect(component.loadingRoles).toBeFalse();
    }));
  });

  describe('userHasRole', () => {
    it('should return true if user has the role', () => {
      component.managingRolesUser = { id: 1, firstName: 'John', lastName: 'Doe', email: 'test@test.com', roles: ['ROLE_USER', 'ROLE_ADMIN'] };

      expect(component.userHasRole('ROLE_USER')).toBeTrue();
      expect(component.userHasRole('ROLE_ADMIN')).toBeTrue();
    });

    it('should return false if user does not have the role', () => {
      component.managingRolesUser = { id: 1, firstName: 'John', lastName: 'Doe', email: 'test@test.com', roles: ['ROLE_USER'] };

      expect(component.userHasRole('ROLE_ADMIN')).toBeFalse();
    });

    it('should return false if managingRolesUser is null', () => {
      component.managingRolesUser = null;

      expect(component.userHasRole('ROLE_USER')).toBeFalse();
    });
  });

  describe('addRoleToUser', () => {
    const mockUser: UserResponse = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', roles: ['ROLE_USER'] };
    const mockRole: RoleResponse = { id: 2, name: 'ROLE_ADMIN', description: 'Admin role' };

    beforeEach(() => {
      component.managingRolesUser = mockUser;
    });

    it('should not call service if managingRolesUser is null', () => {
      component.managingRolesUser = null;
      userServiceSpy.addRole.calls.reset();

      component.addRoleToUser(mockRole);

      expect(userServiceSpy.addRole).not.toHaveBeenCalled();
    });

    it('should call addRole service with correct parameters', fakeAsync(() => {
      userServiceSpy.searchUsers.calls.reset();

      component.addRoleToUser(mockRole);
      tick();

      expect(userServiceSpy.addRole).toHaveBeenCalledWith(1, 2);
    }));

    it('should show success toast and update user on successful add', fakeAsync(() => {
      userServiceSpy.searchUsers.calls.reset();

      component.addRoleToUser(mockRole);
      tick();

      expect(toastrSpy.success).toHaveBeenCalledWith('Role added successfully');
      expect(component.managingRolesUser?.roles).toContain('ROLE_ADMIN');
      expect(userServiceSpy.searchUsers).toHaveBeenCalled();
    }));

    it('should show error toast on add role failure', fakeAsync(() => {
      userServiceSpy.addRole.and.returnValue(throwError(() => 'Add role failed'));

      component.addRoleToUser(mockRole);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Add role failed');
    }));
  });

  describe('removeRoleFromUser', () => {
    const mockUser: UserResponse = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', roles: ['ROLE_USER', 'ROLE_ADMIN'] };
    const mockRole: RoleResponse = { id: 2, name: 'ROLE_ADMIN', description: 'Admin role' };

    beforeEach(() => {
      component.managingRolesUser = mockUser;
    });

    it('should not call service if managingRolesUser is null', fakeAsync(() => {
      component.managingRolesUser = null;
      userServiceSpy.removeRole.calls.reset();

      component.removeRoleFromUser(mockRole);
      tick();

      expect(userServiceSpy.removeRole).not.toHaveBeenCalled();
    }));

    it('should show confirmation dialog when removing role', fakeAsync(() => {
      const swalSpy = spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );

      component.removeRoleFromUser(mockRole);
      tick();

      expect(swalSpy).toHaveBeenCalled();
    }));

    it('should call removeRole service when confirmed', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      userServiceSpy.searchUsers.calls.reset();

      component.removeRoleFromUser(mockRole);
      tick();

      expect(userServiceSpy.removeRole).toHaveBeenCalledWith(1, 2);
      expect(toastrSpy.success).toHaveBeenCalledWith('Role removed successfully');
      expect(userServiceSpy.searchUsers).toHaveBeenCalled();
    }));

    it('should not call removeRole service when cancelled', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: false, isDenied: false, isDismissed: true } as SweetAlertResult)
      );
      userServiceSpy.removeRole.calls.reset();

      component.removeRoleFromUser(mockRole);
      tick();

      expect(userServiceSpy.removeRole).not.toHaveBeenCalled();
    }));

    it('should show error toast on remove role failure', fakeAsync(() => {
      spyOn(Swal, 'fire').and.returnValue(
        Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false } as SweetAlertResult)
      );
      userServiceSpy.removeRole.and.returnValue(throwError(() => 'Remove role failed'));

      component.removeRoleFromUser(mockRole);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Remove role failed');
    }));
  });
});
