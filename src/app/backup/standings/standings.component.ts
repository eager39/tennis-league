// src/app/standings/standings.component.ts
import { Component, OnInit } from '@angular/core';
import { MatchService } from '../match.service';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.css'],
  imports: [MatTableModule, CommonModule],
  standalone: true
})
export class StandingsComponent implements OnInit {
  standings: any[] = [];
  filteredStandings: any[] = [];
  displayedColumns: string[] = ['position','player', 'points', 'netGamesWon', 'games_played'];
  leagues: any[] = []; // Array to hold leagues data
  selectedLeague: string = '2';

  constructor(private matchService: MatchService) { }

  ngOnInit(): void {
    this.loadLeagues(); // Load leagues data on initialization
    this.loadStandings();
  }

  loadLeagues(): void {
    this.matchService.getLeagues(parseInt(this.selectedLeague)).subscribe(data => {
      this.leagues = data;
      console.log('Leagues:', this.leagues); // Add console log
    }, error => {
      console.error('Error fetching leagues:', error);
    });
  }

  loadStandings(): void {
    this.matchService.getMatches(parseInt(this.selectedLeague)).subscribe(data => {
      this.standings = data;
      this.filterStandings(); // Apply initial filter based on selected league
      console.log('Standings:', this.standings); // Add console log
    }, error => {
      console.error('Error fetching standings:', error);
    });
  }

  onLeagueChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedLeague = selectElement.value;
    console.log('Selected League:', this.selectedLeague); // Add console log
    this.loadStandings()
    this.filterStandings();
  }

  filterStandings(): void {
   
    if (this.selectedLeague) {
      this.filteredStandings = this.standings.filter(standing => standing.league_id == this.selectedLeague);
    } else {
      this.filteredStandings = this.standings;
    }
    console.log('Filtered Standings:', this.filteredStandings); // Add console log
  }
}