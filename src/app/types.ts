export interface GameState {
  id: string;
  word: string;
  guessed_letters: string[]; // Fixed to match FastAPI model
  attempts_left: number;
  status: string;
  wrong_guesses: string[]; // Fixed
  correct_guesses: string[]; // Fixed
  created_by: string;
  created_at: string;
  hints: string[];
}

export interface PublicGameState {
  id: string;
  masked_word: string; // Added missing field
  guessed_letters: string[];
  attempts_left: number;
  status: string;
  wrong_guesses: string[];
  correct_guesses: string[];
  created_by: string;
  created_at: string;
  hints: string[];
}

export interface PublicGameResponse {
  game_id: string;
  status: string;
  created_by: string;
  created_at: string;
  attempts_left: number;
}

export interface CreateGame {
  word: string;
}

export interface HintRequest {
  hint: string;
}

export interface LetterGuess {
  letter: string;
}

export interface UserCreate {
  email: string;
  password: string;
  username: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}
