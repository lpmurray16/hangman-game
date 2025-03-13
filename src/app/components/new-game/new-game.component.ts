import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateGame } from '../../types';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-new-game',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-game.component.html',
  styleUrls: ['./new-game.component.scss']
})
export class NewGameComponent {
  @Output() gameCreated = new EventEmitter<CreateGame>();
  @Output() cancel = new EventEmitter<void>();
  
  newGameForm: FormGroup;
  submitted = false;
  
  constructor(private fb: FormBuilder, private gameService: GameService) {
    this.newGameForm = this.fb.group({
      word: ['', [Validators.required, Validators.minLength(2)]],
    });
  }
  
  get f() { return this.newGameForm.controls; }
  
  onSubmit() {
    this.submitted = true;
    
    if (this.newGameForm.invalid) {
      return;
    }
    
    const gameData: CreateGame = {
      word: this.f['word'].value,
    };
    
    this.gameCreated.emit(gameData);
    this.gameService.newGameCreatedTrigger.next();
  }
  
  onCancel() {
    this.cancel.emit();
  }
}