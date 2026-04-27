# Mobile Musical Game

A mobile musical instrument game built with React Native and Expo, featuring realistic 3D models of Thai traditional and international instruments with touch-based interaction and authentic audio playback.

## Features

- 🎵 **Realistic 3D Instruments**: High-fidelity 3D models with Three.js rendering
- 🎹 **Touch Interaction**: Natural touch controls simulating real playing techniques
- 🔊 **Authentic Audio**: High-quality audio samples with low-latency playback
- 🇹🇭 **Thai Traditional Instruments**: Ranat Ek, Khim, Saw Duang, and more
- 🌍 **International Instruments**: Piano, Guitar, Drums, and more
- 📱 **Cross-Platform**: Runs on iOS and Android phones and tablets
- 🎨 **Adaptive UI**: Automatically adjusts to different screen sizes and orientations

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript (strict mode)
- **3D Rendering**: Three.js with expo-gl and @react-three/fiber
- **Audio**: expo-av
- **Storage**: AsyncStorage
- **State Management**: React Context API

## Architecture

The project follows a layered architecture pattern:

```
├── Presentation Layer    # UI components and screens
├── Application Layer     # State management and navigation
├── Domain Layer          # Business logic and entities
├── Infrastructure Layer  # Audio, rendering, storage implementations
└── Data Layer           # Repositories and data access
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed architecture documentation.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app (for testing on physical devices)

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd mobile-musical-game
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

#### Development Mode

```bash
# Start Expo development server
npm start

# Run on iOS simulator (Mac only)
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

#### Using Expo Go

1. Start the development server: `npm start`
2. Scan the QR code with Expo Go app on your phone
3. The app will load on your device

## Project Structure

```
mobile-musical-game/
├── src/
│   ├── presentation/      # UI components, screens, hooks
│   ├── application/       # State management, navigation
│   ├── domain/           # Entities, services, interfaces
│   ├── infrastructure/   # Audio, rendering, storage
│   └── data/            # Repositories, models
├── assets/
│   ├── models/          # 3D models (.glb, .gltf)
│   ├── audio/           # Audio samples
│   └── textures/        # Texture images
└── App.tsx              # Application entry point
```

## Development Guidelines

### TypeScript

- Use strict type checking (no `any` types)
- Use path aliases for imports:
  - `@presentation/*` for presentation layer
  - `@application/*` for application layer
  - `@domain/*` for domain layer
  - `@infrastructure/*` for infrastructure layer
  - `@data/*` for data layer
  - `@assets/*` for assets

### Code Style

- Follow the layered architecture
- Keep layers independent
- Implement domain interfaces in infrastructure layer
- Write unit tests for each layer

### Adding New Instruments

1. Add 3D model to `assets/models/{nationality}/{playing-method}/`
2. Add audio samples to `assets/audio/{nationality}/{playing-method}/`
3. Add instrument definition to instrument repository
4. Update instrument library data

## Requirements Coverage

This project implements the following requirements from the specification:

- **Requirement 1.1**: Instrument library organization by nationality and playing method
- **Requirement 1.2**: 3D instrument visualization with Three.js
- **Requirement 1.3**: Realistic sound playback with expo-av
- **Requirement 1.4**: Touch-based instrument interaction

## Asset Guidelines

### 3D Models
- Format: GLB (preferred) or GLTF
- Max polygons: 5K (low), 15K (medium), 50K (high)
- Texture size: 512px (low), 1024px (medium), 2048px (high)

### Audio Samples
- Format: MP3 (preferred) or WAV
- Sample rate: 44.1 kHz minimum
- Bitrate: 128 kbps (medium), 192 kbps (high)

### Textures
- Format: PNG (with transparency) or JPG
- Size: Power of 2 (512, 1024, 2048)
- Optimized for mobile devices

## Performance Targets

- Frame rate: 30+ FPS
- Audio latency: <100ms
- App load time: <2 seconds
- Instrument load time: <2 seconds

## Supported Devices

- **Phones**: 4-7 inch screens (iPhone SE to iPhone Pro Max)
- **Tablets**: 7-13 inch screens (iPad Mini to iPad Pro)
- **OS**: iOS 13+ and Android 8+

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]

## Contact

[Add contact information here]
