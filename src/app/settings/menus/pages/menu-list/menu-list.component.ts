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
  CreateMenuRequest,
  MenuResponse,
  MenuService,
  ResourceResponse,
  ResourceService,
  UpdateMenuRequest,
} from '@core';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgxDatatableModule,
    TranslateModule,
  ],
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.scss'],
})
export class MenuListComponent implements OnInit {
  @ViewChild(DatatableComponent) table!: DatatableComponent;

  rows: MenuResponse[] = [];
  filteredRows: MenuResponse[] = [];
  search = '';
  page = 0;
  size = 10;
  sort = 'title,asc';
  totalElements = 0;
  loading = false;

  // Form for creating new menu
  menuForm!: UntypedFormGroup;

  // Form for editing menu
  editMenuForm!: UntypedFormGroup;
  editingMenu: MenuResponse | null = null;

  // Resources for dropdown
  resources: ResourceResponse[] = [];

  constructor(
    private menuService: MenuService,
    private resourceService: ResourceService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.initForm();
    this.initEditForm();
  }

  ngOnInit(): void {
    this.loadMenus();
    this.loadResources();
  }

  private loadResources(): void {
    this.resourceService.getAll().subscribe({
      next: (response) => {
        this.resources = response.body.data;
      },
      error: (error) => {
        console.error('Error loading resources:', error);
      },
    });
  }

  private initForm(): void {
    this.menuForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      resourceId: [null, [Validators.required]],
      path: ['', [Validators.maxLength(255)]],
      iconType: ['', [Validators.maxLength(50)]],
      icon: ['', [Validators.maxLength(100)]],
      className: ['', [Validators.maxLength(100)]],
      groupTitle: [false],
      groupName: ['', [Validators.maxLength(100)]],
      badge: ['', [Validators.maxLength(50)]],
      badgeClass: ['', [Validators.maxLength(100)]],
    });
  }

  private initEditForm(): void {
    this.editMenuForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      path: ['', [Validators.maxLength(255)]],
      iconType: ['', [Validators.maxLength(50)]],
      icon: ['', [Validators.maxLength(100)]],
      className: ['', [Validators.maxLength(100)]],
      groupTitle: [false],
      groupName: ['', [Validators.maxLength(100)]],
      badge: ['', [Validators.maxLength(50)]],
      badgeClass: ['', [Validators.maxLength(100)]],
    });
  }

  loadMenus(): void {
    this.loading = true;
    this.menuService.searchMenus(this.search, this.page, this.size, this.sort).subscribe({
      next: (response) => {
        this.rows = response.body.data;
        this.filteredRows = [...this.rows];
        this.totalElements = response.body.pagination?.totalElements || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading menus:', error);
        this.loading = false;
      },
    });
  }

  filterDatatable(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredRows = this.rows.filter((row) => {
      return (
        row.code?.toLowerCase().includes(val) ||
        row.title?.toLowerCase().includes(val) ||
        row.path?.toLowerCase().includes(val) ||
        row.groupName?.toLowerCase().includes(val) ||
        row.id?.toString().includes(val)
      );
    });

    if (this.table) {
      this.table.offset = 0;
    }
  }

  onPageChange(pageInfo: any): void {
    this.page = pageInfo.offset;
    this.loadMenus();
  }

  onSort(event: any): void {
    const sortColumn = event.sorts[0];
    const direction = sortColumn.dir === 'asc' ? 'asc' : 'desc';
    this.sort = `${sortColumn.prop},${direction}`;
    this.page = 0;
    this.loadMenus();
  }

  // Open modal to add new menu
  openAddModal(content: any): void {
    this.menuForm.reset({
      resourceId: null,
      groupTitle: false,
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  // Save new menu
  onAddMenuSave(): void {
    if (this.menuForm.invalid) {
      return;
    }

    const request: CreateMenuRequest = {
      code: this.menuForm.value.code,
      title: this.menuForm.value.title,
      resourceId: this.menuForm.value.resourceId,
      path: this.menuForm.value.path || undefined,
      iconType: this.menuForm.value.iconType || undefined,
      icon: this.menuForm.value.icon || undefined,
      className: this.menuForm.value.className || undefined,
      groupTitle: this.menuForm.value.groupTitle || false,
      groupName: this.menuForm.value.groupName || undefined,
      badge: this.menuForm.value.badge || undefined,
      badgeClass: this.menuForm.value.badgeClass || undefined,
    };

    this.menuService.create(request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.menuForm.reset();
        this.loadMenus();
      },
      error: (error) => {
        let errorMessage = 'Error creating menu';
        if (error) {
          errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
        }
        this.toastr.error(errorMessage);
      },
    });
  }

  // Open modal to edit menu
  openEditModal(content: any, row: MenuResponse): void {
    this.editingMenu = row;
    this.editMenuForm.patchValue({
      title: row.title || '',
      path: row.path || '',
      iconType: row.iconType || '',
      icon: row.icon || '',
      className: row.className || '',
      groupTitle: row.groupTitle || false,
      groupName: row.groupName || '',
      badge: row.badge || '',
      badgeClass: row.badgeClass || '',
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-edit-title',
      size: 'lg',
    });
  }

  // Save edited menu
  onEditMenuSave(): void {
    if (this.editMenuForm.invalid || !this.editingMenu) {
      return;
    }

    const request: UpdateMenuRequest = {
      title: this.editMenuForm.value.title,
      path: this.editMenuForm.value.path || undefined,
      iconType: this.editMenuForm.value.iconType || undefined,
      icon: this.editMenuForm.value.icon || undefined,
      className: this.editMenuForm.value.className || undefined,
      groupTitle: this.editMenuForm.value.groupTitle || false,
      groupName: this.editMenuForm.value.groupName || undefined,
      badge: this.editMenuForm.value.badge || undefined,
      badgeClass: this.editMenuForm.value.badgeClass || undefined,
    };

    this.menuService.update(this.editingMenu.id, request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.editMenuForm.reset();
        this.editingMenu = null;
        this.loadMenus();
      },
      error: (error) => {
        let errorMessage = 'Error updating menu';
        if (error) {
          errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
        }
        this.toastr.error(errorMessage);
      },
    });
  }

  // Delete menu with confirmation
  deleteMenu(row: MenuResponse): void {
    Swal.fire({
      title: this.translate.instant('MENUS.DELETE_CONFIRM_TITLE'),
      text: this.translate.instant('MENUS.DELETE_CONFIRM_MESSAGE', { title: row.title }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.menuService.delete(row.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadMenus();
          },
          error: (error) => {
            let errorMessage = 'Error deleting menu';
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
