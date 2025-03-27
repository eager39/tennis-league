import { Component } from '@angular/core';
import { MatchService } from '../match.service';
import { LeaguesService } from '../league.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { randomInt } from 'crypto';
import { SeasonService } from '../season.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-leaguedraw',
  standalone: true,
  imports: [MatFormFieldModule,MatSelectModule,CommonModule,MatTableModule,MatIconModule],
  templateUrl: './leaguedraw.component.html',
  styleUrl: './leaguedraw.component.css'
})
export class LeaguedrawComponent {
leagues: any
currentSeason: any;
  pari: any = [];
  selectedLeagueId: any;
  players: any;
  playerlistfordraw:any[]=[]
  playerlistforlist:any[]=[]
  displayedColumns: string[] = ['position', 'name'];
  dataSource = new MatTableDataSource<any>([]);
  numofplayersleft:any=16
  seasons:any[]=[]
  constructor(private seasonservice: SeasonService,private matchService: MatchService, private leagueService: LeaguesService,private route: ActivatedRoute,private fb: FormBuilder,private AuthService: AuthService) {
  
   }
   ngOnInit(): void {
  this.loadLeagues();
  this.seasonservice.getSeasons().subscribe(data=>{
this.seasons=data
console.log(this.seasons)
  })
   }

   loadLeagues(): void {
    this.matchService.getLeagues().subscribe(data => {
      this.leagues = data;
  
    }, error => {
      console.error('Error fetching leagues:', error);
    });
  }
  onLeagueChange() {
  
    // this.selectedLeagueId = event.target.value;
     if (this.selectedLeagueId) {
       this.leagueService.getPlayersByLeague(this.selectedLeagueId).subscribe(data => {
         this.players = data;
       this.dataSource.data=[]
       this.playerlistfordraw=[]
       this.playerlistforlist=[]
//
       });
     } else {
       this.players = [];
     }
   }
   test(){
   
    this.leagueService.draw(this.selectedLeagueId,this.seasonservice.getCurrentSeason()).subscribe(
      (response) => {
      
       
      },
      (error) => {
        console.error('Registration error', error);
      }
    );
   }
   addToDraw(player:any){
   
    this.players = this.players.filter((p: { player_id: any; }) => player.player_id!= p.player_id);
    this.playerlistforlist.push(player)
    this.playerlistfordraw.push(player.id)
    this.dataSource.data = [...this.playerlistforlist];
    this.numofplayersleft=this.players.length
console.log(this.playerlistfordraw)
console.log(this.players)
   }
   manualdraw(){
   
    this.leagueService.manualdraw(this.playerlistfordraw,this.seasonservice.getCurrentSeason()).subscribe(
      (response) => {
      console.log(response)
       
      },
      (error) => {
        console.error('Registration error', error);
      }
    );
   }
   isLeagueDisabled(leagueId: number): boolean {
    const season = this.seasons.find(s => s.leagueId == leagueId); // Adjust key based on your data structure
    return season ? season.draw == 1 : false;
  }

    


}
