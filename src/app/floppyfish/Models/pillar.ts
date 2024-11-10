import * as THREE from 'three';

export class Pillar {
  private topPillar: THREE.Mesh;
  private bottomPillar: THREE.Mesh;
  private speed = 0.02; // Speed of movement
  private color: THREE.ColorRepresentation = 0x00ff00; // Default color
  private scene: THREE.Scene;
  private topBoundingBox: THREE.Box3;
  private bottomBoundingBox: THREE.Box3;
  public hasBeenPassed: boolean = false;

  constructor(
    scene: THREE.Scene,
    xPosition: number,
    gapYPosition: number,
    gapSize: number = 2,
  ) {
    this.scene = scene;

    // Create the geometry and material for the pillars
    const pillarWidth = 1;
    const pillarMaterial = new THREE.MeshBasicMaterial({ color: this.color }); // Use the default class color

    // Top pillar
    const topGeometry = new THREE.BoxGeometry(pillarWidth, 10, 0.5);
    this.topPillar = new THREE.Mesh(topGeometry, pillarMaterial);
    this.topPillar.position.set(xPosition, gapYPosition + gapSize / 2 + 5, 0);
    this.topPillar.frustumCulled = false;
    this.topBoundingBox = new THREE.Box3().setFromObject(this.topPillar);
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
    this.bottomBoundingBox = new THREE.Box3().setFromObject(this.bottomPillar);
    scene.add(this.bottomPillar);
  }

  public move(): void {
    this.topPillar.position.x -= this.speed;
    this.bottomPillar.position.x -= this.speed;
    this.topBoundingBox.setFromObject(this.topPillar);
    this.bottomBoundingBox.setFromObject(this.bottomPillar);
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

  public getTopBoundingBox(): THREE.Box3 {
    return this.topBoundingBox;
  }

  public getBottomBoundingBox(): THREE.Box3 {
    return this.bottomBoundingBox;
  }

  public getPositionX(): number {
    return this.topPillar.position.x;
  }
}
