import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { WebsocketService } from './websocket.service';
import { AuthService } from './auth.service';
import { Game, GameCreate, GameResponse, GameStatus } from '../models/game';

export interface GameState {
  word: string;
  display_word: string;
  guessed_letters: string[];
  attempts_left: number;
  status: string; // "in_progress", "won", "lost"
}

export interface GameMessage {
  type: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class GameWebsocketService {
  private gameStateSubject = new Subject<GameState>();
  private gameOverSubject = new Subject<{word: string, status: string}>();
  private infoSubject = new Subject<string>();
  private currentGameId: string | null = null;
  private availableGamesSubject = new BehaviorSubject<Game[]>([]);
  private currentGameSubject = new BehaviorSubject<GameResponse | null>(null);

  constructor(
    private websocketService: WebsocketService,
    private authService: AuthService
  ) {
    // Connect to WebSocket when service is initialized
    this.connectToWebSocket();
  }

  // Connect to WebSocket and listen for messages
  private connectToWebSocket(): Observable<any> {
    const connection = this.websocketService.connect();
    
    connection.subscribe({
      next: (message: GameMessage) => {
        this.handleGameMessage(message);
      },
      error: (error) => {
        console.error('WebSocket error:', error);
      }
    });
    
    return connection;
  }
  
  // Connect to a specific game
  connectToGame(gameId: string, customWord?: string): Observable<any> {
    this.currentGameId = gameId;
    
    // Send a message to join the game
    const joinMessage = {
      type: 'join_game',
      game_id: gameId,
      custom_word: customWord || undefined
    };
    
    // Send the join message
    this.websocketService.sendMessage(joinMessage);
    
    // Get the initial game state
    this.getGame(gameId);
    
    return this.gameStateSubject.asObservable();
  }

  // Handle incoming game messages
  private handleGameMessage(message: GameMessage): void {
    console.log('Received message:', message);
    
    switch (message.type) {
      case 'game_state':
        // Process game state update
        const gameState = message.data as GameState;
        this.gameStateSubject.next(gameState);
        
        // Check if game is over
        if (gameState.status === 'won' || gameState.status === 'lost') {
          this.gameOverSubject.next({
            word: gameState.word,
            status: gameState.status
          });
        }
        break;
        
      case 'game_over':
        this.gameOverSubject.next(message.data as {word: string, status: string});
        break;
        
      case 'info':
        this.infoSubject.next(message.data as string);
        break;
        
      case 'available_games':
        this.availableGamesSubject.next(message.data as Game[]);
        break;
        
      case 'game_created':
      case 'game_joined':
      case 'game_updated':
        this.currentGameSubject.next(message.data as GameResponse);
        break;
        
      case 'error':
        console.error('WebSocket error:', message.data);
        this.infoSubject.next(`Error: ${message.data}`);
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  // Send a guess to the server
  sendGuess(letter: string): void {
    if (!this.currentGameId) {
      console.error('No active game connection');
      return;
    }
    
    const message = {
      type: 'guess',
      letter: letter
    };
    
    this.websocketService.sendMessage(message);
  }

  // Disconnect from the game
  disconnect(): void {
    this.websocketService.disconnect();
    this.currentGameId = null;
  }

  // Observable for game state updates
  get gameState$(): Observable<GameState> {
    return this.gameStateSubject.asObservable();
  }

  // Observable for game over events
  get gameOver$(): Observable<{word: string, status: string}> {
    return this.gameOverSubject.asObservable();
  }

  // Observable for info messages
  get info$(): Observable<string> {
    return this.infoSubject.asObservable();
  }
  
  // Observable for available games
  get availableGames$(): Observable<Game[]> {
    return this.availableGamesSubject.asObservable();
  }
  
  // Observable for current game
  get currentGame$(): Observable<GameResponse | null> {
    return this.currentGameSubject.asObservable();
  }
  
  // Create a new game
  createGame(gameData: GameCreate): Observable<GameResponse | null> {
    const message = {
      type: 'create_game',
      data: gameData
    };
    
    this.websocketService.sendMessage(message);
    return this.currentGame$;
  }
  
  // Join a game
  joinGame(gameId: string): Observable<GameResponse | null> {
    const message = {
      type: 'join_game',
      game_id: gameId
    };
    
    this.websocketService.sendMessage(message);
    this.currentGameId = gameId;
    return this.currentGame$;
  }
  
  // Get all games for the current user
  getGames(): void {
    const message = {
      type: 'get_games'
    };
    
    this.websocketService.sendMessage(message);
  }
  
  // Get a specific game by ID
  getGame(gameId: string): void {
    const message = {
      type: 'get_game',
      game_id: gameId
    };
    
    this.websocketService.sendMessage(message);
  }
  
  // Get available public games to join
  getPublicGames(): void {
    const message = {
      type: 'get_public_games'
    };
    
    this.websocketService.sendMessage(message);
  }
}