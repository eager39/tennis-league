// src/app/standings/standings.component.ts
import { Component, OnInit } from '@angular/core';
import { MatchService } from '../match.service';
import { MatTableModule } from '@angular/material/table';


@Component({
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.css'],
  imports: [MatTableModule],
  standalone: true
})
export class StandingsComponent implements OnInit {
  standings: any[] = [];
  displayedColumns: string[] = ['player', 'points', 'netGamesWon','games_played']; // Column names for the table

  constructor(private MatchService: MatchService) { }

  ngOnInit(): void {
    this.loadStandings();
  }

  loadStandings(): void {
    this.MatchService.getMatches().subscribe(data => {
      this.standings = data;
    }, error => {
      console.error('Error fetching standings:', error);
    });
  }
}