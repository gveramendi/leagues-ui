import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PlayerStatisticsService } from '@core';
import { AssistTableResponse, TopAssistResponse } from '../../../core/models/response';

@Component({
  selector: 'app-tournament-assists',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './tournament-assists.component.html',
  styleUrls: ['./tournament-assists.component.scss'],
})
export class TournamentAssistsComponent implements OnChanges {
  @Input() tournamentId!: number;

  assistTable: AssistTableResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(private playerStatisticsService: PlayerStatisticsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tournamentId'] && this.tournamentId) {
      this.loadAssists();
    }
  }

  loadAssists(): void {
    this.loading = true;
    this.error = null;

    this.playerStatisticsService.getTopAssists(this.tournamentId, 50).subscribe({
      next: (response) => {
        this.assistTable = response.body.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading assists:', err);
        this.error = 'Error loading assists';
        this.loading = false;
      },
    });
  }

  getRankClass(rank: number | undefined): string {
    if (!rank) return '';
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  }
}
