import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { StandingService } from '@core';
import { StandingTableResponse, StandingSummaryResponse } from '../../../core/models/response';

@Component({
  selector: 'app-tournament-standings',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './tournament-standings.component.html',
  styleUrls: ['./tournament-standings.component.scss'],
})
export class TournamentStandingsComponent implements OnChanges {
  @Input() tournamentId!: number;

  standingTable: StandingTableResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(private standingService: StandingService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tournamentId'] && this.tournamentId) {
      this.loadStandings();
    }
  }

  loadStandings(): void {
    this.loading = true;
    this.error = null;

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

  getPositionClass(standing: StandingSummaryResponse): string {
    if (standing.qualified) {
      return 'table-success';
    }
    if (standing.relegated) {
      return 'table-danger';
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
