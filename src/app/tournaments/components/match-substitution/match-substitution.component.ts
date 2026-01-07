import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import {
  MatchService,
  MatchResponse,
  MatchLineupResponse,
  TeamLineupResponse,
  UpdateMatchLineupRequest,
} from '@core';

@Component({
  selector: 'app-match-substitution',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, NgbNavModule],
  templateUrl: './match-substitution.component.html',
  styleUrls: ['./match-substitution.component.scss'],
})
export class MatchSubstitutionComponent implements OnInit, OnChanges {
  @Input() match!: MatchResponse;
  @Input() canEdit = false;
  @Output() substitutionMade = new EventEmitter<void>();
  @Output() closeRequested = new EventEmitter<void>();

  activeTab = 1; // 1 = home, 2 = away

  // Home team lineup
  homeTeamLineup: TeamLineupResponse | null = null;
  homeLoading = false;

  // Away team lineup
  awayTeamLineup: TeamLineupResponse | null = null;
  awayLoading = false;

  // Substitution form
  substitutionForm!: UntypedFormGroup;
  selectedPlayerOut: MatchLineupResponse | null = null;
  selectedPlayerIn: MatchLineupResponse | null = null;
  isHomeTeam = true;

  saving = false;

  constructor(
    private matchService: MatchService,
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
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
    this.substitutionForm = this.fb.group({
      minuteOut: [null, [Validators.required, Validators.min(1), Validators.max(120)]],
      notes: [''],
    });
  }

  private loadData(): void {
    this.loadHomeLineup();
    this.loadAwayLineup();
  }

  private loadHomeLineup(): void {
    this.homeLoading = true;
    this.matchService.getTeamLineup(this.match.id, this.match.homeTeamId).subscribe({
      next: (response) => {
        this.homeTeamLineup = response.body.data;
        this.homeLoading = false;
      },
      error: () => {
        this.homeTeamLineup = null;
        this.homeLoading = false;
      },
    });
  }

  private loadAwayLineup(): void {
    this.awayLoading = true;
    this.matchService.getTeamLineup(this.match.id, this.match.awayTeamId).subscribe({
      next: (response) => {
        this.awayTeamLineup = response.body.data;
        this.awayLoading = false;
      },
      error: () => {
        this.awayTeamLineup = null;
        this.awayLoading = false;
      },
    });
  }

  getActivePlayers(lineup: TeamLineupResponse | null): MatchLineupResponse[] {
    if (!lineup) return [];
    // Active players = starters who haven't been subbed out + subs who have been subbed in
    const starters = lineup.starters.filter(p => !p.minuteOut);
    const subsIn = lineup.substitutes.filter(p => p.minuteIn && !p.minuteOut);
    return [...starters, ...subsIn];
  }

  getAvailableSubstitutes(lineup: TeamLineupResponse | null): MatchLineupResponse[] {
    if (!lineup) return [];
    // Available subs = substitutes who haven't been used yet
    return lineup.substitutes.filter(p => !p.minuteIn);
  }

  getSubbedOutPlayers(lineup: TeamLineupResponse | null): MatchLineupResponse[] {
    if (!lineup) return [];
    // Players who have been subbed out
    const starters = lineup.starters.filter(p => p.minuteOut);
    const subs = lineup.substitutes.filter(p => p.minuteOut);
    return [...starters, ...subs];
  }

  getSubbedInPlayers(lineup: TeamLineupResponse | null): MatchLineupResponse[] {
    if (!lineup) return [];
    // Substitutes who have been subbed in
    return lineup.substitutes.filter(p => p.minuteIn);
  }

  openSubstitutionModal(content: any, playerOut: MatchLineupResponse, isHome: boolean): void {
    this.selectedPlayerOut = playerOut;
    this.isHomeTeam = isHome;
    this.selectedPlayerIn = null;
    this.substitutionForm.reset();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-substitution-title',
      size: 'md',
    });
  }

  selectPlayerIn(player: MatchLineupResponse): void {
    this.selectedPlayerIn = player;
  }

  onMakeSubstitution(): void {
    if (!this.selectedPlayerOut || !this.selectedPlayerIn || this.substitutionForm.invalid) {
      this.substitutionForm.markAllAsTouched();
      return;
    }

    const minute = this.substitutionForm.get('minuteOut')?.value;
    const notes = this.substitutionForm.get('notes')?.value;

    this.saving = true;

    // Update player going out
    const outRequest: UpdateMatchLineupRequest = {
      minuteOut: minute,
      notes: notes || undefined,
    };

    // Update player coming in
    const inRequest: UpdateMatchLineupRequest = {
      minuteIn: minute,
      isStarter: false,
    };

    // Execute both updates
    this.matchService.updateLineupEntry(this.match.id, this.selectedPlayerOut.id, outRequest).subscribe({
      next: () => {
        this.matchService.updateLineupEntry(this.match.id, this.selectedPlayerIn!.id, inRequest).subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('SUBSTITUTION.SUCCESS'));
            this.modalService.dismissAll();
            this.saving = false;
            this.loadData();
            this.substitutionMade.emit();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
            this.toastr.error(errorMessage);
            this.saving = false;
          },
        });
      },
      error: (error) => {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
        this.toastr.error(errorMessage);
        this.saving = false;
      },
    });
  }

  undoSubstitution(player: MatchLineupResponse): void {
    Swal.fire({
      title: this.translate.instant('SUBSTITUTION.UNDO_CONFIRM_TITLE'),
      text: this.translate.instant('SUBSTITUTION.UNDO_CONFIRM_MESSAGE'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: this.translate.instant('COMMON.YES'),
      cancelButtonText: this.translate.instant('COMMON.NO'),
    }).then((result) => {
      if (result.isConfirmed) {
        const request: UpdateMatchLineupRequest = {
          minuteIn: undefined,
          minuteOut: undefined,
        };

        this.matchService.updateLineupEntry(this.match.id, player.id, request).subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('SUBSTITUTION.UNDO_SUCCESS'));
            this.loadData();
            this.substitutionMade.emit();
          },
          error: (error) => {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
            this.toastr.error(errorMessage);
          },
        });
      }
    });
  }

  isMatchInProgress(): boolean {
    return ['IN_PROGRESS', 'HALF_TIME', 'SECOND_HALF', 'EXTRA_TIME'].includes(this.match.status);
  }
}
