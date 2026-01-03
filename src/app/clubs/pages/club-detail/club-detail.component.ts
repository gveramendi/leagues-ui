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
  ClubResponse,
  ClubService,
  TeamResponse,
  TeamService,
  CreateTeamRequest,
  UpdateTeamRequest,
  Category,
  Gender,
  FootballType,
  TeamStatus,
} from '@core';

@Component({
  selector: 'app-club-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgxDatatableModule,
    TranslateModule,
  ],
  templateUrl: './club-detail.component.html',
  styleUrls: ['./club-detail.component.scss'],
})
export class ClubDetailComponent implements OnInit {
  club: ClubResponse | null = null;
  clubId: number = 0;

  // Teams
  teams: TeamResponse[] = [];
  filteredTeams: TeamResponse[] = [];
  loading = false;

  // Add team form
  teamForm!: UntypedFormGroup;

  // Edit team form
  editTeamForm!: UntypedFormGroup;
  editingTeam: TeamResponse | null = null;

  // Dropdown options
  categories: Category[] = [
    'SUB_8', 'SUB_10', 'SUB_12', 'SUB_14', 'SUB_15', 'SUB_16', 'SUB_17',
    'SUB_18', 'SUB_19', 'SUB_20', 'SUB_21', 'SUB_23', 'PRIMERA', 'RESERVA',
    'SENIOR', 'MASTER', 'SUPER_MASTER', 'LIBRE'
  ];
  genders: Gender[] = ['MALE', 'FEMALE', 'MIXED'];
  footballTypes: FootballType[] = [
    'FOOTBALL_11', 'FOOTBALL_9', 'FOOTBALL_8', 'FOOTBALL_7',
    'FOOTBALL_6', 'FOOTBALL_5', 'FUTSAL', 'BEACH_SOCCER'
  ];
  teamStatuses: TeamStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DISSOLVED'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clubService: ClubService,
    private teamService: TeamService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.initTeamForm();
    this.initEditTeamForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.clubId = +params['clubId'];
      this.loadClub();
      this.loadTeams();
    });
  }

  private initTeamForm(): void {
    const currentYear = new Date().getFullYear();
    this.teamForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      category: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      footballType: ['', [Validators.required]],
      seasonYear: [currentYear, [Validators.required]],
      status: ['ACTIVE', [Validators.required]],
      logoUrl: [''],
      primaryColor: [''],
      secondaryColor: [''],
      homeVenue: [''],
      description: [''],
      maxPlayers: [null],
      minPlayers: [null],
    });
  }

  private initEditTeamForm(): void {
    this.editTeamForm = this.fb.group({
      name: ['', [Validators.minLength(2), Validators.maxLength(100)]],
      category: [''],
      gender: [''],
      footballType: [''],
      seasonYear: [''],
      status: [''],
      logoUrl: [''],
      primaryColor: [''],
      secondaryColor: [''],
      homeVenue: [''],
      description: [''],
      maxPlayers: [null],
      minPlayers: [null],
    });
  }

  private loadClub(): void {
    this.clubService.getById(this.clubId).subscribe({
      next: (response) => {
        this.club = response.body.data;
      },
      error: (error) => {
        console.error('Error loading club:', error);
        this.toastr.error('Error loading club');
        this.router.navigate(['/clubs/list']);
      },
    });
  }

  loadTeams(): void {
    this.loading = true;
    this.teamService.getByClub(this.clubId).subscribe({
      next: (response) => {
        this.teams = response.body.data;
        this.filteredTeams = [...this.teams];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.loading = false;
      },
    });
  }

  filterDatatable(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredTeams = this.teams.filter((row) => {
      return (
        row.code?.toLowerCase().includes(val) ||
        row.name?.toLowerCase().includes(val) ||
        row.category?.toLowerCase().includes(val) ||
        row.gender?.toLowerCase().includes(val)
      );
    });
  }

  openAddModal(content: any): void {
    const currentYear = new Date().getFullYear();
    this.teamForm.reset({
      code: '',
      name: '',
      category: '',
      gender: '',
      footballType: '',
      seasonYear: currentYear,
      status: 'ACTIVE',
      logoUrl: '',
      primaryColor: '',
      secondaryColor: '',
      homeVenue: '',
      description: '',
      maxPlayers: null,
      minPlayers: null,
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  onAddTeamSave(): void {
    if (this.teamForm.invalid) {
      return;
    }

    const formValue = this.teamForm.value;
    const request: CreateTeamRequest = {
      clubId: this.clubId,
      code: formValue.code,
      name: formValue.name,
      category: formValue.category,
      gender: formValue.gender,
      footballType: formValue.footballType,
      seasonYear: formValue.seasonYear,
      status: formValue.status,
      logoUrl: formValue.logoUrl || undefined,
      primaryColor: formValue.primaryColor || undefined,
      secondaryColor: formValue.secondaryColor || undefined,
      homeVenue: formValue.homeVenue || undefined,
      description: formValue.description || undefined,
      maxPlayers: formValue.maxPlayers || undefined,
      minPlayers: formValue.minPlayers || undefined,
    };

    this.teamService.create(request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.teamForm.reset();
        this.loadTeams();
      },
      error: (error) => {
        const errorMessage =
          typeof error === 'string'
            ? error
            : error?.message || 'Error creating team';
        this.toastr.error(errorMessage);
      },
    });
  }

  openEditModal(content: any, team: TeamResponse): void {
    this.editingTeam = team;
    this.editTeamForm.patchValue({
      name: team.name || '',
      category: team.category || '',
      gender: team.gender || '',
      footballType: team.footballType || '',
      seasonYear: team.seasonYear || new Date().getFullYear(),
      status: team.status || 'ACTIVE',
      logoUrl: team.logoUrl || '',
      primaryColor: team.primaryColor || '',
      secondaryColor: team.secondaryColor || '',
      homeVenue: team.homeVenue || '',
      description: team.description || '',
      maxPlayers: team.maxPlayers || null,
      minPlayers: team.minPlayers || null,
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-edit-title',
      size: 'lg',
    });
  }

  onEditTeamSave(): void {
    if (this.editTeamForm.invalid || !this.editingTeam) {
      return;
    }

    const formValue = this.editTeamForm.value;
    const request: UpdateTeamRequest = {
      name: formValue.name || undefined,
      category: formValue.category || undefined,
      gender: formValue.gender || undefined,
      footballType: formValue.footballType || undefined,
      seasonYear: formValue.seasonYear || undefined,
      status: formValue.status || undefined,
      logoUrl: formValue.logoUrl || undefined,
      primaryColor: formValue.primaryColor || undefined,
      secondaryColor: formValue.secondaryColor || undefined,
      homeVenue: formValue.homeVenue || undefined,
      description: formValue.description || undefined,
      maxPlayers: formValue.maxPlayers || undefined,
      minPlayers: formValue.minPlayers || undefined,
    };

    this.teamService.update(this.editingTeam.id, request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.editingTeam = null;
        this.loadTeams();
      },
      error: (error) => {
        const errorMessage =
          typeof error === 'string'
            ? error
            : error?.message || 'Error updating team';
        this.toastr.error(errorMessage);
      },
    });
  }

  deleteTeam(team: TeamResponse): void {
    Swal.fire({
      title: this.translate.instant('TEAMS.DELETE_CONFIRM_TITLE'),
      text: this.translate.instant('TEAMS.DELETE_CONFIRM_MESSAGE', { name: team.name }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.teamService.delete(team.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadTeams();
          },
          error: (error) => {
            const errorMessage =
              typeof error === 'string'
                ? error
                : error?.message || 'Error deleting team';
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  viewTeamDetail(team: TeamResponse): void {
    this.router.navigate(['/clubs', this.clubId, 'teams', team.id]);
  }

  goBack(): void {
    this.router.navigate(['/clubs/list']);
  }

  getCategoryLabel(category: Category): string {
    const labels: Record<Category, string> = {
      'SUB_8': 'Sub-8',
      'SUB_10': 'Sub-10',
      'SUB_12': 'Sub-12',
      'SUB_14': 'Sub-14',
      'SUB_15': 'Sub-15',
      'SUB_16': 'Sub-16',
      'SUB_17': 'Sub-17',
      'SUB_18': 'Sub-18',
      'SUB_19': 'Sub-19',
      'SUB_20': 'Sub-20',
      'SUB_21': 'Sub-21',
      'SUB_23': 'Sub-23',
      'PRIMERA': 'Primera',
      'RESERVA': 'Reserva',
      'SENIOR': 'Senior',
      'MASTER': 'Master',
      'SUPER_MASTER': 'Super Master',
      'LIBRE': 'Libre',
    };
    return labels[category] || category;
  }

  getGenderLabel(gender: Gender): string {
    const labels: Record<Gender, string> = {
      'MALE': this.translate.instant('TEAMS.GENDER_MALE'),
      'FEMALE': this.translate.instant('TEAMS.GENDER_FEMALE'),
      'MIXED': this.translate.instant('TEAMS.GENDER_MIXED'),
    };
    return labels[gender] || gender;
  }

  getFootballTypeLabel(type: FootballType): string {
    const labels: Record<FootballType, string> = {
      'FOOTBALL_11': 'Fútbol 11',
      'FOOTBALL_9': 'Fútbol 9',
      'FOOTBALL_8': 'Fútbol 8',
      'FOOTBALL_7': 'Fútbol 7',
      'FOOTBALL_6': 'Fútbol 6',
      'FOOTBALL_5': 'Fútbol 5',
      'FUTSAL': 'Futsal',
      'BEACH_SOCCER': 'Fútbol Playa',
    };
    return labels[type] || type;
  }

  getStatusLabel(status: TeamStatus): string {
    const labels: Record<TeamStatus, string> = {
      'ACTIVE': this.translate.instant('TEAMS.STATUS_ACTIVE'),
      'INACTIVE': this.translate.instant('TEAMS.STATUS_INACTIVE'),
      'SUSPENDED': this.translate.instant('TEAMS.STATUS_SUSPENDED'),
      'DISSOLVED': this.translate.instant('TEAMS.STATUS_DISSOLVED'),
    };
    return labels[status] || status;
  }

  getStatusClass(status: TeamStatus): string {
    const classes: Record<TeamStatus, string> = {
      'ACTIVE': 'badge bg-success',
      'INACTIVE': 'badge bg-secondary',
      'SUSPENDED': 'badge bg-warning',
      'DISSOLVED': 'badge bg-danger',
    };
    return classes[status] || 'badge bg-secondary';
  }
}
