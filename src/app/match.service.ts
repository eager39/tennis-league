// src/app/services/match.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TennisMatch } from './tennismatch.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  private apiUrl = 'http://localhost:3000/standings'; // Update with your API URL
  private apiUrl1 = 'http://localhost:3000/getmatches';
  private api="http://localhost:3000";
  constructor(private http: HttpClient) { }

  getMatches(): Observable<any[]> {
    return this.http.get<TennisMatch[]>(this.apiUrl);
  }
  getMatches1(): Observable<any[]> {
    return this.http.get<TennisMatch[]>(this.apiUrl1);
  }
  updateMatchResult(matchId: number, newResult: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post("http://localhost:3000/update-match-result", { 'id': matchId, 'result': newResult }, { headers });
  }
  

}