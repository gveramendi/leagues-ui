import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatchService } from '@core';
import { MatchSummaryResponse } from '../../../core/models/response';

interface BracketMatch {
  id: number;
  homeTeam: string | null;
  awayTeam: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties?: number | null;
  awayPenalties?: number | null;
  winnerId: number | null;
  status: string;
  matchDate?: string;
}

interface BracketRound {
  name: string;
  order: number;
  matches: BracketMatch[];
}

@Component({
  selector: 'app-tournament-bracket',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './tournament-bracket.component.html',
  styleUrls: ['./tournament-bracket.component.scss'],
})
export class TournamentBracketComponent implements OnInit, OnChanges {
  @Input() tournamentId!: number;

  rounds: BracketRound[] = [];
  loading = false;
  error: string | null = null;

  private roundOrder: { [key: string]: number } = {
    'ROUND_OF_64': 1,
    'ROUND_OF_32': 2,
    'ROUND_OF_16': 3,
    'QUARTER_FINALS': 4,
    'SEMI_FINALS': 5,
    'THIRD_PLACE': 6,
    'FINAL': 7,
  };

  private roundNames: { [key: string]: string } = {
    'ROUND_OF_64': 'Ronda de 64',
    'ROUND_OF_32': 'Ronda de 32',
    'ROUND_OF_16': 'Octavos de Final',
    'QUARTER_FINALS': 'Cuartos de Final',
    'SEMI_FINALS': 'Semifinales',
    'THIRD_PLACE': 'Tercer Puesto',
    'FINAL': 'Final',
  };

  constructor(private matchService: MatchService) {}

  ngOnInit(): void {
    if (this.tournamentId) {
      this.loadBracket();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tournamentId'] && this.tournamentId && !changes['tournamentId'].firstChange) {
      this.loadBracket();
    }
  }

  loadBracket(): void {
    this.loading = true;
    this.error = null;

    this.matchService.getByTournament(this.tournamentId, 0, 100).subscribe({
      next: (response) => {
        const matches = response.body.data;
        this.rounds = this.organizeMatchesIntoRounds(matches);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading bracket:', err);
        this.error = 'Error loading bracket';
        this.loading = false;
      },
    });
  }

  private organizeMatchesIntoRounds(matches: MatchSummaryResponse[]): BracketRound[] {
    const roundsMap = new Map<string, BracketMatch[]>();

    matches.forEach((match) => {
      const roundKey = match.phaseName || match.round || 'Unknown';

      if (!roundsMap.has(roundKey)) {
        roundsMap.set(roundKey, []);
      }

      const winnerId = this.determineWinner(match);

      roundsMap.get(roundKey)!.push({
        id: match.id,
        homeTeam: match.homeTeamName ?? null,
        awayTeam: match.awayTeamName ?? null,
        homeScore: match.homeScore ?? null,
        awayScore: match.awayScore ?? null,
        homePenalties: match.homePenalties ?? null,
        awayPenalties: match.awayPenalties ?? null,
        winnerId: winnerId,
        status: match.status,
        matchDate: match.matchDate,
      });
    });

    const rounds: BracketRound[] = [];
    roundsMap.forEach((matches, roundKey) => {
      rounds.push({
        name: this.roundNames[roundKey] || roundKey,
        order: this.roundOrder[roundKey] || 0,
        matches: matches.sort((a, b) => a.id - b.id),
      });
    });

    // Sort rounds by order
    return rounds.sort((a, b) => a.order - b.order);
  }

  private determineWinner(match: MatchSummaryResponse): number | null {
    if (match.status !== 'FINISHED') {
      return null;
    }

    const homeScore = match.homeScore ?? 0;
    const awayScore = match.awayScore ?? 0;

    if (homeScore > awayScore) {
      return match.homeTeamId;
    } else if (awayScore > homeScore) {
      return match.awayTeamId;
    }

    // Check penalties if tied
    if (match.homePenalties != null && match.awayPenalties != null) {
      if (match.homePenalties > match.awayPenalties) {
        return match.homeTeamId;
      } else if (match.awayPenalties > match.homePenalties) {
        return match.awayTeamId;
      }
    }

    return null;
  }

  isWinner(match: BracketMatch, team: 'home' | 'away'): boolean {
    if (!match.winnerId || match.status !== 'FINISHED') {
      return false;
    }
    // We don't have teamId in BracketMatch, so we determine by score
    if (team === 'home') {
      const homeTotal = (match.homeScore ?? 0) + (match.homePenalties ?? 0);
      const awayTotal = (match.awayScore ?? 0) + (match.awayPenalties ?? 0);
      return homeTotal > awayTotal || (homeTotal === awayTotal && (match.homePenalties ?? 0) > (match.awayPenalties ?? 0));
    } else {
      const homeTotal = (match.homeScore ?? 0) + (match.homePenalties ?? 0);
      const awayTotal = (match.awayScore ?? 0) + (match.awayPenalties ?? 0);
      return awayTotal > homeTotal || (homeTotal === awayTotal && (match.awayPenalties ?? 0) > (match.homePenalties ?? 0));
    }
  }

  getMatchStatusClass(status: string): string {
    switch (status) {
      case 'FINISHED':
        return 'status-finished';
      case 'IN_PROGRESS':
        return 'status-live';
      case 'SCHEDULED':
        return 'status-scheduled';
      default:
        return '';
    }
  }

  getScoreDisplay(match: BracketMatch): string {
    if (match.status === 'SCHEDULED' || match.homeScore === null) {
      return 'vs';
    }

    let score = `${match.homeScore} - ${match.awayScore}`;
    if (match.homePenalties !== null && match.awayPenalties !== null) {
      score += ` (${match.homePenalties}-${match.awayPenalties} pen)`;
    }
    return score;
  }
}
