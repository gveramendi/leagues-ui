import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PlayerStatisticsService } from '@core';
import { ScorerTableResponse, TopScorerResponse } from '../../../core/models/response';

@Component({
  selector: 'app-tournament-scorers',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './tournament-scorers.component.html',
  styleUrls: ['./tournament-scorers.component.scss'],
})
export class TournamentScorersComponent implements OnInit, OnChanges {
  @Input() tournamentId!: number;

  scorerTable: ScorerTableResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(private playerStatisticsService: PlayerStatisticsService) {}

  ngOnInit(): void {
    if (this.tournamentId) {
      this.loadScorers();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tournamentId'] && this.tournamentId && !changes['tournamentId'].firstChange) {
      this.loadScorers();
    }
  }

  loadScorers(): void {
    this.loading = true;
    this.error = null;

    this.playerStatisticsService.getTopScorers(this.tournamentId, 50).subscribe({
      next: (response) => {
        this.scorerTable = response.body.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading scorers:', err);
        this.error = 'Error loading scorers';
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
