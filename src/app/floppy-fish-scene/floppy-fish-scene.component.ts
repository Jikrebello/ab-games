import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { GameState } from '../Enums/GameState';
import { Fish } from '../Models/fish';
import { Pillar } from '../Models/pillar';
import { GameOverModalComponent } from '../game-over-modal/game-over-modal.component';

@Component({
  selector: 'app-floppy-fish-scene',
  standalone: true,
  imports: [CommonModule, GameOverModalComponent],
  templateUrl: './floppy-fish-scene.component.html',
  styleUrl: './floppy-fish-scene.component.css',
})
export class FloppyFishSceneComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private isBrowser: boolean;

  private fish!: Fish;
  private pillars: Pillar[] = [];
  private gameState: GameState = GameState.NewGame;

  public displayMessage: string = 'Press Space to Start';
  public isGameOverModalVisible: boolean = false;

  private pillarSpawnInterval: string | number | NodeJS.Timeout | undefined;
  private spawnRate: number = 800;

  public score: number = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.scene = new THREE.Scene();

      // Set up camera with the same aspect ratio as the fixed canvas
      this.camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.01, 1000);
      this.camera.position.z = 6;
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // --- Setup ---
      this.canvasAndCameraSetup();
      this.createFish();

      // --- Render Loop ---
      this.update();

      // --- Input Events ---
      window.addEventListener('keydown', this.onSpaceBarPress.bind(this));
    }
  }

  private update = () => {
    if (this.isBrowser) {
      requestAnimationFrame(this.update);

      if (
        this.gameState === GameState.Playing ||
        this.gameState === GameState.GameOver
      ) {
        // Update the fish position, applying gravity in both states
        this.fish.animate();

        if (this.gameState === GameState.Playing) {
          // Update displayMessage with the current score during gameplay
          this.displayMessage = `${this.score}`;

          // Update and move existing pillars
          this.pillars.forEach((pillar, index) => {
            pillar.move();

            // Check if the fish has passed the pillar to increment the score
            if (
              !pillar.hasBeenPassed &&
              pillar.getPositionX() < this.fish.getPositionX()
            ) {
              this.score += 1;
              pillar.hasBeenPassed = true;
            }

            // Remove pillars that are out of view
            if (pillar.isOutOfView()) {
              pillar.remove();
              this.pillars.splice(index, 1);
            }
          });

          // Check for collision or boundary conditions to set game over
          for (const pillar of this.pillars) {
            if (this.checkCollision(this.fish.getBoundingBox(), pillar)) {
              this.triggerGameOver();
              return; // Stop further checks if game over is triggered
            }
          }
          if (this.fish.getPositionY() < -3.5 || this.fish.getPositionY() > 5) {
            this.triggerGameOver();
            return;
          }

          // Create new pillars as needed
          if (!this.pillarSpawnInterval) {
            this.createPillars();
          }
        }

        // Allow the fish to keep falling after Game Over until it reaches the ground level
        if (
          this.gameState === GameState.GameOver &&
          this.fish.getPositionY() < -3.5
        ) {
          this.fish.stopMovement();
          this.fish.setPositionY(-3.5);
        }
      }

      // Render the scene regardless of the game state
      this.renderer.render(this.scene, this.camera);
    }
  };

  private canvasAndCameraSetup(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
    });

    const canvasWidth = 800; // Set to match the CSS width
    const canvasHeight = 600; // Set to match the CSS height

    this.camera.aspect = canvasWidth / canvasHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(canvasWidth, canvasHeight);
  }

  private createFish(): void {
    this.fish = new Fish(this.scene); // Instantiate the Fish class
  }

  private createPillars(): void {
    if (!this.pillarSpawnInterval && this.gameState === GameState.Playing) {
      // Set up an interval to spawn pillars at a controlled rate
      this.pillarSpawnInterval = window.setInterval(() => {
        if (this.gameState === GameState.Playing) {
          const yPosition = Math.random() * 4 - 2; // Random vertical position within bounds
          const initialXPosition = 7;
          const newPillar = new Pillar(
            this.scene,
            initialXPosition, // Ensure the pillar starts just outside the view to slide in
            yPosition,
            1.8,
          );
          this.pillars.push(newPillar);
        }
      }, this.spawnRate); // Adjust interval as needed to control the spawn rate
    }
  }

  private onSpaceBarPress(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      if (this.gameState === GameState.NewGame) {
        // Start the game
        this.gameState = GameState.Playing;
        this.fish.applyFlap();
        this.displayMessage = '';
      } else if (this.gameState === GameState.Playing) {
        // Apply flap
        this.fish.applyFlap();
      }
    }
  }

  private triggerGameOver(): void {
    this.gameState = GameState.GameOver;
    this.isGameOverModalVisible = true;
    this.displayMessage = ''; // Clear display message during game over
  }

  public onRestartGame(): void {
    this.resetGame();
    this.isGameOverModalVisible = false; // Hide the modal
  }

  private resetGame(): void {
    this.gameState = GameState.NewGame;
    this.fish.reset();
    this.score = 0;
    this.displayMessage = 'Press Space to Start';

    // Remove all existing pillars from the scene
    this.pillars.forEach((pillar) => pillar.remove());
    this.pillars = [];

    // Clear existing interval and reset it
    if (this.pillarSpawnInterval) {
      clearInterval(this.pillarSpawnInterval);
      this.pillarSpawnInterval = undefined;
    }
  }

  private checkCollision(fishBox: THREE.Box3, pillar: Pillar): boolean {
    // Check for intersection with both top and bottom parts of the pillar
    return (
      fishBox.intersectsBox(pillar.getTopBoundingBox()) ||
      fishBox.intersectsBox(pillar.getBottomBoundingBox())
    );
  }
}
