import * as THREE from 'three';

export class Pillar {
  private topPillar: THREE.Mesh;
  private bottomPillar: THREE.Mesh;
  private speed = 0.02; // Speed of movement
  private color: THREE.ColorRepresentation = 0x00ff00; // Default color
  private scene: THREE.Scene;

  constructor(
    scene: THREE.Scene,
    xPosition: number,
    gapYPosition: number,
    gapSize: number = 2,
  ) {
    this.scene = scene;

    // Create the geometry and material for the pillars
    const pillarWidth = 0.5;
    const pillarMaterial = new THREE.MeshBasicMaterial({ color: this.color }); // Use the default class color

    // Top pillar
    const topGeometry = new THREE.BoxGeometry(pillarWidth, 10, 0.5);
    this.topPillar = new THREE.Mesh(topGeometry, pillarMaterial);
    this.topPillar.position.set(xPosition, gapYPosition + gapSize / 2 + 5, 0);
    this.topPillar.frustumCulled = false;
    scene.add(this.topPillar);

    // Bottom pillar
    const bottomGeometry = new THREE.BoxGeometry(pillarWidth, 10, 0.5);
    this.bottomPillar = new THREE.Mesh(bottomGeometry, pillarMaterial);
    this.bottomPillar.position.set(
      xPosition,
      gapYPosition - gapSize / 2 - 5,
      0,
    );
    this.bottomPillar.frustumCulled = false;
    scene.add(this.bottomPillar);
  }

  public move(): void {
    this.topPillar.position.x -= this.speed;
    this.bottomPillar.position.x -= this.speed;
  }

  public isOutOfView(): boolean {
    if (this.bottomPillar.position.x < -7) {
      return true;
    } else return false;
  }

  public remove(): void {
    this.scene.remove(this.topPillar);
    this.scene.remove(this.bottomPillar);
  }
}
