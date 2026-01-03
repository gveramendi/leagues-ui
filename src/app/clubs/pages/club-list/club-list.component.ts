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
  ClubResponse,
  ClubService,
  CreateClubRequest,
  UpdateClubRequest,
} from '@core';

@Component({
  selector: 'app-club-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgxDatatableModule,
    TranslateModule,
  ],
  templateUrl: './club-list.component.html',
  styleUrls: ['./club-list.component.scss'],
})
export class ClubListComponent implements OnInit {
  @ViewChild(DatatableComponent) table!: DatatableComponent;

  rows: ClubResponse[] = [];
  filteredRows: ClubResponse[] = [];
  search = '';
  page = 0;
  size = 10;
  sort = 'name,asc';
  totalElements = 0;
  loading = false;

  // Form for creating new club
  clubForm!: UntypedFormGroup;

  // Form for editing club
  editClubForm!: UntypedFormGroup;
  editingClub: ClubResponse | null = null;

  constructor(
    private clubService: ClubService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.initForm();
    this.initEditForm();
  }

  ngOnInit(): void {
    this.loadClubs();
  }

  private initForm(): void {
    this.clubForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      shortName: ['', [Validators.maxLength(50)]],
      foundationDate: [''],
      logoUrl: ['', [Validators.maxLength(500)]],
      colors: ['', [Validators.maxLength(100)]],
      stadiumName: ['', [Validators.maxLength(150)]],
      stadiumCapacity: [null],
      website: ['', [Validators.maxLength(255)]],
      description: [''],
      taxId: ['', [Validators.maxLength(50)]],
      legalRepresentative: ['', [Validators.maxLength(200)]],
      // Address fields
      street: [''],
      number: [''],
      city: [''],
      state: [''],
      country: [''],
      postalCode: [''],
      // Contact fields
      email: ['', [Validators.email]],
      phone: [''],
      mobile: [''],
      contactPerson: [''],
    });
  }

  private initEditForm(): void {
    this.editClubForm = this.fb.group({
      name: ['', [Validators.minLength(2), Validators.maxLength(150)]],
      shortName: ['', [Validators.maxLength(50)]],
      foundationDate: [''],
      logoUrl: ['', [Validators.maxLength(500)]],
      colors: ['', [Validators.maxLength(100)]],
      stadiumName: ['', [Validators.maxLength(150)]],
      stadiumCapacity: [null],
      website: ['', [Validators.maxLength(255)]],
      description: [''],
      taxId: ['', [Validators.maxLength(50)]],
      legalRepresentative: ['', [Validators.maxLength(200)]],
      // Address fields
      street: [''],
      number: [''],
      city: [''],
      state: [''],
      country: [''],
      postalCode: [''],
      // Contact fields
      email: ['', [Validators.email]],
      phone: [''],
      mobile: [''],
      contactPerson: [''],
    });
  }

  loadClubs(): void {
    this.loading = true;
    this.clubService.searchClubs(this.search, this.page, this.size, this.sort).subscribe({
      next: (response) => {
        this.rows = response.body.data;
        this.filteredRows = [...this.rows];
        this.totalElements = response.body.pagination?.totalElements || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading clubs:', error);
        this.loading = false;
      },
    });
  }

  filterDatatable(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredRows = this.rows.filter((row) => {
      return (
        row.code?.toLowerCase().includes(val) ||
        row.name?.toLowerCase().includes(val) ||
        row.shortName?.toLowerCase().includes(val) ||
        row.stadiumName?.toLowerCase().includes(val) ||
        row.id?.toString().includes(val)
      );
    });

    if (this.table) {
      this.table.offset = 0;
    }
  }

  onPageChange(pageInfo: any): void {
    this.page = pageInfo.offset;
    this.loadClubs();
  }

  onSort(event: any): void {
    const sortColumn = event.sorts[0];
    const direction = sortColumn.dir === 'asc' ? 'asc' : 'desc';
    this.sort = `${sortColumn.prop},${direction}`;
    this.page = 0;
    this.loadClubs();
  }

  // Open modal to add new club
  openAddModal(content: any): void {
    this.clubForm.reset();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  // Save new club
  onAddClubSave(): void {
    if (this.clubForm.invalid) {
      return;
    }

    const formValue = this.clubForm.value;
    const request: CreateClubRequest = {
      code: formValue.code,
      name: formValue.name,
      shortName: formValue.shortName || undefined,
      foundationDate: formValue.foundationDate || undefined,
      logoUrl: formValue.logoUrl || undefined,
      colors: formValue.colors || undefined,
      stadiumName: formValue.stadiumName || undefined,
      stadiumCapacity: formValue.stadiumCapacity || undefined,
      website: formValue.website || undefined,
      description: formValue.description || undefined,
      taxId: formValue.taxId || undefined,
      legalRepresentative: formValue.legalRepresentative || undefined,
      address: this.hasAddressData(formValue) ? {
        street: formValue.street || undefined,
        number: formValue.number || undefined,
        city: formValue.city || undefined,
        state: formValue.state || undefined,
        country: formValue.country || undefined,
        postalCode: formValue.postalCode || undefined,
      } : undefined,
      contactInfo: this.hasContactData(formValue) ? {
        email: formValue.email || undefined,
        phone: formValue.phone || undefined,
        mobile: formValue.mobile || undefined,
        contactPerson: formValue.contactPerson || undefined,
      } : undefined,
    };

    this.clubService.create(request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.clubForm.reset();
        this.loadClubs();
      },
      error: (error) => {
        let errorMessage = 'Error creating club';
        if (error) {
          errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
        }
        this.toastr.error(errorMessage);
      },
    });
  }

  // Open modal to edit club
  openEditModal(content: any, row: ClubResponse): void {
    this.editingClub = row;
    this.editClubForm.patchValue({
      name: row.name || '',
      shortName: row.shortName || '',
      foundationDate: row.foundationDate || '',
      logoUrl: row.logoUrl || '',
      colors: row.colors || '',
      stadiumName: row.stadiumName || '',
      stadiumCapacity: row.stadiumCapacity || null,
      website: row.website || '',
      description: row.description || '',
      taxId: row.taxId || '',
      legalRepresentative: row.legalRepresentative || '',
      // Address fields
      street: row.address?.street || '',
      number: row.address?.number || '',
      city: row.address?.city || '',
      state: row.address?.state || '',
      country: row.address?.country || '',
      postalCode: row.address?.postalCode || '',
      // Contact fields
      email: row.contactInfo?.email || '',
      phone: row.contactInfo?.phone || '',
      mobile: row.contactInfo?.mobile || '',
      contactPerson: row.contactInfo?.contactPerson || '',
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-edit-title',
      size: 'lg',
    });
  }

  // Save edited club
  onEditClubSave(): void {
    if (this.editClubForm.invalid || !this.editingClub) {
      return;
    }

    const formValue = this.editClubForm.value;
    const request: UpdateClubRequest = {
      name: formValue.name || undefined,
      shortName: formValue.shortName || undefined,
      foundationDate: formValue.foundationDate || undefined,
      logoUrl: formValue.logoUrl || undefined,
      colors: formValue.colors || undefined,
      stadiumName: formValue.stadiumName || undefined,
      stadiumCapacity: formValue.stadiumCapacity || undefined,
      website: formValue.website || undefined,
      description: formValue.description || undefined,
      taxId: formValue.taxId || undefined,
      legalRepresentative: formValue.legalRepresentative || undefined,
      address: this.hasAddressData(formValue) ? {
        street: formValue.street || undefined,
        number: formValue.number || undefined,
        city: formValue.city || undefined,
        state: formValue.state || undefined,
        country: formValue.country || undefined,
        postalCode: formValue.postalCode || undefined,
      } : undefined,
      contactInfo: this.hasContactData(formValue) ? {
        email: formValue.email || undefined,
        phone: formValue.phone || undefined,
        mobile: formValue.mobile || undefined,
        contactPerson: formValue.contactPerson || undefined,
      } : undefined,
    };

    this.clubService.update(this.editingClub.id, request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.editClubForm.reset();
        this.editingClub = null;
        this.loadClubs();
      },
      error: (error) => {
        let errorMessage = 'Error updating club';
        if (error) {
          errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
        }
        this.toastr.error(errorMessage);
      },
    });
  }

  // Delete club with confirmation
  deleteClub(row: ClubResponse): void {
    Swal.fire({
      title: this.translate.instant('CLUBS.DELETE_CONFIRM_TITLE'),
      text: this.translate.instant('CLUBS.DELETE_CONFIRM_MESSAGE', { name: row.name }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.clubService.delete(row.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadClubs();
          },
          error: (error) => {
            let errorMessage = 'Error deleting club';
            if (error) {
              errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
            }
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  private hasAddressData(formValue: any): boolean {
    return !!(formValue.street || formValue.number || formValue.city ||
              formValue.state || formValue.country || formValue.postalCode);
  }

  private hasContactData(formValue: any): boolean {
    return !!(formValue.email || formValue.phone || formValue.mobile || formValue.contactPerson);
  }
}
