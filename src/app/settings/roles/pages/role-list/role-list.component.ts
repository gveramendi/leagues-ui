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
  CreateRoleRequest,
  RoleResponse,
  RoleService,
} from '@core';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgxDatatableModule,
    TranslateModule,
  ],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss'],
})
export class RoleListComponent implements OnInit {
  @ViewChild(DatatableComponent) table!: DatatableComponent;

  rows: RoleResponse[] = [];
  filteredRows: RoleResponse[] = [];
  search = '';
  page = 0;
  size = 10;
  sort = 'name,asc';
  totalElements = 0;
  loading = false;

  // Form for creating new role
  roleForm!: UntypedFormGroup;

  constructor(
    private roleService: RoleService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  private initForm(): void {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(255)]],
    });
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.searchRoles(this.search, this.page, this.size, this.sort).subscribe({
      next: (response) => {
        this.rows = response.body.data;
        this.filteredRows = [...this.rows];
        this.totalElements = response.body.pagination?.totalElements || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.loading = false;
      },
    });
  }

  filterDatatable(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredRows = this.rows.filter((row) => {
      return (
        row.name?.toLowerCase().includes(val) ||
        row.description?.toLowerCase().includes(val) ||
        row.id?.toString().includes(val)
      );
    });

    if (this.table) {
      this.table.offset = 0;
    }
  }

  onPageChange(pageInfo: any): void {
    this.page = pageInfo.offset;
    this.loadRoles();
  }

  onSort(event: any): void {
    const sortColumn = event.sorts[0];
    const direction = sortColumn.dir === 'asc' ? 'asc' : 'desc';
    this.sort = `${sortColumn.prop},${direction}`;
    this.page = 0;
    this.loadRoles();
  }

  // Open modal to add new role
  openAddModal(content: any): void {
    this.roleForm.reset();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  // Save new role
  onAddRoleSave(): void {
    if (this.roleForm.invalid) {
      return;
    }

    const request: CreateRoleRequest = {
      name: this.roleForm.value.name,
      description: this.roleForm.value.description,
    };

    this.roleService.create(request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.roleForm.reset();
        this.loadRoles();
      },
      error: (error) => {
        let errorMessage = 'Error creating role';
        if (error) {
          errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
        }
        this.toastr.error(errorMessage);
      },
    });
  }

  // Delete role with confirmation
  deleteRole(row: RoleResponse): void {
    Swal.fire({
      title: this.translate.instant('ROLES.DELETE_CONFIRM_TITLE'),
      text: this.translate.instant('ROLES.DELETE_CONFIRM_MESSAGE', { name: row.name }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.roleService.delete(row.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadRoles();
          },
          error: (error) => {
            let errorMessage = 'Error deleting role';
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
