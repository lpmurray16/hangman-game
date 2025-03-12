export interface UserCreate {
  email: string;
  password: string;
  username: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface GameState {
  id: string;
  word: string;
  guessed_letters: string[];
  attempts_left: number;
  status: string;
  wrong_guesses: string[];
  correct_guesses: string[];
  created_by: string;
  created_at: string;
}

export interface PublicGameState {
  id: string;
  masked_word: string;
  guessed_letters: string[];
  attempts_left: number;
  status: string;
  wrong_guesses: string[];
  correct_guesses: string[];
  created_by: string;
  created_at: string;
}

export interface PublicGameResponse {
  game_id: string;
  status: string;
  created_by: string;
  created_at: string;
}

export interface LetterGuess {
  letter: string;
}

export interface CreateGame {
  word: string;
}