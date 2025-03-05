import { Component, OnInit, ViewChild, AfterViewInit, NgModule, ElementRef } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatchService } from '../match.service';
import { LeaguesService } from '../league.service';
import { TennisMatch } from '../tennismatch.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInput, MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Params } from '@angular/router';
import { map } from 'rxjs/internal/operators/map';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css'],
  standalone: true,
  imports:[MatFormFieldModule,MatSelectModule,MatSelect,FormsModule,MatTableModule,MatPaginatorModule,CommonModule,ReactiveFormsModule,MatInputModule ]
})
export class MatchesComponent implements OnInit, AfterViewInit {
  matches: TennisMatch[] = [];
  dataSource = new MatTableDataSource<TennisMatch>();
  players: string[] = [];
  weeks: string[] = [];
  leagues: any[] = [];
  displayedColumns: string[] = ['week', 'home_player', 'away_player', 'result','deadline'];

  selectedPlayer: string = '';
  selectedWeek: number | string = '';
  selectedLeagueId: number =1;
  
  hideNoResults: boolean = false;
  @ViewChild('resultInput') resultInput!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  resultForm: FormGroup;
  editingMatch: any = null;
  

  constructor(private matchService: MatchService, private leagueService: LeaguesService,private route: ActivatedRoute,private fb: FormBuilder,private AuthService: AuthService) {
    this.resultForm = this.fb.group({
      newResult: ['', [Validators.required, this.tennisScoreValidator]]
    });
   }

  ngOnInit(): void {
    this.fetchLeagues();
    this.loadMatches();
    this.route.params.subscribe(
      (params: Params) => {
        this.selectedLeagueId = +params["id"];
       
        this.loadMatches()
      })
}
checkNames(name:string){
return this.AuthService.userMatchesPlayer(name)
}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
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
    if (this.selectedLeagueId) {
      this.matchService.getMatches1(this.selectedLeagueId).subscribe(
        (data) => {
          this.matches = data;
          this.dataSource.data = data;
          this.extractPlayersAndWeeks(data);
          this.filterMatches();
        },
        (error) => {
          console.error('Error fetching matches:', error);
        }
      );
    }
  }

  onLeagueChange(): void {
    if (this.selectedLeagueId) {
      this.leagueService.getMatchesByLeague(this.selectedLeagueId).subscribe(
        (data) => {
         
          this.matches = data;
          this.dataSource.data = data;
          this.extractPlayersAndWeeks(data);
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
    // Ensure that `this.selectedWeek` and `this.selectedPlayer` are properly defined
    const playerFilter = this.selectedPlayer ? (match: TennisMatch) => 
      match.home_player === this.selectedPlayer || match.away_player === this.selectedPlayer 
      : () => true;
  
    const weekFilter = this.selectedWeek ? (match: TennisMatch) => 
      match.week === this.selectedWeek 
      : () => true;
  
    this.dataSource.data = this.matches.filter(match => playerFilter(match) && weekFilter(match));
  }

  extractPlayersAndWeeks(matches: TennisMatch[]): void {
    this.players = Array.from(new Set(matches.flatMap(match => [match.home_player, match.away_player])));
    this.weeks = Array.from(new Set(matches.map(match => match.week)));
  }

  editResult(match: any): void {
    this.editingMatch = match;
    this.resultForm.patchValue({
      newResult: match.result
    });
    setTimeout(() => {
      this.resultInput.nativeElement.focus();
    }, 10);
  }
  updateResult(matchId: number): void {
    if (this.resultForm.valid) {
      const updatedResult = this.resultForm.value.newResult;
      // Call your service to update the result
      this.matchService.updateMatchResult(matchId, updatedResult).subscribe(() => {
        this.editingMatch.result = updatedResult;
        this.editingMatch = null;
        this.calculateStandings()
      });
    }
  }

  calculateStandings(): void {
    this.matchService.calculateStandings(this.selectedLeagueId).subscribe(
      (response) => {
        
      },
      (error) => {
        console.error('Error calculating standings:', error);
      }
    );
  }
  tennisScoreValidator(control: any): { [key: string]: boolean } | null {
    const value = control.value;
    const regex = /^(\d+-\d+,)*\d+-\d+$/; // Regular expression for tennis scores
    if (!regex.test(value)) {
      return { invalidTennisScore: true };
    }
    
    const sets = value.split(',').map((set: string) => set.split('-').map(Number));
    
    let homeWins = 0;
    let awayWins = 0;

    for (const [x, y] of sets) {
      if (
        (x < 0 || x > 7 || y < 0 || y > 7) || // Scores must be between 0 and 7
        (x === 7 && y < 5) || (y === 7 && x < 5) || // To win 7, opponent must have at least 5
        (x === 7 && y > 6) || (y === 7 && x > 6) || // Valid 7-score pairs are 7-5 or 7-6
        (x > 6 && y > 6) || // Both cannot be more than 6
        (x === 5 && y === 6) || (x === 6 && y === 5) // Scores like 5-6 or 6-5 are not valid
      ) {
        return { invalidSetScores: true };
      }
      
      if (x > y) {
        homeWins++;
      } else {
        awayWins++;
      }

      if (homeWins > 2 && awayWins == 1) {
     
        if (sets.length > 2) {
          return { extraSet: true };
        }
      }else if(homeWins == 1 && awayWins > 2) {
       
        if (sets.length > 2) {
          return { extraSet: true };
        }

      }else if(homeWins >= 2 && awayWins==0){
        if (sets.length > 2) {
          return { extraSet: true };
        }
        }else if(homeWins == 0 && awayWins >=2){
          if (sets.length > 2) {
            return { extraSet: true };
          }
          }

      
    }

    return null;
  }
  onFocusOut(event: FocusEvent): void {
    // Check if focus is moving outside the form
    const target = event.relatedTarget as HTMLElement;
    if (!target || !target.closest('form')) {
      this.editingMatch = null;
    }
  }
  
  
  
}