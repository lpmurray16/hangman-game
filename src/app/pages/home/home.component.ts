import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OnGoingGamesComponent } from "../../components/ongoing/ongoing-games.component";
import { NewGameComponent } from "../../components/new-game/new-game.component";
import { GameService } from '../../services/game.service';
import { CreateGame } from '../../types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, OnGoingGamesComponent, NewGameComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  showNewGameForm = false;
  
  constructor(private gameService: GameService) {}

  createNewGame() {
    this.showNewGameForm = true;
  }
  
  onGameCreated(gameData: CreateGame) {
    this.gameService.createGame(gameData).subscribe({
      next: (response) => {
        console.log('Game created successfully', response);
        this.showNewGameForm = false;
        // Additional logic like redirecting to the game page could be added here
      },
      error: (error) => {
        console.error('Error creating game', error);
      }
    });
  }
  
  onCancelNewGame() {
    this.showNewGameForm = false;
  }
}