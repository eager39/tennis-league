import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule, NgFor } from '@angular/common';
import { LeaguesService } from '../league.service';
import { ActivatedRoute, Params } from '@angular/router';
@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css'],
  imports: [CommonModule],
  standalone: true,
  
})
export class PlayersComponent implements OnInit {
  leagues: any[] = [];
  players: any[] = [];
  selectedLeagueId: string | null = null;

  constructor(private leaguesService: LeaguesService,private route: ActivatedRoute) {}

  ngOnInit() {
    this.leaguesService.getLeagues().subscribe(data => {
      this.leagues = data;
    });
    this.route.params.subscribe(
      (params: Params) => {
        this.selectedLeagueId = params["id"];
        console.log(this.selectedLeagueId);
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
}