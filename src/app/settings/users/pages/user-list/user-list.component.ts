import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  UserService,
} from '@core';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgxDatatableModule,
    TranslateModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  @ViewChild(DatatableComponent) table!: DatatableComponent;

  rows: UserResponse[] = [];
  filteredRows: UserResponse[] = [];
  search = '';
  page = 0;
  size = 10;
  sort = 'firstName,asc';
  totalElements = 0;
  loading = false;

  // Form for creating new user
  userForm!: UntypedFormGroup;

  // Form for editing user
  editUserForm!: UntypedFormGroup;
  editingUser: UserResponse | null = null;

  constructor(
    private userService: UserService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.initForm();
    this.initEditForm();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    });
  }

  private initEditForm(): void {
    this.editUserForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.searchUsers(this.search, this.page, this.size, this.sort).subscribe({
      next: (response) => {
        this.rows = response.body.data;
        this.filteredRows = [...this.rows];
        this.totalElements = response.body.pagination?.totalElements || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      },
    });
  }

  filterDatatable(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredRows = this.rows.filter((row) => {
      return (
        row.firstName?.toLowerCase().includes(val) ||
        row.lastName?.toLowerCase().includes(val) ||
        row.email?.toLowerCase().includes(val) ||
        row.id?.toString().includes(val)
      );
    });

    if (this.table) {
      this.table.offset = 0;
    }
  }

  onPageChange(pageInfo: any): void {
    this.page = pageInfo.offset;
    this.loadUsers();
  }

  onSort(event: any): void {
    const sortColumn = event.sorts[0];
    const direction = sortColumn.dir === 'asc' ? 'asc' : 'desc';
    this.sort = `${sortColumn.prop},${direction}`;
    this.page = 0;
    this.loadUsers();
  }

  // Open modal to add new user
  openAddModal(content: any): void {
    this.userForm.reset();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  // Save new user
  onAddUserSave(): void {
    if (this.userForm.invalid) {
      return;
    }

    const request: CreateUserRequest = {
      firstName: this.userForm.value.firstName,
      lastName: this.userForm.value.lastName,
      email: this.userForm.value.email,
      password: this.userForm.value.password,
    };

    this.userService.create(request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.userForm.reset();
        this.loadUsers();
      },
      error: (error) => {
        let errorMessage = 'Error creating user';
        if (error) {
          errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
        }
        this.toastr.error(errorMessage);
      },
    });
  }

  // Open modal to edit user
  openEditModal(content: any, row: UserResponse): void {
    this.editingUser = row;
    this.editUserForm.patchValue({
      firstName: row.firstName || '',
      lastName: row.lastName || '',
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-edit-title',
      size: 'lg',
    });
  }

  // Save edited user
  onEditUserSave(): void {
    if (this.editUserForm.invalid || !this.editingUser) {
      return;
    }

    const request: UpdateUserRequest = {
      firstName: this.editUserForm.value.firstName,
      lastName: this.editUserForm.value.lastName,
    };

    this.userService.update(this.editingUser.id, request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.editUserForm.reset();
        this.editingUser = null;
        this.loadUsers();
      },
      error: (error) => {
        let errorMessage = 'Error updating user';
        if (error) {
          errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
        }
        this.toastr.error(errorMessage);
      },
    });
  }

  // Delete user with confirmation
  deleteUser(row: UserResponse): void {
    Swal.fire({
      title: this.translate.instant('USERS.DELETE_CONFIRM_TITLE'),
      text: this.translate.instant('USERS.DELETE_CONFIRM_MESSAGE', { name: `${row.firstName} ${row.lastName}` }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.delete(row.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadUsers();
          },
          error: (error) => {
            let errorMessage = 'Error deleting user';
            if (error) {
              errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
            }
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }
}
