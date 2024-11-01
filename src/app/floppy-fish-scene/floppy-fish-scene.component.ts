import { isPlatformBrowser } from '@angular/common';
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

@Component({
  selector: 'app-floppy-fish-scene',
  standalone: true,
  imports: [],
  templateUrl: './floppy-fish-scene.component.html',
  styleUrl: './floppy-fish-scene.component.css',
})
export class FloppyFishSceneComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private cube!: THREE.Mesh;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.scene = new THREE.Scene();

      // Set up camera
      this.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );

      this.camera.position.z = 5;
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvasRef.nativeElement,
      });

      this.renderer.setSize(window.innerWidth, window.innerHeight);

      // Add cube to the scene
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      this.cube = new THREE.Mesh(geometry, material);
      this.scene.add(this.cube);

      // Start rendering the scene
      this.animate();
    }
  }

  private animate = () => {
    if (this.isBrowser) {
      requestAnimationFrame(this.animate);

      // rotate the cube :)
      this.cube.rotation.x += 0.01;
      this.cube.rotation.y += 0.01;

      this.renderer.render(this.scene, this.camera);
    }
  };
}
