import * as THREE from 'three';
import { Spaceship } from './Spaceship';

export interface CollisionBoundary {
  min: THREE.Vector3;
  max: THREE.Vector3;
}

export class CollisionSystem {
  private boundaries: CollisionBoundary;
  private boundingBox: THREE.Box3;
  private spaceshipRadius: number;
  private warningDistance: number;
  private boundaryMesh: THREE.Mesh | null = null;
  
  constructor() {
    // Define play area boundaries (invisible walls)
    this.boundaries = {
      min: new THREE.Vector3(-500, -500, -500),
      max: new THREE.Vector3(500, 500, 500)
    };
    
    this.boundingBox = new THREE.Box3();
    this.spaceshipRadius = 1.5; // Approximate spaceship size
    this.warningDistance = 5; // Distance to show boundary warning
    
    this.createBoundaryVisualization();
  }

  private createBoundaryVisualization(): void {
    // Create invisible boundary mesh for debug visualization
    const size = this.boundaries.max.clone().sub(this.boundaries.min);
    const center = this.boundaries.min.clone().add(this.boundaries.max).multiplyScalar(0.5);
    
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });
    
    this.boundaryMesh = new THREE.Mesh(geometry, material);
    this.boundaryMesh.position.copy(center);
    this.boundaryMesh.visible = false; // Hidden by default
  }

  public addToScene(scene: THREE.Scene): void {
    if (this.boundaryMesh) {
      scene.add(this.boundaryMesh);
    }
  }

  public checkCollision(spaceship: Spaceship): void {
    const position = spaceship.getPosition();
    const velocity = spaceship.getVelocity();
    let collision = false;
    const correctedPosition = position.clone();

    // Check X boundaries
    if (position.x - this.spaceshipRadius < this.boundaries.min.x) {
      correctedPosition.x = this.boundaries.min.x + this.spaceshipRadius;
      spaceship.velocity.x = Math.max(0, spaceship.velocity.x); // Stop negative velocity
      collision = true;
    } else if (position.x + this.spaceshipRadius > this.boundaries.max.x) {
      correctedPosition.x = this.boundaries.max.x - this.spaceshipRadius;
      spaceship.velocity.x = Math.min(0, spaceship.velocity.x); // Stop positive velocity
      collision = true;
    }

    // Check Y boundaries
    if (position.y - this.spaceshipRadius < this.boundaries.min.y) {
      correctedPosition.y = this.boundaries.min.y + this.spaceshipRadius;
      spaceship.velocity.y = Math.max(0, spaceship.velocity.y);
      collision = true;
    } else if (position.y + this.spaceshipRadius > this.boundaries.max.y) {
      correctedPosition.y = this.boundaries.max.y - this.spaceshipRadius;
      spaceship.velocity.y = Math.min(0, spaceship.velocity.y);
      collision = true;
    }

    // Check Z boundaries
    if (position.z - this.spaceshipRadius < this.boundaries.min.z) {
      correctedPosition.z = this.boundaries.min.z + this.spaceshipRadius;
      spaceship.velocity.z = Math.max(0, spaceship.velocity.z);
      collision = true;
    } else if (position.z + this.spaceshipRadius > this.boundaries.max.z) {
      correctedPosition.z = this.boundaries.max.z - this.spaceshipRadius;
      spaceship.velocity.z = Math.min(0, spaceship.velocity.z);
      collision = true;
    }

    // Apply collision response
    if (collision) {
      spaceship.position.copy(correctedPosition);
      spaceship.group.position.copy(correctedPosition);
      
      // Add some bounce-back effect
      spaceship.velocity.multiplyScalar(0.3);
    }
  }

  public getDistanceToBoundary(position: THREE.Vector3): number {
    // Calculate minimum distance to any boundary
    const distanceToMin = position.clone().sub(this.boundaries.min);
    const distanceToMax = this.boundaries.max.clone().sub(position);
    
    const minDistance = Math.min(
      distanceToMin.x, distanceToMin.y, distanceToMin.z,
      distanceToMax.x, distanceToMax.y, distanceToMax.z
    );
    
    return Math.max(0, minDistance);
  }

  public isNearBoundary(position: THREE.Vector3): boolean {
    return this.getDistanceToBoundary(position) < this.warningDistance;
  }

  public toggleDebugVisualization(): void {
    if (this.boundaryMesh) {
      this.boundaryMesh.visible = !this.boundaryMesh.visible;
    }
  }

  public getBoundaries(): CollisionBoundary {
    return {
      min: this.boundaries.min.clone(),
      max: this.boundaries.max.clone()
    };
  }
}