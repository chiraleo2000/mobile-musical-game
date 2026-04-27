/**
 * LifecycleManager Unit Tests
 * Tests lifecycle event handling, state persistence, and audio control
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4
 */

import { LifecycleManager } from '../LifecycleManager';
import { ISoundEngine, MixerState } from '@domain/interfaces/ISoundEngine';
import { IStorageService } from '@domain/interfaces/IStorageService';
import { IInstrumentManager } from '@domain/interfaces/IInstrumentManager';
import { Instrument } from '@domain/entities/Instrument';
import { UserPreferences, ErrorLogEntry } from '@domain/entities/AppState';

// Mock implementations
class MockSoundEngine implements ISoundEngine {
  private volume: number = 1.0;
  private activeNotes: Set<string> = new Set();
  public stopAllCalled: boolean = false;
  public stopAllCallCount: number = 0;

  async initialize(): Promise<void> {
    // Mock implementation
  }

  async loadAudioSamples(_samples: any[]): Promise<void> {
    // Mock implementation
  }

  playNote(noteId: string, _velocity: number): void {
    this.activeNotes.add(noteId);
  }

  stopNote(noteId: string): void {
    this.activeNotes.delete(noteId);
  }

  stopAll(): void {
    this.stopAllCalled = true;
    this.stopAllCallCount++;
    this.activeNotes.clear();
  }

  setVolume(volume: number): void {
    this.volume = volume;
  }

  getMixerState(): MixerState {
    return {
      activeVoices: this.activeNotes.size,
      maxVoices: 16,
      cpuLoad: 0,
    };
  }

  dispose(): void {
    this.activeNotes.clear();
  }

  // Test helper methods
  getVolume(): number {
    return this.volume;
  }

  getActiveNotesCount(): number {
    return this.activeNotes.size;
  }

  resetMock(): void {
    this.stopAllCalled = false;
    this.stopAllCallCount = 0;
    this.activeNotes.clear();
  }
}

class MockStorageService implements IStorageService {
  private preferences: UserPreferences | null = null;
  private lastInstrument: string | null = null;
  private errorLogs: ErrorLogEntry[] = [];
  public saveLastInstrumentCalled: boolean = false;
  public saveLastInstrumentCallCount: number = 0;
  public loadLastInstrumentCallCount: number = 0;

  async savePreferences(preferences: UserPreferences): Promise<void> {
    this.preferences = preferences;
  }

  async loadPreferences(): Promise<UserPreferences | null> {
    return this.preferences;
  }

  async saveLastInstrument(instrumentId: string): Promise<void> {
    this.saveLastInstrumentCalled = true;
    this.saveLastInstrumentCallCount++;
    this.lastInstrument = instrumentId;
  }

  async loadLastInstrument(): Promise<string | null> {
    this.loadLastInstrumentCallCount++;
    return this.lastInstrument;
  }

  async clearAll(): Promise<void> {
    this.preferences = null;
    this.lastInstrument = null;
    this.errorLogs = [];
  }

  async saveErrorLog(errorLog: ErrorLogEntry): Promise<void> {
    this.errorLogs.push(errorLog);
  }

  async loadErrorLogs(): Promise<ErrorLogEntry[]> {
    return this.errorLogs;
  }

  async clearErrorLogs(): Promise<void> {
    this.errorLogs = [];
  }

  // Test helper methods
  getStoredLastInstrument(): string | null {
    return this.lastInstrument;
  }

  resetMock(): void {
    this.saveLastInstrumentCalled = false;
    this.saveLastInstrumentCallCount = 0;
    this.loadLastInstrumentCallCount = 0;
  }
}

class MockInstrumentManager implements IInstrumentManager {
  private currentInstrument: Instrument | null = null;
  private shouldFail: boolean = false;
  public loadInstrumentCallCount: number = 0;

  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  setCurrentInstrument(instrument: Instrument | null): void {
    this.currentInstrument = instrument;
  }

  async loadInstrument(instrumentId: string): Promise<Instrument> {
    this.loadInstrumentCallCount++;

    if (this.shouldFail) {
      throw new Error(`Failed to load instrument: ${instrumentId}`);
    }

    const instrument: Instrument = {
      id: instrumentId,
      name: { thai: 'ทดสอบ', english: 'Test Instrument' },
      nationality: 'thai',
      playingMethod: 'striking',
      model3D: {
        modelId: 'test-model',
        filePath: '/models/test.glb',
        format: 'glb',
        lodLevels: [],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 1, y: 1, z: 1 },
        },
      },
      audioSamples: {
        samples: [],
        polyphony: 4,
      },
      interactionZones: [],
      culturalInfo: {
        description: { thai: 'คำอธิบาย', english: 'Description' },
        origin: { thai: 'ต้นกำเนิด', english: 'Origin' },
        usage: { thai: 'การใช้งาน', english: 'Usage' },
      },
      metadata: {
        difficulty: 'beginner',
        popularity: 50,
        dateAdded: '2024-01-01',
        version: '1.0.0',
        tags: ['test'],
      },
    };

    this.currentInstrument = instrument;
    return instrument;
  }

  unloadInstrument(instrumentId: string): void {
    if (this.currentInstrument?.id === instrumentId) {
      this.currentInstrument = null;
    }
  }

  getCurrentInstrument(): Instrument | null {
    return this.currentInstrument;
  }

  async preloadInstruments(_instrumentIds: string[]): Promise<void> {
    // Mock implementation
  }

  resetMock(): void {
    this.loadInstrumentCallCount = 0;
  }
}

describe('LifecycleManager', () => {
  let lifecycleManager: LifecycleManager;
  let mockSoundEngine: MockSoundEngine;
  let mockStorageService: MockStorageService;
  let mockInstrumentManager: MockInstrumentManager;

  beforeEach(() => {
    mockSoundEngine = new MockSoundEngine();
    mockStorageService = new MockStorageService();
    mockInstrumentManager = new MockInstrumentManager();

    lifecycleManager = new LifecycleManager(
      mockSoundEngine,
      mockStorageService,
      mockInstrumentManager
    );
  });

  afterEach(() => {
    lifecycleManager.dispose();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const state = lifecycleManager.getState();

      expect(state.appState).toBe('active');
      expect(state.isInterrupted).toBe(false);
      expect(state.lastInstrumentId).toBeNull();
      expect(state.savedAt).toBeNull();
    });

    it('should initialize lifecycle manager', () => {
      lifecycleManager.initialize();

      const state = lifecycleManager.getState();
      expect(state.appState).toBeDefined();
    });

    it('should not reinitialize if already initialized', () => {
      lifecycleManager.initialize();
      lifecycleManager.initialize();

      // Should not throw or cause issues
      expect(lifecycleManager.getState()).toBeDefined();
    });

    it('should dispose and clean up listeners', () => {
      lifecycleManager.initialize();
      lifecycleManager.dispose();

      // Should not throw
      expect(() => lifecycleManager.dispose()).not.toThrow();
    });
  });

  describe('onAppBackground', () => {
    it('should stop all audio when app goes to background', async () => {
      await lifecycleManager.onAppBackground();

      expect(mockSoundEngine.stopAllCalled).toBe(true);
    });

    it('should save current instrument to storage', async () => {
      const testInstrument: Instrument = {
        id: 'test-instrument-1',
        name: { thai: 'ทดสอบ', english: 'Test' },
        nationality: 'thai',
        playingMethod: 'striking',
        model3D: {
          modelId: 'test',
          filePath: '/test.glb',
          format: 'glb',
          lodLevels: [],
          defaultScale: { x: 1, y: 1, z: 1 },
          defaultRotation: { x: 0, y: 0, z: 0 },
          boundingBox: {
            center: { x: 0, y: 0, z: 0 },
            size: { x: 1, y: 1, z: 1 },
          },
        },
        audioSamples: { samples: [], polyphony: 4 },
        interactionZones: [],
        culturalInfo: {
          description: { thai: '', english: '' },
          origin: { thai: '', english: '' },
          usage: { thai: '', english: '' },
        },
        metadata: {
          difficulty: 'beginner',
          popularity: 50,
          dateAdded: '2024-01-01',
          version: '1.0.0',
          tags: [],
        },
      };

      mockInstrumentManager.setCurrentInstrument(testInstrument);

      await lifecycleManager.onAppBackground();

      expect(mockStorageService.saveLastInstrumentCalled).toBe(true);
      expect(mockStorageService.getStoredLastInstrument()).toBe('test-instrument-1');
    });

    it('should update lifecycle state with saved instrument ID', async () => {
      const testInstrument: Instrument = {
        id: 'ranat-ek',
        name: { thai: 'ระนาดเอก', english: 'Ranat Ek' },
        nationality: 'thai',
        playingMethod: 'striking',
        model3D: {
          modelId: 'ranat-ek',
          filePath: '/ranat-ek.glb',
          format: 'glb',
          lodLevels: [],
          defaultScale: { x: 1, y: 1, z: 1 },
          defaultRotation: { x: 0, y: 0, z: 0 },
          boundingBox: {
            center: { x: 0, y: 0, z: 0 },
            size: { x: 1, y: 1, z: 1 },
          },
        },
        audioSamples: { samples: [], polyphony: 4 },
        interactionZones: [],
        culturalInfo: {
          description: { thai: '', english: '' },
          origin: { thai: '', english: '' },
          usage: { thai: '', english: '' },
        },
        metadata: {
          difficulty: 'beginner',
          popularity: 50,
          dateAdded: '2024-01-01',
          version: '1.0.0',
          tags: [],
        },
      };

      mockInstrumentManager.setCurrentInstrument(testInstrument);

      await lifecycleManager.onAppBackground();

      const state = lifecycleManager.getState();
      expect(state.lastInstrumentId).toBe('ranat-ek');
      expect(state.savedAt).not.toBeNull();
    });

    it('should not save if no current instrument', async () => {
      mockInstrumentManager.setCurrentInstrument(null);

      await lifecycleManager.onAppBackground();

      expect(mockStorageService.getStoredLastInstrument()).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      mockStorageService.saveLastInstrument = jest.fn().mockRejectedValue(new Error('Storage error'));

      const testInstrument: Instrument = {
        id: 'test',
        name: { thai: '', english: '' },
        nationality: 'thai',
        playingMethod: 'striking',
        model3D: {
          modelId: 'test',
          filePath: '/test.glb',
          format: 'glb',
          lodLevels: [],
          defaultScale: { x: 1, y: 1, z: 1 },
          defaultRotation: { x: 0, y: 0, z: 0 },
          boundingBox: {
            center: { x: 0, y: 0, z: 0 },
            size: { x: 1, y: 1, z: 1 },
          },
        },
        audioSamples: { samples: [], polyphony: 4 },
        interactionZones: [],
        culturalInfo: {
          description: { thai: '', english: '' },
          origin: { thai: '', english: '' },
          usage: { thai: '', english: '' },
        },
        metadata: {
          difficulty: 'beginner',
          popularity: 50,
          dateAdded: '2024-01-01',
          version: '1.0.0',
          tags: [],
        },
      };

      mockInstrumentManager.setCurrentInstrument(testInstrument);

      // Should not throw
      await expect(lifecycleManager.onAppBackground()).resolves.not.toThrow();
    });

    it('should respect config option to disable audio stop', async () => {
      const customLifecycleManager = new LifecycleManager(
        mockSoundEngine,
        mockStorageService,
        mockInstrumentManager,
        { stopAudioOnBackground: false }
      );

      await customLifecycleManager.onAppBackground();

      expect(mockSoundEngine.stopAllCalled).toBe(false);

      customLifecycleManager.dispose();
    });

    it('should respect config option to disable state saving', async () => {
      const customLifecycleManager = new LifecycleManager(
        mockSoundEngine,
        mockStorageService,
        mockInstrumentManager,
        { saveStateOnBackground: false }
      );

      const testInstrument: Instrument = {
        id: 'test',
        name: { thai: '', english: '' },
        nationality: 'thai',
        playingMethod: 'striking',
        model3D: {
          modelId: 'test',
          filePath: '/test.glb',
          format: 'glb',
          lodLevels: [],
          defaultScale: { x: 1, y: 1, z: 1 },
          defaultRotation: { x: 0, y: 0, z: 0 },
          boundingBox: {
            center: { x: 0, y: 0, z: 0 },
            size: { x: 1, y: 1, z: 1 },
          },
        },
        audioSamples: { samples: [], polyphony: 4 },
        interactionZones: [],
        culturalInfo: {
          description: { thai: '', english: '' },
          origin: { thai: '', english: '' },
          usage: { thai: '', english: '' },
        },
        metadata: {
          difficulty: 'beginner',
          popularity: 50,
          dateAdded: '2024-01-01',
          version: '1.0.0',
          tags: [],
        },
      };

      mockInstrumentManager.setCurrentInstrument(testInstrument);

      await customLifecycleManager.onAppBackground();

      expect(mockStorageService.saveLastInstrumentCalled).toBe(false);

      customLifecycleManager.dispose();
    });
  });

  describe('onAppForeground', () => {
    it('should restore last instrument from storage', async () => {
      await mockStorageService.saveLastInstrument('test-instrument-2');

      await lifecycleManager.onAppForeground();

      expect(mockStorageService.loadLastInstrumentCallCount).toBeGreaterThan(0);
      expect(mockInstrumentManager.loadInstrumentCallCount).toBeGreaterThan(0);
    });

    it('should not reload if current instrument matches saved instrument', async () => {
      await mockStorageService.saveLastInstrument('same-instrument');
      await mockInstrumentManager.loadInstrument('same-instrument');

      mockInstrumentManager.resetMock();

      await lifecycleManager.onAppForeground();

      expect(mockInstrumentManager.loadInstrumentCallCount).toBe(0);
    });

    it('should reload if current instrument differs from saved instrument', async () => {
      await mockStorageService.saveLastInstrument('instrument-a');
      await mockInstrumentManager.loadInstrument('instrument-b');

      mockInstrumentManager.resetMock();

      await lifecycleManager.onAppForeground();

      expect(mockInstrumentManager.loadInstrumentCallCount).toBeGreaterThan(0);
    });

    it('should clear interruption flag', async () => {
      await lifecycleManager.onInterruption();

      expect(lifecycleManager.isInterrupted()).toBe(true);

      await lifecycleManager.onAppForeground();

      expect(lifecycleManager.isInterrupted()).toBe(false);
    });

    it('should handle missing saved instrument gracefully', async () => {
      // No saved instrument
      await expect(lifecycleManager.onAppForeground()).resolves.not.toThrow();
    });

    it('should handle instrument load failure gracefully', async () => {
      await mockStorageService.saveLastInstrument('failing-instrument');
      mockInstrumentManager.setShouldFail(true);

      // Should not throw
      await expect(lifecycleManager.onAppForeground()).resolves.not.toThrow();
    });

    it('should respect config option to disable auto-restore', async () => {
      const customLifecycleManager = new LifecycleManager(
        mockSoundEngine,
        mockStorageService,
        mockInstrumentManager,
        { enableAutoRestore: false }
      );

      await mockStorageService.saveLastInstrument('test-instrument');

      await customLifecycleManager.onAppForeground();

      expect(mockInstrumentManager.loadInstrumentCallCount).toBe(0);

      customLifecycleManager.dispose();
    });
  });

  describe('onInterruption', () => {
    it('should stop all audio on interruption', async () => {
      await lifecycleManager.onInterruption();

      expect(mockSoundEngine.stopAllCalled).toBe(true);
    });

    it('should set interruption flag', async () => {
      await lifecycleManager.onInterruption();

      expect(lifecycleManager.isInterrupted()).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      mockSoundEngine.stopAll = jest.fn().mockImplementation(() => {
        throw new Error('Audio error');
      });

      // Should not throw
      await expect(lifecycleManager.onInterruption()).resolves.not.toThrow();
    });
  });

  describe('onResume', () => {
    it('should clear interruption flag', async () => {
      await lifecycleManager.onInterruption();

      expect(lifecycleManager.isInterrupted()).toBe(true);

      await lifecycleManager.onResume();

      expect(lifecycleManager.isInterrupted()).toBe(false);
    });

    it('should not automatically restart audio playback', async () => {
      mockSoundEngine.resetMock();

      await lifecycleManager.onResume();

      // Audio should not be restarted automatically
      expect(mockSoundEngine.stopAllCallCount).toBe(0);
    });

    it('should handle errors gracefully', async () => {
      // Should not throw even if there are issues
      await expect(lifecycleManager.onResume()).resolves.not.toThrow();
    });
  });

  describe('State Management', () => {
    it('should track app state correctly', () => {
      const state = lifecycleManager.getState();

      expect(state.appState).toBe('active');
    });

    it('should check if app is in background', () => {
      expect(lifecycleManager.isInBackground()).toBe(false);
    });

    it('should check if app is interrupted', () => {
      expect(lifecycleManager.isInterrupted()).toBe(false);
    });

    it('should return immutable state copy', () => {
      const state1 = lifecycleManager.getState();
      const state2 = lifecycleManager.getState();

      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe('Manual Triggers (Testing Helpers)', () => {
    it('should manually trigger background handler', async () => {
      await lifecycleManager.triggerBackground();

      expect(mockSoundEngine.stopAllCalled).toBe(true);
    });

    it('should manually trigger foreground handler', async () => {
      await mockStorageService.saveLastInstrument('test');

      await lifecycleManager.triggerForeground();

      expect(mockStorageService.loadLastInstrumentCallCount).toBeGreaterThan(0);
    });

    it('should manually trigger interruption handler', async () => {
      await lifecycleManager.triggerInterruption();

      expect(lifecycleManager.isInterrupted()).toBe(true);
    });

    it('should manually trigger resume handler', async () => {
      await lifecycleManager.triggerInterruption();
      await lifecycleManager.triggerResume();

      expect(lifecycleManager.isInterrupted()).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete background/foreground cycle', async () => {
      const testInstrument: Instrument = {
        id: 'cycle-test',
        name: { thai: '', english: '' },
        nationality: 'thai',
        playingMethod: 'striking',
        model3D: {
          modelId: 'test',
          filePath: '/test.glb',
          format: 'glb',
          lodLevels: [],
          defaultScale: { x: 1, y: 1, z: 1 },
          defaultRotation: { x: 0, y: 0, z: 0 },
          boundingBox: {
            center: { x: 0, y: 0, z: 0 },
            size: { x: 1, y: 1, z: 1 },
          },
        },
        audioSamples: { samples: [], polyphony: 4 },
        interactionZones: [],
        culturalInfo: {
          description: { thai: '', english: '' },
          origin: { thai: '', english: '' },
          usage: { thai: '', english: '' },
        },
        metadata: {
          difficulty: 'beginner',
          popularity: 50,
          dateAdded: '2024-01-01',
          version: '1.0.0',
          tags: [],
        },
      };

      mockInstrumentManager.setCurrentInstrument(testInstrument);

      // Background
      await lifecycleManager.onAppBackground();

      expect(mockSoundEngine.stopAllCalled).toBe(true);
      expect(mockStorageService.getStoredLastInstrument()).toBe('cycle-test');

      // Foreground
      mockSoundEngine.resetMock();
      mockInstrumentManager.setCurrentInstrument(null);

      await lifecycleManager.onAppForeground();

      expect(mockInstrumentManager.getCurrentInstrument()?.id).toBe('cycle-test');
    });

    it('should handle interruption during active use', async () => {
      // Simulate active audio playback
      mockSoundEngine.playNote('C4', 0.8);

      expect(mockSoundEngine.getActiveNotesCount()).toBeGreaterThan(0);

      // Interruption
      await lifecycleManager.onInterruption();

      expect(mockSoundEngine.stopAllCalled).toBe(true);
      expect(lifecycleManager.isInterrupted()).toBe(true);

      // Resume
      await lifecycleManager.onResume();

      expect(lifecycleManager.isInterrupted()).toBe(false);
    });

    it('should handle multiple background/foreground cycles', async () => {
      const testInstrument: Instrument = {
        id: 'multi-cycle',
        name: { thai: '', english: '' },
        nationality: 'thai',
        playingMethod: 'striking',
        model3D: {
          modelId: 'test',
          filePath: '/test.glb',
          format: 'glb',
          lodLevels: [],
          defaultScale: { x: 1, y: 1, z: 1 },
          defaultRotation: { x: 0, y: 0, z: 0 },
          boundingBox: {
            center: { x: 0, y: 0, z: 0 },
            size: { x: 1, y: 1, z: 1 },
          },
        },
        audioSamples: { samples: [], polyphony: 4 },
        interactionZones: [],
        culturalInfo: {
          description: { thai: '', english: '' },
          origin: { thai: '', english: '' },
          usage: { thai: '', english: '' },
        },
        metadata: {
          difficulty: 'beginner',
          popularity: 50,
          dateAdded: '2024-01-01',
          version: '1.0.0',
          tags: [],
        },
      };

      mockInstrumentManager.setCurrentInstrument(testInstrument);

      for (let i = 0; i < 3; i++) {
        await lifecycleManager.onAppBackground();
        await lifecycleManager.onAppForeground();
      }

      expect(mockSoundEngine.stopAllCallCount).toBe(3);
      expect(mockStorageService.saveLastInstrumentCallCount).toBe(3);
    });
  });

  describe('Requirements Validation', () => {
    it('should satisfy Requirement 14.1 - stop audio when app moves to background', async () => {
      await lifecycleManager.onAppBackground();

      expect(mockSoundEngine.stopAllCalled).toBe(true);
    });

    it('should satisfy Requirement 14.2 - restore previously selected instrument', async () => {
      await mockStorageService.saveLastInstrument('ranat-ek');

      await lifecycleManager.onAppForeground();

      expect(mockInstrumentManager.loadInstrumentCallCount).toBeGreaterThan(0);
    });

    it('should satisfy Requirement 14.3 - pause audio during interruptions', async () => {
      await lifecycleManager.onInterruption();

      expect(mockSoundEngine.stopAllCalled).toBe(true);
      expect(lifecycleManager.isInterrupted()).toBe(true);
    });

    it('should satisfy Requirement 14.3 - resume after interruption ends', async () => {
      await lifecycleManager.onInterruption();
      await lifecycleManager.onResume();

      expect(lifecycleManager.isInterrupted()).toBe(false);
    });

    it('should satisfy Requirement 14.4 - save last selected instrument when closing', async () => {
      const testInstrument: Instrument = {
        id: 'save-test',
        name: { thai: '', english: '' },
        nationality: 'thai',
        playingMethod: 'striking',
        model3D: {
          modelId: 'test',
          filePath: '/test.glb',
          format: 'glb',
          lodLevels: [],
          defaultScale: { x: 1, y: 1, z: 1 },
          defaultRotation: { x: 0, y: 0, z: 0 },
          boundingBox: {
            center: { x: 0, y: 0, z: 0 },
            size: { x: 1, y: 1, z: 1 },
          },
        },
        audioSamples: { samples: [], polyphony: 4 },
        interactionZones: [],
        culturalInfo: {
          description: { thai: '', english: '' },
          origin: { thai: '', english: '' },
          usage: { thai: '', english: '' },
        },
        metadata: {
          difficulty: 'beginner',
          popularity: 50,
          dateAdded: '2024-01-01',
          version: '1.0.0',
          tags: [],
        },
      };

      mockInstrumentManager.setCurrentInstrument(testInstrument);

      await lifecycleManager.onAppBackground();

      expect(mockStorageService.getStoredLastInstrument()).toBe('save-test');
    });
  });
});
