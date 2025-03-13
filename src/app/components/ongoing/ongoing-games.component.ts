import { Component, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicGameResponse } from '../../types';

@Component({
  selector: 'ongoing-games',
  templateUrl: 'ongoing-games.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [
    `
      .game-item {
        width: 100%;
        display: flex;
        justify-content: space-between;
        gap:4px;
        padding: 16px;
        border: var(--border-width) solid var(--primary);
        border-radius: var(--border-radius);
        margin-bottom: 4px;
        .game-status {
          margin-bottom: 4px;
        }
      }
    `,
  ],
})
export class OnGoingGamesComponent implements OnInit {
  games: PublicGameResponse[] = [];
  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.gameService.getPublicGames().subscribe((games) => {
      this.games = games || [];
    });
    this.gameService.newGameCreatedTrigger.subscribe(() => {
      this.gameService.getPublicGames().subscribe((games) => {
        this.games = games || [];
      });
    });
  }
}
