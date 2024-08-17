import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) { }
  players = [
    { id: 1, name: 'Player 1' },
    { id: 2, name: 'Player 2' },
    // Add more players
  ];

  matches = [
    { id: 1, homePlayer: 'Player 1', awayPlayer: 'Player 2', result: '6-4, 6-4' },
    // Add more matches
  ];

  getPlayers() {
    return this.players;
  }

  getMyMatches(userid:number) {
    let params = new HttpParams().set('id', userid);
    return this.http.get<any[]>(`${environment.apiUrl}/getMyMatches`, { params });
  }

  getStandings() {
    // Calculate standings based on matches
  }
}