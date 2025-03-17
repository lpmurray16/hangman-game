import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-game',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './join-game.component.html',
  styleUrls: ['./join-game.component.scss']
})
export class JoinGameComponent {
  @Output() cancel = new EventEmitter<void>();
  
  gameIdControl = new FormControl('', [
    Validators.required,
    Validators.pattern('^[0-9]{4}$')
  ]);
  
  constructor(private router: Router) {}

  onSubmit() {
    if (this.gameIdControl.valid && this.gameIdControl.value) {
      const gameId = this.gameIdControl.value;
      // Use router.navigateByUrl for more direct navigation
      this.router.navigateByUrl(`/game/${gameId}`);
    }
  }
  
  onCancel() {
    this.cancel.emit();
  }
} 