import './style.css';
import * as THREE from 'three';
import { Spaceship } from './Spaceship';
import { CameraController } from './CameraController';
import { InputHandler } from './InputHandler';
import { PhysicsWorld } from './PhysicsWorld';

class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private spaceship: Spaceship;
  private cameraController: CameraController;
  private inputHandler: InputHandler;
  private physicsWorld: PhysicsWorld;
  private clock: THREE.Clock;

  // Lighting
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;

  // Debug helpers
  private gridHelper: THREE.GridHelper;
  private axesHelper: THREE.AxesHelper;
  
  // Scene objects
  private moon: THREE.Mesh;
  private starField: THREE.Points;

  // UI Elements
  private crosshair: HTMLElement;
  private uiPanel: HTMLElement;
  private pointerLockPrompt: HTMLElement;
  private boundaryWarning: HTMLElement;
  private speedValue: HTMLElement;
  private speedFill: HTMLElement;
  private sensitivityValue: HTMLElement;
  private sensitivitySlider: HTMLInputElement;

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
    this.setupMoon();
    this.setupStarField();
    this.setupPhysics();
    this.setupSpaceship();
    this.setupCamera();
    this.setupInput();
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

  private setupMoon(): void {
    // Create Moon geometry
    const moonGeometry = new THREE.SphereGeometry(50, 32, 32);
    
    // Create Moon material with realistic lunar appearance
    const moonMaterial = new THREE.MeshPhongMaterial({
      color: 0xaaaaaa,
      shininess: 1,
      specular: 0x111111
    });

    // Add some basic crater-like texture using bump mapping
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d')!;
    
    // Create a gradient base
    const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#cccccc');
    gradient.addColorStop(0.7, '#999999');
    gradient.addColorStop(1, '#666666');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);
    
    // Add some random craters/spots
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 20 + 5;
      const darkness = Math.random() * 0.3 + 0.1;
      
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(0, 0, 0, ${darkness})`;
      context.fill();
      
      // Add small bright rim
      context.beginPath();
      context.arc(x, y, radius * 1.1, 0, Math.PI * 2);
      context.strokeStyle = `rgba(255, 255, 255, ${darkness * 0.5})`;
      context.lineWidth = 1;
      context.stroke();
    }
    
    const moonTexture = new THREE.CanvasTexture(canvas);
    moonMaterial.map = moonTexture;
    
    // Create Moon mesh
    this.moon = new THREE.Mesh(moonGeometry, moonMaterial);
    
    // Position Moon in the distance (visible and provides good reference)
    this.moon.position.set(200, 100, 300);
    
    // Enable shadows
    this.moon.receiveShadow = true;
    this.moon.castShadow = true;
    
    // Add to scene
    this.scene.add(this.moon);
  }

  private setupStarField(): void {
    // Create star field for background reference
    const starCount = 1000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    
    // Generate random star positions in a large sphere
    for (let i = 0; i < starCount; i++) {
      const radius = 800 + Math.random() * 200; // Far away stars
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      sizeAttenuation: true
    });
    
    this.starField = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starField);
  }

  private setupPhysics(): void {
    this.physicsWorld = new PhysicsWorld();
  }

  private setupSpaceship(): void {
    this.spaceship = new Spaceship(this.physicsWorld);
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
    this.sensitivitySlider = document.getElementById('sensitivity-slider') as HTMLInputElement;

    // Set up sensitivity slider event listener
    this.sensitivitySlider.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      const sensitivity = parseFloat(target.value);
      this.inputHandler.setMouseSensitivity(sensitivity);
      this.sensitivityValue.textContent = sensitivity.toFixed(1);
    });
  }

  private setupInput(): void {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.inputHandler = new InputHandler(canvas);
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

    // Update physics world
    this.physicsWorld.update(deltaTime);

    // Update spaceship based on input
    this.spaceship.update(this.inputHandler.spaceshipControls, deltaTime);

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
    const maxDisplaySpeed = 100; // Higher max for display (no artificial limit)
    const speedPercent = Math.min((speed / maxDisplaySpeed) * 100, 100);
    
    this.speedValue.textContent = speed.toFixed(2);
    this.speedFill.style.width = `${speedPercent}%`;

    // Sensitivity display is handled by slider event listener

    // Show/hide UI elements based on pointer lock
    const isLocked = this.inputHandler.isPointerLockActive();
    this.crosshair.style.display = isLocked ? 'block' : 'none';
    this.pointerLockPrompt.style.display = isLocked ? 'none' : 'block';

    // Hide boundary warning for now (physics handles collisions)
    this.boundaryWarning.style.display = 'none';

    // Debug mode - show helpers
    if (this.inputHandler.debugMode) {
      this.gridHelper.visible = true;
      this.axesHelper.visible = true;
    } else {
      this.gridHelper.visible = false;
      this.axesHelper.visible = false;
    }
  };
}

new Game();