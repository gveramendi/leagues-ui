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
import { NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
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
  PlayerRegistrationResponse,
  PlayerRegistrationService,
  CreatePlayerRegistrationRequest,
  UpdatePlayerRegistrationRequest,
  Position,
  PlayerStatus,
  PlayerService,
  PlayerResponse,
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
    NgbNavModule,
  ],
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss'],
})
export class TeamDetailComponent implements OnInit {
  team: TeamResponse | null = null;
  teamId: number = 0;
  clubId: number = 0;
  activeTab = 1;

  // Staff Members
  staffMembers: StaffMemberResponse[] = [];
  filteredStaffMembers: StaffMemberResponse[] = [];
  loadingStaff = false;

  // Player Registrations (players in team)
  playerRegistrations: PlayerRegistrationResponse[] = [];
  filteredPlayerRegistrations: PlayerRegistrationResponse[] = [];
  loadingPlayers = false;

  // Available players for registration (from search)
  availablePlayers: PlayerResponse[] = [];
  loadingAvailablePlayers = false;

  // Add staff member form
  staffForm!: UntypedFormGroup;

  // Edit staff member form
  editStaffForm!: UntypedFormGroup;
  editingStaff: StaffMemberResponse | null = null;

  // Add player registration form
  playerRegistrationForm!: UntypedFormGroup;

  // Edit player registration form
  editPlayerRegistrationForm!: UntypedFormGroup;
  editingPlayerRegistration: PlayerRegistrationResponse | null = null;

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

  positions: Position[] = [
    'GOALKEEPER',
    'CENTER_BACK',
    'LEFT_BACK',
    'RIGHT_BACK',
    'SWEEPER',
    'DEFENSIVE_MIDFIELDER',
    'CENTRAL_MIDFIELDER',
    'ATTACKING_MIDFIELDER',
    'LEFT_MIDFIELDER',
    'RIGHT_MIDFIELDER',
    'LEFT_WINGER',
    'RIGHT_WINGER',
    'CENTER_FORWARD',
    'STRIKER',
    'SECOND_STRIKER',
  ];

  playerStatuses: PlayerStatus[] = [
    'ACTIVE',
    'INJURED',
    'SUSPENDED',
    'ON_LOAN',
    'INACTIVE',
    'TRANSFERRED',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private staffMemberService: StaffMemberService,
    private playerRegistrationService: PlayerRegistrationService,
    private playerService: PlayerService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.initStaffForm();
    this.initEditStaffForm();
    this.initPlayerRegistrationForm();
    this.initEditPlayerRegistrationForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.clubId = +params['clubId'];
      this.teamId = +params['teamId'];
      this.loadTeam();
      this.loadStaffMembers();
    });
  }

  // ==================== Staff Members ====================

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
        // Load players after we know the season year
        if (this.team?.seasonYear) {
          this.loadPlayerRegistrations();
        }
      },
      error: (error) => {
        console.error('Error loading team:', error);
        this.toastr.error('Error loading team');
        this.router.navigate(['/clubs', this.clubId]);
      },
    });
  }

  loadStaffMembers(): void {
    this.loadingStaff = true;
    this.staffMemberService.getByTeam(this.teamId).subscribe({
      next: (response) => {
        this.staffMembers = response.body.data;
        this.filteredStaffMembers = [...this.staffMembers];
        this.loadingStaff = false;
      },
      error: (error) => {
        console.error('Error loading staff members:', error);
        this.loadingStaff = false;
      },
    });
  }

  filterStaffDatatable(event: Event): void {
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

  openAddStaffModal(content: any): void {
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

  openEditStaffModal(content: any, staff: StaffMemberResponse): void {
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

  // ==================== Player Registrations ====================

  private initPlayerRegistrationForm(): void {
    this.playerRegistrationForm = this.fb.group({
      playerId: ['', [Validators.required]],
      jerseyNumber: ['', [Validators.min(1), Validators.max(99)]],
      position: [''],
      status: ['ACTIVE', [Validators.required]],
      registrationDate: ['', [Validators.required]],
      endDate: [''],
      isCaptain: [false],
      isViceCaptain: [false],
      contractStart: [''],
      contractEnd: [''],
      notes: [''],
    });
  }

  private initEditPlayerRegistrationForm(): void {
    this.editPlayerRegistrationForm = this.fb.group({
      jerseyNumber: ['', [Validators.min(1), Validators.max(99)]],
      position: [''],
      status: [''],
      endDate: [''],
      isCaptain: [false],
      isViceCaptain: [false],
      contractStart: [''],
      contractEnd: [''],
      notes: [''],
    });
  }

  loadPlayerRegistrations(): void {
    if (!this.team?.seasonYear) return;

    this.loadingPlayers = true;
    this.playerRegistrationService.getByTeam(this.teamId, this.team.seasonYear).subscribe({
      next: (response) => {
        this.playerRegistrations = response.body.data;
        this.filteredPlayerRegistrations = [...this.playerRegistrations];
        this.loadingPlayers = false;
      },
      error: (error) => {
        console.error('Error loading player registrations:', error);
        this.loadingPlayers = false;
      },
    });
  }

  filterPlayerDatatable(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredPlayerRegistrations = this.playerRegistrations.filter((row) => {
      return (
        row.playerFullName?.toLowerCase().includes(val) ||
        row.positionDisplayName?.toLowerCase().includes(val) ||
        row.jerseyNumber?.toString().includes(val)
      );
    });
  }

  searchPlayers(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    if (val.length < 2) {
      this.availablePlayers = [];
      return;
    }

    this.loadingAvailablePlayers = true;
    this.playerService.search(val, 0, 10).subscribe({
      next: (response) => {
        this.availablePlayers = response.body.data;
        this.loadingAvailablePlayers = false;
      },
      error: (error) => {
        console.error('Error searching players:', error);
        this.loadingAvailablePlayers = false;
      },
    });
  }

  openAddPlayerRegistrationModal(content: any): void {
    const today = new Date().toISOString().split('T')[0];
    this.playerRegistrationForm.reset({
      playerId: '',
      jerseyNumber: '',
      position: '',
      status: 'ACTIVE',
      registrationDate: today,
      endDate: '',
      isCaptain: false,
      isViceCaptain: false,
      contractStart: '',
      contractEnd: '',
      notes: '',
    });
    this.availablePlayers = [];
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-player-title',
      size: 'lg',
    });
  }

  onAddPlayerRegistrationSave(): void {
    if (this.playerRegistrationForm.invalid || !this.team) {
      return;
    }

    const formValue = this.playerRegistrationForm.value;
    const request: CreatePlayerRegistrationRequest = {
      playerId: +formValue.playerId,
      teamId: this.teamId,
      seasonYear: this.team.seasonYear,
      jerseyNumber: formValue.jerseyNumber ? +formValue.jerseyNumber : undefined,
      position: formValue.position || undefined,
      status: formValue.status,
      registrationDate: formValue.registrationDate,
      endDate: formValue.endDate || undefined,
      isCaptain: formValue.isCaptain || false,
      isViceCaptain: formValue.isViceCaptain || false,
      contractStart: formValue.contractStart || undefined,
      contractEnd: formValue.contractEnd || undefined,
      notes: formValue.notes || undefined,
    };

    this.playerRegistrationService.create(request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.playerRegistrationForm.reset();
        this.loadPlayerRegistrations();
      },
      error: (error) => {
        const errorMessage =
          typeof error === 'string'
            ? error
            : error?.message || 'Error registering player';
        this.toastr.error(errorMessage);
      },
    });
  }

  openEditPlayerRegistrationModal(content: any, registration: PlayerRegistrationResponse): void {
    this.editingPlayerRegistration = registration;
    this.editPlayerRegistrationForm.patchValue({
      jerseyNumber: registration.jerseyNumber || '',
      position: registration.position || '',
      status: registration.status || '',
      endDate: registration.endDate || '',
      isCaptain: registration.isCaptain || false,
      isViceCaptain: registration.isViceCaptain || false,
      contractStart: registration.contractStart || '',
      contractEnd: registration.contractEnd || '',
      notes: registration.notes || '',
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-edit-player-title',
      size: 'lg',
    });
  }

  onEditPlayerRegistrationSave(): void {
    if (this.editPlayerRegistrationForm.invalid || !this.editingPlayerRegistration) {
      return;
    }

    const formValue = this.editPlayerRegistrationForm.value;
    const request: UpdatePlayerRegistrationRequest = {
      jerseyNumber: formValue.jerseyNumber ? +formValue.jerseyNumber : undefined,
      position: formValue.position || undefined,
      status: formValue.status || undefined,
      endDate: formValue.endDate || undefined,
      isCaptain: formValue.isCaptain,
      isViceCaptain: formValue.isViceCaptain,
      contractStart: formValue.contractStart || undefined,
      contractEnd: formValue.contractEnd || undefined,
      notes: formValue.notes || undefined,
    };

    this.playerRegistrationService.update(this.editingPlayerRegistration.id, request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.editingPlayerRegistration = null;
        this.loadPlayerRegistrations();
      },
      error: (error) => {
        const errorMessage =
          typeof error === 'string'
            ? error
            : error?.message || 'Error updating player registration';
        this.toastr.error(errorMessage);
      },
    });
  }

  deletePlayerRegistration(registration: PlayerRegistrationResponse): void {
    Swal.fire({
      title: this.translate.instant('PLAYERS.DELETE_CONFIRM_TITLE'),
      text: this.translate.instant('PLAYERS.DELETE_CONFIRM_MESSAGE', { name: registration.playerFullName }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.playerRegistrationService.delete(registration.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadPlayerRegistrations();
          },
          error: (error) => {
            const errorMessage =
              typeof error === 'string'
                ? error
                : error?.message || 'Error deleting player registration';
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  getPositionLabel(position: Position): string {
    const labels: Record<Position, string> = {
      'GOALKEEPER': this.translate.instant('PLAYERS.POSITION_GOALKEEPER'),
      'CENTER_BACK': this.translate.instant('PLAYERS.POSITION_CENTER_BACK'),
      'LEFT_BACK': this.translate.instant('PLAYERS.POSITION_LEFT_BACK'),
      'RIGHT_BACK': this.translate.instant('PLAYERS.POSITION_RIGHT_BACK'),
      'SWEEPER': this.translate.instant('PLAYERS.POSITION_SWEEPER'),
      'DEFENSIVE_MIDFIELDER': this.translate.instant('PLAYERS.POSITION_DEFENSIVE_MIDFIELDER'),
      'CENTRAL_MIDFIELDER': this.translate.instant('PLAYERS.POSITION_CENTRAL_MIDFIELDER'),
      'ATTACKING_MIDFIELDER': this.translate.instant('PLAYERS.POSITION_ATTACKING_MIDFIELDER'),
      'LEFT_MIDFIELDER': this.translate.instant('PLAYERS.POSITION_LEFT_MIDFIELDER'),
      'RIGHT_MIDFIELDER': this.translate.instant('PLAYERS.POSITION_RIGHT_MIDFIELDER'),
      'LEFT_WINGER': this.translate.instant('PLAYERS.POSITION_LEFT_WINGER'),
      'RIGHT_WINGER': this.translate.instant('PLAYERS.POSITION_RIGHT_WINGER'),
      'CENTER_FORWARD': this.translate.instant('PLAYERS.POSITION_CENTER_FORWARD'),
      'STRIKER': this.translate.instant('PLAYERS.POSITION_STRIKER'),
      'SECOND_STRIKER': this.translate.instant('PLAYERS.POSITION_SECOND_STRIKER'),
    };
    return labels[position] || position;
  }

  getPlayerStatusLabel(status: PlayerStatus): string {
    const labels: Record<PlayerStatus, string> = {
      'ACTIVE': this.translate.instant('PLAYERS.STATUS_ACTIVE'),
      'INJURED': this.translate.instant('PLAYERS.STATUS_INJURED'),
      'SUSPENDED': this.translate.instant('PLAYERS.STATUS_SUSPENDED'),
      'ON_LOAN': this.translate.instant('PLAYERS.STATUS_ON_LOAN'),
      'INACTIVE': this.translate.instant('PLAYERS.STATUS_INACTIVE'),
      'TRANSFERRED': this.translate.instant('PLAYERS.STATUS_TRANSFERRED'),
    };
    return labels[status] || status;
  }

  getPlayerStatusClass(status: PlayerStatus): string {
    const classes: Record<PlayerStatus, string> = {
      'ACTIVE': 'badge bg-success',
      'INJURED': 'badge bg-danger',
      'SUSPENDED': 'badge bg-warning',
      'ON_LOAN': 'badge bg-info',
      'INACTIVE': 'badge bg-secondary',
      'TRANSFERRED': 'badge bg-dark',
    };
    return classes[status] || 'badge bg-secondary';
  }

  // ==================== Common ====================

  goBack(): void {
    this.router.navigate(['/clubs', this.clubId]);
  }
}
