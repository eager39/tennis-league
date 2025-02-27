import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaguesService {
  [x: string]: any;
  // private apiUrl = 'http://localhost:3000';
  // private matchesUrl = 'http://localhost:3000/getmatches/'; // Adjust the URL as needed
  constructor(private http: HttpClient) {}

  getLeagues(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/leagues`);
  }

  getPlayersByLeague(leagueId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/leagues/${leagueId}/players`);
  }
  getMatchesByLeague(leagueId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl+"/getmatches/"}${leagueId}`);
  }
  endLeague(): Observable<any> {
   
    return this.http.post(environment.apiUrl+"/endLeague", {});
  }
  getTiedPlayers(): Observable<any> {
    return this.http.get(`${environment.apiUrl+"/getTiedPlayers"}`);
  }
  promoteanddemote(): Observable<any> {
    return this.http.get(`${environment.apiUrl+"/fetchpromotedanddemoted"}`);
  }
  promote(playerid: number,seasonid:number): Observable<any> {
  
    return this.http.post(environment.apiUrl+"/promote", { 'id': playerid,'status':'promoted','seasonid':seasonid });
  }
  demote(playerid: number,seasonid:number): Observable<any> {
  
    return this.http.post(environment.apiUrl+"/demote", { 'id': playerid,'status':'demoted','seasonid':seasonid });
  }
  applypenalty(playerid: number,matchid:number): Observable<any> {
  
    return this.http.post(environment.apiUrl+"/applypenalty", { 'id': playerid,'matchid':matchid });
  }
  changeLeagueforPlayer(id: number,newleagueid:number): Observable<any> {
  
    return this.http.post(environment.apiUrl+"/changePlayerLeague", { 'id': id,"newleagueid":newleagueid});
  }
  draw(league: number,season:number): Observable<any> {
  
    return this.http.post(environment.apiUrl+"/generate-schedule", { 'liga': league,"season":season});
  }

  
}