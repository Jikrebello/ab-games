import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-game-over-modal',
  standalone: true,
  imports: [],
  templateUrl: './game-over-modal.component.html',
  styleUrl: './game-over-modal.component.css',
})
export class GameOverModalComponent {
  @Input() score: number = 0;
  @Output() restartGame = new EventEmitter<void>();

  onPlayAgain() {
    this.restartGame.emit();
  }
}
