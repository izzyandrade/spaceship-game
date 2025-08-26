# 🚀 Spaceship Cave

A 3D browser-based spaceship game built with Three.js and TypeScript, featuring realistic physics-based movement and mouse controls.

## ✨ Features

### 🎮 Advanced Controls
- **Mouse Control**: Move mouse to steer spaceship (yaw/pitch rotation)
- **Physics-Based Movement**: Realistic acceleration, velocity, and momentum

### 🎯 Gameplay Elements
- **Collision Detection**: Invisible boundary walls with bounce-back response
- **Boundary Warnings**: Visual feedback when approaching play area edges
- **Speed Indicator**: Real-time velocity display with gradient bar
- **Debug Mode**: Toggle collision boundaries and physics vectors

### 🔧 Technical Features
- **TypeScript**: Full type safety and modern ES6+ features
- **Modular Architecture**: Clean separation of concerns
- **Physics Engine**: Custom implementation with configurable constants
- **UI System**: HUD elements with real-time updates

## 🎮 Controls

| Input | Action |
|-------|--------|
| **Mouse** | Look around and steer spaceship |
| **W** | Forward thrust |
| **S** | Backward thrust |
| **↑/↓ Arrows** | Adjust camera height |
| **←/→ Arrows** | Cycle through zoom modes |
| **F** | Toggle debug mode |
| **ESC** | Release mouse control |

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spaceship-cave
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the displayed localhost URL (typically `http://localhost:3000`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🏗️ Project Structure

```
src/
├── main.ts              # Main game loop and initialization
├── Spaceship.ts         # Spaceship class with physics
├── CameraController.ts  # Advanced camera system
├── InputHandler.ts      # Mouse and keyboard input
├── CollisionSystem.ts   # Boundary collision detection
└── style.css           # UI styling and layout
```

## 🔧 Architecture

### Physics System
- **Acceleration/Velocity Model**: Realistic momentum physics
- **Drag Coefficient**: Gradual deceleration when no input
- **Banking Animation**: Natural roll into turns
- **Configurable Constants**: Easy tweaking of physics parameters

### Camera System  
- **Spring Damping**: Smooth following with lag
- **Vector3 Math**: 3D position calculations
- **Quaternion Rotations**: Smooth spaceship orientation
- **Lerp Interpolation**: Smooth transitions

### Input System
- **Pointer Lock API**: Seamless mouse capture
- **Event-Driven**: Supports simultaneous inputs
- **State Management**: Clean separation of controls

### Collision Detection
- **Sphere-Based**: Efficient collision checking
- **Boundary Response**: Bounce-back physics
- **Warning System**: Visual feedback near boundaries

## 🎨 Customization

### Physics Constants (in `Spaceship.ts`)
```typescript
private readonly MAX_SPEED = 0.5;           // Maximum velocity
private readonly ACCELERATION = 0.02;       // Acceleration rate
private readonly DRAG_COEFFICIENT = 0.95;   // Momentum decay
private readonly MOUSE_SENSITIVITY = 0.003; // Mouse responsiveness
```

### Camera Settings (in `CameraController.ts`)
```typescript
private readonly FOLLOW_SPEED = 0.08;       // Camera following speed
private readonly CAMERA_DAMPING = 0.15;     // Spring damping
private readonly LOOK_AHEAD_FACTOR = 0.3;   // Prediction amount
```

### Collision Boundaries (in `CollisionSystem.ts`)
```typescript
this.boundaries = {
  min: new THREE.Vector3(-500, -500, -500),  // Play area minimum
  max: new THREE.Vector3(500, 500, 500)      // Play area maximum
};
```

## 🎯 Gameplay Tips

1. **Click the canvas** to start - this captures your mouse for control
2. **Use smooth mouse movements** - the spaceship has realistic physics
3. **Build up speed gradually** - momentum carries you forward
4. **Watch the speed indicator** - green is slow, red is fast
5. **Press F for debug mode** to see collision boundaries
6. **Red border warning** appears when near play area edges

## 🛠️ Technologies Used

- **Three.js** - 3D graphics and rendering
- **TypeScript** - Type safety and modern JavaScript
- **Vite** - Fast build tool and dev server
- **CSS3** - UI styling and animations

## 📝 Development Notes

The game demonstrates several advanced 3D programming concepts:

- **Vector Mathematics**: Position, velocity, and acceleration calculations
- **Quaternion Rotations**: Smooth 3D rotations without gimbal lock
- **Physics Integration**: Euler integration for realistic movement  
- **Event-Driven Architecture**: Modular input and update systems
- **Performance Optimization**: Efficient collision detection and rendering

## 🔮 Future Enhancements

- Cave environment with procedural generation
- Particle effects for engine thrust
- Sound effects and spatial audio
- Multiplayer support
- Power-ups and collectibles
- Improved graphics and shaders

## 📄 License

This project is open source and available under the [MIT License](LICENSE).