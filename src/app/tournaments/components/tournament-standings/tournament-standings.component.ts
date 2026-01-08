import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { StandingService } from '@core';
import {
  StandingTableResponse,
  StandingSummaryResponse,
  TournamentFormat,
  GroupStandingsResponse,
  GroupTeamStandingResponse,
} from '../../../core/models/response';

@Component({
  selector: 'app-tournament-standings',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './tournament-standings.component.html',
  styleUrls: ['./tournament-standings.component.scss'],
})
export class TournamentStandingsComponent implements OnChanges {
  @Input() tournamentId!: number;
  @Input() tournamentFormat?: TournamentFormat;

  standingTable: StandingTableResponse | null = null;
  groupStandings: GroupStandingsResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(private standingService: StandingService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tournamentId'] && this.tournamentId) {
      this.loadStandings();
    }
  }

  isGroupStageFormat(): boolean {
    return (
      this.tournamentFormat === 'GROUP_STAGE' ||
      this.tournamentFormat === 'GROUP_STAGE_SINGLE' ||
      this.tournamentFormat === 'GROUP_STAGE_DOUBLE'
    );
  }

  loadStandings(): void {
    this.loading = true;
    this.error = null;
    this.standingTable = null;
    this.groupStandings = null;

    if (this.isGroupStageFormat()) {
      this.loadGroupStandings();
    } else {
      this.loadLeagueStandings();
    }
  }

  private loadLeagueStandings(): void {
    this.standingService.getByTournament(this.tournamentId).subscribe({
      next: (response) => {
        this.standingTable = response.body.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading standings:', err);
        this.error = 'Error loading standings';
        this.loading = false;
      },
    });
  }

  private loadGroupStandings(): void {
    this.standingService.getGroupStandings(this.tournamentId).subscribe({
      next: (response) => {
        this.groupStandings = response.body.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading group standings:', err);
        this.error = 'Error loading group standings';
        this.loading = false;
      },
    });
  }

  getPositionClass(standing: StandingSummaryResponse): string {
    if (standing.qualified) {
      return 'table-success';
    }
    if (standing.relegated) {
      return 'table-danger';
    }
    return '';
  }

  getGroupPositionClass(standing: GroupTeamStandingResponse): string {
    if (standing.isQualified) {
      return 'table-success';
    }
    return '';
  }

  getFormBadges(form: string | undefined): string[] {
    if (!form) return [];
    return form.split('').slice(-5);
  }

  getFormBadgeClass(result: string): string {
    switch (result) {
      case 'W':
        return 'bg-success';
      case 'D':
        return 'bg-warning';
      case 'L':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}
