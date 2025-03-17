import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OnGoingGamesComponent } from "../../components/ongoing/ongoing-games.component";
import { NewGameComponent } from "../../components/new-game/new-game.component";
import { JoinGameComponent } from "../../components/join-game/join-game.component";
import { GameService } from '../../services/game.service';
import { CreateGame } from '../../types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, OnGoingGamesComponent, NewGameComponent, JoinGameComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  showNewGameForm = false;
  showJoinGameForm = false;
  
  constructor(private gameService: GameService) {}

  createNewGame() {
    this.showNewGameForm = true;
    this.showJoinGameForm = false;
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

  showJoinGame() {
    this.showJoinGameForm = true;
    this.showNewGameForm = false;
  }

  onCancelJoinGame() {
    this.showJoinGameForm = false;
  }
}