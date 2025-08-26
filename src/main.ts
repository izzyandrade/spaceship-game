import './style.css';
import * as THREE from 'three';
import { Spaceship } from './Spaceship';
import { CameraController } from './CameraController';
import { InputHandler } from './InputHandler';
import { CollisionSystem } from './CollisionSystem';

class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private spaceship: Spaceship;
  private cameraController: CameraController;
  private inputHandler: InputHandler;
  private collisionSystem: CollisionSystem;
  private clock: THREE.Clock;

  // Lighting
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;

  // Debug helpers
  private gridHelper: THREE.GridHelper;
  private axesHelper: THREE.AxesHelper;

  // UI Elements
  private crosshair: HTMLElement;
  private uiPanel: HTMLElement;
  private pointerLockPrompt: HTMLElement;
  private boundaryWarning: HTMLElement;
  private speedValue: HTMLElement;
  private speedFill: HTMLElement;
  private sensitivityValue: HTMLElement;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.clock = new THREE.Clock();
    
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    this.setupUI();
    this.setupScene();
    this.setupLighting();
    this.setupSpaceship();
    this.setupCamera();
    this.setupInput();
    this.setupCollision();
    this.setupEventListeners();
    this.animate();
  }

  private setupScene(): void {
    // Dark space-like background
    this.renderer.setClearColor(0x0a0a1a);
    
    // Add debug helpers
    this.gridHelper = new THREE.GridHelper(20, 20, 0x333333, 0x222222);
    this.scene.add(this.gridHelper);
    
    this.axesHelper = new THREE.AxesHelper(5);
    this.scene.add(this.axesHelper);
  }

  private setupLighting(): void {
    // Ambient light for overall illumination (low intensity)
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(this.ambientLight);

    // Directional light positioned above and in front (higher intensity)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    this.directionalLight.position.set(5, 10, 5);
    this.directionalLight.castShadow = true;
    
    // Configure shadow properties for better quality
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;
    this.directionalLight.shadow.camera.left = -20;
    this.directionalLight.shadow.camera.right = 20;
    this.directionalLight.shadow.camera.top = 20;
    this.directionalLight.shadow.camera.bottom = -20;
    
    this.scene.add(this.directionalLight);
  }

  private setupSpaceship(): void {
    this.spaceship = new Spaceship();
    this.scene.add(this.spaceship.group);
    
    // Enable shadows for spaceship
    this.spaceship.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  private setupCamera(): void {
    this.cameraController = new CameraController(this.camera);
  }

  private setupUI(): void {
    this.crosshair = document.getElementById('crosshair')!;
    this.uiPanel = document.getElementById('ui-panel')!;
    this.pointerLockPrompt = document.getElementById('pointer-lock-prompt')!;
    this.boundaryWarning = document.getElementById('boundary-warning')!;
    this.speedValue = document.getElementById('speed-value')!;
    this.speedFill = document.getElementById('speed-fill')!;
    this.sensitivityValue = document.getElementById('sensitivity-value')!;
  }

  private setupInput(): void {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.inputHandler = new InputHandler(canvas);
  }

  private setupCollision(): void {
    this.collisionSystem = new CollisionSystem();
    this.collisionSystem.addToScene(this.scene);
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    const deltaTime = this.clock.getDelta();

    // Update spaceship based on input
    this.spaceship.update(this.inputHandler.spaceshipControls, deltaTime);

    // Check collisions
    this.collisionSystem.checkCollision(this.spaceship);

    // Update camera to follow spaceship
    this.cameraController.update(this.spaceship, this.inputHandler.cameraDebugControls);

    // Update UI
    this.updateUI();

    // Reset mouse movement for next frame
    this.inputHandler.resetMouseMovement();

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  };

  private updateUI(): void {
    // Update speed indicator
    const speed = this.spaceship.getCurrentSpeed();
    const maxSpeed = 0.5; // Same as spaceship MAX_SPEED
    const speedPercent = (speed / maxSpeed) * 100;
    
    this.speedValue.textContent = speed.toFixed(2);
    this.speedFill.style.width = `${speedPercent}%`;

    // Update sensitivity display
    this.sensitivityValue.textContent = this.inputHandler.getMouseSensitivity().toFixed(1);

    // Show/hide UI elements based on pointer lock
    const isLocked = this.inputHandler.isPointerLockActive();
    this.crosshair.style.display = isLocked ? 'block' : 'none';
    this.pointerLockPrompt.style.display = isLocked ? 'none' : 'block';

    // Boundary warning
    const spaceshipPos = this.spaceship.getPosition();
    const nearBoundary = this.collisionSystem.isNearBoundary(spaceshipPos);
    this.boundaryWarning.style.display = nearBoundary ? 'block' : 'none';

    // Debug mode - show collision boundaries
    if (this.inputHandler.debugMode) {
      this.collisionSystem.toggleDebugVisualization();
      this.gridHelper.visible = true;
      this.axesHelper.visible = true;
    } else {
      this.gridHelper.visible = false;
      this.axesHelper.visible = false;
    }
  };
}

new Game();