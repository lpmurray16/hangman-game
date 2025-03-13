import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../../services/game.service';
import { PublicGameState, LetterGuess } from '../../types';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { HintRequest } from '../../types';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  gameId: string = '';
  game: PublicGameState | null = null;
  loading: boolean = true;
  error: string | null = null;
  alphabet: string[] = 'abcdefghijklmnopqrstuvwxyz'.split('');
  guessInProgress: boolean = false;
  isGameCreator: boolean = false;
  hintControl = new FormControl('');

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get the game ID from the route parameters
    this.route.paramMap.subscribe((params) => {
      const id = params.get('gameId');
      if (id) {
        this.gameId = id;
        this.loadGame();
      } else {
        this.error = 'Invalid game ID';
        this.loading = false;
      }
    });
  }

  loadGame(): void {
    this.loading = true;
    this.error = null;

    this.gameService.getGameById(this.gameId).subscribe({
      next: (gameData) => {
        this.game = gameData;
        this.loading = false;

        // Check if current user is the game creator
        this.authService.currentUser.subscribe((user) => {
          if (user && this.game) {
            this.isGameCreator = user.email === this.game.created_by;
          } else {
            this.isGameCreator = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading game:', err);
        this.error = 'Failed to load game. Please try again.';
        this.loading = false;
      },
    });
  }

  addHint() {
    const hint: HintRequest = {
      hint: this.hintControl.value || '',
    };

    this.gameService.addHint(this.gameId, hint).subscribe({
      next: (response) => {
        // Update game state with the response
        this.game = {
          ...this.game!,
          hints: response.hints,
        };
      },
      error: (err) => {
        console.error('Error adding hint:', err);
        this.error = 'Failed to add hint. Please try again.';
      },
    });
  }

  guessLetter(letter: string): void {
    if (
      this.guessInProgress ||
      !this.game ||
      this.game.status !== 'in_progress'
    ) {
      return;
    }

    this.guessInProgress = true;
    const guess: LetterGuess = { letter };

    this.gameService.guessLetter(this.gameId, guess).subscribe({
      next: (response) => {
        // Update game state with the response
        this.game = {
          ...this.game!,
          masked_word: response.masked_word, // Use the masked_word directly from the response
          guessed_letters: response.guessed_letters,
          attempts_left: response.attempts_left,
          status: response.status,
          wrong_guesses: response.wrong_guesses,
          correct_guesses: response.correct_guesses,
        };
        this.guessInProgress = false;
      },
      error: (err) => {
        console.error('Error guessing letter:', err);
        this.error = 'Failed to submit guess. Please try again.';
        this.guessInProgress = false;
      },
    });
  }

  isLetterGuessed(letter: string): boolean {
    return this.game?.guessed_letters.includes(letter) || false;
  }

  isLetterCorrect(letter: string): boolean {
    return this.game?.correct_guesses.includes(letter) || false;
  }

  isLetterIncorrect(letter: string): boolean {
    return this.game?.wrong_guesses.includes(letter) || false;
  }

  getHangmanImage(): string {
    if (!this.game) return '/assets/hangman/0.svg';

    // Calculate which image to show based on wrong guesses
    const wrongGuessCount = this.game.wrong_guesses.length;
    const maxImages = 6; // We have images from 0.svg to 6.svg

    // Ensure we don't exceed the available images
    const imageIndex = Math.min(wrongGuessCount, maxImages);

    return `/assets/hangman/${imageIndex}.svg`;
  }
}
