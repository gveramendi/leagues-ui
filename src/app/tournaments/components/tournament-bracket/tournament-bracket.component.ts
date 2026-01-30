import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatchService, TournamentFormat } from '@core';
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
  round?: string;
}

interface BracketRound {
  name: string;
  order: number;
  matches: BracketMatch[];
  bracketType?: 'winners' | 'losers' | 'grand_final';
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
  @Input() tournamentFormat: TournamentFormat = 'SINGLE_ELIMINATION';

  // Single elimination
  rounds: BracketRound[] = [];

  // Double elimination
  winnersBracket: BracketRound[] = [];
  losersBracket: BracketRound[] = [];
  grandFinal: BracketRound | null = null;

  loading = false;
  error: string | null = null;

  // Single elimination round order
  private singleEliminationOrder: { [key: string]: number } = {
    'ROUND_OF_64': 1,
    'ROUND_OF_32': 2,
    'ROUND_OF_16': 3,
    'QUARTER_FINALS': 4,
    'SEMI_FINALS': 5,
    'THIRD_PLACE': 6,
    'FINAL': 7,
  };

  // Double elimination round order
  private doubleEliminationOrder: { [key: string]: number } = {
    // Winners Bracket
    'WB_ROUND_1': 1,
    'WB_ROUND_2': 2,
    'WB_ROUND_3': 3,
    'WB_QUARTER_FINALS': 4,
    'WB_SEMI_FINALS': 5,
    'WB_FINAL': 6,
    // Losers Bracket
    'LB_ROUND_1': 11,
    'LB_ROUND_2': 12,
    'LB_ROUND_3': 13,
    'LB_ROUND_4': 14,
    'LB_ROUND_5': 15,
    'LB_QUARTER_FINALS': 16,
    'LB_SEMI_FINALS': 17,
    'LB_FINAL': 18,
    // Grand Final
    'GRAND_FINAL': 100,
    'GRAND_FINAL_RESET': 101,
  };

  private singleEliminationNames: { [key: string]: string } = {
    'ROUND_OF_64': 'Ronda de 64',
    'ROUND_OF_32': 'Ronda de 32',
    'ROUND_OF_16': 'Octavos de Final',
    'QUARTER_FINALS': 'Cuartos de Final',
    'SEMI_FINALS': 'Semifinales',
    'THIRD_PLACE': 'Tercer Puesto',
    'FINAL': 'Final',
  };

  private doubleEliminationNames: { [key: string]: string } = {
    // Winners Bracket
    'WB_ROUND_1': 'WB Ronda 1',
    'WB_ROUND_2': 'WB Ronda 2',
    'WB_ROUND_3': 'WB Ronda 3',
    'WB_QUARTER_FINALS': 'WB Cuartos',
    'WB_SEMI_FINALS': 'WB Semifinal',
    'WB_FINAL': 'WB Final',
    // Losers Bracket
    'LB_ROUND_1': 'LB Ronda 1',
    'LB_ROUND_2': 'LB Ronda 2',
    'LB_ROUND_3': 'LB Ronda 3',
    'LB_ROUND_4': 'LB Ronda 4',
    'LB_ROUND_5': 'LB Ronda 5',
    'LB_QUARTER_FINALS': 'LB Cuartos',
    'LB_SEMI_FINALS': 'LB Semifinal',
    'LB_FINAL': 'LB Final',
    // Grand Final
    'GRAND_FINAL': 'Gran Final',
    'GRAND_FINAL_RESET': 'Gran Final (Reset)',
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
    if (changes['tournamentFormat'] && !changes['tournamentFormat'].firstChange) {
      this.loadBracket();
    }
  }

  get isDoubleElimination(): boolean {
    return this.tournamentFormat === 'DOUBLE_ELIMINATION' ||
           this.tournamentFormat === 'GROUP_STAGE_DOUBLE';
  }

  get isGroupStageFormat(): boolean {
    return this.tournamentFormat === 'GROUP_STAGE' ||
           this.tournamentFormat === 'GROUP_STAGE_SINGLE' ||
           this.tournamentFormat === 'GROUP_STAGE_DOUBLE';
  }

  // Knockout round identifiers
  private knockoutRounds = [
    'ROUND_OF_64', 'ROUND_OF_32', 'ROUND_OF_16',
    'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL'
  ];

  loadBracket(): void {
    this.loading = true;
    this.error = null;

    this.matchService.getByTournament(this.tournamentId, 0, 200).subscribe({
      next: (response) => {
        const matches = response.body.data;
        if (this.isDoubleElimination) {
          this.organizeDoubleEliminationBracket(matches);
        } else if (this.tournamentFormat === 'GROUP_STAGE_DOUBLE') {
          // GROUP_STAGE_DOUBLE advances to double elimination knockout
          this.organizeDoubleEliminationBracket(matches);
        } else {
          // SINGLE_ELIMINATION, GROUP_STAGE, GROUP_STAGE_SINGLE use single elimination bracket
          this.rounds = this.organizeMatchesIntoRounds(matches);
        }
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

      // For GROUP_STAGE formats, only include knockout rounds in bracket
      if (this.isGroupStageFormat && !this.isKnockoutRound(roundKey)) {
        return; // Skip group stage matches
      }

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
        round: roundKey,
      });
    });

    const rounds: BracketRound[] = [];
    roundsMap.forEach((matchList, roundKey) => {
      rounds.push({
        name: this.singleEliminationNames[roundKey] || roundKey,
        order: this.singleEliminationOrder[roundKey] || 0,
        matches: matchList.sort((a, b) => a.id - b.id),
      });
    });

    return rounds.sort((a, b) => a.order - b.order);
  }

  /**
   * Checks if a round is a knockout round
   */
  private isKnockoutRound(roundKey: string): boolean {
    return this.knockoutRounds.includes(roundKey) ||
           roundKey.startsWith('WB_') ||
           roundKey.startsWith('LB_') ||
           roundKey.startsWith('GRAND_FINAL');
  }

  private organizeDoubleEliminationBracket(matches: MatchSummaryResponse[]): void {
    const winnersMap = new Map<string, BracketMatch[]>();
    const losersMap = new Map<string, BracketMatch[]>();
    const grandFinalMatches: BracketMatch[] = [];

    matches.forEach((match) => {
      const roundKey = match.phaseName || match.round || 'Unknown';
      const winnerId = this.determineWinner(match);

      const bracketMatch: BracketMatch = {
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
        round: roundKey,
      };

      // Categorize by bracket type
      if (roundKey.startsWith('WB_')) {
        if (!winnersMap.has(roundKey)) {
          winnersMap.set(roundKey, []);
        }
        winnersMap.get(roundKey)!.push(bracketMatch);
      } else if (roundKey.startsWith('LB_')) {
        if (!losersMap.has(roundKey)) {
          losersMap.set(roundKey, []);
        }
        losersMap.get(roundKey)!.push(bracketMatch);
      } else if (roundKey.startsWith('GRAND_FINAL')) {
        grandFinalMatches.push(bracketMatch);
      } else {
        // Fallback: try to determine by round name pattern
        if (!winnersMap.has(roundKey)) {
          winnersMap.set(roundKey, []);
        }
        winnersMap.get(roundKey)!.push(bracketMatch);
      }
    });

    // Build winners bracket
    this.winnersBracket = [];
    winnersMap.forEach((matchList, roundKey) => {
      this.winnersBracket.push({
        name: this.doubleEliminationNames[roundKey] || roundKey,
        order: this.doubleEliminationOrder[roundKey] || 0,
        matches: matchList.sort((a, b) => a.id - b.id),
        bracketType: 'winners',
      });
    });
    this.winnersBracket.sort((a, b) => a.order - b.order);

    // Build losers bracket
    this.losersBracket = [];
    losersMap.forEach((matchList, roundKey) => {
      this.losersBracket.push({
        name: this.doubleEliminationNames[roundKey] || roundKey,
        order: this.doubleEliminationOrder[roundKey] || 0,
        matches: matchList.sort((a, b) => a.id - b.id),
        bracketType: 'losers',
      });
    });
    this.losersBracket.sort((a, b) => a.order - b.order);

    // Build grand final
    if (grandFinalMatches.length > 0) {
      this.grandFinal = {
        name: 'Gran Final',
        order: 100,
        matches: grandFinalMatches.sort((a, b) => a.id - b.id),
        bracketType: 'grand_final',
      };
    } else {
      this.grandFinal = null;
    }
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

  getChampion(): string | null {
    if (this.isDoubleElimination) {
      // Check grand final for champion
      if (this.grandFinal && this.grandFinal.matches.length > 0) {
        const lastMatch = this.grandFinal.matches[this.grandFinal.matches.length - 1];
        if (lastMatch.status === 'FINISHED') {
          return this.isWinner(lastMatch, 'home') ? lastMatch.homeTeam : lastMatch.awayTeam;
        }
      }
    } else {
      // Check final for single elimination
      const finalRound = this.rounds.find(r => r.name === 'Final' || r.name.includes('Final'));
      if (finalRound && finalRound.matches.length > 0) {
        const finalMatch = finalRound.matches[0];
        if (finalMatch.status === 'FINISHED') {
          return this.isWinner(finalMatch, 'home') ? finalMatch.homeTeam : finalMatch.awayTeam;
        }
      }
    }
    return null;
  }

  hasChampion(): boolean {
    return this.getChampion() !== null;
  }
}
