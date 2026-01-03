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
  TeamResponse,
  TeamService,
  StaffMemberResponse,
  StaffMemberService,
  CreateStaffMemberRequest,
  UpdateStaffMemberRequest,
  StaffRole,
} from '@core';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgxDatatableModule,
    TranslateModule,
  ],
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss'],
})
export class TeamDetailComponent implements OnInit {
  team: TeamResponse | null = null;
  teamId: number = 0;
  clubId: number = 0;

  // Staff Members
  staffMembers: StaffMemberResponse[] = [];
  filteredStaffMembers: StaffMemberResponse[] = [];
  loading = false;

  // Add staff member form
  staffForm!: UntypedFormGroup;

  // Edit staff member form
  editStaffForm!: UntypedFormGroup;
  editingStaff: StaffMemberResponse | null = null;

  // Dropdown options
  staffRoles: StaffRole[] = [
    'HEAD_COACH',
    'ASSISTANT_COACH',
    'GOALKEEPER_COACH',
    'FITNESS_COACH',
    'TEAM_MANAGER',
    'TEAM_DOCTOR',
    'PHYSIOTHERAPIST',
    'ANALYST',
    'EQUIPMENT_MANAGER',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private staffMemberService: StaffMemberService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.initStaffForm();
    this.initEditStaffForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.clubId = +params['clubId'];
      this.teamId = +params['teamId'];
      this.loadTeam();
      this.loadStaffMembers();
    });
  }

  private initStaffForm(): void {
    this.staffForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      role: ['', [Validators.required]],
      documentType: [''],
      documentNumber: [''],
      birthDate: [''],
      nationality: [''],
      licenseNumber: [''],
      email: ['', [Validators.email]],
      phone: [''],
      photoUrl: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  private initEditStaffForm(): void {
    this.editStaffForm = this.fb.group({
      firstName: ['', [Validators.minLength(2), Validators.maxLength(100)]],
      lastName: ['', [Validators.minLength(2), Validators.maxLength(100)]],
      role: [''],
      documentType: [''],
      documentNumber: [''],
      birthDate: [''],
      nationality: [''],
      licenseNumber: [''],
      email: ['', [Validators.email]],
      phone: [''],
      photoUrl: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  private loadTeam(): void {
    this.teamService.getById(this.teamId).subscribe({
      next: (response) => {
        this.team = response.body.data;
      },
      error: (error) => {
        console.error('Error loading team:', error);
        this.toastr.error('Error loading team');
        this.router.navigate(['/clubs', this.clubId]);
      },
    });
  }

  loadStaffMembers(): void {
    this.loading = true;
    this.staffMemberService.getByTeam(this.teamId).subscribe({
      next: (response) => {
        this.staffMembers = response.body.data;
        this.filteredStaffMembers = [...this.staffMembers];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading staff members:', error);
        this.loading = false;
      },
    });
  }

  filterDatatable(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredStaffMembers = this.staffMembers.filter((row) => {
      return (
        row.firstName?.toLowerCase().includes(val) ||
        row.lastName?.toLowerCase().includes(val) ||
        row.fullName?.toLowerCase().includes(val) ||
        row.role?.toLowerCase().includes(val) ||
        row.email?.toLowerCase().includes(val)
      );
    });
  }

  openAddModal(content: any): void {
    this.staffForm.reset({
      firstName: '',
      lastName: '',
      role: '',
      documentType: '',
      documentNumber: '',
      birthDate: '',
      nationality: '',
      licenseNumber: '',
      email: '',
      phone: '',
      photoUrl: '',
      startDate: '',
      endDate: '',
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  onAddStaffSave(): void {
    if (this.staffForm.invalid) {
      return;
    }

    const formValue = this.staffForm.value;
    const request: CreateStaffMemberRequest = {
      teamId: this.teamId,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      role: formValue.role,
      documentType: formValue.documentType || undefined,
      documentNumber: formValue.documentNumber || undefined,
      birthDate: formValue.birthDate || undefined,
      nationality: formValue.nationality || undefined,
      licenseNumber: formValue.licenseNumber || undefined,
      email: formValue.email || undefined,
      phone: formValue.phone || undefined,
      photoUrl: formValue.photoUrl || undefined,
      startDate: formValue.startDate || undefined,
      endDate: formValue.endDate || undefined,
    };

    this.staffMemberService.create(request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.staffForm.reset();
        this.loadStaffMembers();
      },
      error: (error) => {
        const errorMessage =
          typeof error === 'string'
            ? error
            : error?.message || 'Error creating staff member';
        this.toastr.error(errorMessage);
      },
    });
  }

  openEditModal(content: any, staff: StaffMemberResponse): void {
    this.editingStaff = staff;
    this.editStaffForm.patchValue({
      firstName: staff.firstName || '',
      lastName: staff.lastName || '',
      role: staff.role || '',
      documentType: staff.documentType || '',
      documentNumber: staff.documentNumber || '',
      birthDate: staff.birthDate || '',
      nationality: staff.nationality || '',
      licenseNumber: staff.licenseNumber || '',
      email: staff.email || '',
      phone: staff.phone || '',
      photoUrl: staff.photoUrl || '',
      startDate: staff.startDate || '',
      endDate: staff.endDate || '',
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-edit-title',
      size: 'lg',
    });
  }

  onEditStaffSave(): void {
    if (this.editStaffForm.invalid || !this.editingStaff) {
      return;
    }

    const formValue = this.editStaffForm.value;
    const request: UpdateStaffMemberRequest = {
      firstName: formValue.firstName || undefined,
      lastName: formValue.lastName || undefined,
      role: formValue.role || undefined,
      documentType: formValue.documentType || undefined,
      documentNumber: formValue.documentNumber || undefined,
      birthDate: formValue.birthDate || undefined,
      nationality: formValue.nationality || undefined,
      licenseNumber: formValue.licenseNumber || undefined,
      email: formValue.email || undefined,
      phone: formValue.phone || undefined,
      photoUrl: formValue.photoUrl || undefined,
      startDate: formValue.startDate || undefined,
      endDate: formValue.endDate || undefined,
    };

    this.staffMemberService.update(this.editingStaff.id, request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.editingStaff = null;
        this.loadStaffMembers();
      },
      error: (error) => {
        const errorMessage =
          typeof error === 'string'
            ? error
            : error?.message || 'Error updating staff member';
        this.toastr.error(errorMessage);
      },
    });
  }

  deleteStaff(staff: StaffMemberResponse): void {
    Swal.fire({
      title: this.translate.instant('STAFF.DELETE_CONFIRM_TITLE'),
      text: this.translate.instant('STAFF.DELETE_CONFIRM_MESSAGE', { name: staff.fullName }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.staffMemberService.delete(staff.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadStaffMembers();
          },
          error: (error) => {
            const errorMessage =
              typeof error === 'string'
                ? error
                : error?.message || 'Error deleting staff member';
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/clubs', this.clubId]);
  }

  getRoleLabel(role: StaffRole): string {
    const labels: Record<StaffRole, string> = {
      'HEAD_COACH': this.translate.instant('STAFF.ROLE_HEAD_COACH'),
      'ASSISTANT_COACH': this.translate.instant('STAFF.ROLE_ASSISTANT_COACH'),
      'GOALKEEPER_COACH': this.translate.instant('STAFF.ROLE_GOALKEEPER_COACH'),
      'FITNESS_COACH': this.translate.instant('STAFF.ROLE_FITNESS_COACH'),
      'TEAM_MANAGER': this.translate.instant('STAFF.ROLE_TEAM_MANAGER'),
      'TEAM_DOCTOR': this.translate.instant('STAFF.ROLE_TEAM_DOCTOR'),
      'PHYSIOTHERAPIST': this.translate.instant('STAFF.ROLE_PHYSIOTHERAPIST'),
      'ANALYST': this.translate.instant('STAFF.ROLE_ANALYST'),
      'EQUIPMENT_MANAGER': this.translate.instant('STAFF.ROLE_EQUIPMENT_MANAGER'),
    };
    return labels[role] || role;
  }

  getActiveStatusClass(isActive: boolean | undefined): string {
    return isActive ? 'badge bg-success' : 'badge bg-secondary';
  }

  getActiveStatusLabel(isActive: boolean | undefined): string {
    return isActive
      ? this.translate.instant('STAFF.STATUS_ACTIVE')
      : this.translate.instant('STAFF.STATUS_INACTIVE');
  }
}
