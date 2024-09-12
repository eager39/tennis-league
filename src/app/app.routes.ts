import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PlayersComponent } from './players/players.component';
import { MatchesComponent } from './matches/matches.component';
import { StandingsComponent } from './standings/standings.component';
import { RoleGuard } from './auth.guard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardadminComponent } from './dashboardadmin/dashboardadmin.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ManageleagueComponent } from './manageleague/manageleague.component';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'players/:id', component: PlayersComponent },
  { path: 'matches/:id', component: MatchesComponent },
  { path: 'standings/:id', component: StandingsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'logout', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent ,canActivate:[RoleGuard],data: { roles: ['user'] }},
  { path: 'dashboardadmin', component: DashboardadminComponent ,canActivate:[RoleGuard],data: { roles: ['admin'] }},
  { path: 'manageusers', component: ManageUsersComponent ,canActivate:[RoleGuard],data: { roles: ['admin'] }},
  { path: 'manageleague', component: ManageleagueComponent ,canActivate:[RoleGuard],data: { roles: ['admin'] }}
];