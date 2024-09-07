import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TennisMatch } from './tennismatch.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeasonService {
  private currentSeasonSource = new BehaviorSubject<number>(2024); // Default season
  currentSeason$ = this.currentSeasonSource.asObservable();
  constructor(private http: HttpClient) { }
  setSeason(season: number) {
    this.currentSeasonSource.next(season);
  }

  getCurrentSeason() {
    return this.currentSeasonSource.value;
  }
  getSeasons(): Observable<any[]>{
    return this.http.get<TennisMatch[]>(environment.apiUrl+"/getSeasons/");
  }
}