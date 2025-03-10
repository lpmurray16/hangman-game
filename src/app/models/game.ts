export interface Game {
  id?: string;
  word?: string;
  guessed_letters?: string[];
  incorrect_guesses?: number;
  max_incorrect_guesses?: number;
  status?: GameStatus;
  created_by?: string;
  opponent?: string;
  winner?: string;
  turn?: string;
  display_word?: string;
}

export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  WON = 'won',
  LOST = 'lost'
}

export interface GameCreate {
  word?: string; // Optional if system generates word
  max_incorrect_guesses?: number; // Default can be set by backend
  opponent?: string; // Optional for single player mode
  is_public?: boolean; // Whether the game is public and can be joined by others
}

export interface GameGuess {
  gameId: string;
  letter: string;
}

export interface GameResponse {
  game: Game;
  message?: string;
  masked_word?: string; // Word with unguessed letters masked
}
