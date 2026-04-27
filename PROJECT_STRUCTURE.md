# Mobile Musical Game - Project Structure

## Overview
This project follows a layered architecture pattern to ensure separation of concerns, maintainability, and testability.

## Directory Structure

```
mobile-musical-game/
├── src/
│   ├── presentation/          # UI Layer
│   │   ├── components/        # Reusable UI components
│   │   ├── screens/           # Screen components
│   │   └── hooks/             # Custom React hooks
│   │
│   ├── application/           # Application Layer
│   │   ├── state/             # State management (Context, reducers)
│   │   └── navigation/        # Navigation configuration
│   │
│   ├── domain/                # Domain Layer (Business Logic)
│   │   ├── entities/          # Core business entities and types
│   │   ├── services/          # Business logic services
│   │   └── interfaces/        # Service interfaces (contracts)
│   │
│   ├── infrastructure/        # Infrastructure Layer
│   │   ├── audio/             # Audio engine implementation
│   │   ├── rendering/         # 3D rendering engine
│   │   ├── storage/           # Storage service implementation
│   │   ├── assets/            # Asset loading and management
│   │   └── utils/             # Utility functions
│   │
│   └── data/                  # Data Layer
│       ├── repositories/      # Data access repositories
│       └── models/            # Data models and schemas
│
├── assets/                    # Static Assets
│   ├── models/                # 3D models (.glb, .gltf)
│   │   ├── thai/
│   │   │   ├── striking/
│   │   │   ├── plucked/
│   │   │   └── pressed/
│   │   └── international/
│   │       ├── striking/
│   │       ├── plucked/
│   │       └── pressed/
│   │
│   ├── audio/                 # Audio samples
│   │   ├── thai/
│   │   │   ├── striking/
│   │   │   ├── plucked/
│   │   │   └── pressed/
│   │   └── international/
│   │       ├── striking/
│   │       ├── plucked/
│   │       └── pressed/
│   │
│   └── textures/              # Texture images
│       ├── instruments/
│       └── ui/
│
└── App.tsx                    # Application entry point
```

## Layer Responsibilities

### Presentation Layer
- Renders UI components
- Handles user interactions
- Displays data from application state
- No business logic

### Application Layer
- Manages application state
- Coordinates between layers
- Handles navigation flow
- Manages lifecycle events

### Domain Layer
- Contains core business logic
- Defines entities and types
- Defines service interfaces
- Independent of frameworks

### Infrastructure Layer
- Implements domain interfaces
- Handles external dependencies
- Manages audio, rendering, storage
- Platform-specific code

### Data Layer
- Manages data access
- Implements repositories
- Handles data persistence
- Data transformation

## Key Files

### Domain Entities
- `src/domain/entities/Instrument.ts` - Core instrument types
- `src/domain/entities/AppState.ts` - Application state types
- `src/domain/entities/Touch.ts` - Touch interaction types

### Domain Interfaces
- `src/domain/interfaces/ISoundEngine.ts` - Audio engine contract
- `src/domain/interfaces/IRenderEngine.ts` - Rendering engine contract
- `src/domain/interfaces/ITouchController.ts` - Touch controller contract
- `src/domain/interfaces/IInstrumentManager.ts` - Instrument manager contract
- `src/domain/interfaces/IStorageService.ts` - Storage service contract

### Infrastructure
- `src/infrastructure/storage/StorageService.ts` - AsyncStorage implementation
- `src/infrastructure/assets/AssetConfig.ts` - Asset paths and configuration
- `src/infrastructure/utils/DeviceUtils.ts` - Device detection utilities

### Application State
- `src/application/state/AppContext.tsx` - React Context for global state

### Data
- `src/data/repositories/InstrumentRepository.ts` - Instrument data access

## TypeScript Configuration

The project uses strict TypeScript configuration with:
- Strict null checks
- No implicit any
- Path aliases for clean imports:
  - `@presentation/*` → `src/presentation/*`
  - `@application/*` → `src/application/*`
  - `@domain/*` → `src/domain/*`
  - `@infrastructure/*` → `src/infrastructure/*`
  - `@data/*` → `src/data/*`
  - `@assets/*` → `assets/*`

## Asset Organization

### 3D Models
- Format: GLB (preferred) or GLTF
- Organized by nationality and playing method
- LOD (Level of Detail) variants for performance

### Audio Samples
- Format: MP3 (preferred) or WAV
- Sample rate: 44.1 kHz minimum
- Organized by nationality and playing method

### Textures
- Format: PNG (preferred) or JPG
- Organized by usage (instruments, UI)

## Dependencies

### Core
- React Native with Expo
- TypeScript

### 3D Rendering
- three - 3D rendering library
- expo-gl - OpenGL ES integration
- @react-three/fiber - React renderer for Three.js

### Audio
- expo-av - Audio playback

### Storage
- @react-native-async-storage/async-storage - Persistent storage

## Development Guidelines

1. **Follow the layered architecture** - Don't skip layers
2. **Use TypeScript strictly** - No `any` types
3. **Use path aliases** - Import using `@domain/*` etc.
4. **Keep layers independent** - Domain layer should not import from infrastructure
5. **Implement interfaces** - Infrastructure implements domain interfaces
6. **Test each layer** - Unit tests for each layer independently

## Next Steps

1. Implement audio engine (Infrastructure layer)
2. Implement render engine (Infrastructure layer)
3. Implement touch controller (Infrastructure layer)
4. Create UI components (Presentation layer)
5. Add instrument data (Data layer)
6. Integrate layers in App.tsx
