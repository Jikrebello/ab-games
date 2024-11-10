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
import { GameState } from '../../Enums/GameState';
import { Fish } from '../../Models/fish';
import { Pillar } from '../../Models/pillar';
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
        this.applyGravity();

        if (this.gameState === GameState.Playing) {
          this.displayMessage = `${this.score}`;
          this.updatePillars();
          this.checkGameOverConditions();
          this.spawnPillarsIfNeeded();
        }

        if (this.gameState === GameState.GameOver) {
          this.ensureFishFallsToGround();
        }
      }

      this.renderer.render(this.scene, this.camera);
    }
  };

  /**
   * Apply gravity to the fish in both Playing and GameOver states
   */
  private applyGravity(): void {
    this.fish.animate();
  }

  /**
   * Move pillars and check if any pillars have been passed or are out of view
   */
  private updatePillars(): void {
    this.pillars.forEach((pillar, index) => {
      pillar.move();

      if (
        !pillar.hasBeenPassed &&
        pillar.getPositionX() < this.fish.getPositionX()
      ) {
        this.score += 1;
        pillar.hasBeenPassed = true;
      }

      if (pillar.isOutOfView()) {
        pillar.remove();
        this.pillars.splice(index, 1);
      }
    });
  }

  /**
   * Check for collision or out-of-bounds conditions to trigger game over
   */
  private checkGameOverConditions(): void {
    if (
      this.pillars.some((pillar) =>
        this.checkCollision(this.fish.getBoundingBox(), pillar),
      ) ||
      this.fish.getPositionY() < -3.5 ||
      this.fish.getPositionY() > 5
    ) {
      this.triggerGameOver();
    }
  }

  /**
   * Ensure pillars are spawned at set intervals during gameplay
   */
  private spawnPillarsIfNeeded(): void {
    if (!this.pillarSpawnInterval) {
      this.createPillars();
    }
  }

  /**
   * Allow the fish to keep falling after Game Over until it reaches the ground level
   */
  private ensureFishFallsToGround(): void {
    if (this.fish.getPositionY() < -3.5) {
      this.fish.stopMovement();
      this.fish.setPositionY(-3.5);
    }
  }

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
