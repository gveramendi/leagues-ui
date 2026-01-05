import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  PlayerResponse,
  PlayerService,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  DocumentType,
  FootPreference,
  Position,
  PlayerRegistrationResponse,
  PlayerRegistrationService,
  PlayerStatus,
} from '@core';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgxDatatableModule,
    TranslateModule,
  ],
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnInit {
  @ViewChild(DatatableComponent) table!: DatatableComponent;

  rows: PlayerResponse[] = [];
  filteredRows: PlayerResponse[] = [];
  search = '';
  page = 0;
  size = 10;
  sort = 'lastName,asc';
  totalElements = 0;
  loading = false;

  // Form for creating new player
  playerForm!: UntypedFormGroup;

  // Form for editing player
  editPlayerForm!: UntypedFormGroup;
  editingPlayer: PlayerResponse | null = null;

  // Player teams (registrations)
  playerRegistrations: PlayerRegistrationResponse[] = [];
  loadingRegistrations = false;
  viewingPlayer: PlayerResponse | null = null;

  // Enum values for dropdowns
  documentTypes: DocumentType[] = ['CI', 'PASSPORT', 'DNI', 'FOREIGN_ID', 'OTHER'];
  footPreferences: FootPreference[] = ['RIGHT', 'LEFT', 'BOTH'];
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
  genders: string[] = ['MALE', 'FEMALE'];

  // Labels for display
  documentTypeLabels: { [key: string]: string } = {
    'CI': 'CI',
    'PASSPORT': 'Passport',
    'DNI': 'DNI',
    'FOREIGN_ID': 'Foreign ID',
    'OTHER': 'Other',
  };

  footPreferenceLabels: { [key: string]: string } = {
    'RIGHT': 'PLAYERS.FOOT_RIGHT',
    'LEFT': 'PLAYERS.FOOT_LEFT',
    'BOTH': 'PLAYERS.FOOT_BOTH',
  };

  positionLabels: { [key: string]: string } = {
    'GOALKEEPER': 'PLAYERS.POSITION_GOALKEEPER',
    'CENTER_BACK': 'PLAYERS.POSITION_CENTER_BACK',
    'LEFT_BACK': 'PLAYERS.POSITION_LEFT_BACK',
    'RIGHT_BACK': 'PLAYERS.POSITION_RIGHT_BACK',
    'SWEEPER': 'PLAYERS.POSITION_SWEEPER',
    'DEFENSIVE_MIDFIELDER': 'PLAYERS.POSITION_DEFENSIVE_MIDFIELDER',
    'CENTRAL_MIDFIELDER': 'PLAYERS.POSITION_CENTRAL_MIDFIELDER',
    'ATTACKING_MIDFIELDER': 'PLAYERS.POSITION_ATTACKING_MIDFIELDER',
    'LEFT_MIDFIELDER': 'PLAYERS.POSITION_LEFT_MIDFIELDER',
    'RIGHT_MIDFIELDER': 'PLAYERS.POSITION_RIGHT_MIDFIELDER',
    'LEFT_WINGER': 'PLAYERS.POSITION_LEFT_WINGER',
    'RIGHT_WINGER': 'PLAYERS.POSITION_RIGHT_WINGER',
    'CENTER_FORWARD': 'PLAYERS.POSITION_CENTER_FORWARD',
    'STRIKER': 'PLAYERS.POSITION_STRIKER',
    'SECOND_STRIKER': 'PLAYERS.POSITION_SECOND_STRIKER',
  };

  genderLabels: { [key: string]: string } = {
    'MALE': 'TEAMS.GENDER_MALE',
    'FEMALE': 'TEAMS.GENDER_FEMALE',
  };

  playerStatusLabels: { [key: string]: string } = {
    'ACTIVE': 'PLAYERS.STATUS_ACTIVE',
    'INJURED': 'PLAYERS.STATUS_INJURED',
    'SUSPENDED': 'PLAYERS.STATUS_SUSPENDED',
    'ON_LOAN': 'PLAYERS.STATUS_ON_LOAN',
    'INACTIVE': 'PLAYERS.STATUS_INACTIVE',
    'TRANSFERRED': 'PLAYERS.STATUS_TRANSFERRED',
  };

  constructor(
    private playerService: PlayerService,
    private playerRegistrationService: PlayerRegistrationService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService,
    private router: Router
  ) {
    this.initForm();
    this.initEditForm();
  }

  ngOnInit(): void {
    this.loadPlayers();
  }

  private initForm(): void {
    this.playerForm = this.fb.group({
      // Personal Info
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      birthDate: ['', [Validators.required]],
      birthPlace: ['', [Validators.maxLength(100)]],
      nationality: ['', [Validators.required, Validators.maxLength(100)]],
      secondNationality: ['', [Validators.maxLength(100)]],
      gender: ['', [Validators.required]],
      // Document Info
      documentType: ['', [Validators.required]],
      documentNumber: ['', [Validators.required, Validators.maxLength(50)]],
      // Physical Info
      height: [null],
      weight: [null],
      footPreference: [''],
      primaryPosition: [''],
      secondaryPosition: [''],
      // Contact Info
      email: ['', [Validators.email, Validators.maxLength(150)]],
      phone: ['', [Validators.maxLength(30)]],
      address: ['', [Validators.maxLength(255)]],
      // Emergency Contact
      emergencyContactName: ['', [Validators.maxLength(150)]],
      emergencyContactPhone: ['', [Validators.maxLength(30)]],
      emergencyContactRelationship: ['', [Validators.maxLength(50)]],
      // Medical Info
      bloodType: ['', [Validators.maxLength(10)]],
      medicalNotes: [''],
      allergies: [''],
      // Photo
      photoUrl: ['', [Validators.maxLength(500)]],
    });
  }

  private initEditForm(): void {
    this.editPlayerForm = this.fb.group({
      // Personal Info
      firstName: ['', [Validators.minLength(2), Validators.maxLength(100)]],
      lastName: ['', [Validators.minLength(2), Validators.maxLength(100)]],
      birthDate: [''],
      birthPlace: ['', [Validators.maxLength(100)]],
      nationality: ['', [Validators.maxLength(100)]],
      secondNationality: ['', [Validators.maxLength(100)]],
      gender: [''],
      // Document Info
      documentType: [''],
      documentNumber: ['', [Validators.maxLength(50)]],
      // Physical Info
      height: [null],
      weight: [null],
      footPreference: [''],
      primaryPosition: [''],
      secondaryPosition: [''],
      // Contact Info
      email: ['', [Validators.email, Validators.maxLength(150)]],
      phone: ['', [Validators.maxLength(30)]],
      address: ['', [Validators.maxLength(255)]],
      // Emergency Contact
      emergencyContactName: ['', [Validators.maxLength(150)]],
      emergencyContactPhone: ['', [Validators.maxLength(30)]],
      emergencyContactRelationship: ['', [Validators.maxLength(50)]],
      // Medical Info
      bloodType: ['', [Validators.maxLength(10)]],
      medicalNotes: [''],
      allergies: [''],
      // Photo
      photoUrl: ['', [Validators.maxLength(500)]],
    });
  }

  loadPlayers(): void {
    this.loading = true;
    this.playerService.search(this.search, this.page, this.size, this.sort).subscribe({
      next: (response) => {
        this.rows = response.body.data;
        this.filteredRows = [...this.rows];
        this.totalElements = response.body.pagination?.totalElements || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading players:', error);
        this.loading = false;
      },
    });
  }

  filterDatatable(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredRows = this.rows.filter((row) => {
      return (
        row.firstName?.toLowerCase().includes(val) ||
        row.lastName?.toLowerCase().includes(val) ||
        row.fullName?.toLowerCase().includes(val) ||
        row.documentNumber?.toLowerCase().includes(val) ||
        row.nationality?.toLowerCase().includes(val) ||
        row.id?.toString().includes(val)
      );
    });

    if (this.table) {
      this.table.offset = 0;
    }
  }

  onPageChange(pageInfo: any): void {
    this.page = pageInfo.offset;
    this.loadPlayers();
  }

  onSort(event: any): void {
    const sortColumn = event.sorts[0];
    const direction = sortColumn.dir === 'asc' ? 'asc' : 'desc';
    this.sort = `${sortColumn.prop},${direction}`;
    this.page = 0;
    this.loadPlayers();
  }

  // Open modal to add new player
  openAddModal(content: any): void {
    this.playerForm.reset();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  // Save new player
  onAddPlayerSave(): void {
    if (this.playerForm.invalid) {
      return;
    }

    const formValue = this.playerForm.value;
    const request: CreatePlayerRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      documentType: formValue.documentType,
      documentNumber: formValue.documentNumber,
      birthDate: formValue.birthDate,
      birthPlace: formValue.birthPlace || undefined,
      nationality: formValue.nationality,
      secondNationality: formValue.secondNationality || undefined,
      gender: formValue.gender,
      height: formValue.height || undefined,
      weight: formValue.weight || undefined,
      footPreference: formValue.footPreference || undefined,
      primaryPosition: formValue.primaryPosition || undefined,
      secondaryPosition: formValue.secondaryPosition || undefined,
      email: formValue.email || undefined,
      phone: formValue.phone || undefined,
      address: formValue.address || undefined,
      emergencyContactName: formValue.emergencyContactName || undefined,
      emergencyContactPhone: formValue.emergencyContactPhone || undefined,
      emergencyContactRelationship: formValue.emergencyContactRelationship || undefined,
      bloodType: formValue.bloodType || undefined,
      medicalNotes: formValue.medicalNotes || undefined,
      allergies: formValue.allergies || undefined,
      photoUrl: formValue.photoUrl || undefined,
    };

    this.playerService.create(request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.playerForm.reset();
        this.loadPlayers();
      },
      error: (error) => {
        let errorMessage = 'Error creating player';
        if (error) {
          errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
        }
        this.toastr.error(errorMessage);
      },
    });
  }

  // Open modal to edit player
  openEditModal(content: any, row: PlayerResponse): void {
    this.editingPlayer = row;
    this.editPlayerForm.patchValue({
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      birthDate: row.birthDate || '',
      birthPlace: row.birthPlace || '',
      nationality: row.nationality || '',
      secondNationality: row.secondNationality || '',
      gender: row.gender || '',
      documentType: row.documentType || '',
      documentNumber: row.documentNumber || '',
      height: row.height || null,
      weight: row.weight || null,
      footPreference: row.footPreference || '',
      primaryPosition: row.primaryPosition || '',
      secondaryPosition: row.secondaryPosition || '',
      email: row.email || '',
      phone: row.phone || '',
      address: row.address || '',
      emergencyContactName: row.emergencyContactName || '',
      emergencyContactPhone: row.emergencyContactPhone || '',
      emergencyContactRelationship: row.emergencyContactRelationship || '',
      bloodType: row.bloodType || '',
      medicalNotes: row.medicalNotes || '',
      allergies: row.allergies || '',
      photoUrl: row.photoUrl || '',
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-edit-title',
      size: 'lg',
    });
  }

  // Save edited player
  onEditPlayerSave(): void {
    if (this.editPlayerForm.invalid || !this.editingPlayer) {
      return;
    }

    const formValue = this.editPlayerForm.value;
    const request: UpdatePlayerRequest = {
      firstName: formValue.firstName || undefined,
      lastName: formValue.lastName || undefined,
      documentType: formValue.documentType || undefined,
      documentNumber: formValue.documentNumber || undefined,
      birthDate: formValue.birthDate || undefined,
      birthPlace: formValue.birthPlace || undefined,
      nationality: formValue.nationality || undefined,
      secondNationality: formValue.secondNationality || undefined,
      gender: formValue.gender || undefined,
      height: formValue.height || undefined,
      weight: formValue.weight || undefined,
      footPreference: formValue.footPreference || undefined,
      primaryPosition: formValue.primaryPosition || undefined,
      secondaryPosition: formValue.secondaryPosition || undefined,
      email: formValue.email || undefined,
      phone: formValue.phone || undefined,
      address: formValue.address || undefined,
      emergencyContactName: formValue.emergencyContactName || undefined,
      emergencyContactPhone: formValue.emergencyContactPhone || undefined,
      emergencyContactRelationship: formValue.emergencyContactRelationship || undefined,
      bloodType: formValue.bloodType || undefined,
      medicalNotes: formValue.medicalNotes || undefined,
      allergies: formValue.allergies || undefined,
      photoUrl: formValue.photoUrl || undefined,
    };

    this.playerService.update(this.editingPlayer.id, request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.editPlayerForm.reset();
        this.editingPlayer = null;
        this.loadPlayers();
      },
      error: (error) => {
        let errorMessage = 'Error updating player';
        if (error) {
          errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
        }
        this.toastr.error(errorMessage);
      },
    });
  }

  // Delete player with confirmation
  deletePlayer(row: PlayerResponse): void {
    Swal.fire({
      title: this.translate.instant('PLAYERS.DELETE_CONFIRM_TITLE'),
      text: this.translate.instant('PLAYERS.DELETE_CONFIRM_MESSAGE', { name: row.fullName || `${row.firstName} ${row.lastName}` }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.playerService.delete(row.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadPlayers();
          },
          error: (error) => {
            let errorMessage = 'Error deleting player';
            if (error) {
              errorMessage = typeof error === 'string' ? error : (error.message || errorMessage);
            }
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  getPositionLabel(position: Position | undefined): string {
    if (!position) return '-';
    return this.translate.instant(this.positionLabels[position] || position);
  }

  getAge(birthDate: string | undefined): string {
    if (!birthDate) return '-';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  }

  // View player teams (registrations)
  openViewTeamsModal(content: any, player: PlayerResponse): void {
    this.viewingPlayer = player;
    this.playerRegistrations = [];
    this.loadingRegistrations = true;

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-teams-title',
      size: 'lg',
    });

    this.playerRegistrationService.getByPlayer(player.id).subscribe({
      next: (response) => {
        this.playerRegistrations = response.body.data;
        this.loadingRegistrations = false;
      },
      error: (error) => {
        console.error('Error loading player registrations:', error);
        this.loadingRegistrations = false;
      },
    });
  }

  getPlayerStatusLabel(status: PlayerStatus): string {
    return this.translate.instant(this.playerStatusLabels[status] || status);
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
}
