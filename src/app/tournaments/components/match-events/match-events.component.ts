import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  MatchService,
  MatchResponse,
  MatchEventResponse,
  MatchEventType,
  CreateMatchEventRequest,
  TeamLineupResponse,
  MatchLineupResponse,
} from '@core';

@Component({
  selector: 'app-match-events',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, NgbNavModule],
  templateUrl: './match-events.component.html',
  styleUrls: ['./match-events.component.scss'],
})
export class MatchEventsComponent implements OnInit, OnChanges {
  @Input() match!: MatchResponse;
  @Input() canEdit = false;
  @Output() eventAdded = new EventEmitter<void>();
  @Output() closeRequested = new EventEmitter<void>();

  activeTab = 1; // 1 = home, 2 = away

  // Events
  goals: MatchEventResponse[] = [];
  cards: MatchEventResponse[] = [];
  loading = false;

  // Lineups for player selection
  homeTeamLineup: TeamLineupResponse | null = null;
  awayTeamLineup: TeamLineupResponse | null = null;
  loadingLineups = false;

  // Goal form
  goalForm!: UntypedFormGroup;
  showGoalForm = false;
  selectedTeamIdForGoal: number | null = null;
  savingGoal = false;

  // Card form
  cardForm!: UntypedFormGroup;
  showCardForm = false;
  selectedTeamIdForCard: number | null = null;
  savingCard = false;

  // Event types
  goalTypes: MatchEventType[] = ['GOAL', 'OWN_GOAL', 'PENALTY_GOAL'];
  cardTypes: MatchEventType[] = ['YELLOW_CARD', 'RED_CARD', 'SECOND_YELLOW'];

  constructor(
    private matchService: MatchService,
    private fb: UntypedFormBuilder,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    if (this.match) {
      this.loadData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['match'] && this.match) {
      this.loadData();
    }
  }

  private initForm(): void {
    this.goalForm = this.fb.group({
      eventType: ['GOAL', [Validators.required]],
      minute: [null, [Validators.required, Validators.min(1), Validators.max(120)]],
      additionalTime: [null],
      playerId: [null, [Validators.required]],
      assistPlayerId: [null],
      description: [''],
    });

    this.cardForm = this.fb.group({
      eventType: ['YELLOW_CARD', [Validators.required]],
      minute: [null, [Validators.required, Validators.min(1), Validators.max(120)]],
      additionalTime: [null],
      playerId: [null, [Validators.required]],
      description: [''],
    });
  }

  private loadData(): void {
    this.loadEvents();
    this.loadLineups();
  }

  private loadEvents(): void {
    this.loading = true;

    // Load goals
    this.matchService.getGoals(this.match.id).subscribe({
      next: (response) => {
        this.goals = response.body.data;
      },
      error: (err) => {
        console.error('Error loading goals:', err);
      },
    });

    // Load cards
    this.matchService.getCards(this.match.id).subscribe({
      next: (response) => {
        this.cards = response.body.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading cards:', err);
        this.loading = false;
      },
    });
  }

  private loadLineups(): void {
    this.loadingLineups = true;

    // Load home team lineup
    this.matchService.getTeamLineup(this.match.id, this.match.homeTeamId).subscribe({
      next: (response) => {
        this.homeTeamLineup = response.body.data;
      },
      error: () => {
        // No lineup
      },
    });

    // Load away team lineup
    this.matchService.getTeamLineup(this.match.id, this.match.awayTeamId).subscribe({
      next: (response) => {
        this.awayTeamLineup = response.body.data;
        this.loadingLineups = false;
      },
      error: () => {
        this.loadingLineups = false;
      },
    });
  }

  // Goal getters
  getHomeGoals(): MatchEventResponse[] {
    return this.goals.filter((e) => e.teamId === this.match.homeTeamId);
  }

  getAwayGoals(): MatchEventResponse[] {
    return this.goals.filter((e) => e.teamId === this.match.awayTeamId);
  }

  // Card getters
  getHomeCards(): MatchEventResponse[] {
    return this.cards.filter((e) => e.teamId === this.match.homeTeamId);
  }

  getAwayCards(): MatchEventResponse[] {
    return this.cards.filter((e) => e.teamId === this.match.awayTeamId);
  }

  getActivePlayers(lineup: TeamLineupResponse | null): MatchLineupResponse[] {
    if (!lineup) return [];
    return [...lineup.starters, ...lineup.substitutes].filter(
      (p) => !p.minuteOut || p.minuteIn
    );
  }

  // Goal form methods
  openGoalForm(teamId: number): void {
    this.selectedTeamIdForGoal = teamId;
    this.showGoalForm = true;
    this.goalForm.reset({ eventType: 'GOAL' });
  }

  cancelGoalForm(): void {
    this.showGoalForm = false;
    this.selectedTeamIdForGoal = null;
    this.goalForm.reset({ eventType: 'GOAL' });
  }

  onAddGoal(): void {
    if (this.goalForm.invalid || !this.selectedTeamIdForGoal) {
      this.goalForm.markAllAsTouched();
      return;
    }

    const formValue = this.goalForm.value;

    const request: CreateMatchEventRequest = {
      eventType: formValue.eventType,
      minute: formValue.minute,
      additionalTime: formValue.additionalTime || undefined,
      teamId: this.selectedTeamIdForGoal,
      playerId: formValue.playerId,
      assistPlayerId: formValue.assistPlayerId || undefined,
      description: formValue.description || undefined,
    };

    this.savingGoal = true;

    this.matchService.addEvent(this.match.id, request).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('EVENTS.GOAL_ADDED'));
        this.savingGoal = false;
        this.showGoalForm = false;
        this.selectedTeamIdForGoal = null;
        this.goalForm.reset({ eventType: 'GOAL' });
        this.loadEvents();
        this.eventAdded.emit();
      },
      error: (error) => {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
        this.toastr.error(errorMessage);
        this.savingGoal = false;
      },
    });
  }

  deleteGoal(event: MatchEventResponse): void {
    Swal.fire({
      title: this.translate.instant('EVENTS.DELETE_GOAL_TITLE'),
      text: this.translate.instant('EVENTS.DELETE_GOAL_MESSAGE'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.matchService.deleteEvent(this.match.id, event.id).subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('EVENTS.GOAL_DELETED'));
            this.loadEvents();
            this.eventAdded.emit();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  // Card form methods
  openCardForm(teamId: number): void {
    this.selectedTeamIdForCard = teamId;
    this.showCardForm = true;
    this.cardForm.reset({ eventType: 'YELLOW_CARD' });
  }

  cancelCardForm(): void {
    this.showCardForm = false;
    this.selectedTeamIdForCard = null;
    this.cardForm.reset({ eventType: 'YELLOW_CARD' });
  }

  onAddCard(): void {
    if (this.cardForm.invalid || !this.selectedTeamIdForCard) {
      this.cardForm.markAllAsTouched();
      return;
    }

    const formValue = this.cardForm.value;

    const request: CreateMatchEventRequest = {
      eventType: formValue.eventType,
      minute: formValue.minute,
      additionalTime: formValue.additionalTime || undefined,
      teamId: this.selectedTeamIdForCard,
      playerId: formValue.playerId,
      description: formValue.description || undefined,
    };

    this.savingCard = true;

    this.matchService.addEvent(this.match.id, request).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('EVENTS.CARD_ADDED'));
        this.savingCard = false;
        this.showCardForm = false;
        this.selectedTeamIdForCard = null;
        this.cardForm.reset({ eventType: 'YELLOW_CARD' });
        this.loadEvents();
        this.eventAdded.emit();
      },
      error: (error) => {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
        this.toastr.error(errorMessage);
        this.savingCard = false;
      },
    });
  }

  deleteCard(event: MatchEventResponse): void {
    Swal.fire({
      title: this.translate.instant('EVENTS.DELETE_CARD_TITLE'),
      text: this.translate.instant('EVENTS.DELETE_CARD_MESSAGE'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        this.matchService.deleteEvent(this.match.id, event.id).subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('EVENTS.CARD_DELETED'));
            this.loadEvents();
            this.eventAdded.emit();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  // Helper methods
  getEventTypeLabel(type: MatchEventType): string {
    const key = `EVENTS.TYPE_${type}`;
    return this.translate.instant(key);
  }

  getCardClass(type: MatchEventType): string {
    switch (type) {
      case 'YELLOW_CARD':
        return 'bg-warning text-dark';
      case 'RED_CARD':
        return 'bg-danger';
      case 'SECOND_YELLOW':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  }

  getCardIcon(type: MatchEventType): string {
    switch (type) {
      case 'YELLOW_CARD':
        return 'fas fa-square text-warning';
      case 'RED_CARD':
        return 'fas fa-square text-danger';
      case 'SECOND_YELLOW':
        return 'fas fa-square text-warning';
      default:
        return 'fas fa-square';
    }
  }

  formatMinute(event: MatchEventResponse): string {
    if (event.additionalTime) {
      return `${event.minute}+${event.additionalTime}'`;
    }
    return `${event.minute}'`;
  }
}
