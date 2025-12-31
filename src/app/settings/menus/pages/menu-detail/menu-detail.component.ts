import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  CreateMenuItemRequest,
  MenuItemResponse,
  MenuItemService,
  MenuResponse,
  MenuService,
  ResourceResponse,
  ResourceService,
  UpdateMenuItemRequest,
} from '@core';

@Component({
  selector: 'app-menu-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgxDatatableModule,
    TranslateModule,
  ],
  templateUrl: './menu-detail.component.html',
  styleUrls: ['./menu-detail.component.scss'],
})
export class MenuDetailComponent implements OnInit {
  @ViewChild(DatatableComponent) table!: DatatableComponent;

  menuId!: number;
  menu: MenuResponse | null = null;
  menuItems: MenuItemResponse[] = [];
  filteredMenuItems: MenuItemResponse[] = [];
  loading = false;

  // Resources for dropdown
  resources: ResourceResponse[] = [];

  // Form for creating new menu item
  menuItemForm!: UntypedFormGroup;

  // Form for editing menu item
  editMenuItemForm!: UntypedFormGroup;
  editingMenuItem: MenuItemResponse | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menuService: MenuService,
    private menuItemService: MenuItemService,
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
    this.route.params.subscribe((params) => {
      this.menuId = +params['id'];
      this.loadMenu();
      this.loadMenuItems();
      this.loadResources();
    });
  }

  private initForm(): void {
    this.menuItemForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      parentId: [null],
      resourceId: [null],
      path: ['', [Validators.maxLength(255)]],
      iconType: ['', [Validators.maxLength(50)]],
      icon: ['', [Validators.maxLength(100)]],
      className: ['', [Validators.maxLength(100)]],
      groupTitle: [false],
      badge: ['', [Validators.maxLength(50)]],
      badgeClass: ['', [Validators.maxLength(100)]],
      displayOrder: [1, [Validators.required, Validators.min(0)]],
    });
  }

  private initEditForm(): void {
    this.editMenuItemForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      parentId: [null],
      resourceId: [null],
      path: ['', [Validators.maxLength(255)]],
      iconType: ['', [Validators.maxLength(50)]],
      icon: ['', [Validators.maxLength(100)]],
      className: ['', [Validators.maxLength(100)]],
      groupTitle: [false],
      badge: ['', [Validators.maxLength(50)]],
      badgeClass: ['', [Validators.maxLength(100)]],
      displayOrder: [1, [Validators.required, Validators.min(0)]],
    });
  }

  private loadMenu(): void {
    this.menuService.getById(this.menuId).subscribe({
      next: (response) => {
        this.menu = response.body.data;
      },
      error: (error) => {
        console.error('Error loading menu:', error);
        this.router.navigate(['/settings/menus/list']);
      },
    });
  }

  loadMenuItems(): void {
    this.loading = true;
    this.menuItemService.getByMenuId(this.menuId).subscribe({
      next: (response) => {
        this.menuItems = response.body.data;
        this.filteredMenuItems = [...this.menuItems];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading menu items:', error);
        this.loading = false;
      },
    });
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

  filterDatatable(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredMenuItems = this.menuItems.filter((row) => {
      return (
        row.title?.toLowerCase().includes(val) ||
        row.path?.toLowerCase().includes(val) ||
        row.resourceCode?.toLowerCase().includes(val) ||
        row.id?.toString().includes(val)
      );
    });

    if (this.table) {
      this.table.offset = 0;
    }
  }

  // Get root level menu items (items without parent)
  getRootMenuItems(): MenuItemResponse[] {
    return this.menuItems.filter((item) => !item.parentId);
  }

  // Open modal to add new menu item
  openAddModal(content: any): void {
    this.menuItemForm.reset({
      parentId: null,
      resourceId: null,
      groupTitle: false,
      displayOrder: this.menuItems.length + 1,
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  // Save new menu item
  onAddMenuItemSave(): void {
    if (this.menuItemForm.invalid) {
      return;
    }

    const request: CreateMenuItemRequest = {
      menuId: this.menuId,
      title: this.menuItemForm.value.title,
      parentId: this.menuItemForm.value.parentId || undefined,
      resourceId: this.menuItemForm.value.resourceId || undefined,
      path: this.menuItemForm.value.path || undefined,
      iconType: this.menuItemForm.value.iconType || undefined,
      icon: this.menuItemForm.value.icon || undefined,
      className: this.menuItemForm.value.className || undefined,
      groupTitle: this.menuItemForm.value.groupTitle || false,
      badge: this.menuItemForm.value.badge || undefined,
      badgeClass: this.menuItemForm.value.badgeClass || undefined,
      displayOrder: this.menuItemForm.value.displayOrder,
    };

    this.menuItemService.create(request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.menuItemForm.reset();
        this.loadMenuItems();
      },
      error: (error) => {
        let errorMessage = 'Error creating menu item';
        if (error) {
          errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
        }
        this.toastr.error(errorMessage);
      },
    });
  }

  // Open modal to edit menu item
  openEditModal(content: any, row: MenuItemResponse): void {
    this.editingMenuItem = row;
    this.editMenuItemForm.patchValue({
      title: row.title || '',
      parentId: row.parentId || null,
      resourceId: row.resourceId || null,
      path: row.path || '',
      iconType: row.iconType || '',
      icon: row.icon || '',
      className: row.className || '',
      groupTitle: row.groupTitle || false,
      badge: row.badge || '',
      badgeClass: row.badgeClass || '',
      displayOrder: row.displayOrder,
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-edit-title',
      size: 'lg',
    });
  }

  // Save edited menu item
  onEditMenuItemSave(): void {
    if (this.editMenuItemForm.invalid || !this.editingMenuItem) {
      return;
    }

    const request: UpdateMenuItemRequest = {
      title: this.editMenuItemForm.value.title,
      parentId: this.editMenuItemForm.value.parentId || undefined,
      resourceId: this.editMenuItemForm.value.resourceId || undefined,
      path: this.editMenuItemForm.value.path || undefined,
      iconType: this.editMenuItemForm.value.iconType || undefined,
      icon: this.editMenuItemForm.value.icon || undefined,
      className: this.editMenuItemForm.value.className || undefined,
      groupTitle: this.editMenuItemForm.value.groupTitle || false,
      badge: this.editMenuItemForm.value.badge || undefined,
      badgeClass: this.editMenuItemForm.value.badgeClass || undefined,
      displayOrder: this.editMenuItemForm.value.displayOrder,
    };

    this.menuItemService.update(this.editingMenuItem.id, request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.editMenuItemForm.reset();
        this.editingMenuItem = null;
        this.loadMenuItems();
      },
      error: (error) => {
        let errorMessage = 'Error updating menu item';
        if (error) {
          errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
        }
        this.toastr.error(errorMessage);
      },
    });
  }

  // Delete menu item with confirmation
  deleteMenuItem(row: MenuItemResponse): void {
    Swal.fire({
      title: this.translate.instant('MENU_ITEMS.DELETE_CONFIRM_TITLE'),
      text: this.translate.instant('MENU_ITEMS.DELETE_CONFIRM_MESSAGE', { title: row.title }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.menuItemService.delete(row.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadMenuItems();
          },
          error: (error) => {
            let errorMessage = 'Error deleting menu item';
            if (error) {
              errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
            }
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  // Get parent item title for display
  getParentTitle(parentId: number | undefined): string {
    if (!parentId) return '-';
    const parent = this.menuItems.find((item) => item.id === parentId);
    return parent?.title || '-';
  }

  // Navigate back to menu list
  goBack(): void {
    this.router.navigate(['/settings/menus/list']);
  }
}
