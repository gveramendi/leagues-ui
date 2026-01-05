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
  TournamentService,
  TournamentResponse,
  CreateTournamentRequest,
  UpdateTournamentRequest,
  TournamentRulesDto,
} from '@core';

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgxDatatableModule,
    TranslateModule,
  ],
  templateUrl: './tournament-list.component.html',
  styleUrls: ['./tournament-list.component.scss'],
})
export class TournamentListComponent implements OnInit {
  @ViewChild(DatatableComponent) table!: DatatableComponent;

  rows: TournamentResponse[] = [];
  filteredRows: TournamentResponse[] = [];
  search = '';
  page = 0;
  size = 10;
  sort = 'createdAt,desc';
  totalElements = 0;
  loading = false;

  // Form for creating new tournament
  tournamentForm!: UntypedFormGroup;

  // Form for editing tournament
  editTournamentForm!: UntypedFormGroup;
  editingTournament: TournamentResponse | null = null;

  // Dropdown options
  formats = [
    { value: 'LEAGUE', label: 'Liga' },
    { value: 'SINGLE_ELIMINATION', label: 'Eliminacion Simple' },
    { value: 'DOUBLE_ELIMINATION', label: 'Eliminacion Doble' },
    { value: 'GROUP_STAGE', label: 'Fase de Grupos' },
    { value: 'GROUP_STAGE_SINGLE', label: 'Fase de Grupos + Eliminacion Simple' },
    { value: 'GROUP_STAGE_DOUBLE', label: 'Fase de Grupos + Eliminacion Doble' },
    { value: 'ROUND_ROBIN', label: 'Todos contra Todos' },
    { value: 'SWISS', label: 'Sistema Suizo' },
    { value: 'PLAYOFF', label: 'Playoff' },
  ];

  statuses = [
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'REGISTRATION_OPEN', label: 'Inscripcion Abierta' },
    { value: 'REGISTRATION_CLOSED', label: 'Inscripcion Cerrada' },
    { value: 'SCHEDULED', label: 'Programado' },
    { value: 'IN_PROGRESS', label: 'En Progreso' },
    { value: 'PAUSED', label: 'Pausado' },
    { value: 'FINISHED', label: 'Finalizado' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ];

  categories = [
    { value: 'SUB_8', label: 'Sub-8' },
    { value: 'SUB_10', label: 'Sub-10' },
    { value: 'SUB_12', label: 'Sub-12' },
    { value: 'SUB_14', label: 'Sub-14' },
    { value: 'SUB_16', label: 'Sub-16' },
    { value: 'SUB_18', label: 'Sub-18' },
    { value: 'SUB_20', label: 'Sub-20' },
    { value: 'SUB_23', label: 'Sub-23' },
    { value: 'PRIMERA', label: 'Primera' },
    { value: 'RESERVA', label: 'Reserva' },
    { value: 'SENIOR', label: 'Senior' },
    { value: 'MASTER', label: 'Master' },
    { value: 'LIBRE', label: 'Libre' },
  ];

  genders = [
    { value: 'MALE', label: 'Masculino' },
    { value: 'FEMALE', label: 'Femenino' },
    { value: 'MIXED', label: 'Mixto' },
  ];

  footballTypes = [
    { value: 'FOOTBALL_11', label: 'Futbol 11' },
    { value: 'FOOTBALL_9', label: 'Futbol 9' },
    { value: 'FOOTBALL_8', label: 'Futbol 8' },
    { value: 'FOOTBALL_7', label: 'Futbol 7' },
    { value: 'FOOTBALL_6', label: 'Futbol 6' },
    { value: 'FOOTBALL_5', label: 'Futbol 5' },
    { value: 'FUTSAL', label: 'Futsal' },
    { value: 'BEACH_SOCCER', label: 'Futbol Playa' },
  ];

  tiebreakerOptions = [
    { value: 'GOAL_DIFFERENCE', label: 'Diferencia de Goles' },
    { value: 'GOALS_SCORED', label: 'Goles a Favor' },
    { value: 'HEAD_TO_HEAD', label: 'Enfrentamiento Directo' },
    { value: 'AWAY_GOALS', label: 'Goles de Visitante' },
    { value: 'FAIR_PLAY', label: 'Fair Play' },
    { value: 'DRAW', label: 'Sorteo' },
    { value: 'EXTRA_TIME', label: 'Tiempo Extra' },
    { value: 'PENALTIES', label: 'Penales' },
  ];

  constructor(
    private tournamentService: TournamentService,
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
    this.loadTournaments();
  }

  private initForm(): void {
    this.tournamentForm = this.fb.group({
      // Basic info
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      shortName: ['', [Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(500)]],
      // Classification
      format: ['LEAGUE', [Validators.required]],
      category: ['PRIMERA', [Validators.required]],
      gender: ['MALE', [Validators.required]],
      footballType: ['FOOTBALL_11', [Validators.required]],
      seasonYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
      // Dates
      startDate: [''],
      endDate: [''],
      registrationStart: [''],
      registrationEnd: [''],
      // Teams
      minTeams: [2, [Validators.min(2)]],
      maxTeams: [32, [Validators.min(2)]],
      // Additional
      logoUrl: ['', [Validators.maxLength(255)]],
      organizer: ['', [Validators.maxLength(100)]],
      location: ['', [Validators.maxLength(200)]],
      prizeDescription: ['', [Validators.maxLength(500)]],
      // Rules
      pointsForWin: [3],
      pointsForDraw: [1],
      pointsForLoss: [0],
      matchDurationMinutes: [90],
      halfTimeDurationMinutes: [15],
      allowsExtraTime: [false],
      extraTimeDurationMinutes: [30],
      allowsPenalties: [true],
      homeAndAway: [true],
      yellowCardsForSuspension: [5],
      redCardSuspensionMatches: [1],
      maxPlayersPerTeam: [25],
      minPlayersPerTeam: [11],
      maxForeignPlayers: [5],
      substitutionsAllowed: [5],
      firstTiebreaker: ['GOAL_DIFFERENCE'],
      secondTiebreaker: ['GOALS_SCORED'],
      thirdTiebreaker: ['HEAD_TO_HEAD'],
    });
  }

  private initEditForm(): void {
    this.editTournamentForm = this.fb.group({
      // Basic info (code is not editable)
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      shortName: ['', [Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(500)]],
      // Classification
      format: ['LEAGUE', [Validators.required]],
      category: ['PRIMERA', [Validators.required]],
      gender: ['MALE', [Validators.required]],
      footballType: ['FOOTBALL_11', [Validators.required]],
      seasonYear: [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
      // Dates
      startDate: [''],
      endDate: [''],
      registrationStart: [''],
      registrationEnd: [''],
      // Teams
      minTeams: [2, [Validators.min(2)]],
      maxTeams: [32, [Validators.min(2)]],
      // Additional
      logoUrl: ['', [Validators.maxLength(255)]],
      organizer: ['', [Validators.maxLength(100)]],
      location: ['', [Validators.maxLength(200)]],
      prizeDescription: ['', [Validators.maxLength(500)]],
      // Rules
      pointsForWin: [3],
      pointsForDraw: [1],
      pointsForLoss: [0],
      matchDurationMinutes: [90],
      halfTimeDurationMinutes: [15],
      allowsExtraTime: [false],
      extraTimeDurationMinutes: [30],
      allowsPenalties: [true],
      homeAndAway: [true],
      yellowCardsForSuspension: [5],
      redCardSuspensionMatches: [1],
      maxPlayersPerTeam: [25],
      minPlayersPerTeam: [11],
      maxForeignPlayers: [5],
      substitutionsAllowed: [5],
      firstTiebreaker: ['GOAL_DIFFERENCE'],
      secondTiebreaker: ['GOALS_SCORED'],
      thirdTiebreaker: ['HEAD_TO_HEAD'],
    });
  }

  loadTournaments(): void {
    this.loading = true;
    this.tournamentService.search(this.search, this.page, this.size, this.sort).subscribe({
      next: (response) => {
        this.rows = response.body.data;
        this.filteredRows = [...this.rows];
        this.totalElements = response.body.pagination?.totalElements || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tournaments:', error);
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
        row.organizer?.toLowerCase().includes(val) ||
        row.location?.toLowerCase().includes(val) ||
        row.id?.toString().includes(val)
      );
    });

    if (this.table) {
      this.table.offset = 0;
    }
  }

  onPageChange(pageInfo: any): void {
    this.page = pageInfo.offset;
    this.loadTournaments();
  }

  onSort(event: any): void {
    const sortColumn = event.sorts[0];
    const direction = sortColumn.dir === 'asc' ? 'asc' : 'desc';
    this.sort = `${sortColumn.prop},${direction}`;
    this.page = 0;
    this.loadTournaments();
  }

  // Open modal to add new tournament
  openAddModal(content: any): void {
    this.tournamentForm.reset({
      format: 'LEAGUE',
      category: 'PRIMERA',
      gender: 'MALE',
      footballType: 'FOOTBALL_11',
      seasonYear: new Date().getFullYear(),
      minTeams: 2,
      maxTeams: 32,
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
      matchDurationMinutes: 90,
      halfTimeDurationMinutes: 15,
      allowsExtraTime: false,
      extraTimeDurationMinutes: 30,
      allowsPenalties: true,
      homeAndAway: true,
      yellowCardsForSuspension: 5,
      redCardSuspensionMatches: 1,
      maxPlayersPerTeam: 25,
      minPlayersPerTeam: 11,
      maxForeignPlayers: 5,
      substitutionsAllowed: 5,
      firstTiebreaker: 'GOAL_DIFFERENCE',
      secondTiebreaker: 'GOALS_SCORED',
      thirdTiebreaker: 'HEAD_TO_HEAD',
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
  }

  // Save new tournament
  onAddTournamentSave(): void {
    if (this.tournamentForm.invalid) {
      return;
    }

    const formValue = this.tournamentForm.value;
    const rules: TournamentRulesDto = {
      pointsForWin: formValue.pointsForWin,
      pointsForDraw: formValue.pointsForDraw,
      pointsForLoss: formValue.pointsForLoss,
      matchDurationMinutes: formValue.matchDurationMinutes,
      halfTimeDurationMinutes: formValue.halfTimeDurationMinutes,
      allowsExtraTime: formValue.allowsExtraTime,
      extraTimeDurationMinutes: formValue.extraTimeDurationMinutes,
      allowsPenalties: formValue.allowsPenalties,
      homeAndAway: formValue.homeAndAway,
      yellowCardsForSuspension: formValue.yellowCardsForSuspension,
      redCardSuspensionMatches: formValue.redCardSuspensionMatches,
      maxPlayersPerTeam: formValue.maxPlayersPerTeam,
      minPlayersPerTeam: formValue.minPlayersPerTeam,
      maxForeignPlayers: formValue.maxForeignPlayers,
      substitutionsAllowed: formValue.substitutionsAllowed,
      firstTiebreaker: formValue.firstTiebreaker,
      secondTiebreaker: formValue.secondTiebreaker,
      thirdTiebreaker: formValue.thirdTiebreaker,
    };

    const request: CreateTournamentRequest = {
      code: formValue.code,
      name: formValue.name,
      shortName: formValue.shortName || undefined,
      description: formValue.description || undefined,
      format: formValue.format,
      category: formValue.category,
      gender: formValue.gender,
      footballType: formValue.footballType,
      seasonYear: formValue.seasonYear,
      startDate: formValue.startDate || undefined,
      endDate: formValue.endDate || undefined,
      registrationStart: formValue.registrationStart || undefined,
      registrationEnd: formValue.registrationEnd || undefined,
      minTeams: formValue.minTeams,
      maxTeams: formValue.maxTeams,
      logoUrl: formValue.logoUrl || undefined,
      organizer: formValue.organizer || undefined,
      location: formValue.location || undefined,
      prizeDescription: formValue.prizeDescription || undefined,
      rules: rules,
    };

    this.tournamentService.create(request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.tournamentForm.reset();
        this.loadTournaments();
      },
      error: (error) => {
        const errorMessage = typeof error === 'string' ? error : (error.message || 'Error creating tournament');
        this.toastr.error(errorMessage);
      },
    });
  }

  // Open modal to edit tournament
  openEditModal(content: any, row: TournamentResponse): void {
    this.editingTournament = row;
    this.editTournamentForm.patchValue({
      name: row.name || '',
      shortName: row.shortName || '',
      description: row.description || '',
      format: row.format || 'LEAGUE',
      category: row.category || 'PRIMERA',
      gender: row.gender || 'MALE',
      footballType: row.footballType || 'FOOTBALL_11',
      seasonYear: row.seasonYear || new Date().getFullYear(),
      startDate: row.startDate || '',
      endDate: row.endDate || '',
      registrationStart: row.registrationStart || '',
      registrationEnd: row.registrationEnd || '',
      minTeams: row.minTeams || 2,
      maxTeams: row.maxTeams || 32,
      logoUrl: row.logoUrl || '',
      organizer: row.organizer || '',
      location: row.location || '',
      prizeDescription: row.prizeDescription || '',
      // Rules
      pointsForWin: row.rules?.pointsForWin ?? 3,
      pointsForDraw: row.rules?.pointsForDraw ?? 1,
      pointsForLoss: row.rules?.pointsForLoss ?? 0,
      matchDurationMinutes: row.rules?.matchDurationMinutes ?? 90,
      halfTimeDurationMinutes: row.rules?.halfTimeDurationMinutes ?? 15,
      allowsExtraTime: row.rules?.allowsExtraTime ?? false,
      extraTimeDurationMinutes: row.rules?.extraTimeDurationMinutes ?? 30,
      allowsPenalties: row.rules?.allowsPenalties ?? true,
      homeAndAway: row.rules?.homeAndAway ?? true,
      yellowCardsForSuspension: row.rules?.yellowCardsForSuspension ?? 5,
      redCardSuspensionMatches: row.rules?.redCardSuspensionMatches ?? 1,
      maxPlayersPerTeam: row.rules?.maxPlayersPerTeam ?? 25,
      minPlayersPerTeam: row.rules?.minPlayersPerTeam ?? 11,
      maxForeignPlayers: row.rules?.maxForeignPlayers ?? 5,
      substitutionsAllowed: row.rules?.substitutionsAllowed ?? 5,
      firstTiebreaker: row.rules?.firstTiebreaker || 'GOAL_DIFFERENCE',
      secondTiebreaker: row.rules?.secondTiebreaker || 'GOALS_SCORED',
      thirdTiebreaker: row.rules?.thirdTiebreaker || 'HEAD_TO_HEAD',
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-edit-title',
      size: 'xl',
    });
  }

  // Save edited tournament
  onEditTournamentSave(): void {
    if (this.editTournamentForm.invalid || !this.editingTournament) {
      return;
    }

    const formValue = this.editTournamentForm.value;
    const rules: TournamentRulesDto = {
      pointsForWin: formValue.pointsForWin,
      pointsForDraw: formValue.pointsForDraw,
      pointsForLoss: formValue.pointsForLoss,
      matchDurationMinutes: formValue.matchDurationMinutes,
      halfTimeDurationMinutes: formValue.halfTimeDurationMinutes,
      allowsExtraTime: formValue.allowsExtraTime,
      extraTimeDurationMinutes: formValue.extraTimeDurationMinutes,
      allowsPenalties: formValue.allowsPenalties,
      homeAndAway: formValue.homeAndAway,
      yellowCardsForSuspension: formValue.yellowCardsForSuspension,
      redCardSuspensionMatches: formValue.redCardSuspensionMatches,
      maxPlayersPerTeam: formValue.maxPlayersPerTeam,
      minPlayersPerTeam: formValue.minPlayersPerTeam,
      maxForeignPlayers: formValue.maxForeignPlayers,
      substitutionsAllowed: formValue.substitutionsAllowed,
      firstTiebreaker: formValue.firstTiebreaker,
      secondTiebreaker: formValue.secondTiebreaker,
      thirdTiebreaker: formValue.thirdTiebreaker,
    };

    const request: UpdateTournamentRequest = {
      name: formValue.name,
      shortName: formValue.shortName || undefined,
      description: formValue.description || undefined,
      format: formValue.format,
      category: formValue.category,
      gender: formValue.gender,
      footballType: formValue.footballType,
      seasonYear: formValue.seasonYear,
      startDate: formValue.startDate || undefined,
      endDate: formValue.endDate || undefined,
      registrationStart: formValue.registrationStart || undefined,
      registrationEnd: formValue.registrationEnd || undefined,
      minTeams: formValue.minTeams,
      maxTeams: formValue.maxTeams,
      logoUrl: formValue.logoUrl || undefined,
      organizer: formValue.organizer || undefined,
      location: formValue.location || undefined,
      prizeDescription: formValue.prizeDescription || undefined,
      rules: rules,
    };

    this.tournamentService.update(this.editingTournament.id, request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.editTournamentForm.reset();
        this.editingTournament = null;
        this.loadTournaments();
      },
      error: (error) => {
        const errorMessage = typeof error === 'string' ? error : (error.message || 'Error updating tournament');
        this.toastr.error(errorMessage);
      },
    });
  }

  // Delete tournament with confirmation
  deleteTournament(row: TournamentResponse): void {
    Swal.fire({
      title: this.translate.instant('TOURNAMENTS.DELETE_CONFIRM_TITLE'),
      text: this.translate.instant('TOURNAMENTS.DELETE_CONFIRM_MESSAGE', { name: row.name }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.tournamentService.delete(row.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadTournaments();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : (error.message || 'Error deleting tournament');
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  // Navigate to tournament detail
  viewTournament(row: TournamentResponse): void {
    this.router.navigate(['/tournaments', row.id]);
  }

  // Get status badge class
  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      DRAFT: 'bg-secondary',
      REGISTRATION_OPEN: 'bg-info',
      REGISTRATION_CLOSED: 'bg-warning',
      SCHEDULED: 'bg-primary',
      IN_PROGRESS: 'bg-success',
      PAUSED: 'bg-warning',
      FINISHED: 'bg-dark',
      CANCELLED: 'bg-danger',
    };
    return statusClasses[status] || 'bg-secondary';
  }

  // Get label from options array
  getLabel(options: { value: string; label: string }[], value: string): string {
    const option = options.find((o) => o.value === value);
    return option ? option.label : value;
  }
}
