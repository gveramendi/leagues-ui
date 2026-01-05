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
import { NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  TournamentService,
  TournamentTeamService,
  TeamService,
  TournamentResponse,
  TournamentTeamResponse,
  TeamResponse,
  RegisterTeamRequest,
  RejectTeamRequest,
} from '@core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { TournamentStandingsComponent } from '../../components/tournament-standings/tournament-standings.component';
import { TournamentScorersComponent } from '../../components/tournament-scorers/tournament-scorers.component';
import { TournamentAssistsComponent } from '../../components/tournament-assists/tournament-assists.component';

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgxDatatableModule,
    NgbNavModule,
    TranslateModule,
    TournamentStandingsComponent,
    TournamentScorersComponent,
    TournamentAssistsComponent,
  ],
  templateUrl: './tournament-detail.component.html',
  styleUrls: ['./tournament-detail.component.scss'],
})
export class TournamentDetailComponent implements OnInit {
  @ViewChild(DatatableComponent) table!: DatatableComponent;

  tournamentId!: number;
  tournament: TournamentResponse | null = null;
  loading = false;
  activeTab = 1;

  // Teams
  teams: TournamentTeamResponse[] = [];
  filteredTeams: TournamentTeamResponse[] = [];
  teamsLoading = false;

  // Team registration form
  registerTeamForm!: UntypedFormGroup;
  availableTeams: TeamResponse[] = [];
  teamSearchTerm$ = new Subject<string>();

  // Reject/Withdraw form
  rejectForm!: UntypedFormGroup;
  selectedTeamRegistration: TournamentTeamResponse | null = null;
  actionType: 'reject' | 'withdraw' = 'reject';

  // Status options
  registrationStatuses = [
    { value: 'PENDING', label: 'Pendiente', class: 'bg-warning' },
    { value: 'APPROVED', label: 'Aprobado', class: 'bg-success' },
    { value: 'REJECTED', label: 'Rechazado', class: 'bg-danger' },
    { value: 'WITHDRAWN', label: 'Retirado', class: 'bg-secondary' },
    { value: 'DISQUALIFIED', label: 'Descalificado', class: 'bg-dark' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tournamentService: TournamentService,
    private tournamentTeamService: TournamentTeamService,
    private teamService: TeamService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.initForms();
    this.setupTeamSearch();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.tournamentId = +params['tournamentId'];
      this.loadTournament();
      this.loadTeams();
    });
  }

  private initForms(): void {
    this.registerTeamForm = this.fb.group({
      teamId: [null, [Validators.required]],
      notes: ['', [Validators.maxLength(500)]],
    });

    this.rejectForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    });
  }

  private setupTeamSearch(): void {
    this.teamSearchTerm$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        if (term && term.length >= 2) {
          this.searchTeams(term);
        } else {
          this.availableTeams = [];
        }
      });
  }

  loadTournament(): void {
    this.loading = true;
    this.tournamentService.getById(this.tournamentId).subscribe({
      next: (response) => {
        this.tournament = response.body.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tournament:', error);
        this.loading = false;
        this.router.navigate(['/tournaments/list']);
      },
    });
  }

  loadTeams(): void {
    this.teamsLoading = true;
    this.tournamentTeamService.getAll(this.tournamentId).subscribe({
      next: (response) => {
        this.teams = response.body.data;
        this.filteredTeams = [...this.teams];
        this.teamsLoading = false;
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.teamsLoading = false;
      },
    });
  }

  searchTeams(term: string): void {
    this.teamService.searchTeams(term, 0, 20, 'name,asc').subscribe({
      next: (response) => {
        // Filter out teams already registered
        const registeredTeamIds = this.teams.map((t) => t.teamId);
        this.availableTeams = response.body.data.filter(
          (team) => !registeredTeamIds.includes(team.id)
        );
      },
      error: (error) => {
        console.error('Error searching teams:', error);
      },
    });
  }

  onTeamSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.teamSearchTerm$.next(term);
  }

  filterTeams(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredTeams = this.teams.filter((row) => {
      return (
        row.teamName?.toLowerCase().includes(val) ||
        row.teamCode?.toLowerCase().includes(val) ||
        row.clubName?.toLowerCase().includes(val) ||
        row.registrationNumber?.toString().includes(val)
      );
    });

    if (this.table) {
      this.table.offset = 0;
    }
  }

  // Tournament state actions
  openRegistration(): void {
    Swal.fire({
      title: this.translate.instant('TOURNAMENTS.OPEN_REGISTRATION_TITLE'),
      text: this.translate.instant('TOURNAMENTS.OPEN_REGISTRATION_MESSAGE'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.tournamentService.openRegistration(this.tournamentId).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadTournament();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : (error.message || 'Error');
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  closeRegistration(): void {
    Swal.fire({
      title: this.translate.instant('TOURNAMENTS.CLOSE_REGISTRATION_TITLE'),
      text: this.translate.instant('TOURNAMENTS.CLOSE_REGISTRATION_MESSAGE'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.tournamentService.closeRegistration(this.tournamentId).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadTournament();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : (error.message || 'Error');
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  startTournament(): void {
    Swal.fire({
      title: this.translate.instant('TOURNAMENTS.START_TITLE'),
      text: this.translate.instant('TOURNAMENTS.START_MESSAGE'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.tournamentService.start(this.tournamentId).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadTournament();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : (error.message || 'Error');
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  finishTournament(): void {
    Swal.fire({
      title: this.translate.instant('TOURNAMENTS.FINISH_TITLE'),
      text: this.translate.instant('TOURNAMENTS.FINISH_MESSAGE'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.tournamentService.finish(this.tournamentId).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadTournament();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : (error.message || 'Error');
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  // Team registration
  openRegisterTeamModal(content: any): void {
    this.registerTeamForm.reset();
    this.availableTeams = [];
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-register-title',
      size: 'lg',
    });
  }

  selectTeam(team: TeamResponse): void {
    this.registerTeamForm.patchValue({ teamId: team.id });
    this.availableTeams = [team]; // Keep only selected team visible
  }

  onRegisterTeamSave(): void {
    if (this.registerTeamForm.invalid) {
      return;
    }

    const request: RegisterTeamRequest = {
      teamId: this.registerTeamForm.value.teamId,
      notes: this.registerTeamForm.value.notes || undefined,
    };

    this.tournamentTeamService.registerTeam(this.tournamentId, request).subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.registerTeamForm.reset();
        this.loadTeams();
        this.loadTournament(); // Refresh team counts
      },
      error: (error) => {
        const errorMessage = typeof error === 'string' ? error : (error.message || 'Error registering team');
        this.toastr.error(errorMessage);
      },
    });
  }

  // Approve team
  approveTeam(team: TournamentTeamResponse): void {
    Swal.fire({
      title: this.translate.instant('TOURNAMENTS.APPROVE_TEAM_TITLE'),
      text: this.translate.instant('TOURNAMENTS.APPROVE_TEAM_MESSAGE', { team: team.teamName }),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.tournamentTeamService.approve(this.tournamentId, team.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadTeams();
            this.loadTournament();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : (error.message || 'Error');
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  // Reject team
  openRejectModal(content: any, team: TournamentTeamResponse): void {
    this.selectedTeamRegistration = team;
    this.actionType = 'reject';
    this.rejectForm.reset();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-reject-title',
      size: 'md',
    });
  }

  // Withdraw team
  openWithdrawModal(content: any, team: TournamentTeamResponse): void {
    this.selectedTeamRegistration = team;
    this.actionType = 'withdraw';
    this.rejectForm.reset();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-reject-title',
      size: 'md',
    });
  }

  onRejectWithdrawSave(): void {
    if (this.rejectForm.invalid || !this.selectedTeamRegistration) {
      return;
    }

    const request: RejectTeamRequest = {
      reason: this.rejectForm.value.reason,
    };

    const action$ = this.actionType === 'reject'
      ? this.tournamentTeamService.reject(this.tournamentId, this.selectedTeamRegistration.id, request)
      : this.tournamentTeamService.withdraw(this.tournamentId, this.selectedTeamRegistration.id, request);

    action$.subscribe({
      next: (response) => {
        this.toastr.success(response.header.message);
        this.modalService.dismissAll();
        this.rejectForm.reset();
        this.selectedTeamRegistration = null;
        this.loadTeams();
        this.loadTournament();
      },
      error: (error) => {
        const errorMessage = typeof error === 'string' ? error : (error.message || 'Error');
        this.toastr.error(errorMessage);
      },
    });
  }

  // Delete team registration
  deleteTeamRegistration(team: TournamentTeamResponse): void {
    Swal.fire({
      title: this.translate.instant('TOURNAMENTS.DELETE_TEAM_TITLE'),
      text: this.translate.instant('TOURNAMENTS.DELETE_TEAM_MESSAGE', { team: team.teamName }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.tournamentTeamService.delete(this.tournamentId, team.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadTeams();
            this.loadTournament();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : (error.message || 'Error');
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  // Helpers
  getStatusClass(status: string): string {
    const statusConfig = this.registrationStatuses.find((s) => s.value === status);
    return statusConfig ? statusConfig.class : 'bg-secondary';
  }

  getStatusLabel(status: string): string {
    const statusConfig = this.registrationStatuses.find((s) => s.value === status);
    return statusConfig ? statusConfig.label : status;
  }

  canRegisterTeams(): boolean {
    return this.tournament?.status === 'REGISTRATION_OPEN' || this.tournament?.status === 'DRAFT';
  }

  canApproveReject(): boolean {
    return this.tournament?.status === 'REGISTRATION_OPEN' || this.tournament?.status === 'DRAFT';
  }

  goBack(): void {
    this.router.navigate(['/tournaments/list']);
  }
}
