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

@Component({
  selector: 'app-leaguedraw',
  standalone: true,
  imports: [MatFormFieldModule,MatSelectModule,CommonModule],
  templateUrl: './leaguedraw.component.html',
  styleUrl: './leaguedraw.component.css'
})
export class LeaguedrawComponent {
leagues: any
currentSeason: any;
  pari: any = [];
  selectedLeagueId: any;
  players: any;
  constructor(private seasonservice: SeasonService,private matchService: MatchService, private leagueService: LeaguesService,private route: ActivatedRoute,private fb: FormBuilder,private AuthService: AuthService) {
  
   }
   ngOnInit(): void {
  this.loadLeagues();
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
       
this.test()
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


    


}
