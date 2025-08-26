import * as THREE from 'three';

export interface SpaceshipControls {
  forward: boolean;
  backward: boolean;
  mouseX: number;  // Mouse X movement for yaw
  mouseY: number;  // Mouse Y movement for pitch
}

export class Spaceship {
  public group: THREE.Group;
  public velocity: THREE.Vector3;
  public acceleration: THREE.Vector3;
  public position: THREE.Vector3;
  public targetRotation: THREE.Euler;
  public currentSpeed: number;

  // Physics constants
  private readonly MAX_SPEED = 0.5;
  private readonly ACCELERATION = 0.02;
  private readonly DRAG_COEFFICIENT = 0.95;
  private readonly MOUSE_SENSITIVITY = 0.003;
  private readonly BANKING_AMOUNT = Math.PI / 6; // 30 degrees max bank

  constructor() {
    this.group = new THREE.Group();
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.position = new THREE.Vector3(0, 0, 0);
    this.targetRotation = new THREE.Euler(0, 0, 0);
    this.currentSpeed = 0;

    this.createSpaceshipGeometry();
  }

  private createSpaceshipGeometry(): void {
    // Main body - cone pointing forward (positive Z direction)
    const bodyGeometry = new THREE.ConeGeometry(0.3, 2, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4a90e2,
      shininess: 100,
      specular: 0x111111
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Rotate cone to point forward and adjust position
    body.rotation.x = Math.PI / 2;
    body.position.z = 0.5;
    this.group.add(body);

    // Left wing
    const wingGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.6);
    const wingMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x6ba3f0,
      shininess: 80,
      specular: 0x222222
    });
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-0.8, -0.1, -0.2);
    this.group.add(leftWing);

    // Right wing
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(0.8, -0.1, -0.2);
    this.group.add(rightWing);

    // Engine exhausts
    const exhaustGeometry = new THREE.CylinderGeometry(0.08, 0.12, 0.4);
    const exhaustMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      shininess: 60
    });

    const leftExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    leftExhaust.position.set(-0.4, -0.1, -0.8);
    leftExhaust.rotation.x = Math.PI / 2;
    this.group.add(leftExhaust);

    const rightExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    rightExhaust.position.set(0.4, -0.1, -0.8);
    rightExhaust.rotation.x = Math.PI / 2;
    this.group.add(rightExhaust);
  }

  public update(controls: SpaceshipControls, deltaTime: number): void {
    // Mouse controls for rotation (yaw and pitch)
    this.targetRotation.y += controls.mouseX * this.MOUSE_SENSITIVITY;
    this.targetRotation.x += controls.mouseY * this.MOUSE_SENSITIVITY;
    
    // Limit pitch to prevent over-rotation
    this.targetRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetRotation.x));

    // Banking animation - roll into turns based on yaw change
    const yawVelocity = controls.mouseX * this.MOUSE_SENSITIVITY;
    this.targetRotation.z = -yawVelocity * this.BANKING_AMOUNT;

    // Smooth rotation interpolation
    this.group.rotation.x = THREE.MathUtils.lerp(this.group.rotation.x, this.targetRotation.x, 0.1);
    this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, this.targetRotation.y, 0.1);
    this.group.rotation.z = THREE.MathUtils.lerp(this.group.rotation.z, this.targetRotation.z, 0.05);

    // Reset acceleration
    this.acceleration.set(0, 0, 0);

    // Forward/backward acceleration based on spaceship's current direction
    const forwardDirection = new THREE.Vector3(0, 0, 1);
    forwardDirection.applyQuaternion(this.group.quaternion);

    if (controls.forward) {
      this.acceleration.add(forwardDirection.multiplyScalar(this.ACCELERATION));
    }
    if (controls.backward) {
      this.acceleration.add(forwardDirection.multiplyScalar(-this.ACCELERATION * 0.5));
    }

    // Apply acceleration to velocity
    this.velocity.add(this.acceleration);

    // Apply drag (momentum conservation with gradual deceleration)
    this.velocity.multiplyScalar(this.DRAG_COEFFICIENT);

    // Limit maximum speed
    if (this.velocity.length() > this.MAX_SPEED) {
      this.velocity.normalize().multiplyScalar(this.MAX_SPEED);
    }

    // Update current speed for UI display
    this.currentSpeed = this.velocity.length();

    // Apply velocity to position
    this.position.add(this.velocity);
    this.group.position.copy(this.position);
  }

  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  public getForwardDirection(): THREE.Vector3 {
    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(this.group.quaternion);
    return forward;
  }

  public getCurrentSpeed(): number {
    return this.currentSpeed;
  }

  public getVelocity(): THREE.Vector3 {
    return this.velocity.clone();
  }
}