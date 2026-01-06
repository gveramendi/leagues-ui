import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

import {
  RefereeService,
  RefereeResponse,
  CreateRefereeRequest,
  UpdateRefereeRequest,
  RefereeCategory,
} from '@core';

@Component({
  selector: 'app-referee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgxDatatableModule,
    TranslateModule,
  ],
  templateUrl: './referee-list.component.html',
  styleUrls: ['./referee-list.component.scss'],
})
export class RefereeListComponent implements OnInit {
  @ViewChild(DatatableComponent) table!: DatatableComponent;

  rows: RefereeResponse[] = [];
  filteredRows: RefereeResponse[] = [];
  page = 0;
  size = 10;
  totalElements = 0;
  loading = false;

  // Filters
  searchQuery = '';
  selectedCategory: RefereeCategory | null = null;

  refereeForm!: UntypedFormGroup;
  editRefereeForm!: UntypedFormGroup;
  editingReferee: RefereeResponse | null = null;

  categories: RefereeCategory[] = ['FIFA', 'NATIONAL', 'REGIONAL', 'LOCAL', 'TRAINEE'];

  categoryLabels: Record<RefereeCategory, string> = {
    FIFA: 'REFEREES.CATEGORY_FIFA',
    NATIONAL: 'REFEREES.CATEGORY_NATIONAL',
    REGIONAL: 'REFEREES.CATEGORY_REGIONAL',
    LOCAL: 'REFEREES.CATEGORY_LOCAL',
    TRAINEE: 'REFEREES.CATEGORY_TRAINEE',
  };

  constructor(
    private refereeService: RefereeService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initEditForm();
    this.loadReferees();
  }

  private initForm(): void {
    this.refereeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      documentNumber: ['', [Validators.maxLength(20)]],
      licenseNumber: ['', [Validators.required, Validators.maxLength(50)]],
      category: ['', [Validators.required]],
      dateOfBirth: [''],
      nationality: [''],
      phone: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      licenseExpiration: [''],
      photoUrl: ['', [Validators.maxLength(500)]],
    });
  }

  private initEditForm(): void {
    this.editRefereeForm = this.fb.group({
      firstName: ['', [Validators.minLength(2), Validators.maxLength(100)]],
      lastName: ['', [Validators.minLength(2), Validators.maxLength(100)]],
      documentNumber: ['', [Validators.maxLength(20)]],
      category: [''],
      dateOfBirth: [''],
      nationality: [''],
      phone: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      licenseExpiration: [''],
      photoUrl: ['', [Validators.maxLength(500)]],
    });
  }

  loadReferees(): void {
    this.loading = true;

    // Determine which endpoint to use based on filters
    let request$;
    if (this.searchQuery && this.searchQuery.length >= 2) {
      request$ = this.refereeService.search(this.searchQuery, this.page, this.size);
    } else if (this.selectedCategory) {
      request$ = this.refereeService.getByCategory(this.selectedCategory, this.page, this.size);
    } else {
      request$ = this.refereeService.getAll(this.page, this.size);
    }

    request$.subscribe({
      next: (response) => {
        this.rows = response.body.data;
        this.filteredRows = [...this.rows];
        this.totalElements = response.body.pagination?.totalElements || this.rows.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading referees:', error);
        this.loading = false;
      },
    });
  }

  onSearchChange(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.page = 0;
    if (this.table) {
      this.table.offset = 0;
    }
    this.loadReferees();
  }

  onCategoryChange(): void {
    this.page = 0;
    if (this.table) {
      this.table.offset = 0;
    }
    this.loadReferees();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.page = 0;
    if (this.table) {
      this.table.offset = 0;
    }
    this.loadReferees();
  }

  onPageChange(pageInfo: any): void {
    this.page = pageInfo.offset;
    this.loadReferees();
  }

  getCategoryLabel(category: RefereeCategory): string {
    return this.translate.instant(this.categoryLabels[category] || category);
  }

  getCategoryClass(category: RefereeCategory): string {
    const classes: Record<RefereeCategory, string> = {
      FIFA: 'bg-primary',
      NATIONAL: 'bg-success',
      REGIONAL: 'bg-info',
      LOCAL: 'bg-secondary',
      TRAINEE: 'bg-warning',
    };
    return classes[category] || 'bg-secondary';
  }

  // Modal handlers
  openAddModal(content: any): void {
    this.refereeForm.reset();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  openEditModal(content: any, row: RefereeResponse): void {
    this.editingReferee = row;
    this.editRefereeForm.patchValue({
      firstName: row.firstName,
      lastName: row.lastName,
      documentNumber: row.documentNumber,
      category: row.category,
      dateOfBirth: row.dateOfBirth,
      nationality: row.nationality,
      phone: row.phone,
      email: row.email,
      licenseExpiration: row.licenseExpiration,
      photoUrl: row.photoUrl,
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-edit-title',
      size: 'lg',
    });
  }

  onAddRefereeSave(): void {
    if (this.refereeForm.invalid) {
      this.refereeForm.markAllAsTouched();
      return;
    }

    const formValue = this.refereeForm.value;
    const request: CreateRefereeRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      documentNumber: formValue.documentNumber || undefined,
      licenseNumber: formValue.licenseNumber,
      category: formValue.category,
      dateOfBirth: formValue.dateOfBirth || undefined,
      nationality: formValue.nationality || undefined,
      phone: formValue.phone || undefined,
      email: formValue.email || undefined,
      licenseExpiration: formValue.licenseExpiration || undefined,
      photoUrl: formValue.photoUrl || undefined,
    };

    this.refereeService.create(request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.refereeForm.reset();
        this.loadReferees();
      },
      error: (error) => {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
        this.toastr.error(errorMessage);
      },
    });
  }

  onEditRefereeSave(): void {
    if (this.editRefereeForm.invalid || !this.editingReferee) {
      this.editRefereeForm.markAllAsTouched();
      return;
    }

    const formValue = this.editRefereeForm.value;
    const request: UpdateRefereeRequest = {
      firstName: formValue.firstName || undefined,
      lastName: formValue.lastName || undefined,
      documentNumber: formValue.documentNumber || undefined,
      category: formValue.category || undefined,
      dateOfBirth: formValue.dateOfBirth || undefined,
      nationality: formValue.nationality || undefined,
      phone: formValue.phone || undefined,
      email: formValue.email || undefined,
      licenseExpiration: formValue.licenseExpiration || undefined,
      photoUrl: formValue.photoUrl || undefined,
    };

    this.refereeService.update(this.editingReferee.id, request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.editingReferee = null;
        this.loadReferees();
      },
      error: (error) => {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
        this.toastr.error(errorMessage);
      },
    });
  }

  deleteReferee(row: RefereeResponse): void {
    Swal.fire({
      title: this.translate.instant('REFEREES.DELETE_CONFIRM_TITLE'),
      text: this.translate.instant('REFEREES.DELETE_CONFIRM_MESSAGE', { name: row.fullName }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.refereeService.delete(row.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadReferees();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }
}
