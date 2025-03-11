/**
 * Type definitions for the Hangman Game application
 */

// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

// Game status type
export type GameStatus = 'active' | 'won' | 'lost';

// Game related types
export interface Game {
  id: string;
  word: string;
  hint?: string;
  max_attempts: number;
  current_attempts: number;
  guessed_letters: string[];
  status: GameStatus;
  created_at: string;
  created_by: string;
  is_multiplayer: boolean;
}

export interface GameCreate {
  word?: string;
  hint?: string;
  max_attempts?: number;
  is_multiplayer?: boolean;
}

export interface GameState {
  id: string;
  word_display: string[];
  hint?: string;
  max_attempts: number;
  current_attempts: number;
  guessed_letters: string[];
  status: GameStatus;
  is_multiplayer: boolean;
  players?: string[];
  current_player_turn?: string;
}

// Request types
export interface GuessRequest {
  game_id: string;
  letter: string;
}

export interface JoinGameRequest {
  game_id: string;
}

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
