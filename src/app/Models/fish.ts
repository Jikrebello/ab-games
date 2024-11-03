import * as THREE from 'three';

export class Fish {
  private fishMesh: THREE.Mesh;
  private velocity = 0;
  private gravity = -0.001;
  private flopStrength = 0.05;

  /**
   * Create the geometry and material for the fish, bind it to a mesh and add it to the scene
   * @param scene The scene to add the fish mesh to
   * @param color The color of the fish
   */
  constructor(scene: THREE.Scene, color: number = 0xcc6633) {
    //
    const fishGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const fishMaterial = new THREE.MeshBasicMaterial({ color });

    this.fishMesh = new THREE.Mesh(fishGeometry, fishMaterial);
    scene.add(this.fishMesh);
  }

  /**
   * Applies gravity to the fish's velocity and updates its position.
   */
  public animate(): void {
    this.velocity += this.gravity;
    this.fishMesh.position.y += this.velocity;
  }

  /**
   * Applies an upward force to the fish to make it "flap" upward.
   */
  public applyFlap(): void {
    this.velocity = this.flopStrength;
  }

  /**
   * Resets the fish's position and velocity to their initial state.
   */
  public reset(): void {
    this.fishMesh.position.y = 0;
    this.velocity = 0;
  }

  /**
   * Gets the current Y position of the fish.
   * @returns {number} The current Y position of the fish.
   */
  public getPositionY(): number {
    return this.fishMesh.position.y;
  }

  /**
   * Sets the current Y position of the fish.
   * @returns {number} The current Y position of the fish.
   */
  public setPositionY(position: number): void {
    this.fishMesh.position.y = position;
  }

  /**
   * Stops the fish's movement by setting its velocity to zero.
   */
  public stopMovement(): void {
    this.velocity = 0;
  }
}
