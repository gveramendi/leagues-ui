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
import { forkJoin } from 'rxjs';
import {
  CreateResourceRequest,
  PermissionResponse,
  PermissionService,
  ResourceResponse,
  ResourceService,
  ResourceType,
  UpdateResourceRequest,
} from '@core';

@Component({
  selector: 'app-resource-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgxDatatableModule,
    TranslateModule,
  ],
  templateUrl: './resource-list.component.html',
  styleUrls: ['./resource-list.component.scss'],
})
export class ResourceListComponent implements OnInit {
  @ViewChild(DatatableComponent) table!: DatatableComponent;

  rows: ResourceResponse[] = [];
  filteredRows: ResourceResponse[] = [];
  loading = false;

  // Resource types for dropdown
  resourceTypes: ResourceType[] = ['API', 'VIEW'];

  // Form for creating new resource
  resourceForm!: UntypedFormGroup;

  // Form for editing resource
  editResourceForm!: UntypedFormGroup;
  editingResource: ResourceResponse | null = null;

  constructor(
    private resourceService: ResourceService,
    private permissionService: PermissionService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.initForm();
    this.initEditForm();
  }

  ngOnInit(): void {
    this.loadResources();
  }

  private initForm(): void {
    this.resourceForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      type: ['API', [Validators.required]],
    });
  }

  private initEditForm(): void {
    this.editResourceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      type: ['', [Validators.required]],
    });
  }

  loadResources(): void {
    this.loading = true;

    // Load resources and permissions in parallel
    forkJoin({
      resources: this.resourceService.getAll(),
      permissions: this.permissionService.getAll(),
    }).subscribe({
      next: ({ resources, permissions }) => {
        // Create a map of resourceId -> roles
        const resourceRolesMap = this.buildResourceRolesMap(permissions.body.data);

        // Enrich resources with their roles
        this.rows = resources.body.data.map((resource) => ({
          ...resource,
          roles: resourceRolesMap.get(resource.id) || [],
        }));
        this.filteredRows = [...this.rows];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading resources:', error);
        this.loading = false;
      },
    });
  }

  private buildResourceRolesMap(permissions: PermissionResponse[]): Map<number, { id: number; name: string }[]> {
    const map = new Map<number, { id: number; name: string }[]>();

    permissions.forEach((permission) => {
      const existingRoles = map.get(permission.resourceId) || [];
      // Avoid duplicates
      if (!existingRoles.some((r) => r.id === permission.roleId)) {
        existingRoles.push({ id: permission.roleId, name: permission.roleName });
      }
      map.set(permission.resourceId, existingRoles);
    });

    return map;
  }

  filterDatatable(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredRows = this.rows.filter((row) => {
      const rolesMatch = row.roles?.some((role) =>
        role.name?.toLowerCase().includes(val)
      );
      return (
        row.code?.toLowerCase().includes(val) ||
        row.name?.toLowerCase().includes(val) ||
        row.type?.toLowerCase().includes(val) ||
        row.id?.toString().includes(val) ||
        rolesMatch
      );
    });

    if (this.table) {
      this.table.offset = 0;
    }
  }

  // Open modal to add new resource
  openAddModal(content: any): void {
    this.resourceForm.reset({ type: 'API' });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  // Save new resource
  onAddResourceSave(): void {
    if (this.resourceForm.invalid) {
      return;
    }

    const request: CreateResourceRequest = {
      code: this.resourceForm.value.code,
      name: this.resourceForm.value.name,
      type: this.resourceForm.value.type,
    };

    this.resourceService.create(request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.resourceForm.reset({ type: 'API' });
        this.loadResources();
      },
      error: (error) => {
        let errorMessage = 'Error creating resource';
        if (error) {
          errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
        }
        this.toastr.error(errorMessage);
      },
    });
  }

  // Open modal to edit resource
  openEditModal(content: any, row: ResourceResponse): void {
    this.editingResource = row;
    this.editResourceForm.patchValue({
      name: row.name || '',
      type: row.type || 'API',
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-edit-title',
      size: 'lg',
    });
  }

  // Save edited resource
  onEditResourceSave(): void {
    if (this.editResourceForm.invalid || !this.editingResource) {
      return;
    }

    const request: UpdateResourceRequest = {
      name: this.editResourceForm.value.name,
      type: this.editResourceForm.value.type,
    };

    this.resourceService.update(this.editingResource.id, request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.editResourceForm.reset();
        this.editingResource = null;
        this.loadResources();
      },
      error: (error) => {
        let errorMessage = 'Error updating resource';
        if (error) {
          errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
        }
        this.toastr.error(errorMessage);
      },
    });
  }

  // Delete resource with confirmation
  deleteResource(row: ResourceResponse): void {
    Swal.fire({
      title: this.translate.instant('RESOURCES.DELETE_CONFIRM_TITLE'),
      text: this.translate.instant('RESOURCES.DELETE_CONFIRM_MESSAGE', { name: row.name }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.resourceService.delete(row.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadResources();
          },
          error: (error) => {
            let errorMessage = 'Error deleting resource';
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
