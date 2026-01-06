import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  MatchService,
  TournamentTeamService,
  StandingService,
  MatchSummaryResponse,
  MatchStatus,
  CreateMatchRequest,
  UpdateMatchRequest,
  TournamentTeamResponse,
} from '@core';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-tournament-matches',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './tournament-matches.component.html',
  styleUrls: ['./tournament-matches.component.scss'],
})
export class TournamentMatchesComponent implements OnInit, OnChanges {
  @Input() tournamentId!: number;
  @Input() canEdit = false;

  matches: MatchSummaryResponse[] = [];
  filteredMatches: MatchSummaryResponse[] = [];
  loading = false;
  error: string | null = null;

  // Matchday filter
  matchdays: number[] = [];
  selectedMatchday: number | null = null;

  // Status filter
  statusOptions: MatchStatus[] = [
    'SCHEDULED',
    'CONFIRMED',
    'IN_PROGRESS',
    'HALF_TIME',
    'SECOND_HALF',
    'EXTRA_TIME',
    'PENALTIES',
    'FINISHED',
    'SUSPENDED',
    'POSTPONED',
    'CANCELLED',
    'WALKOVER',
  ];
  selectedStatus: MatchStatus | null = null;

  // Match form
  matchForm!: UntypedFormGroup;
  editingMatch: MatchSummaryResponse | null = null;
  isEditMode = false;

  // Teams for dropdowns
  teams: TournamentTeamResponse[] = [];

  constructor(
    private matchService: MatchService,
    private tournamentTeamService: TournamentTeamService,
    private standingService: StandingService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    if (this.tournamentId) {
      this.loadMatches();
      this.loadTeams();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tournamentId'] && this.tournamentId && !changes['tournamentId'].firstChange) {
      this.loadMatches();
      this.loadTeams();
    }
  }

  private initForm(): void {
    this.matchForm = this.fb.group({
      homeTeamId: [null, [Validators.required]],
      awayTeamId: [null, [Validators.required]],
      matchday: [1, [Validators.required, Validators.min(1)]],
      matchDate: [''],
      matchTime: [''],
      venue: ['', [Validators.maxLength(200)]],
    });
  }

  loadMatches(): void {
    this.loading = true;
    this.error = null;

    this.matchService.getByTournament(this.tournamentId, 0, 100).subscribe({
      next: (response) => {
        this.matches = response.body.data;
        this.extractMatchdays();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading matches:', err);
        this.error = 'Error loading matches';
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

  private extractMatchdays(): void {
    const uniqueMatchdays = [...new Set(this.matches.map((m) => m.matchday))];
    this.matchdays = uniqueMatchdays.sort((a, b) => a - b);
  }

  applyFilters(): void {
    this.filteredMatches = this.matches.filter((match) => {
      const matchdayFilter = this.selectedMatchday === null || match.matchday === this.selectedMatchday;
      const statusFilter = this.selectedStatus === null || match.status === this.selectedStatus;
      return matchdayFilter && statusFilter;
    });
  }

  onMatchdayChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedMatchday = null;
    this.selectedStatus = null;
    this.applyFilters();
  }

  getStatusClass(status: MatchStatus): string {
    const classes: Record<MatchStatus, string> = {
      SCHEDULED: 'bg-info',
      CONFIRMED: 'bg-primary',
      IN_PROGRESS: 'bg-warning',
      HALF_TIME: 'bg-warning',
      SECOND_HALF: 'bg-warning',
      EXTRA_TIME: 'bg-warning',
      PENALTIES: 'bg-warning',
      FINISHED: 'bg-success',
      POSTPONED: 'bg-secondary',
      CANCELLED: 'bg-danger',
      SUSPENDED: 'bg-dark',
      WALKOVER: 'bg-dark',
    };
    return classes[status] || 'bg-secondary';
  }

  getStatusLabel(status: MatchStatus): string {
    const key = `MATCHES.STATUS_${status}`;
    return this.translate.instant(key);
  }

  // Match CRUD operations
  openAddModal(content: any): void {
    this.isEditMode = false;
    this.editingMatch = null;
    this.matchForm.reset({ matchday: 1 });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-match-title',
      size: 'lg',
    });
  }

  openEditModal(content: any, match: MatchSummaryResponse): void {
    this.isEditMode = true;
    this.editingMatch = match;
    this.matchForm.patchValue({
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      matchday: match.matchday,
      matchDate: match.matchDate,
      matchTime: match.matchTime,
      venue: match.venue,
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-match-title',
      size: 'lg',
    });
  }

  onSaveMatch(): void {
    if (this.matchForm.invalid) {
      this.matchForm.markAllAsTouched();
      return;
    }

    const formValue = this.matchForm.value;

    if (this.isEditMode && this.editingMatch) {
      const request: UpdateMatchRequest = {
        matchday: formValue.matchday,
        matchDate: formValue.matchDate || undefined,
        matchTime: formValue.matchTime || undefined,
        venue: formValue.venue || undefined,
      };

      this.matchService.update(this.editingMatch.id, request).subscribe({
        next: (response) => {
          this.toastr.success(response.header.message);
          this.modalService.dismissAll();
          this.loadMatches();
        },
        error: (error) => {
          const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
          this.toastr.error(errorMessage);
        },
      });
    } else {
      const request: CreateMatchRequest = {
        tournamentId: this.tournamentId,
        homeTeamId: formValue.homeTeamId,
        awayTeamId: formValue.awayTeamId,
        matchday: formValue.matchday,
        matchDate: formValue.matchDate || undefined,
        matchTime: formValue.matchTime || undefined,
        venue: formValue.venue || undefined,
      };

      this.matchService.create(request).subscribe({
        next: (response) => {
          this.toastr.success(response.header.message);
          this.modalService.dismissAll();
          this.loadMatches();
        },
        error: (error) => {
          const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
          this.toastr.error(errorMessage);
        },
      });
    }
  }

  deleteMatch(match: MatchSummaryResponse): void {
    Swal.fire({
      title: this.translate.instant('MATCHES.DELETE_CONFIRM_TITLE'),
      text: this.translate.instant('MATCHES.DELETE_CONFIRM_MESSAGE'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.matchService.delete(match.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadMatches();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  // Match status actions
  startMatch(match: MatchSummaryResponse): void {
    Swal.fire({
      title: this.translate.instant('MATCHES.START_CONFIRM_TITLE'),
      text: this.translate.instant('MATCHES.START_CONFIRM_MESSAGE'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.matchService.start(match.id).subscribe({
          next: (response) => {
            this.toastr.success(response.header.message);
            this.loadMatches();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  finishMatch(match: MatchSummaryResponse): void {
    Swal.fire({
      title: this.translate.instant('MATCHES.FINISH_CONFIRM_TITLE'),
      text: this.translate.instant('MATCHES.FINISH_CONFIRM_MESSAGE'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.matchService.finish(match.id).pipe(
          switchMap((response) => {
            this.toastr.success(response.header.message);
            return this.standingService.recalculateStandings(this.tournamentId);
          })
        ).subscribe({
          next: () => {
            this.loadMatches();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
            this.toastr.error(errorMessage);
            this.loadMatches();
          },
        });
      }
    });
  }

  // Score update
  openScoreModal(content: any, match: MatchSummaryResponse): void {
    this.editingMatch = match;
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-score-title',
      size: 'sm',
      centered: true,
    });
  }

  onUpdateScore(homeScore: number, awayScore: number): void {
    if (this.editingMatch) {
      this.matchService.updateScore(this.editingMatch.id, { homeScore, awayScore }).subscribe({
        next: (response) => {
          this.toastr.success(response.header.message);
          this.modalService.dismissAll();
          this.loadMatches();
        },
        error: (error) => {
          const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
          this.toastr.error(errorMessage);
        },
      });
    }
  }

  // Helper methods for template
  getUniqueMatchdays(): number[] {
    const uniqueMatchdays = [...new Set(this.filteredMatches.map((m) => m.matchday))];
    return uniqueMatchdays.sort((a, b) => a - b);
  }

  getMatchesByMatchday(matchday: number): MatchSummaryResponse[] {
    return this.filteredMatches.filter((m) => m.matchday === matchday);
  }
}
