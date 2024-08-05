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

  getLeagues(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/leagues`);
  }

  getPlayersByLeague(leagueId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/leagues/${leagueId}/players`);
  }
  getMatchesByLeague(leagueId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl+"/getmatches/"}${leagueId}`);
  }
  
}