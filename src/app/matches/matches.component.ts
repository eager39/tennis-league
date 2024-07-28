import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatchService } from '../match.service';

@Component({
  selector: 'app-matches',
  standalone: true,
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css'],
  imports: [CommonModule, FormsModule],
})
export class MatchesComponent implements OnInit {
  matches: any[] = [];
  filteredMatches: any[] = [];
  players: string[] = [];
  weeks: number[] = [];
  selectedPlayer: string = '';
  selectedWeek: number | string = '';
  editingMatch: any = null;

  constructor(private matchService: MatchService) { }

  ngOnInit(): void {
    this.loadMatches();
  }

  loadMatches(): void {
    this.matchService.getMatches1().subscribe(data => {
      this.matches = data;
      this.filteredMatches = data;

      this.players = Array.from(new Set(data.flatMap(match => [match.home_player, match.away_player])));
      this.weeks = Array.from(new Set(data.map(match => match.week)));
    }, error => {
      console.error('Error fetching matches:', error);
    });
  }

  filterMatches(): void {
    this.filteredMatches = this.matches.filter(match => {
      return (this.selectedPlayer ? match.home_player === this.selectedPlayer || match.away_player === this.selectedPlayer : true)
        && (this.selectedWeek ? match.week === +this.selectedWeek : true);
    });
  }

  isWinner(match: any, player: string): boolean {
    const sets = match.result.split(',').map((set: string) => set.trim().split('-').map(Number));
    const homeWins = sets.filter((set: number[]) => set[0] > set[1]).length;
    const awayWins = sets.filter((set: number[]) => set[1] > set[0]).length;
    const winner = homeWins > awayWins ? match.home_player : match.away_player;
    return player === winner;
  }

  isLoser(match: any, player: string): boolean {
    const sets = match.result.split(',').map((set: string) => set.trim().split('-').map(Number));
    const homeWins = sets.filter((set: number[]) => set[0] > set[1]).length;
    const awayWins = sets.filter((set: number[]) => set[1] > set[0]).length;
    const loser = homeWins > awayWins ? match.away_player : match.home_player;
    return player === loser;
  }

  getGamesWon(match: any, player: string): number {
    const sets = match.result.split(',').map((set: string) => set.trim().split('-').map(Number));
    const gamesWon = sets.reduce((acc: number, set: number[]) => {
      if (player === match.home_player) {
        return acc + set[0];
      } else {
        return acc + set[1];
      }
    }, 0);
    return gamesWon;
  }

  editResult(match: any): void {
    this.editingMatch = match;
    match.newResult = match.result;  // Pre-fill the input with the current result
  }

  updateResult(matchId: number, newResult: string): void {
    this.matchService.updateMatchResult(matchId, newResult).subscribe(response => {
      console.log('Match result updated:', response);
      this.loadMatches();  // Reload matches to update the UI
      this.editingMatch = null;  // Reset editing state
    }, error => {
      console.error('Error updating match result:', error);
    });
  }
}