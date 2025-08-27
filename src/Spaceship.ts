import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from './PhysicsWorld';

export interface SpaceshipControls {
  forward: boolean;
  backward: boolean;
  mouseX: number;  // Mouse X movement for yaw
  mouseY: number;  // Mouse Y movement for pitch
}

export class Spaceship {
  public group: THREE.Group;
  public physicsBody: CANNON.Body;
  public currentSpeed: number;

  // Physics constants
  private readonly THRUST_POWER = 150;      // Increased from 50 for faster acceleration
  private readonly ROTATION_TORQUE = 25;    // Increased from 10 for more responsive turning
  private readonly LINEAR_DAMPING = 0.1;    // Reduced from 0.4 for higher top speed
  private readonly ANGULAR_DAMPING = 0.6;   // Reduced from 0.8 for less rotation damping
  private readonly MOUSE_SENSITIVITY = 0.003; // Slightly increased base sensitivity
  
  // Movement thresholds
  private readonly MOUSE_THRESHOLD = 0.1;

  constructor(physicsWorld: PhysicsWorld) {
    this.group = new THREE.Group();
    this.currentSpeed = 0;

    this.createSpaceshipGeometry();
    this.createPhysicsBody(physicsWorld);
  }

  private createPhysicsBody(physicsWorld: PhysicsWorld): void {
    // Create a box shape for the spaceship physics
    const shape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
    
    this.physicsBody = new CANNON.Body({
      mass: 10,
      shape: shape,
      position: new CANNON.Vec3(0, 0, 0),
      material: new CANNON.Material({
        friction: 0.1,
        restitution: 0.3
      })
    });

    // Set damping for realistic spaceship physics
    this.physicsBody.linearDamping = this.LINEAR_DAMPING;
    this.physicsBody.angularDamping = this.ANGULAR_DAMPING;

    // Add to physics world
    physicsWorld.addBody(this.physicsBody);
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
    // Apply mouse movement thresholds to prevent micro-movements
    const mouseX = Math.abs(controls.mouseX) > this.MOUSE_THRESHOLD ? controls.mouseX : 0;
    const mouseY = Math.abs(controls.mouseY) > this.MOUSE_THRESHOLD ? controls.mouseY : 0;
    
    // Reset forces and torques
    this.physicsBody.force.set(0, 0, 0);
    this.physicsBody.torque.set(0, 0, 0);

    // Apply thrust forces (like your snippet!)
    if (controls.forward) {
      // Apply local forward thrust
      const thrustForce = new CANNON.Vec3(0, 0, this.THRUST_POWER);
      this.physicsBody.applyLocalForce(thrustForce, new CANNON.Vec3(0, 0, 0));
    }
    if (controls.backward) {
      // Apply local backward thrust (weaker)
      const thrustForce = new CANNON.Vec3(0, 0, -this.THRUST_POWER * 0.5);
      this.physicsBody.applyLocalForce(thrustForce, new CANNON.Vec3(0, 0, 0));
    }

    // Apply torque for rotation based on mouse movement
    if (Math.abs(mouseX) > this.MOUSE_THRESHOLD) {
      // Yaw torque (left/right turning)
      const yawTorque = -mouseX * this.MOUSE_SENSITIVITY * this.ROTATION_TORQUE;
      this.physicsBody.torque.y += yawTorque;
    }
    
    if (Math.abs(mouseY) > this.MOUSE_THRESHOLD) {
      // Pitch torque (up/down turning)
      const pitchTorque = -mouseY * this.MOUSE_SENSITIVITY * this.ROTATION_TORQUE;
      this.physicsBody.torque.x += pitchTorque;
    }

    // Auto-roll based on yaw input for realistic banking
    if (Math.abs(mouseX) > this.MOUSE_THRESHOLD) {
      const rollTorque = mouseX * this.MOUSE_SENSITIVITY * this.ROTATION_TORQUE * 0.5;
      this.physicsBody.torque.z += rollTorque;
    }

    // Sync Three.js group with physics body
    this.syncWithPhysicsBody();

    // Update current speed for UI display
    this.currentSpeed = this.physicsBody.velocity.length();
  }

  private syncWithPhysicsBody(): void {
    // Copy position from physics body to Three.js group
    this.group.position.copy(PhysicsWorld.cannonVecToThree(this.physicsBody.position));
    
    // Copy rotation from physics body to Three.js group
    this.group.quaternion.copy(PhysicsWorld.cannonQuatToThree(this.physicsBody.quaternion));
  }

  public getPosition(): THREE.Vector3 {
    return PhysicsWorld.cannonVecToThree(this.physicsBody.position);
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
    return PhysicsWorld.cannonVecToThree(this.physicsBody.velocity);
  }
}