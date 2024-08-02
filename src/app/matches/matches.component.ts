import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatchService } from '../match.service';
import { LeaguesService } from '../league.service';
import { HttpClient } from '@angular/common/http';
import { TennisMatch } from '../tennismatch.model';

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
  leagues: any[] = [];

  selectedPlayer: string = '';
  selectedWeek: number | string = '';
  selectedLeagueId: string = '';
  editingMatch: any = null;

  constructor(private matchService: MatchService, private leagueService: LeaguesService,private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchLeagues();
    this.loadMatches();
  }

  fetchLeagues(): void {
    this.leagueService.getLeagues().subscribe(
      (data) => {
        this.leagues = data;
      },
      (error) => {
        console.error('Error fetching leagues:', error);
      }
    );
  }

  loadMatches(): void {
    console.log("asdasdasd",this.selectedLeagueId)
    this.matchService.getMatches1(parseInt(this.selectedLeagueId)).subscribe(
      (data) => {
        this.matches = data;
        this.filteredMatches = data;
        this.extractPlayersAndWeeks(data);
      },
      (error) => {
        console.error('Error fetching matches:', error);
      }
    );
  }

  onLeagueChange(): void {
    if (this.selectedLeagueId) {
      this.leagueService.getMatchesByLeague(this.selectedLeagueId).subscribe(
        (data) => {
          this.matches = data;
          this.extractPlayersAndWeeks(data);  // Ensure players and weeks are updated for the selected league
          this.filterMatches();
        },
        (error) => {
          console.error('Error fetching matches:', error);
        }
      );
    } else {
      this.loadMatches();
    }
  }

  filterMatches(): void {
    this.filteredMatches = this.matches.filter(match => {
      return (this.selectedPlayer ? match.home_player === this.selectedPlayer || match.away_player === this.selectedPlayer : true)
        && (this.selectedWeek ? match.week === +this.selectedWeek : true);
    });
  }

  extractPlayersAndWeeks(matches: any[]): void {
    this.players = Array.from(new Set(matches.flatMap(match => [match.home_player, match.away_player])));
    this.weeks = Array.from(new Set(matches.map(match => match.week)));
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
   
   
    this.matchService.updateMatchResult(matchId, newResult).subscribe(
      (response) => {
        
        console.log('Match result updated:', response);
        this.loadMatches();  // Reload matches to update the UI
        
        this.editingMatch = null;  // Reset editing state
        this.calculateStandings();
      },
      (error) => {
        console.error('Error updating match result:', error);
      }
    );
  }
  calculateStandings(): void {
    console.log("WTF")
    console.log(this.selectedLeagueId)
    this.matchService.calculateStandings(parseInt(this.selectedLeagueId)).subscribe(
      (response) => {
        console.log('Standings calculated:', response);
        
      },
      (error) => {
        console.error('Error calculating standings:', error);
      }
    );
}
}