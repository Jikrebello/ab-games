import * as THREE from 'three';

export class Fish {
  private fishMesh: THREE.Mesh;
  private velocity = 0;
  private gravity = -0.0015;
  private flopStrength = 0.05;
  private boundingBox: THREE.Box3;
  private fishSize: number = 0.5;

  /**
   * Create the geometry and material for the fish, bind it to a mesh and add it to the scene
   * @param scene The scene to add the fish mesh to
   * @param color The color of the fish
   */
  constructor(scene: THREE.Scene, color: number = 0xcc6633) {
    const fishGeometry = new THREE.BoxGeometry(
      this.fishSize,
      this.fishSize,
      this.fishSize,
    );
    const fishMaterial = new THREE.MeshBasicMaterial({ color });

    this.fishMesh = new THREE.Mesh(fishGeometry, fishMaterial);
    this.boundingBox = new THREE.Box3().setFromObject(this.fishMesh);
    scene.add(this.fishMesh);
  }

  /**
   * Applies gravity to the fish's velocity and updates its position.
   */
  public animate(): void {
    this.velocity += this.gravity;
    this.fishMesh.position.y += this.velocity;
    this.boundingBox.setFromObject(this.fishMesh);
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

  public getPositionX(): number {
    return this.fishMesh.position.x;
  }

  /**
   * Gets the Bounding Box (collision box) for the fish
   * @returns The current THREE.Box3 of the fish
   */
  public getBoundingBox(): THREE.Box3 {
    return this.boundingBox;
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
