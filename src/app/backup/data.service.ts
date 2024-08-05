import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
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

  getMatches() {
    return this.matches;
  }

  getStandings() {
    // Calculate standings based on matches
  }
}