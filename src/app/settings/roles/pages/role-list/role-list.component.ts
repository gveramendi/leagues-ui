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
  CreatePermissionRequest,
  CreateRoleRequest,
  PermissionResponse,
  PermissionService,
  ResourceResponse,
  ResourceService,
  RoleResponse,
  RoleService,
  UpdateRoleRequest,
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

  // Form for editing role
  editRoleForm!: UntypedFormGroup;
  editingRole: RoleResponse | null = null;

  // Resources modal
  viewingRole: RoleResponse | null = null;
  rolePermissions: PermissionResponse[] = [];
  loadingPermissions = false;

  // Add resource modal
  availableResources: ResourceResponse[] = [];
  loadingResources = false;
  addResourceForm!: UntypedFormGroup;

  constructor(
    private roleService: RoleService,
    private permissionService: PermissionService,
    private resourceService: ResourceService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.initForm();
    this.initEditForm();
    this.initAddResourceForm();
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

  private initEditForm(): void {
    this.editRoleForm = this.fb.group({
      description: ['', [Validators.maxLength(255)]],
    });
  }

  private initAddResourceForm(): void {
    this.addResourceForm = this.fb.group({
      resourceId: ['', [Validators.required]],
      canCreate: [false],
      canRead: [false],
      canWrite: [false],
      canDelete: [false],
      canExecute: [false],
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

  // Open modal to edit role
  openEditModal(content: any, row: RoleResponse): void {
    this.editingRole = row;
    this.editRoleForm.patchValue({
      description: row.description || '',
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-edit-title',
      size: 'lg',
    });
  }

  // Save edited role
  onEditRoleSave(): void {
    if (this.editRoleForm.invalid || !this.editingRole) {
      return;
    }

    const request: UpdateRoleRequest = {
      description: this.editRoleForm.value.description,
    };

    this.roleService.update(this.editingRole.id, request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.editRoleForm.reset();
        this.editingRole = null;
        this.loadRoles();
      },
      error: (error) => {
        let errorMessage = 'Error updating role';
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

  // Open modal to view role resources
  openResourcesModal(content: any, row: RoleResponse): void {
    this.viewingRole = row;
    this.rolePermissions = [];
    this.loadingPermissions = true;
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-resources-title',
      size: 'lg',
    });
    this.loadRolePermissions(row.id);
  }

  // Load permissions for a role
  private loadRolePermissions(roleId: number): void {
    this.permissionService.getByRoleId(roleId).subscribe({
      next: (response) => {
        this.rolePermissions = response.body.data;
        this.loadingPermissions = false;
      },
      error: (error) => {
        console.error('Error loading role permissions:', error);
        this.loadingPermissions = false;
        let errorMessage = 'Error loading resources';
        if (error) {
          errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
        }
        this.toastr.error(errorMessage);
      },
    });
  }

  // Open modal to add resource to role
  openAddResourceModal(content: any): void {
    this.addResourceForm.reset({
      resourceId: '',
      canCreate: false,
      canRead: false,
      canWrite: false,
      canDelete: false,
      canExecute: false,
    });
    this.loadAvailableResources();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-add-resource-title',
      size: 'lg',
    });
  }

  // Load available resources (excluding already assigned ones)
  private loadAvailableResources(): void {
    this.loadingResources = true;
    this.resourceService.getAll().subscribe({
      next: (response) => {
        const assignedResourceIds = this.rolePermissions.map((p) => p.resourceId);
        this.availableResources = response.body.data.filter(
          (resource) => !assignedResourceIds.includes(resource.id)
        );
        this.loadingResources = false;
      },
      error: (error) => {
        console.error('Error loading resources:', error);
        this.loadingResources = false;
      },
    });
  }

  // Save new resource permission
  onAddResourceSave(): void {
    if (this.addResourceForm.invalid || !this.viewingRole) {
      return;
    }

    const request: CreatePermissionRequest = {
      roleId: this.viewingRole.id,
      resourceId: Number(this.addResourceForm.value.resourceId),
      canCreate: this.addResourceForm.value.canCreate || false,
      canRead: this.addResourceForm.value.canRead || false,
      canWrite: this.addResourceForm.value.canWrite || false,
      canDelete: this.addResourceForm.value.canDelete || false,
      canExecute: this.addResourceForm.value.canExecute || false,
    };

    this.permissionService.create(request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.addResourceForm.reset();
        // Reload permissions for the current role
        if (this.viewingRole) {
          this.loadRolePermissions(this.viewingRole.id);
        }
      },
      error: (error) => {
        let errorMessage = 'Error adding resource';
        if (error) {
          errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
        }
        this.toastr.error(errorMessage);
      },
    });
  }

  // Remove resource from role with confirmation
  removeResource(permission: PermissionResponse): void {
    if (!this.viewingRole) {
      return;
    }

    Swal.fire({
      title: this.translate.instant('ROLES.REMOVE_RESOURCE_CONFIRM_TITLE'),
      text: this.translate.instant('ROLES.REMOVE_RESOURCE_CONFIRM_MESSAGE', {
        resource: permission.resourceName,
        role: this.viewingRole.name,
      }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed && this.viewingRole) {
        this.permissionService.delete(this.viewingRole.id, permission.resourceId).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            // Reload permissions for the current role
            if (this.viewingRole) {
              this.loadRolePermissions(this.viewingRole.id);
            }
          },
          error: (error) => {
            let errorMessage = 'Error removing resource';
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
