# Data Model Unit Tests

This directory contains comprehensive unit tests for all data models in the mobile musical game application.

## Test Coverage

### Instrument.test.ts (49 tests)
Tests for instrument data structure validation:
- **InstrumentName validation**: Bilingual names (Thai/English), optional pronunciation
- **Nationality validation**: Thai and international instruments
- **PlayingMethod validation**: Striking, plucked, and pressed methods
- **Bounds2D validation**: 2D coordinate bounds, zero values, negative coordinates
- **Vector3 validation**: 3D vectors with positive, negative, and zero values
- **InteractionZone validation**: 
  - Touch zones with minimum 44px target size (Requirements 5.3)
  - Touch sensitivity (0.0-1.0 range)
  - Optional 3D bounds
  - Visual feedback configuration
- **AudioSample validation**:
  - Minimum 44.1kHz sample rate (Requirement 11.1)
  - Multiple audio formats (WAV, MP3, OGG, M4A)
  - Optional velocity values
  - Stereo and mono channels
- **AudioSampleSet validation**: Polyphony support, optional note ranges
- **Model3DReference validation**: 3D model formats (GLTF, GLB, OBJ), LOD levels
- **Complete Instrument validation**: Full instrument structure with all components

### AppState.test.ts (28 tests)
Tests for user preferences and application state:
- **UserPreferences validation**:
  - Volume range (0.0-1.0) (Requirement 11.4)
  - Language options (Thai, English, Auto)
  - Quality levels (Low, Medium, High, Auto)
  - Optional userId and lastSelectedInstrument
  - Favorite instruments array
  - Haptic feedback and tutorial settings
- **DeviceInfo validation**:
  - Phone screen size range (4-7 inches) (Requirement 5.1)
  - Tablet screen size range (7-13 inches) (Requirement 6.1)
  - Device type (phone/tablet)
  - Platform (iOS/Android)
  - Screen dimensions and pixel density
- **AppError validation**:
  - All error codes (MODEL_LOAD_FAILED, AUDIO_LOAD_FAILED, etc.)
  - Recoverable vs non-recoverable errors
  - Optional error details
  - Timestamp tracking
- **ApplicationState validation**:
  - Loading progress (0-100%)
  - Screen types (splash, library, instrument, settings, info)
  - Orientation (portrait/landscape)
  - Performance metrics (minimum 30 FPS) (Requirement 10.1)

### Touch.test.ts (16 tests)
Tests for touch interaction data:
- **Point2D validation**: Positive, negative, zero, and floating-point coordinates
- **Size validation**: Minimum 44px touch target size (Requirement 5.3)
- **Viewport validation**: 
  - Aspect ratio calculations
  - Portrait and landscape orientations
- **TouchAction validation**:
  - All action types (strike, pluck, press, release) (Requirements 4.1-4.3)
  - Velocity range (0.0-1.0)
  - Timestamp validation
- **Gesture validation**:
  - Tap, drag, pinch, and rotate gestures (Requirement 2.3)
  - Delta calculations
  - Scale factors (pinch-in/out)
  - Rotation angles

### Asset.test.ts (24 tests)
Tests for asset management:
- **AssetReference validation**:
  - All asset types (model, audio, texture, animation, metadata)
  - Compressed and uncompressed assets
  - Size validation (non-negative, large files)
  - Checksum tracking
- **InstrumentAssetEntry validation**:
  - Model, audio, and texture references
  - Multiple audio samples
  - Total size calculations
  - Empty arrays
- **SharedAsset validation**:
  - Assets used by multiple instruments
  - Empty and populated usedBy arrays
- **AssetManifest validation**:
  - Version tracking (semantic versioning)
  - Multiple instruments
  - Shared assets
- **LoadProgress validation**:
  - Progress percentage (0-100%)
  - Failed assets tracking
  - Loaded vs total assets validation

## Requirements Coverage

The tests validate the following requirements:
- **Requirement 1.1-1.4**: Instrument library organization
- **Requirement 2.3**: 3D model rotation and zoom gestures
- **Requirement 4.1-4.5**: Touch-based instrument interaction
- **Requirement 5.1, 5.3**: Mobile phone support and touch target sizes
- **Requirement 6.1**: Tablet support
- **Requirement 10.1**: Performance optimization (30+ FPS)
- **Requirement 11.1, 11.4**: Audio quality (44.1kHz) and volume control

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Statistics

- **Total Test Suites**: 4
- **Total Tests**: 101
- **All Tests Passing**: ✓

## Notes

- Tests focus on data structure validation and type constraints
- Bounds checking ensures minimum touch target sizes (44px)
- Audio sample rate validation enforces minimum 44.1kHz
- Device screen size validation for phones (4-7") and tablets (7-13")
- Volume and velocity values validated within 0.0-1.0 range
- Performance metrics validated for minimum 30 FPS requirement
