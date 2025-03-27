import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule, NgFor } from '@angular/common';
import { LeaguesService } from '../league.service';
import { ActivatedRoute, Params } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { LoadingService } from '../loadingservice.service';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css'],
  imports: [CommonModule,MatFormFieldModule,MatSelectModule, MatInputModule, FormsModule,MatIconModule],
  standalone: true,
  
})
export class PlayersComponent implements OnInit {
  leagues: any[] = [];
  players: any[] = [];
  newleagueid: any;
  selectedLeagueId: string | null = null;
  showleague=false;
  editplayers=false
  selectedplayerid:any
  constructor(private leaguesService: LeaguesService,private route: ActivatedRoute,public authService: AuthService,private loadingService: LoadingService) {}

  ngOnInit() {
    this.leaguesService.getLeagues().subscribe(data => {
      this.leagues = data;
    });
    this.route.params.subscribe(
      (params: Params) => {
        this.selectedLeagueId = params["id"];
     
       this.onLeagueChange()
      })
  }

  onLeagueChange() {
   // this.selectedLeagueId = event.target.value;
    if (this.selectedLeagueId) {
      this.leaguesService.getPlayersByLeague(this.selectedLeagueId).subscribe(data => {
        this.players = data;
      });
    } else {
      this.players = [];
    }
  }
  changeleague(id:number){
    this.selectedplayerid=id
   this.showleague=true


  }
  updateLeague(){
  
  
  
     this.leaguesService.changeLeagueforPlayer(this.selectedplayerid,this.newleagueid).subscribe((data) => {
     if(data){
      alert("uspešno!")
      this.onLeagueChange()
      this.showleague=false
     }else{
      alert("fail")
     }
     })
   
  }
  removeplayer(id:number){
  
  this.selectedplayerid=id
  
    this.leaguesService.removePlayer(this.selectedplayerid).subscribe((data) => {
    if(data){
     
     this.onLeagueChange()
     this.showleague=false
    }else{
     alert("fail")
    }
    })
  
 }
 edit(){
  if(this.editplayers==false){
    this.editplayers=true
  }else{
    this.editplayers=false
  }
 }
}