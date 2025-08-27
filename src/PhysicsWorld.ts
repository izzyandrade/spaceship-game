import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export class PhysicsWorld {
  public world: CANNON.World;
  private fixedTimeStep: number = 1 / 60;
  private maxSubSteps: number = 3;

  constructor() {
    // Create Cannon world
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, 0, 0) // No gravity in space
    });

    // Set collision detection algorithm
    this.world.broadphase = new CANNON.NaiveBroadphase();
    
    // Allow sleeping for performance
    this.world.allowSleep = true;

    // Set up collision boundaries
    this.createBoundaries();
  }

  private createBoundaries(): void {
    // Create boundary walls (invisible physics bodies)
    const boundarySize = 500;
    const wallThickness = 10;

    // Wall positions and sizes
    const walls = [
      // Left wall
      { position: [-boundarySize, 0, 0], size: [wallThickness, boundarySize * 2, boundarySize * 2] },
      // Right wall  
      { position: [boundarySize, 0, 0], size: [wallThickness, boundarySize * 2, boundarySize * 2] },
      // Bottom wall
      { position: [0, -boundarySize, 0], size: [boundarySize * 2, wallThickness, boundarySize * 2] },
      // Top wall
      { position: [0, boundarySize, 0], size: [boundarySize * 2, wallThickness, boundarySize * 2] },
      // Back wall
      { position: [0, 0, -boundarySize], size: [boundarySize * 2, boundarySize * 2, wallThickness] },
      // Front wall
      { position: [0, 0, boundarySize], size: [boundarySize * 2, boundarySize * 2, wallThickness] }
    ];

    walls.forEach(wall => {
      const shape = new CANNON.Box(new CANNON.Vec3(wall.size[0] / 2, wall.size[1] / 2, wall.size[2] / 2));
      const body = new CANNON.Body({
        mass: 0, // Static body
        shape: shape,
        position: new CANNON.Vec3(wall.position[0], wall.position[1], wall.position[2]),
        material: new CANNON.Material({ friction: 0.1, restitution: 0.3 })
      });
      this.world.addBody(body);
    });
  }

  public update(deltaTime: number): void {
    // Step the physics simulation
    this.world.fixedStep(this.fixedTimeStep, deltaTime, this.maxSubSteps);
  }

  public addBody(body: CANNON.Body): void {
    this.world.addBody(body);
  }

  public removeBody(body: CANNON.Body): void {
    this.world.removeBody(body);
  }

  // Helper function to convert Three.js Vector3 to Cannon Vec3
  public static threeVecToCannon(vec: THREE.Vector3): CANNON.Vec3 {
    return new CANNON.Vec3(vec.x, vec.y, vec.z);
  }

  // Helper function to convert Cannon Vec3 to Three.js Vector3
  public static cannonVecToThree(vec: CANNON.Vec3): THREE.Vector3 {
    return new THREE.Vector3(vec.x, vec.y, vec.z);
  }

  // Helper function to convert Cannon Quaternion to Three.js Quaternion
  public static cannonQuatToThree(quat: CANNON.Quaternion): THREE.Quaternion {
    return new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w);
  }
}