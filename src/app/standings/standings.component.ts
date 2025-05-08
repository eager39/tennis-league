// src/app/standings/standings.component.ts
import { Component, OnInit } from '@angular/core';
import { MatchService } from '../match.service';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap, Params, RouterOutlet } from '@angular/router';
import { Router, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { filter } from 'rxjs/internal/operators/filter';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { trigger, state, style, transition, animate } from '@angular/animations';


@Component({
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.css'],
  imports: [MatTableModule, CommonModule,RouterOutlet,MatTooltipModule],
  standalone: true,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*', display: 'block' })),
      transition('expanded <=> collapsed', animate('225ms ease-in-out')),
    ]),
  ],
})
export class StandingsComponent implements OnInit {
  standings: any[] = [];
  filteredStandings: any[] = [];
  displayedColumns: string[] = ['position','player', 'points', 'netGamesWon','setsPlayed','netSetsWon', 'games_played','penalty'];
  leagues: any[] = []; // Array to hold leagues data
  selectedLeague: string='' 
  myParam: any;
  hero: any;

  service: any;
  expandedElement: any | null = null;
  constructor(private matchService: MatchService,private route : ActivatedRoute,private router: Router) { }

  ngOnInit(): void {
    this.loadLeagues(); // Load leagues data on initialization
   // this.loadStandings();
    
    this.route.params.subscribe(
      (params: Params) => {
        this.selectedLeague = params["id"];
  
        this.loadStandings()
      })
  }

  loadLeagues(): void {
    this.matchService.getLeagues().subscribe(data => {
      this.leagues = data;
     
    }, error => {
     
    });
  }

  loadStandings(): void {
    this.matchService.getMatches(parseInt(this.selectedLeague)).subscribe(data => {
       data.map((element) => {
      

        try {
          // Check if tie_breaker_stats is a JSON string and parse it
          if (typeof element.tie_breaker_stats == 'string') {
            // Ensure it's not empty or invalid before parsing
            if (element.tie_breaker_stats.trim() == '') {
           //   console.warn('Empty tie_breaker_stats for player:', element.name);
              element.tieBreakerStats = {}; // Fallback to an empty object
            } else {
              element.tieBreakerStats = JSON.parse(element.tie_breaker_stats);
            }
          } else {
            element.tieBreakerStats = element.tie_breaker_stats; // already an object
          }
        } catch (error) {
          console.error('Error parsing tie_breaker_stats JSON:', error);
          element.tieBreakerStats = {}; // Fallback to an empty object if parsing fails
        }
     
      });
      this.standings = data;
   
     this.filterStandings(); // Apply initial filter based on selected league
    //  console.log('Standings:', this.standings); // Add console log
    }, error => {
    //  console.error('Error fetching standings:', error);
    });
  }

  onLeagueChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedLeague = selectElement.value;
  //  console.log('Selected League:', this.selectedLeague); // Add console log
    //this.loadStandings()
   // this.filterStandings();
  }

  filterStandings(): void {
   
    if (this.selectedLeague) {
      this.filteredStandings = this.standings.filter(standing => standing.league_id == this.selectedLeague);
    } else {
      this.filteredStandings = this.standings;
    }
    
  
  }
  expandedRows = new Set<any>(); // Or use Array if preferred

  // Method to toggle the expanded state for a row
  toggleRowExpansion(row: any): void {
    if (this.isRowExpanded(row)) {
      this.expandedRows.delete(row);  // Collapse row if it's already expanded
    } else {
      this.expandedRows.add(row);     // Expand row
    }
  }

  // Method to check if a row is expanded
  isRowExpanded(row: any): boolean {
    return this.expandedRows.has(row);  // Check if the row is expanded
  }
  getLocalTieBreakerStats(jsonString: string)  {
    return JSON.parse(jsonString);
  }
}