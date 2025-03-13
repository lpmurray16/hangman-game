import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import {
  CreateGame,
  GameState,
  HintRequest,
  LetterGuess,
  PublicGameResponse,
  PublicGameState,
} from '../types';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private apiUrl = 'http://localhost:8000';
  newGameCreatedTrigger = new Subject<void>();

  constructor(private http: HttpClient) {}

  getPublicGames(): Observable<PublicGameResponse[]> {
    return this.http.get<PublicGameResponse[]>(`${this.apiUrl}/games/public`);
  }

  getGameById(gameId: string): Observable<PublicGameState> {
    return this.http.get<PublicGameState>(`${this.apiUrl}/games/${gameId}`);
  }

  createGame(game: CreateGame): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/games`, game);
  }

  guessLetter(gameId: string, guess: LetterGuess): Observable<PublicGameState> {
    return this.http.post<PublicGameState>(
      `${this.apiUrl}/games/${gameId}/guess`,
      guess
    );
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/auth/logout`,
      {}
    );
  }

  addHint(gameId: string, hint: HintRequest): Observable<PublicGameState> {
    return this.http.post<PublicGameState>(
      `${this.apiUrl}/games/${gameId}/addhint`,
      hint
    );
  }
}
