import { SpaceshipControls } from './Spaceship';
import { CameraDebugControls } from './CameraController';

export class InputHandler {
  private keys: { [key: string]: boolean } = {};
  public spaceshipControls: SpaceshipControls;
  public cameraDebugControls: CameraDebugControls;
  private canvas: HTMLCanvasElement;
  private isPointerLocked: boolean = false;
  private mouseSensitivity: number = 0.8;
  public debugMode: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    
    this.spaceshipControls = {
      forward: false,
      backward: false,
      mouseX: 0,
      mouseY: 0
    };

    this.cameraDebugControls = {
      up: false,
      down: false,
      zoomToggle: false
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keydown event - mark key as pressed
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      this.keys[event.code] = true;
      
      // Handle special keys
      if (event.code === 'KeyF') {
        this.debugMode = !this.debugMode;
      }
      
      this.updateControlStates();
    });

    // Keyup event - mark key as released
    window.addEventListener('keyup', (event: KeyboardEvent) => {
      this.keys[event.code] = false;
      
      // Release pointer lock with Escape
      if (event.code === 'Escape' && this.isPointerLocked) {
        document.exitPointerLock();
      }
      
      this.updateControlStates();
    });

    // Mouse movement for spaceship control
    window.addEventListener('mousemove', (event: MouseEvent) => {
      if (this.isPointerLocked) {
        this.spaceshipControls.mouseX = event.movementX * this.mouseSensitivity;
        this.spaceshipControls.mouseY = event.movementY * this.mouseSensitivity;
      }
    });

    // Canvas click to request pointer lock
    this.canvas.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        this.canvas.requestPointerLock();
      }
    });

    // Pointer lock change events
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.canvas;
      if (!this.isPointerLocked) {
        // Reset mouse movement when pointer lock is released
        this.spaceshipControls.mouseX = 0;
        this.spaceshipControls.mouseY = 0;
      }
    });

    // Prevent page scrolling with arrow keys
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
      }
    });
  }

  private updateControlStates(): void {
    // Spaceship movement controls (WS only - AD removed for mouse control)
    this.spaceshipControls.forward = this.keys['KeyW'] || false;
    this.spaceshipControls.backward = this.keys['KeyS'] || false;

    // Camera debug controls (Arrow keys)
    this.cameraDebugControls.up = this.keys['ArrowUp'] || false;
    this.cameraDebugControls.down = this.keys['ArrowDown'] || false;
    this.cameraDebugControls.zoomToggle = this.keys['ArrowLeft'] || this.keys['ArrowRight'] || false;
  }

  public isKeyPressed(keyCode: string): boolean {
    return this.keys[keyCode] || false;
  }

  public isPointerLockActive(): boolean {
    return this.isPointerLocked;
  }

  public setMouseSensitivity(sensitivity: number): void {
    this.mouseSensitivity = sensitivity;
  }

  public getMouseSensitivity(): number {
    return this.mouseSensitivity;
  }

  public resetMouseMovement(): void {
    this.spaceshipControls.mouseX = 0;
    this.spaceshipControls.mouseY = 0;
  }
}