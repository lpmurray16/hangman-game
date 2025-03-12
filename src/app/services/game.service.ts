import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateGame, GameState, PublicGameResponse, PublicGameState } from '../types';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly baseUrl = environment.backend_api_url;

  constructor(private http: HttpClient) {}

  createGame(
    gameData: CreateGame
  ): Observable<GameState> {
    return this.http.post<GameState>(
      `${this.baseUrl}/games`,
      gameData
    );
  }

  getGame(gameId: string): Observable<PublicGameState> {
    return this.http.get<PublicGameState>(
      `${this.baseUrl}/games/${gameId}`
    );
  }

  getPublicGames(): Observable<PublicGameResponse[]> {
    return this.http.get<PublicGameResponse[]>(`${this.baseUrl}/games/public`);
  }
}
