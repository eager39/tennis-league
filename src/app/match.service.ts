// src/app/services/match.service.ts
import { EnvironmentProviders, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TennisMatch } from './tennismatch.model';
import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  //private apiUrl = 'http://localhost:3000/standings/'; // Update with your API URL
  //private apiUrl1 = 'http://localhost:3000/getmatches/';
  //private api="http://localhost:3000";
  
  constructor(private http: HttpClient) { }

  getMatches(leagueid: number): Observable<any[]> {
    
    return this.http.get<TennisMatch[]>(environment.apiUrl+"/standings/"+leagueid);
  }
  getMatches1(leagueid:number): Observable<any[]> {
   
    return this.http.get<TennisMatch[]>(environment.apiUrl+"/getmatches/"+leagueid);
  }
  unplayedMatches(): Observable<any[]> {
   
    return this.http.get<TennisMatch[]>(environment.apiUrl+"/unplayedMatches/");
  }
  updateMatchResult(matchId: number, newResult: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(environment.apiUrl+"/update-match-result", { 'id': matchId, 'result': newResult }, { headers });
  }
  getLeagues(): Observable<any[]> {
  
    return this.http.get<any[]>(`${environment.apiUrl}/leagues`);
  }
  calculateStandings(leagueid: number): Observable<any[]> {
    return this.http.get<TennisMatch[]>(environment.apiUrl+'/calculate-standings/'+leagueid)
  }

  confirmResult(matchId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(environment.apiUrl+"/confirmResult", { 'id': matchId }, { headers });
  }
  updateComment(matchId: number,comment:string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(environment.apiUrl+"/updateComment", { 'id': matchId ,"comment":comment}, { headers });
  }
  forfeitMatch(matchId: number,result:string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(environment.apiUrl+"/forfeitMatch", { 'id': matchId,'result':result }, { headers });
  }

}