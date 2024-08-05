import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PlayersComponent } from './players/players.component';
import { MatchesComponent } from './matches/matches.component';
import { StandingsComponent } from './standings/standings.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'players/:id', component: PlayersComponent },
  { path: 'matches/:id', component: MatchesComponent },
  { path: 'standings/:id', component: StandingsComponent },
];