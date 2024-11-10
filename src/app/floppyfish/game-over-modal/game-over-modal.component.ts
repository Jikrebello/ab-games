import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LeaderboardService } from '../../Services/leaderboard.service';
@Component({
  selector: 'app-game-over-modal',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './game-over-modal.component.html',
  styleUrl: './game-over-modal.component.css',
})
export class GameOverModalComponent implements OnInit {
  @Input() score: number = 0; // final score
  @Output() restartGame = new EventEmitter<void>();

  playerName: string = '';

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
      this.playerName = savedName;
    }
  }

  async onPlayAgain() {
    try {
      if (this.playerName.trim()) {
        localStorage.setItem('playerName', this.playerName);
        await this.leaderboardService.addHighScore(this.playerName, this.score);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    } finally {
      this.restartGame.emit();
    }
  }
}
