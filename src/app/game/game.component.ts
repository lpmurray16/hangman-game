import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { GameWebsocketService, GameState } from '../services/game-websocket.service';
import { Game, GameCreate, GameStatus, GameResponse } from '../models/game';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit, OnDestroy {
  // Game state
  gameId: string | null = null;
  gameState: GameState | null = null;
  gameOver: boolean = false;
  gameOverMessage: string = '';
  finalWord: string = '';
  infoMessage: string = '';
  
  // Game creation
  newGameWord: string = '';
  isCreatingGame: boolean = false;
  availableGames: Game[] = [];
  
  // User input
  letterInput: string = '';
  alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  // Subscriptions
  private gameStateSubscription: Subscription | null = null;
  private gameOverSubscription: Subscription | null = null;
  private infoSubscription: Subscription | null = null;
  private wsConnection: Subscription | null = null;
  private availableGamesSubscription: Subscription | null = null;
  private currentGameSubscription: Subscription | null = null;
  
  constructor(
    private gameWebsocketService: GameWebsocketService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Subscribe to available games
    this.availableGamesSubscription = this.gameWebsocketService.availableGames$.subscribe(games => {
      this.availableGames = games;
    });
    
    // Subscribe to current game
    this.currentGameSubscription = this.gameWebsocketService.currentGame$.subscribe(response => {
      if (response && response.game && response.game.id) {
        this.gameId = response.game.id;
        
        // Update URL with game ID
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { id: this.gameId },
          queryParamsHandling: 'merge'
        });
      }
    });
    
    // Check if there's a game ID in the route
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.joinGame(params['id']);
      } else {
        // Load available games
        this.loadAvailableGames();
      }
    });
  }
  
  ngOnDestroy(): void {
    this.disconnectFromGame();
    
    // Unsubscribe from all subscriptions
    if (this.availableGamesSubscription) {
      this.availableGamesSubscription.unsubscribe();
    }
    
    if (this.currentGameSubscription) {
      this.currentGameSubscription.unsubscribe();
    }
  }
  
  // Load available public games
  loadAvailableGames(): void {
    this.gameWebsocketService.getPublicGames();
  }
  
  // Create a new game
  createGame(): void {
    if (this.isCreatingGame) return;
    
    this.isCreatingGame = true;
    
    const gameData: GameCreate = {
      is_public: true // Make the game public by default
    };
    
    if (this.newGameWord && this.newGameWord.trim().length > 0) {
      gameData.word = this.newGameWord.trim().toUpperCase();
    }
    
    console.log('Creating game with data:', gameData);
    
    // Create game via WebSocket
    this.gameWebsocketService.createGame(gameData).subscribe({
      next: (response) => {
        this.isCreatingGame = false;
        if (response && response.game && response.game.id) {
          // Connect to the game via WebSocket
          this.connectToGame(response.game.id, gameData.word);
        }
      },
      error: (error) => {
        this.isCreatingGame = false;
        console.error('Error creating game:', error);
      }
    });
  }
  
  // Join an existing game
  joinGame(gameId: string): void {
    // Join game via WebSocket
    this.gameWebsocketService.joinGame(gameId).subscribe({
      next: (response) => {
        if (response) {
          this.connectToGame(gameId);
        }
      },
      error: (error) => {
        console.error('Error joining game:', error);
      }
    });
  }
  
  // Connect to a game via WebSocket
  connectToGame(gameId: string, customWord?: string): void {
    // Disconnect from any existing game
    this.disconnectFromGame();
    
    // Subscribe to game state updates
    this.gameStateSubscription = this.gameWebsocketService.gameState$.subscribe(state => {
      this.gameState = state;
      this.gameOver = state.status !== 'in_progress';
    });
    
    // Subscribe to game over events
    this.gameOverSubscription = this.gameWebsocketService.gameOver$.subscribe(data => {
      this.gameOver = true;
      this.finalWord = data.word;
      this.gameOverMessage = data.status === 'won' ? 'You won!' : 'Game over!';
    });
    
    // Subscribe to info messages
    this.infoSubscription = this.gameWebsocketService.info$.subscribe(message => {
      this.infoMessage = message;
      setTimeout(() => this.infoMessage = '', 5000); // Clear after 5 seconds
    });
    
    // Connect to the game
    this.wsConnection = this.gameWebsocketService.connectToGame(gameId, customWord).subscribe() as Subscription;
  }
  
  // Disconnect from the current game
  disconnectFromGame(): void {
    if (this.gameStateSubscription) {
      this.gameStateSubscription.unsubscribe();
      this.gameStateSubscription = null;
    }
    
    if (this.gameOverSubscription) {
      this.gameOverSubscription.unsubscribe();
      this.gameOverSubscription = null;
    }
    
    if (this.infoSubscription) {
      this.infoSubscription.unsubscribe();
      this.infoSubscription = null;
    }
    
    if (this.wsConnection) {
      this.wsConnection.unsubscribe();
      this.wsConnection = null;
    }
    
    this.gameWebsocketService.disconnect();
  }
  
  // Make a guess
  makeGuess(letter: string): void {
    if (!this.gameState || this.gameOver || this.gameState.guessed_letters.includes(letter)) {
      return;
    }
    
    this.gameWebsocketService.sendGuess(letter);
    this.letterInput = ''; // Clear input field
  }
  
  // Submit letter from input field
  submitLetter(): void {
    if (this.letterInput && this.letterInput.length > 0) {
      const letter = this.letterInput.trim().toUpperCase();
      if (letter.length === 1 && /[A-Z]/.test(letter)) {
        this.makeGuess(letter);
      }
    }
  }
  
  // Check if a letter has been guessed
  isLetterGuessed(letter: string): boolean {
    return this.gameState ? this.gameState.guessed_letters.includes(letter) : false;
  }
  
  // Check if a letter is in the word
  isLetterCorrect(letter: string): boolean {
    if (!this.gameState || !this.gameState.display_word) return false;
    return this.gameState.display_word.includes(letter);
  }
  
  // Start a new game
  startNewGame(): void {
    this.disconnectFromGame();
    this.gameId = null;
    this.gameState = null;
    this.gameOver = false;
    this.gameOverMessage = '';
    this.finalWord = '';
    this.newGameWord = '';
    
    // Remove game ID from URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { id: null },
      queryParamsHandling: 'merge'
    });
    
    // Load available games
    this.loadAvailableGames();
  }
}
