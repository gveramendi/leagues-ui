import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PlayerStatisticsService, CardStatsResponse } from '@core';

@Component({
  selector: 'app-tournament-sanctions',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './tournament-sanctions.component.html',
  styleUrls: ['./tournament-sanctions.component.scss'],
})
export class TournamentSanctionsComponent implements OnInit, OnChanges {
  @Input() tournamentId!: number;
  @Input() seasonYear!: number;
  @Input() canEdit = false;

  // Cards data
  yellowCards: CardStatsResponse[] = [];
  redCards: CardStatsResponse[] = [];
  allCards: CardStatsResponse[] = [];
  filteredCards: CardStatsResponse[] = [];

  loading = false;
  error: string | null = null;

  // Filter
  selectedFilter: 'all' | 'yellow' | 'red' = 'all';

  constructor(
    private playerStatisticsService: PlayerStatisticsService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (this.tournamentId) {
      this.loadCards();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tournamentId'] && this.tournamentId && !changes['tournamentId'].firstChange) {
      this.loadCards();
    }
  }

  loadCards(): void {
    this.loading = true;
    this.error = null;

    // Load yellow cards
    this.playerStatisticsService.getMostYellowCards(this.tournamentId, 100).subscribe({
      next: (response) => {
        this.yellowCards = response.body.data || [];
        this.mergeCards();
      },
      error: (err) => {
        console.error('Error loading yellow cards:', err);
      },
    });

    // Load red cards
    this.playerStatisticsService.getMostRedCards(this.tournamentId, 100).subscribe({
      next: (response) => {
        this.redCards = response.body.data || [];
        this.mergeCards();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading red cards:', err);
        this.loading = false;
        this.error = 'Error loading cards';
      },
    });
  }

  private mergeCards(): void {
    // Create a map to combine player cards
    const playerMap = new Map<number, CardStatsResponse>();

    // Add yellow card players
    this.yellowCards.forEach((card) => {
      playerMap.set(card.playerId, { ...card });
    });

    // Merge red card data
    this.redCards.forEach((card) => {
      const existing = playerMap.get(card.playerId);
      if (existing) {
        existing.redCards = card.redCards;
        existing.totalCards = (existing.yellowCards || 0) + (existing.redCards || 0) + (existing.secondYellowCards || 0);
      } else {
        playerMap.set(card.playerId, { ...card });
      }
    });

    // Convert to array and sort by total cards
    this.allCards = Array.from(playerMap.values()).sort((a, b) => {
      const totalA = (a.yellowCards || 0) + (a.redCards || 0) * 2 + (a.secondYellowCards || 0);
      const totalB = (b.yellowCards || 0) + (b.redCards || 0) * 2 + (b.secondYellowCards || 0);
      return totalB - totalA;
    });

    // Assign ranks
    this.allCards.forEach((card, index) => {
      card.rank = index + 1;
    });

    this.applyFilter();
  }

  applyFilter(): void {
    switch (this.selectedFilter) {
      case 'yellow':
        this.filteredCards = this.allCards.filter((c) => (c.yellowCards || 0) > 0);
        break;
      case 'red':
        this.filteredCards = this.allCards.filter((c) => (c.redCards || 0) > 0 || (c.secondYellowCards || 0) > 0);
        break;
      default:
        this.filteredCards = [...this.allCards];
    }
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  getRankClass(rank: number | undefined): string {
    if (!rank) return '';
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  }

  getTotalCards(card: CardStatsResponse): number {
    return (card.yellowCards || 0) + (card.redCards || 0) + (card.secondYellowCards || 0);
  }
}
