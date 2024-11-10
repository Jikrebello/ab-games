import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LeaderboardService } from './../Services/leaderboard.service';
@Component({
  selector: 'app-game-over-modal',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './game-over-modal.component.html',
  styleUrl: './game-over-modal.component.css',
})
export class GameOverModalComponent {
  @Input() score: number = 0; // final score
  @Output() restartGame = new EventEmitter<void>();

  playerName: string = '';

  constructor(private leaderboardService: LeaderboardService) {}

  async onPlayAgain() {
    try {
      if (this.playerName.trim()) {
        console.log('Attempting to submit score:', this.playerName, this.score);
        await this.leaderboardService.addHighScore(this.playerName, this.score);
        console.log('Score submitted successfully');
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    } finally {
      console.log('Emitting restartGame event');
      this.restartGame.emit();
    }
  }
}
