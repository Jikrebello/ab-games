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

@Component({
  selector: 'app-floppy-fish-scene',
  standalone: true,
  imports: [CommonModule],
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

  private pillarSpawnInterval: string | number | NodeJS.Timeout | undefined;

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
        this.fish.animate();

        if (this.gameState === GameState.Playing) {
          // Update and move existing pillars
          this.pillars.forEach((pillar, index) => {
            pillar.move();
            if (pillar.isOutOfView()) {
              pillar.remove();
              this.pillars.splice(index, 1);
            }
          });

          if (!this.pillarSpawnInterval) {
            this.createPillars();
          }

          // Check for game over conditions
          if (this.fish.getPositionY() < -3.5 || this.fish.getPositionY() > 5) {
            this.gameState = GameState.GameOver;
            this.displayMessage = 'Game Over! Press Space to Try Again';
          }
        }

        // Stop the fish at the ground level during game over
        if (
          this.gameState === GameState.GameOver &&
          this.fish.getPositionY() < -3.5
        ) {
          this.fish.stopMovement();
          this.fish.setPositionY(-3.5);
        }
      }

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
            2,
          );
          this.pillars.push(newPillar);
          console.log('New pillar created at x position:', initialXPosition);
        }
      }, 1000); // Adjust interval as needed to control the spawn rate
    }
  }

  private onSpaceBarPress(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      if (this.gameState === GameState.NewGame) {
        this.gameState = GameState.Playing;
        this.displayMessage = '';
      }

      if (this.gameState === GameState.Playing) {
        this.fish.applyFlap();
      }

      if (this.gameState === GameState.GameOver) {
        this.resetGame();
      }
    }
  }

  private resetGame(): void {
    this.gameState = GameState.NewGame;
    this.fish.reset();
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

  private checkCollision(): boolean {
    // Collision logic to be added here (e.g., bounding box intersection)
    return false;
  }
}
