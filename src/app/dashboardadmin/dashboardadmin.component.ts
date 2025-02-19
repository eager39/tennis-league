
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
  selector: 'app-dashboardadmin',
  standalone: true,
  imports:[MatFormFieldModule,MatSelectModule,MatSelect,FormsModule,MatTableModule,MatPaginatorModule,CommonModule,ReactiveFormsModule,MatInputModule ],
  templateUrl: './dashboardadmin.component.html',
  styleUrl: './dashboardadmin.component.css'
})
export class DashboardadminComponent {
  matches: TennisMatch[] = [];
  dataSource = new MatTableDataSource<TennisMatch>();
  dataSource2 = new MatTableDataSource<any[]>();
  dataSource3 = new MatTableDataSource<any[]>();
  players: string[] = [];
  weeks: string[] = [];
  leagues: any[] = [];
  displayedColumns: string[] = ['week', 'home_player', 'away_player', 'result','deadline','penalty'];
  displayedColumns2: string[] = ['league',  'points', 'actions'];
  displayedColumns3: string[] = ['name',  'position', 'status','league'];
  selectedPlayer: string = '';
  selectedWeek: number | string = '';
  selectedLeagueId: number =1;
  matchesleft:number=0
  hideNoResults: boolean = false;
  @ViewChild('resultInput') resultInput!: ElementRef;
  @ViewChild('paginator1') paginator1!: MatPaginator;
  @ViewChild('paginator2') paginator2!: MatPaginator;
  @ViewChild('paginator3') paginator3!: MatPaginator;
  resultForm: FormGroup;
  editingMatch: any = null;
  ngOnInit(): void {
   
 
    this.loadMatches();
        this.getTiedPlayers()
        
      
    this.fetchLeagues();
    
      
     
}
penalty(id:any,matchid:number){
  this.leagueService.applypenalty(id,matchid).subscribe((data) => {
    console.log(data) 
if(data){
  alert("Kazenska točka dodeljena")
}
  })
}
ngAfterViewInit() {
  this.dataSource.paginator = this.paginator1;
  this.dataSource2.paginator = this.paginator2;
  this.dataSource3.paginator = this.paginator3;
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
    this.matchService.unplayedMatches().subscribe(
      (data) => {
        this.matches = data;
        this.dataSource.data = data;
        console.log(this.dataSource)
        this.extractPlayersAndWeeks(data);
        this.filterMatches();
        this.matchesleft=this.matches.length
      
      },
      (error) => {
        console.error('Error fetching matches:', error);
      }
    );
  }
}
extractPlayersAndWeeks(matches: TennisMatch[]): void {
  this.players = Array.from(new Set(matches.flatMap(match => [match.home_player, match.away_player])));
  this.weeks = Array.from(new Set(matches.map(match => match.week)));
}
onLeagueChange(): void {
  if (this.selectedLeagueId) {
    this.leagueService.getMatchesByLeague(this.selectedLeagueId).subscribe(
      (data) => {
        console.log(data)
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
  constructor(private matchService: MatchService, private leagueService: LeaguesService,private route: ActivatedRoute,private fb: FormBuilder,private AuthService: AuthService) {
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
      this.matchService.calculateStandings(this.selectedLeagueId).subscribe(
        (response) => {
          console.log('Standings calculated:', response);
        },
        (error) => {
          console.error('Error calculating standings:', error);
        }
      );
    }
    tennisScoreValidator(control: any): { [key: string]: boolean } | null {
      const value = control.value;
      if(value=="No result"){
        console.log("asd")
      return {  invalidTennisScore: false }
      }
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
          console.log(homeWins,awayWins+"1")
          if (sets.length > 2) {
            return { extraSet: true };
          }
        }else if(homeWins == 1 && awayWins > 2) {
          console.log(homeWins,awayWins+"2")
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
    filterMatches(): void {
      // Ensure that `this.selectedWeek` and `this.selectedPlayer` are properly defined
      const playerFilter = this.selectedPlayer ? (match: TennisMatch) => 
        match.home_player === this.selectedPlayer || match.away_player === this.selectedPlayer 
        : () => true;
    
      const weekFilter = this.selectedWeek ? (match: TennisMatch) => 
        match.week === this.selectedWeek 
        : () => true;
        const leagueFilter = this.selectedLeagueId ? (match: TennisMatch) => 
          match.league_id === this.selectedLeagueId 
          : () => true;
      this.extractPlayersAndWeeks(this.matches.filter(match => playerFilter(match) && weekFilter(match) &&leagueFilter(match)))
      this.dataSource.data = this.matches.filter(match => playerFilter(match) && weekFilter(match) &&leagueFilter(match));
    }
     showPromoted=0
    endLeague(){
     this.showPromoted=1
      this.leagueService.promoteanddemote().subscribe((data) => {
        console.log(data) 
        this.dataSource3.data=data
      })

    }
    promote(row: any){
      this.leagueService.promote(row.player,row.season_id).subscribe((data)=>{
        if(data){
           this.dataSource3.data = (this.dataSource3.filteredData as any[]).filter(item => item.player != row.player);
           alert("Igralec uspešno napredoval")
        }
      })
     
    }
    demote(row: any){
      this.leagueService.demote(row.player,row.season_id).subscribe((data)=>{
        if(data){
           this.dataSource3.data = (this.dataSource3.filteredData as any[]).filter(item => item.player != row.player);
           alert("Igralec izpadel v nižjo ligo")
        }
      })
  
    }
    getTiedPlayers(){
      this.leagueService.getTiedPlayers().subscribe((data) => {
       console.log(data) 
        this.dataSource2.data=this.formatPlayerPairs(data)
        console.log(this.formatPlayerPairs(data))
        console.log(this.dataSource2.filteredData)
        const maxPlayers = this.getMaxPlayerCount();
        console.log(this.dataSource2.data)
        for (let i = 1; i <= maxPlayers; i++) {
          this.displayedColumns2.push('player' + i);
        
        }
        console.log(this.displayedColumns2)
      });
    }
    // Format the players into pairs for the table
    formatPlayerPairs(players: any[]): any[] {
      const groupedPlayers = [];
      let currentGroup = [];
      
      for (let i = 0; i < players.length; i++) {
        // Start a new group if points differ or league/season changes
        if (
          currentGroup.length === 0 ||
          (players[i].league_id === players[i - 1]?.league_id &&
           players[i].season_id === players[i - 1]?.season_id &&
           players[i].points === players[i - 1]?.points)
        ) {
          currentGroup.push(players[i]);
        } else {
          // Process the current group and reset it
          groupedPlayers.push(this.flattenPlayerGroup(currentGroup));
          currentGroup = [players[i]];
        }
      }
    
      // Handle the last group if it's not empty
      if (currentGroup.length > 0) {
        groupedPlayers.push(this.flattenPlayerGroup(currentGroup));
      }
    
      return groupedPlayers;
    }
    
    // Helper function to flatten the group into individual player columns
    flattenPlayerGroup(group: any[]): any {
      const groupObject: any = {
        league_name: group[0].league_name,
        points: group[0].points
      };
    
      // Add players dynamically as player1_name, player2_name, etc.
      group.forEach((player, index) => {
        groupObject[`player${index + 1}_name`] = player.player_name;
        groupObject[`player${index + 1}_id`] = player.player_id;
        groupObject[`player${index + 1}_position`] = player.position;
      });
    
      return groupObject;
    }
    // This method dynamically returns indexes for the number of players in each row


  // This method returns the maximum number of players in any row, to define how many columns to add
  getMaxPlayerCount():any {
 
    let data=this.dataSource2.data
    let maxPlayers=0
    
    for(let i=0;i<data.length;i++){
      if( Object.keys(data[i]).filter(key => key.startsWith("player") && key.endsWith("name")).length>maxPlayers){
        maxPlayers= Object.keys(data[i]).filter(key => key.startsWith("player") && key.endsWith("name")).length
      }
     
    }
    
    return maxPlayers;
  }

    

  editPlayerStanding(row: any): void {
    // Handle logic to edit player's standing
    console.log('Edit standing for:', row);
  }
}
