import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import {
  MatchService,
  PlayerRegistrationService,
  TeamService,
  MatchResponse,
  MatchLineupResponse,
  TeamLineupResponse,
  PlayerRegistrationResponse,
  SetTeamLineupRequest,
  LineupPlayerRequest,
  Position,
} from '@core';
import { forkJoin } from 'rxjs';

interface PlayerSelection {
  player: PlayerRegistrationResponse;
  isSelected: boolean;
  isStarter: boolean;
  position?: Position;
  shirtNumber?: number;
  isCaptain: boolean;
}

@Component({
  selector: 'app-match-lineup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, NgbNavModule],
  templateUrl: './match-lineup.component.html',
  styleUrls: ['./match-lineup.component.scss'],
})
export class MatchLineupComponent implements OnInit, OnChanges {
  @Input() match!: MatchResponse;
  @Input() seasonYear?: number; // Optional fallback, will use team's seasonYear
  @Input() canEdit = false;
  @Output() lineupSaved = new EventEmitter<void>();
  @Output() closeRequested = new EventEmitter<void>();

  activeTab = 1; // 1 = home, 2 = away

  // Home team data
  homeTeamPlayers: PlayerSelection[] = [];
  homeTeamLineup: TeamLineupResponse | null = null;
  homeLoading = false;
  homeTeamSeasonYear?: number;

  // Away team data
  awayTeamPlayers: PlayerSelection[] = [];
  awayTeamLineup: TeamLineupResponse | null = null;
  awayLoading = false;
  awayTeamSeasonYear?: number;

  // Position options
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
    'PIVOT',
    'FIXO',
    'ALA_LEFT',
    'ALA_RIGHT',
  ];

  saving = false;

  constructor(
    private matchService: MatchService,
    private playerRegistrationService: PlayerRegistrationService,
    private teamService: TeamService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

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

  private loadData(): void {
    this.loadHomeTeamData();
    this.loadAwayTeamData();
  }

  private loadHomeTeamData(): void {
    this.homeLoading = true;

    // First get the team to obtain its seasonYear
    this.teamService.getById(this.match.homeTeamId).subscribe({
      next: (teamResponse) => {
        this.homeTeamSeasonYear = teamResponse.body.data.seasonYear;

        // Load team players using the team's seasonYear
        this.playerRegistrationService.getByTeam(this.match.homeTeamId, this.homeTeamSeasonYear).subscribe({
          next: (response) => {
            const players = response.body.data.filter(p => p.status === 'ACTIVE');
            this.homeTeamPlayers = players.map(p => ({
              player: p,
              isSelected: false,
              isStarter: false,
              position: p.position,
              shirtNumber: p.jerseyNumber,
              isCaptain: p.isCaptain || false,
            }));

            // Load existing lineup
            this.loadHomeLineup();
          },
          error: (err) => {
            console.error('Error loading home team players:', err);
            this.homeLoading = false;
          },
        });
      },
      error: (err) => {
        console.error('Error loading home team:', err);
        this.homeLoading = false;
      },
    });
  }

  private loadAwayTeamData(): void {
    this.awayLoading = true;

    // First get the team to obtain its seasonYear
    this.teamService.getById(this.match.awayTeamId).subscribe({
      next: (teamResponse) => {
        this.awayTeamSeasonYear = teamResponse.body.data.seasonYear;

        // Load team players using the team's seasonYear
        this.playerRegistrationService.getByTeam(this.match.awayTeamId, this.awayTeamSeasonYear).subscribe({
          next: (response) => {
            const players = response.body.data.filter(p => p.status === 'ACTIVE');
            this.awayTeamPlayers = players.map(p => ({
              player: p,
              isSelected: false,
              isStarter: false,
              position: p.position,
              shirtNumber: p.jerseyNumber,
              isCaptain: p.isCaptain || false,
            }));

            // Load existing lineup
            this.loadAwayLineup();
          },
          error: (err) => {
            console.error('Error loading away team players:', err);
            this.awayLoading = false;
          },
        });
      },
      error: (err) => {
        console.error('Error loading away team:', err);
        this.awayLoading = false;
      },
    });
  }

  private loadHomeLineup(): void {
    this.matchService.getTeamLineup(this.match.id, this.match.homeTeamId).subscribe({
      next: (response) => {
        this.homeTeamLineup = response.body.data;
        this.applyLineupToPlayers(this.homeTeamPlayers, this.homeTeamLineup);
        this.homeLoading = false;
      },
      error: () => {
        // No lineup yet - that's fine
        this.homeLoading = false;
      },
    });
  }

  private loadAwayLineup(): void {
    this.matchService.getTeamLineup(this.match.id, this.match.awayTeamId).subscribe({
      next: (response) => {
        this.awayTeamLineup = response.body.data;
        this.applyLineupToPlayers(this.awayTeamPlayers, this.awayTeamLineup);
        this.awayLoading = false;
      },
      error: () => {
        // No lineup yet - that's fine
        this.awayLoading = false;
      },
    });
  }

  private applyLineupToPlayers(players: PlayerSelection[], lineup: TeamLineupResponse): void {
    if (!lineup) return;

    const allLineupPlayers = [...lineup.starters, ...lineup.substitutes];

    players.forEach(ps => {
      const lineupEntry = allLineupPlayers.find(lp => lp.playerId === ps.player.playerId);
      if (lineupEntry) {
        ps.isSelected = true;
        ps.isStarter = lineupEntry.isStarter;
        ps.position = lineupEntry.position;
        ps.shirtNumber = lineupEntry.shirtNumber;
        ps.isCaptain = lineupEntry.isCaptain;
      }
    });
  }

  togglePlayerSelection(player: PlayerSelection): void {
    if (!this.canEdit) return;
    player.isSelected = !player.isSelected;
    if (!player.isSelected) {
      player.isStarter = false;
      player.isCaptain = false;
    }
  }

  toggleStarter(player: PlayerSelection): void {
    if (!this.canEdit || !player.isSelected) return;
    player.isStarter = !player.isStarter;
  }

  addAsStarter(player: PlayerSelection): void {
    if (!this.canEdit) return;
    player.isSelected = true;
    player.isStarter = true;
  }

  addAsSubstitute(player: PlayerSelection): void {
    if (!this.canEdit) return;
    player.isSelected = true;
    player.isStarter = false;
  }

  removeFromLineup(player: PlayerSelection): void {
    if (!this.canEdit) return;
    player.isSelected = false;
    player.isStarter = false;
    player.isCaptain = false;
  }

  toggleCaptain(player: PlayerSelection, isHome: boolean): void {
    if (!this.canEdit || !player.isSelected) return;

    const players = isHome ? this.homeTeamPlayers : this.awayTeamPlayers;

    // Only one captain per team
    if (!player.isCaptain) {
      players.forEach(p => p.isCaptain = false);
    }
    player.isCaptain = !player.isCaptain;
  }

  getSelectedPlayers(players: PlayerSelection[]): PlayerSelection[] {
    return players.filter(p => p.isSelected);
  }

  getStarters(players: PlayerSelection[]): PlayerSelection[] {
    return players.filter(p => p.isSelected && p.isStarter);
  }

  getSubstitutes(players: PlayerSelection[]): PlayerSelection[] {
    return players.filter(p => p.isSelected && !p.isStarter);
  }

  saveHomeLineup(): void {
    this.saveTeamLineup(this.match.homeTeamId, this.homeTeamPlayers, true);
  }

  saveAwayLineup(): void {
    this.saveTeamLineup(this.match.awayTeamId, this.awayTeamPlayers, false);
  }

  private saveTeamLineup(teamId: number, players: PlayerSelection[], isHome: boolean): void {
    const selectedPlayers = players.filter(p => p.isSelected);

    if (selectedPlayers.length === 0) {
      this.toastr.warning(this.translate.instant('LINEUP.NO_PLAYERS_SELECTED'));
      return;
    }

    const lineupPlayers: LineupPlayerRequest[] = selectedPlayers.map(p => ({
      playerId: p.player.playerId,
      isStarter: p.isStarter,
      position: p.position,
      shirtNumber: p.shirtNumber,
      isCaptain: p.isCaptain,
    }));

    const request: SetTeamLineupRequest = {
      players: lineupPlayers,
      replaceExisting: true,
    };

    this.saving = true;

    this.matchService.setTeamLineup(this.match.id, teamId, request).subscribe({
      next: (response) => {
        if (isHome) {
          this.homeTeamLineup = response.body.data;
        } else {
          this.awayTeamLineup = response.body.data;
        }
        this.toastr.success(this.translate.instant('LINEUP.SAVE_SUCCESS'));
        this.saving = false;
        this.lineupSaved.emit();
      },
      error: (error) => {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'Error';
        this.toastr.error(errorMessage);
        this.saving = false;
      },
    });
  }

  getPositionLabel(position: Position | undefined): string {
    if (!position) return '';
    const key = `PLAYERS.POSITION_${position}`;
    return this.translate.instant(key);
  }
}
