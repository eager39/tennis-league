import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeaguesService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getLeagues(): Observable<any> {
    return this.http.get(`${this.apiUrl}/leagues`);
  }

  getPlayersByLeague(leagueId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/leagues/${leagueId}/players`);
  }
}