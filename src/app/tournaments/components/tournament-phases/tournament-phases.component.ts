import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  TournamentPhaseService,
  TournamentPhaseResponse,
  CreateTournamentPhaseRequest,
  UpdateTournamentPhaseRequest,
  AssignMatchesToPhaseRequest,
  PhaseMode,
  PhaseType,
  MatchService,
  MatchSummaryResponse,
} from '@core';

@Component({
  selector: 'app-tournament-phases',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    TranslateModule,
  ],
  templateUrl: './tournament-phases.component.html',
  styleUrls: ['./tournament-phases.component.scss'],
})
export class TournamentPhasesComponent implements OnInit, OnChanges {
  @Input() tournamentId!: number;
  @Input() canEdit = false;

  phases: TournamentPhaseResponse[] = [];
  filteredPhases: TournamentPhaseResponse[] = [];
  loading = false;

  // Form
  phaseForm!: UntypedFormGroup;
  editingPhase: TournamentPhaseResponse | null = null;
  isEditMode = false;

  // Match assignment
  selectedPhaseForMatches: TournamentPhaseResponse | null = null;
  availableMatches: MatchSummaryResponse[] = [];
  phaseMatches: MatchSummaryResponse[] = [];
  selectedMatchIds: Set<number> = new Set();
  loadingMatches = false;

  // Options
  phaseModes: { value: PhaseMode; label: string }[] = [
    { value: 'KNOCKOUT', label: 'Eliminación Directa' },
    { value: 'ROUND_ROBIN', label: 'Todos contra Todos' },
    { value: 'GROUP_STAGE', label: 'Fase de Grupos' },
  ];

  phaseTypes: { value: PhaseType; label: string }[] = [
    { value: 'ROUND_OF_32', label: 'Dieciseisavos de Final' },
    { value: 'ROUND_OF_16', label: 'Octavos de Final' },
    { value: 'QUARTER_FINALS', label: 'Cuartos de Final' },
    { value: 'SEMI_FINALS', label: 'Semifinales' },
    { value: 'THIRD_PLACE', label: 'Tercer Puesto' },
    { value: 'FINAL', label: 'Final' },
    { value: 'GROUP_STAGE', label: 'Fase de Grupos' },
    { value: 'REGULAR_PHASE', label: 'Fase Regular' },
    { value: 'SPLIT_PHASE', label: 'Fase de División' },
  ];

  phaseStatuses: { value: string; label: string; class: string }[] = [
    { value: 'PENDING', label: 'Pendiente', class: 'bg-secondary' },
    { value: 'IN_PROGRESS', label: 'En Progreso', class: 'bg-success' },
    { value: 'COMPLETED', label: 'Completada', class: 'bg-dark' },
  ];

  constructor(
    private phaseService: TournamentPhaseService,
    private matchService: MatchService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    if (this.tournamentId) {
      this.loadPhases();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tournamentId'] && !changes['tournamentId'].firstChange) {
      this.loadPhases();
    }
  }

  private initForm(): void {
    this.phaseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      phaseOrder: [1, [Validators.required, Validators.min(1)]],
      phaseType: ['QUARTER_FINALS', [Validators.required]],
      // Config fields
      phaseMode: ['KNOCKOUT', [Validators.required]],
      isSingleRound: [true],
      isHomeAndAway: [false],
    });
  }

  loadPhases(): void {
    this.loading = true;
    this.phaseService.getAll(this.tournamentId).subscribe({
      next: (response) => {
        this.phases = response.body.data || [];
        this.filteredPhases = [...this.phases];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading phases:', error);
        this.loading = false;
      },
    });
  }

  filterPhases(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredPhases = this.phases.filter((phase) => {
      return (
        phase.name?.toLowerCase().includes(val) ||
        phase.phaseMode?.toLowerCase().includes(val) ||
        phase.phaseType?.toLowerCase().includes(val)
      );
    });
  }

  // Modal handlers
  openAddModal(content: any): void {
    this.isEditMode = false;
    this.editingPhase = null;
    const nextOrder = this.phases.length > 0
      ? Math.max(...this.phases.map((p) => p.phaseOrder)) + 1
      : 1;
    this.phaseForm.reset({
      name: '',
      phaseOrder: nextOrder,
      phaseType: 'QUARTER_FINALS',
      phaseMode: 'KNOCKOUT',
      isSingleRound: true,
      isHomeAndAway: false,
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-phase-title',
      size: 'md',
    });
  }

  openEditModal(content: any, phase: TournamentPhaseResponse): void {
    this.isEditMode = true;
    this.editingPhase = phase;
    this.phaseForm.patchValue({
      name: phase.name,
      phaseOrder: phase.phaseOrder,
      phaseType: phase.phaseType || 'QUARTER_FINALS',
      phaseMode: phase.phaseMode || 'KNOCKOUT',
      isSingleRound: true,
      isHomeAndAway: false,
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-phase-title',
      size: 'md',
    });
  }

  onSavePhase(): void {
    if (this.phaseForm.invalid) {
      this.phaseForm.markAllAsTouched();
      return;
    }

    const formValue = this.phaseForm.value;

    if (this.isEditMode && this.editingPhase) {
      const request: UpdateTournamentPhaseRequest = {
        name: formValue.name,
        phaseOrder: formValue.phaseOrder,
        phaseType: formValue.phaseType,
        config: {
          phaseMode: formValue.phaseMode,
          isSingleRound: formValue.isSingleRound,
          isHomeAndAway: formValue.isHomeAndAway,
        },
      };

      this.phaseService.update(this.tournamentId, this.editingPhase.id, request).subscribe({
        next: (response) => {
          this.toastr.success(response.header.message);
          this.modalService.dismissAll();
          this.loadPhases();
        },
        error: (error) => {
          const errorMessage = typeof error === 'string' ? error : (error?.message || 'Error');
          this.toastr.error(errorMessage);
        },
      });
    } else {
      const request: CreateTournamentPhaseRequest = {
        name: formValue.name,
        phaseOrder: formValue.phaseOrder,
        phaseType: formValue.phaseType,
        config: {
          phaseMode: formValue.phaseMode,
          isSingleRound: formValue.isSingleRound,
          isHomeAndAway: formValue.isHomeAndAway,
        },
      };

      this.phaseService.create(this.tournamentId, request).subscribe({
        next: (response) => {
          this.toastr.success(response.header.message);
          this.modalService.dismissAll();
          this.loadPhases();
        },
        error: (error) => {
          const errorMessage = typeof error === 'string' ? error : (error?.message || 'Error');
          this.toastr.error(errorMessage);
        },
      });
    }
  }

  deletePhase(phase: TournamentPhaseResponse): void {
    Swal.fire({
      title: this.translate.instant('TOURNAMENTS.DELETE_PHASE_TITLE'),
      text: this.translate.instant('TOURNAMENTS.DELETE_PHASE_CONFIRM', { name: phase.name }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.phaseService.delete(this.tournamentId, phase.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadPhases();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : (error?.message || 'Error');
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  // Helpers
  getStatusClass(status: string): string {
    const statusConfig = this.phaseStatuses.find((s) => s.value === status);
    return statusConfig ? statusConfig.class : 'bg-secondary';
  }

  getStatusLabel(status: string): string {
    const statusConfig = this.phaseStatuses.find((s) => s.value === status);
    return statusConfig ? statusConfig.label : status;
  }

  getPhaseModeLabel(mode: string): string {
    const modeConfig = this.phaseModes.find((m) => m.value === mode);
    return modeConfig ? modeConfig.label : mode;
  }

  getPhaseTypeLabel(type: string): string {
    const typeConfig = this.phaseTypes.find((t) => t.value === type);
    return typeConfig ? typeConfig.label : type || '-';
  }

  // Match assignment methods
  openAssignMatchesModal(content: any, phase: TournamentPhaseResponse): void {
    this.selectedPhaseForMatches = phase;
    this.selectedMatchIds.clear();
    this.loadMatchesForAssignment();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-assign-matches-title',
      size: 'lg',
    });
  }

  loadMatchesForAssignment(): void {
    this.loadingMatches = true;
    this.matchService.getByTournament(this.tournamentId, 0, 100).subscribe({
      next: (response) => {
        const allMatches = response.body.data || [];
        // Separate matches: available (no phase) and already assigned to this phase
        this.availableMatches = allMatches.filter((m) => !m.phaseId);
        this.phaseMatches = allMatches.filter(
          (m) => m.phaseId === this.selectedPhaseForMatches?.id
        );
        this.loadingMatches = false;
      },
      error: (error) => {
        console.error('Error loading matches:', error);
        this.loadingMatches = false;
      },
    });
  }

  toggleMatchSelection(matchId: number): void {
    if (this.selectedMatchIds.has(matchId)) {
      this.selectedMatchIds.delete(matchId);
    } else {
      this.selectedMatchIds.add(matchId);
    }
  }

  isMatchSelected(matchId: number): boolean {
    return this.selectedMatchIds.has(matchId);
  }

  selectAllMatches(): void {
    this.availableMatches.forEach((m) => this.selectedMatchIds.add(m.id));
  }

  deselectAllMatches(): void {
    this.selectedMatchIds.clear();
  }

  assignSelectedMatches(): void {
    if (!this.selectedPhaseForMatches || this.selectedMatchIds.size === 0) {
      return;
    }

    const request: AssignMatchesToPhaseRequest = {
      matchIds: Array.from(this.selectedMatchIds),
    };

    this.phaseService
      .assignMatches(this.tournamentId, this.selectedPhaseForMatches.id, request)
      .subscribe({
        next: (response) => {
          this.toastr.success(
            this.translate.instant('TOURNAMENTS.MATCHES_ASSIGNED_SUCCESS', {
              count: this.selectedMatchIds.size,
            })
          );
          this.selectedMatchIds.clear();
          this.loadMatchesForAssignment();
          this.loadPhases();
        },
        error: (error) => {
          const errorMessage = typeof error === 'string' ? error : (error?.message || 'Error');
          this.toastr.error(errorMessage);
        },
      });
  }

  removeMatchFromPhase(match: MatchSummaryResponse): void {
    if (!this.selectedPhaseForMatches) return;

    Swal.fire({
      title: this.translate.instant('TOURNAMENTS.REMOVE_MATCH_TITLE'),
      text: this.translate.instant('TOURNAMENTS.REMOVE_MATCH_CONFIRM', {
        home: match.homeTeamName,
        away: match.awayTeamName,
      }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        // For now, remove all matches and re-add without the removed one
        // Ideally backend should have an endpoint to remove a single match
        const remainingMatchIds = this.phaseMatches
          .filter((m) => m.id !== match.id)
          .map((m) => m.id);

        this.phaseService
          .removeMatches(this.tournamentId, this.selectedPhaseForMatches!.id)
          .subscribe({
            next: () => {
              if (remainingMatchIds.length > 0) {
                const request: AssignMatchesToPhaseRequest = { matchIds: remainingMatchIds };
                this.phaseService
                  .assignMatches(this.tournamentId, this.selectedPhaseForMatches!.id, request)
                  .subscribe({
                    next: () => {
                      this.toastr.success(this.translate.instant('TOURNAMENTS.MATCH_REMOVED_SUCCESS'));
                      this.loadMatchesForAssignment();
                      this.loadPhases();
                    },
                    error: (error) => {
                      const errorMessage = typeof error === 'string' ? error : (error?.message || 'Error');
                      this.toastr.error(errorMessage);
                    },
                  });
              } else {
                this.toastr.success(this.translate.instant('TOURNAMENTS.MATCH_REMOVED_SUCCESS'));
                this.loadMatchesForAssignment();
                this.loadPhases();
              }
            },
            error: (error) => {
              const errorMessage = typeof error === 'string' ? error : (error?.message || 'Error');
              this.toastr.error(errorMessage);
            },
          });
      }
    });
  }

  getMatchStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      SCHEDULED: 'bg-secondary',
      CONFIRMED: 'bg-info',
      IN_PROGRESS: 'bg-primary',
      FINISHED: 'bg-success',
      POSTPONED: 'bg-warning',
      CANCELLED: 'bg-danger',
    };
    return statusClasses[status] || 'bg-secondary';
  }
}
