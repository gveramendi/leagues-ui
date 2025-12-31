import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  CreatePermissionRequest,
  PermissionResponse,
  PermissionService,
  ResourceResponse,
  ResourceService,
  RoleResponse,
  RoleService,
} from '@core';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgxDatatableModule,
    TranslateModule,
  ],
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.scss'],
})
export class RoleDetailComponent implements OnInit {
  role: RoleResponse | null = null;
  roleId: number = 0;

  // Permissions
  permissions: PermissionResponse[] = [];
  filteredPermissions: PermissionResponse[] = [];
  loading = false;

  // Resources
  resources: ResourceResponse[] = [];

  // Add permission form
  permissionForm!: UntypedFormGroup;

  // Edit permission
  editingPermission: PermissionResponse | null = null;
  editPermissionForm!: UntypedFormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private resourceService: ResourceService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.initPermissionForm();
    this.initEditPermissionForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.roleId = +params['id'];
      this.loadRole();
      this.loadPermissions();
      this.loadResources();
    });
  }

  private initPermissionForm(): void {
    this.permissionForm = this.fb.group({
      resourceId: ['', [Validators.required]],
      canCreate: [false],
      canRead: [false],
      canWrite: [false],
      canDelete: [false],
      canExecute: [false],
    });
  }

  private initEditPermissionForm(): void {
    this.editPermissionForm = this.fb.group({
      canCreate: [false],
      canRead: [false],
      canWrite: [false],
      canDelete: [false],
      canExecute: [false],
    });
  }

  private loadRole(): void {
    this.roleService.getById(this.roleId).subscribe({
      next: (response) => {
        this.role = response.body.data;
      },
      error: (error: any) => {
        console.error('Error loading role:', error);
        this.toastr.error('Error loading role');
        this.router.navigate(['/settings/roles/list']);
      },
    });
  }

  loadPermissions(): void {
    this.loading = true;
    this.permissionService.getByRoleId(this.roleId).subscribe({
      next: (response) => {
        this.permissions = response.body.data;
        this.filteredPermissions = [...this.permissions];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading permissions:', error);
        this.loading = false;
      },
    });
  }

  private loadResources(): void {
    this.resourceService.getAll().subscribe({
      next: (response) => {
        this.resources = response.body.data;
      },
      error: (error: any) => {
        console.error('Error loading resources:', error);
      },
    });
  }

  filterDatatable(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredPermissions = this.permissions.filter((row) => {
      return (
        row.resourceCode?.toLowerCase().includes(val) ||
        row.resourceName?.toLowerCase().includes(val)
      );
    });
  }

  getAvailableResources(): ResourceResponse[] {
    const assignedResourceIds = this.permissions.map((p) => p.resourceId);
    return this.resources.filter(
      (resource) => !assignedResourceIds.includes(resource.id)
    );
  }

  openAddModal(content: any): void {
    this.permissionForm.reset({
      resourceId: '',
      canCreate: false,
      canRead: false,
      canWrite: false,
      canDelete: false,
      canExecute: false,
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  onAddPermissionSave(): void {
    if (this.permissionForm.invalid) {
      return;
    }

    const request: CreatePermissionRequest = {
      roleId: this.roleId,
      resourceId: Number(this.permissionForm.value.resourceId),
      canCreate: this.permissionForm.value.canCreate || false,
      canRead: this.permissionForm.value.canRead || false,
      canWrite: this.permissionForm.value.canWrite || false,
      canDelete: this.permissionForm.value.canDelete || false,
      canExecute: this.permissionForm.value.canExecute || false,
    };

    this.permissionService.create(request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.permissionForm.reset();
        this.loadPermissions();
      },
      error: (error: any) => {
        const errorMessage =
          typeof error === 'string'
            ? error
            : error?.message || 'Error adding resource';
        this.toastr.error(errorMessage);
      },
    });
  }

  openEditModal(content: any, permission: PermissionResponse): void {
    this.editingPermission = permission;
    this.editPermissionForm.patchValue({
      canCreate: permission.canCreate,
      canRead: permission.canRead,
      canWrite: permission.canWrite,
      canDelete: permission.canDelete,
      canExecute: permission.canExecute,
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-edit-title',
      size: 'lg',
    });
  }

  onEditPermissionSave(): void {
    if (!this.editingPermission) {
      return;
    }

    const request: CreatePermissionRequest = {
      roleId: this.roleId,
      resourceId: this.editingPermission.resourceId,
      canCreate: this.editPermissionForm.value.canCreate || false,
      canRead: this.editPermissionForm.value.canRead || false,
      canWrite: this.editPermissionForm.value.canWrite || false,
      canDelete: this.editPermissionForm.value.canDelete || false,
      canExecute: this.editPermissionForm.value.canExecute || false,
    };

    this.permissionService
      .update(this.roleId, this.editingPermission.resourceId, request)
      .subscribe({
        next: (response: any) => {
          this.toastr.success(response.header.message);
          this.modalService.dismissAll();
          this.editingPermission = null;
          this.loadPermissions();
        },
        error: (error: any) => {
          const errorMessage =
            typeof error === 'string'
              ? error
              : error?.message || 'Error updating permission';
          this.toastr.error(errorMessage);
        },
      });
  }

  deletePermission(permission: PermissionResponse): void {
    Swal.fire({
      title: this.translate.instant('ROLES.REMOVE_RESOURCE_CONFIRM_TITLE'),
      text: this.translate.instant('ROLES.REMOVE_RESOURCE_CONFIRM_MESSAGE', {
        resource: permission.resourceName,
        role: this.role?.name,
      }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.permissionService
          .delete(this.roleId, permission.resourceId)
          .subscribe({
            next: (response) => {
              this.toastr.success(response.header.message);
              this.loadPermissions();
            },
            error: (error: any) => {
              const errorMessage =
                typeof error === 'string'
                  ? error
                  : error?.message || 'Error removing resource';
              this.toastr.error(errorMessage);
            },
          });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/settings/roles/list']);
  }
}
