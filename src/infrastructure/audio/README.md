# Audio Infrastructure

This module provides low-latency audio playback and intelligent audio sample pre-loading for the mobile musical instrument game.

## Components

### LowLatencySoundEngine

Implements low-latency audio playback using Web Audio API with polyphonic support and voice stealing.

**Features:**
- Sub-100ms audio latency
- Polyphonic playback (up to 16 simultaneous voices)
- Voice stealing when max voices reached
- Velocity control for dynamic expression
- Master volume control

**Usage:**

```typescript
import { LowLatencySoundEngine } from './infrastructure/audio';

const soundEngine = new LowLatencySoundEngine();

// Initialize the audio engine
await soundEngine.initialize();

// Load audio samples
await soundEngine.loadAudioSamples(audioSamples);

// Play a note with velocity
soundEngine.playNote('C4', 0.8); // 80% velocity

// Control volume
soundEngine.setVolume(0.7); // 70% volume

// Stop all notes
soundEngine.stopAll();
```

### AudioPreloadStrategy

Implements intelligent audio sample pre-loading with priority-based loading strategy.

**Features:**
- Priority loading: Loads middle-range notes first (most commonly used)
- Background loading: Loads remaining samples without blocking
- Progress tracking: Monitor loading progress for UI feedback
- Smart sorting: Automatically sorts samples by pitch/frequency

**Usage:**

```typescript
import { LowLatencySoundEngine, AudioPreloadStrategy } from './infrastructure/audio';

const soundEngine = new LowLatencySoundEngine();
await soundEngine.initialize();

const preloadStrategy = new AudioPreloadStrategy(soundEngine);

// Pre-load instrument with priority loading
await preloadStrategy.preloadInstrument(instrument.audioSamples);

// Priority samples are now loaded and ready to play
// Remaining samples are loading in the background

// Track loading progress
const progress = preloadStrategy.getProgress();
console.log(`Loaded ${progress.percentage}% of audio samples`);
console.log(`Priority loaded: ${progress.priorityLoaded}`);
```

## Priority Loading Strategy

The AudioPreloadStrategy uses a smart loading approach:

1. **Priority Loading (Blocking)**: Loads the middle 50% of notes first
   - These are the most commonly used notes in most instruments
   - Ensures quick playability for typical use cases
   - Returns immediately after priority samples are loaded

2. **Background Loading (Non-blocking)**: Loads remaining notes
   - Low and high range notes are loaded in the background
   - Doesn't block the UI or user interaction
   - Gracefully handles loading errors

3. **Smart Sorting**: Automatically sorts samples by pitch
   - Recognizes standard note notation (C4, A#3, Bb5, etc.)
   - Falls back to alphabetical sorting for non-standard names
   - Works with both pitched and non-pitched instruments

## Progress Tracking

The `LoadProgress` interface provides detailed loading status:

```typescript
interface LoadProgress {
  totalSamples: number;      // Total number of samples to load
  loadedSamples: number;     // Number of samples loaded so far
  priorityLoaded: boolean;   // Whether priority samples are loaded
  percentage: number;        // Overall loading percentage (0-100)
}
```

Use this for:
- Displaying loading indicators in the UI
- Determining when the instrument is ready to play
- Monitoring background loading progress

## Integration Example

Complete example of integrating both components:

```typescript
import { LowLatencySoundEngine, AudioPreloadStrategy } from './infrastructure/audio';
import { Instrument } from './domain/entities/Instrument';

async function loadInstrument(instrument: Instrument) {
  // Initialize sound engine
  const soundEngine = new LowLatencySoundEngine();
  await soundEngine.initialize();

  // Create preload strategy
  const preloadStrategy = new AudioPreloadStrategy(soundEngine);

  // Start preloading (returns when priority samples are loaded)
  await preloadStrategy.preloadInstrument(instrument.audioSamples);

  // Instrument is now playable!
  // Background loading continues for remaining samples

  // Monitor progress
  const checkProgress = setInterval(() => {
    const progress = preloadStrategy.getProgress();
    console.log(`Loading: ${progress.percentage}%`);
    
    if (progress.percentage === 100) {
      console.log('All samples loaded!');
      clearInterval(checkProgress);
    }
  }, 100);

  return soundEngine;
}
```

## Requirements

- **Requirement 3.3**: Audio latency less than 100ms
- **Requirement 10.3**: Pre-load audio samples to prevent delays
- **Requirement 11.1**: Minimum 44.1kHz sample rate
- **Requirement 11.2**: Stereo audio support
- **Requirement 11.3**: Polyphonic mixing without distortion
