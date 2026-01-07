import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  SanctionService,
  PlayerRegistrationService,
  TournamentTeamService,
  SanctionResponse,
  SanctionStatus,
  SanctionType,
  CreateSanctionRequest,
  UpdateSanctionRequest,
  AppealSanctionRequest,
  ResolveAppealRequest,
  TournamentTeamResponse,
  PlayerRegistrationResponse,
} from '@core';

@Component({
  selector: 'app-tournament-sanctions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './tournament-sanctions.component.html',
  styleUrls: ['./tournament-sanctions.component.scss'],
})
export class TournamentSanctionsComponent implements OnInit, OnChanges {
  @Input() tournamentId!: number;
  @Input() seasonYear!: number;
  @Input() canEdit = false;

  sanctions: SanctionResponse[] = [];
  filteredSanctions: SanctionResponse[] = [];
  loading = false;
  error: string | null = null;

  // Status filter
  statusOptions: SanctionStatus[] = [
    'PENDING',
    'ACTIVE',
    'SERVED',
    'APPEALED',
    'REDUCED',
    'CANCELLED',
    'EXPIRED',
  ];
  selectedStatus: SanctionStatus | null = null;

  // Type filter
  typeOptions: SanctionType[] = [
    'YELLOW_CARD_ACCUMULATION',
    'RED_CARD_DIRECT',
    'SECOND_YELLOW_CARD',
    'VIOLENT_CONDUCT',
    'SERIOUS_FOUL_PLAY',
    'SPITTING',
    'OFFENSIVE_LANGUAGE',
    'OFFENSIVE_GESTURES',
    'AGGRESSION_TO_REFEREE',
    'INSULT_TO_REFEREE',
    'THREATENING_REFEREE',
    'TEAM_MISCONDUCT',
    'ABANDONMENT',
    'CROWD_TROUBLE',
    'DOCUMENT_FRAUD',
    'INELIGIBLE_PLAYER',
    'DOPING',
    'OTHER',
  ];
  selectedType: SanctionType | null = null;

  // Sanction form
  sanctionForm!: UntypedFormGroup;
  editingSanction: SanctionResponse | null = null;
  isEditMode = false;

  // Appeal form
  appealForm!: UntypedFormGroup;
  appealingSanction: SanctionResponse | null = null;

  // Resolve appeal form
  resolveAppealForm!: UntypedFormGroup;
  resolvingSanction: SanctionResponse | null = null;

  // Teams and players for dropdowns
  teams: TournamentTeamResponse[] = [];
  players: PlayerRegistrationResponse[] = [];

  constructor(
    private sanctionService: SanctionService,
    private tournamentTeamService: TournamentTeamService,
    private playerRegistrationService: PlayerRegistrationService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    if (this.tournamentId) {
      this.loadSanctions();
      this.loadTeams();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tournamentId'] && this.tournamentId && !changes['tournamentId'].firstChange) {
      this.loadSanctions();
      this.loadTeams();
    }
  }

  private initForms(): void {
    this.sanctionForm = this.fb.group({
      playerId: [null],
      teamId: [null, [Validators.required]],
      sanctionType: [null, [Validators.required]],
      description: ['', [Validators.maxLength(500)]],
      matchesSuspended: [1, [Validators.min(0)]],
      fineAmount: [null, [Validators.min(0)]],
      fineCurrency: ['USD'],
      infractionDate: [''],
      effectiveDate: [''],
    });

    this.appealForm = this.fb.group({
      appealNotes: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    });

    this.resolveAppealForm = this.fb.group({
      resolution: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      newMatchesSuspended: [null, [Validators.min(0)]],
      resolvedBy: ['', [Validators.maxLength(100)]],
    });
  }

  loadSanctions(): void {
    this.loading = true;
    this.error = null;

    this.sanctionService.getByTournament(this.tournamentId, 0, 100).subscribe({
      next: (response) => {
        this.sanctions = response.body.data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sanctions:', err);
        this.error = 'Error loading sanctions';
        this.loading = false;
      },
    });
  }

  loadTeams(): void {
    this.tournamentTeamService.getAll(this.tournamentId, 0, 100).subscribe({
      next: (response) => {
        this.teams = response.body.data.filter((t) => t.status === 'APPROVED');
      },
      error: (err) => {
        console.error('Error loading teams:', err);
      },
    });
  }

  onTeamChange(event: Event): void {
    const teamId = +(event.target as HTMLSelectElement).value;
    if (teamId) {
      const team = this.teams.find((t) => t.teamId === teamId);
      if (team) {
        this.loadPlayersForTeam(team.teamId);
      }
    } else {
      this.players = [];
    }
  }

  loadPlayersForTeam(teamId: number): void {
    if (!this.seasonYear) {
      this.players = [];
      return;
    }
    this.playerRegistrationService.getByTeam(teamId, this.seasonYear).subscribe({
      next: (response) => {
        this.players = response.body.data;
      },
      error: (err: Error) => {
        console.error('Error loading players:', err);
        this.players = [];
      },
    });
  }

  applyFilters(): void {
    this.filteredSanctions = this.sanctions.filter((sanction) => {
      const statusFilter = this.selectedStatus === null || sanction.status === this.selectedStatus;
      const typeFilter = this.selectedType === null || sanction.sanctionType === this.selectedType;
      return statusFilter && typeFilter;
    });
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onTypeChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedStatus = null;
    this.selectedType = null;
    this.applyFilters();
  }

  getStatusClass(status: SanctionStatus): string {
    const classes: Record<SanctionStatus, string> = {
      PENDING: 'bg-warning',
      ACTIVE: 'bg-danger',
      SERVED: 'bg-success',
      APPEALED: 'bg-info',
      REDUCED: 'bg-primary',
      CANCELLED: 'bg-secondary',
      EXPIRED: 'bg-dark',
    };
    return classes[status] || 'bg-secondary';
  }

  getStatusLabel(status: SanctionStatus): string {
    const key = `SANCTIONS.STATUS_${status}`;
    return this.translate.instant(key);
  }

  getTypeLabel(type: SanctionType): string {
    const key = `SANCTIONS.TYPE_${type}`;
    return this.translate.instant(key);
  }

  // CRUD operations
  openAddModal(content: any): void {
    this.isEditMode = false;
    this.editingSanction = null;
    this.players = [];
    this.sanctionForm.reset({
      matchesSuspended: 1,
      fineCurrency: 'USD',
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-sanction-title',
      size: 'lg',
    });
  }

  openEditModal(content: any, sanction: SanctionResponse): void {
    this.isEditMode = true;
    this.editingSanction = sanction;

    if (sanction.teamId) {
      this.loadPlayersForTeam(sanction.teamId);
    }

    this.sanctionForm.patchValue({
      playerId: sanction.playerId,
      teamId: sanction.teamId,
      sanctionType: sanction.sanctionType,
      description: sanction.description,
      matchesSuspended: sanction.matchesSuspended,
      fineAmount: sanction.fineAmount,
      fineCurrency: sanction.fineCurrency || 'USD',
      infractionDate: sanction.infractionDate,
      effectiveDate: sanction.effectiveDate,
    });

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-sanction-title',
      size: 'lg',
    });
  }

  onSaveSanction(): void {
    if (this.sanctionForm.invalid) {
      this.sanctionForm.markAllAsTouched();
      return;
    }

    const formValue = this.sanctionForm.value;

    if (this.isEditMode && this.editingSanction) {
      const request: UpdateSanctionRequest = {
        description: formValue.description || undefined,
        matchesSuspended: formValue.matchesSuspended,
        fineAmount: formValue.fineAmount || undefined,
        effectiveDate: formValue.effectiveDate || undefined,
      };

      this.sanctionService.update(this.editingSanction.id, request).subscribe({
        next: (response) => {
          this.toastr.success(response.header.message);
          this.modalService.dismissAll();
          this.loadSanctions();
        },
        error: (error) => {
          const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
          this.toastr.error(errorMessage);
        },
      });
    } else {
      const request: CreateSanctionRequest = {
        tournamentId: this.tournamentId,
        playerId: formValue.playerId || undefined,
        teamId: formValue.teamId,
        sanctionType: formValue.sanctionType,
        description: formValue.description || undefined,
        matchesSuspended: formValue.matchesSuspended,
        fineAmount: formValue.fineAmount || undefined,
        fineCurrency: formValue.fineAmount ? formValue.fineCurrency : undefined,
        infractionDate: formValue.infractionDate || undefined,
        effectiveDate: formValue.effectiveDate || undefined,
      };

      this.sanctionService.create(request).subscribe({
        next: (response) => {
          this.toastr.success(response.header.message);
          this.modalService.dismissAll();
          this.loadSanctions();
        },
        error: (error) => {
          const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
          this.toastr.error(errorMessage);
        },
      });
    }
  }

  deleteSanction(sanction: SanctionResponse): void {
    Swal.fire({
      title: this.translate.instant('SANCTIONS.DELETE_CONFIRM_TITLE'),
      text: this.translate.instant('SANCTIONS.DELETE_CONFIRM_MESSAGE'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.sanctionService.delete(sanction.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadSanctions();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  // Status actions
  activateSanction(sanction: SanctionResponse): void {
    Swal.fire({
      title: this.translate.instant('SANCTIONS.ACTIVATE_CONFIRM_TITLE'),
      text: this.translate.instant('SANCTIONS.ACTIVATE_CONFIRM_MESSAGE'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.sanctionService.activate(sanction.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadSanctions();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  openAppealModal(content: any, sanction: SanctionResponse): void {
    this.appealingSanction = sanction;
    this.appealForm.reset();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-appeal-title',
      size: 'md',
    });
  }

  onSubmitAppeal(): void {
    if (this.appealForm.invalid || !this.appealingSanction) {
      this.appealForm.markAllAsTouched();
      return;
    }

    const request: AppealSanctionRequest = {
      appealNotes: this.appealForm.value.appealNotes,
    };

    this.sanctionService.appeal(this.appealingSanction.id, request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.appealingSanction = null;
        this.loadSanctions();
      },
      error: (error) => {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
        this.toastr.error(errorMessage);
      },
    });
  }

  openResolveAppealModal(content: any, sanction: SanctionResponse): void {
    this.resolvingSanction = sanction;
    this.resolveAppealForm.reset({
      newMatchesSuspended: sanction.matchesSuspended,
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-resolve-appeal-title',
      size: 'md',
    });
  }

  onResolveAppeal(): void {
    if (this.resolveAppealForm.invalid || !this.resolvingSanction) {
      this.resolveAppealForm.markAllAsTouched();
      return;
    }

    const formValue = this.resolveAppealForm.value;
    const request: ResolveAppealRequest = {
      resolution: formValue.resolution,
      newMatchesSuspended: formValue.newMatchesSuspended,
      resolvedBy: formValue.resolvedBy || undefined,
    };

    this.sanctionService.resolveAppeal(this.resolvingSanction.id, request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.resolvingSanction = null;
        this.loadSanctions();
      },
      error: (error) => {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
        this.toastr.error(errorMessage);
      },
    });
  }

  cancelSanction(sanction: SanctionResponse): void {
    Swal.fire({
      title: this.translate.instant('SANCTIONS.CANCEL_TITLE'),
      input: 'textarea',
      inputLabel: this.translate.instant('SANCTIONS.CANCEL_REASON'),
      inputPlaceholder: this.translate.instant('SANCTIONS.CANCEL_REASON_PLACEHOLDER'),
      inputAttributes: {
        'aria-label': this.translate.instant('SANCTIONS.CANCEL_REASON'),
      },
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
      inputValidator: (value) => {
        if (!value || value.length < 10) {
          return this.translate.instant('VALIDATION.MIN_LENGTH', { min: 10 });
        }
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.sanctionService.cancel(sanction.id, result.value).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadSanctions();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  markFinePaid(sanction: SanctionResponse): void {
    Swal.fire({
      title: this.translate.instant('SANCTIONS.MARK_FINE_PAID_TITLE'),
      text: this.translate.instant('SANCTIONS.MARK_FINE_PAID_MESSAGE', {
        amount: sanction.fineAmount,
        currency: sanction.fineCurrency,
      }),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.sanctionService.markFinePaid(sanction.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadSanctions();
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
