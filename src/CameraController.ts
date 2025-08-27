import * as THREE from 'three';
import { Spaceship } from './Spaceship';

export interface CameraDebugControls {
  up: boolean;
  down: boolean;
  zoomToggle: boolean;
}

export enum ZoomMode {
  CLOSE = 0,
  STANDARD = 1,
  FAR = 2
}

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private targetPosition: THREE.Vector3;
  private currentPosition: THREE.Vector3;
  private cameraOffset: THREE.Vector3;
  private currentZoomMode: ZoomMode;
  private lastZoomToggleState: boolean;
  private cameraVelocity: THREE.Vector3;
  private lookAheadPosition: THREE.Vector3;
  private targetRoll: number;
  private currentRoll: number;
  
  private readonly FOLLOW_SPEED = 0.1;
  private readonly DEBUG_SPEED = 0.2;
  
  // Camera constraints
  private readonly MIN_HEIGHT = 0.5;
  private readonly MAX_HEIGHT = 10;
  
  // Zoom mode distances
  private readonly ZOOM_DISTANCES = {
    [ZoomMode.CLOSE]: -5,     // Close to ship
    [ZoomMode.STANDARD]: -10, // Standard distance 
    [ZoomMode.FAR]: -20       // Far distance (40 units away)
  };

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.currentZoomMode = ZoomMode.STANDARD;
    this.lastZoomToggleState = false;
    this.cameraOffset = new THREE.Vector3(0, 3, this.ZOOM_DISTANCES[this.currentZoomMode]);
    this.targetPosition = new THREE.Vector3();
    this.currentPosition = new THREE.Vector3();
    this.cameraVelocity = new THREE.Vector3();
    this.lookAheadPosition = new THREE.Vector3();
    this.targetRoll = 0;
    this.currentRoll = 0;
    
    // Set initial camera position
    this.camera.position.copy(this.cameraOffset);
  }

  public update(spaceship: Spaceship, debugControls: CameraDebugControls): void {
    const spaceshipPos = spaceship.getPosition();
    
    // Handle zoom mode toggle (detect key press, not hold)
    if (debugControls.zoomToggle && !this.lastZoomToggleState) {
      this.currentZoomMode = (this.currentZoomMode + 1) % 3; // Cycle through 0, 1, 2
      this.cameraOffset.z = this.ZOOM_DISTANCES[this.currentZoomMode];
    }
    this.lastZoomToggleState = debugControls.zoomToggle;
    
    // Handle height controls with constraints
    if (debugControls.up) {
      this.cameraOffset.y = Math.min(this.cameraOffset.y + this.DEBUG_SPEED, this.MAX_HEIGHT);
    }
    if (debugControls.down) {
      this.cameraOffset.y = Math.max(this.cameraOffset.y - this.DEBUG_SPEED, this.MIN_HEIGHT);
    }

    // Simple Ace Combat style camera: always behind ship at fixed offset
    // Transform offset by ship's rotation so camera follows ship's orientation
    const rotatedOffset = this.cameraOffset.clone();
    rotatedOffset.applyQuaternion(spaceship.group.quaternion);
    
    // Camera position = ship position + rotated offset
    this.targetPosition.copy(spaceshipPos).add(rotatedOffset);
    
    // Smooth following (much more responsive than before)
    this.currentPosition.lerp(this.targetPosition, 0.1);
    this.camera.position.copy(this.currentPosition);

    // Always look directly at the spaceship (no prediction, just direct)
    this.camera.lookAt(spaceshipPos);
    
    // Very subtle camera roll based on ship banking
    const spaceshipRoll = spaceship.group.rotation.z;
    this.targetRoll = spaceshipRoll * 0.3; // Much more subtle than before
    this.currentRoll = THREE.MathUtils.lerp(this.currentRoll, this.targetRoll, 0.1);
    this.camera.rotateZ(this.currentRoll);
  }

  public getCameraOffset(): THREE.Vector3 {
    return this.cameraOffset.clone();
  }

  public setCameraOffset(offset: THREE.Vector3): void {
    this.cameraOffset.copy(offset);
  }
}