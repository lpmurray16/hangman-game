import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Game, GameCreate, GameGuess, GameResponse } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'https://fastapi-supabase-sho6.onrender.com'; // Updated to deployed backend URL
  constructor(private http: HttpClient) { }
  // Get all games for the current user
  getGames(): Observable<GameResponse[]> {
    return this.http.get<GameResponse[]>(`${this.apiUrl}/games`);
  }
  // Get a specific game by ID
  getGame(gameId: string): Observable<GameResponse> {
    return this.http.get<GameResponse>(`${this.apiUrl}/games/${gameId}`);
  }
  // Create a new game
  createGame(gameData: GameCreate): Observable<GameResponse> {
    return this.http.post<GameResponse>(`${this.apiUrl}/games`, gameData);
  }
  // Make a guess in a game
  makeGuess(guess: GameGuess): Observable<GameResponse> {
    return this.http.post<GameResponse>(`${this.apiUrl}/games/${guess.gameId}/guess`, { letter: guess.letter });
  }
  // Join a game as an opponent
  joinGame(gameId: string): Observable<GameResponse> {
    return this.http.post<GameResponse>(`${this.apiUrl}/games/${gameId}/join`, {});
  }
  // Get available public games to join
  getPublicGames(): Observable<GameResponse[]> {
    return this.http.get<GameResponse[]>(`${this.apiUrl}/games/public`);
  }
}
