import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatchService } from '../match.service';
import { LeaguesService } from '../league.service';
import { ActivatedRoute } from '@angular/router';
import { TennisMatch } from '../tennismatch.model';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatButtonModule,MatExpansionModule,MatCardModule, MatFormFieldModule, MatSelectModule, MatSelect, FormsModule, MatTableModule, MatPaginatorModule, CommonModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  matches: any[] = [];
  upcomingMatches: any[] = [];
  finishedMatches: any[] = [];
  pendingResultsMatches: any[] = [];
      
        // Filter data into categories
         oneWeek = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds

// Current time
 now = Date.now();

// Upcoming Matches: Matches whose deadlines are within 7 days from now
// One week in milliseconds
 twoWeeks = 14 * 24 * 60 * 60 * 1000; 
  dataSourceUpcoming = new MatTableDataSource<TennisMatch>();
  dataSourceFinished = new MatTableDataSource<TennisMatch>();
  dataSourcePendingResults = new MatTableDataSource<TennisMatch>();

  displayedColumnsUpcoming: string[] = ['week', 'home_player', 'away_player', 'deadline', 'phone_away','result','forfeit'];
  displayedColumnsFinished: string[] = ['week', 'home_player', 'away_player', 'result', 'deadline'];
  displayedColumnsPendingResults: string[] = ['week', 'home_player', 'away_player', 'result', 'deadline', 'phone_away'];

  ngOnInit(): void {
    this.loadMatches();
    
  }
  displayall(){
   
    this.upcomingMatches=this.matches
    this.dataSourceUpcoming.data = this.upcomingMatches;
  }
  activeonly(){
    this.upcomingMatches = this.matches.filter(match => {
      const deadline = match.deadline;
      return (deadline > this.now + this.oneWeek && deadline <= this.now + this.twoWeeks) || (deadline < this.now + this.oneWeek) && match.result === 'No result';
  });
  this.dataSourceUpcoming.data = this.upcomingMatches;
  }

  loadMatches(): void {
    const id = this.AuthService.getUserId();
    this.DataService.getMyMatches(id).subscribe(
      (data) => {
        this.matches = data;
       console.log(this.matches)
// Two weeks in milliseconds

// Upcoming Matches: Show only if deadline is between 2 weeks and 1 week away
this.upcomingMatches = this.matches.filter(match => {
    const deadline = match.deadline;
    return (deadline > this.now + this.oneWeek && deadline <= this.now + this.twoWeeks) || (deadline < this.now + this.oneWeek) && match.result === 'No result';
});

// Finished Matches: Matches that are completed
this.finishedMatches = this.matches.filter(match => match.result != 'No result' && match.result_confirmed==1);

this.pendingResultsMatches = this.matches.filter(match => {
  const deadline = match.deadline;
  return  (match.result!="No result" && match.result_confirmed==0) ;
});

        // Update data sources for tables
        this.dataSourceUpcoming.data = this.upcomingMatches;
        this.dataSourceFinished.data = this.finishedMatches;
        this.dataSourcePendingResults.data = this.pendingResultsMatches;

        if (this.matches.length > 0) {
          this.league_id = this.matches[0].league_id;
        }
      },
      (error: any) => {
        console.error('Error fetching matches:', error);
      }
    );
  }
  isAwayPlayer(match: any): boolean {
   console.log(this.AuthService.getUserId() == match.user_id,this.AuthService.getUserId() ,match.away_player_id)
    // Compare the current user's username with the away_player field
    return this.AuthService.getUserId() == match.user_id;
  }
  confirmResult(match: any) {
    // Logic to confirm the result by the away player
   if(match.result!="No result"){
    this.matchService.confirmResult(match.id).subscribe(
      (data) => {
        
    alert('Result confirmed for match ID: '+data + match);

      })
   }
    
  }
  forfeitMatch(match:any): void {
    let result=''
    if(match.home_player_id==this.AuthService.getUserId()){
      result="0-6,0-6"
    }else{
      result="6-0,6-0"
    }
    // Call your match service to update the match status
    this.matchService.forfeitMatch(match.id,result).subscribe(
      response => {
        // Handle success, e.g., refresh the data
       
        // Optionally reload the data
       this.loadMatches()
      },
      error => {
        console.error('Error forfeiting match', error);
      }
    );
  }
  selectedPlayer: string = '';
  selectedWeek: number | string = '';
  league_id: number =99;
  
  hideNoResults: boolean = false;
  @ViewChild('resultInput') resultInput!: ElementRef;
 
  resultForm: FormGroup;
  editingMatch: any = null;
  

  constructor(private DataService:DataService,private matchService: MatchService,private route: ActivatedRoute,private fb: FormBuilder,private AuthService: AuthService) {
    this.resultForm = this.fb.group({
      newResult: ['', [Validators.required, this.tennisScoreValidator]]
    });
   }


checkNames(name:string){
return this.AuthService.userMatchesPlayer(name)
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
    this.matchService.calculateStandings(this.league_id).subscribe(
      (response: any) => {
       
      },
      (error: any) => {
      
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

