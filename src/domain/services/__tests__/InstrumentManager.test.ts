/**
 * InstrumentManager Tests
 * Comprehensive test suite for InstrumentManager functionality
 */

import { InstrumentManager, InstrumentManagerError } from '../InstrumentManager';
import { InstrumentRepository } from '../../../data/repositories/InstrumentRepository';
import { AssetLoader } from '../../../infrastructure/assets/AssetLoader';
import { IRenderEngine } from '../../interfaces/IRenderEngine';
import { ISoundEngine } from '../../interfaces/ISoundEngine';
import { Instrument } from '../../entities/Instrument';

// Mock implementations
class MockRenderEngine implements IRenderEngine {
  loadModelCalls: any[] = [];
  
  initialize = jest.fn();
  loadModel = jest.fn(async (model) => {
    this.loadModelCalls.push(model);
  });
  render = jest.fn();
  setCamera = jest.fn();
  handleGesture = jest.fn();
  setQualityLevel = jest.fn();
  getPerformanceMetrics = jest.fn(() => ({
    fps: 60,
    drawCalls: 100,
    triangles: 5000,
    memoryUsage: 50,
  }));
  dispose = jest.fn();
}

class MockSoundEngine implements ISoundEngine {
  loadAudioSamplesCalls: any[] = [];
  
  initialize = jest.fn(async () => {});
  loadAudioSamples = jest.fn(async (samples) => {
    this.loadAudioSamplesCalls.push(samples);
  });
  playNote = jest.fn();
  stopNote = jest.fn();
  stopAll = jest.fn();
  setVolume = jest.fn();
  getMixerState = jest.fn(() => ({
    activeVoices: 0,
    maxVoices: 16,
    cpuLoad: 0.1,
  }));
  dispose = jest.fn();
}

// Helper to create mock instrument
function createMockInstrument(id: string): Instrument {
  return {
    id,
    name: {
      thai: `เครื่องดนตรี ${id}`,
      english: `Instrument ${id}`,
    },
    nationality: 'thai',
    playingMethod: 'striking',
    model3D: {
      modelId: `model-${id}`,
      filePath: `assets/models/${id}.glb`,
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
      samples: [
        {
          id: `audio-${id}-1`,
          noteId: 'C4',
          filePath: `assets/audio/${id}/c4.wav`,
          format: 'wav',
          sampleRate: 44100,
          bitDepth: 16,
          channels: 'stereo',
          duration: 2.5,
          loopable: false,
        },
      ],
      polyphony: 8,
    },
    interactionZones: [],
    culturalInfo: {
      description: { thai: 'คำอธิบาย', english: 'Description' },
      origin: { thai: 'ที่มา', english: 'Origin' },
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
}

describe('InstrumentManager', () => {
  let manager: InstrumentManager;
  let repository: InstrumentRepository;
  let assetLoader: AssetLoader;
  let renderEngine: MockRenderEngine;
  let soundEngine: MockSoundEngine;
  let mockInstrument1: Instrument;
  let mockInstrument2: Instrument;

  beforeEach(() => {
    // Create mock instruments
    mockInstrument1 = createMockInstrument('ranat-ek');
    mockInstrument2 = createMockInstrument('khong-wong');

    // Setup repository with mock instruments
    repository = new InstrumentRepository([mockInstrument1, mockInstrument2]);

    // Setup asset loader
    assetLoader = new AssetLoader();
    jest.spyOn(assetLoader, 'loadModel').mockResolvedValue({
      id: 'model-1',
      filePath: 'test.glb',
      format: 'glb',
      data: {},
    });
    jest.spyOn(assetLoader, 'loadAudio').mockResolvedValue({
      id: 'audio-1',
      filePath: 'test.wav',
      duration: 2.5,
      sound: {} as any,
    });

    // Setup engines
    renderEngine = new MockRenderEngine();
    soundEngine = new MockSoundEngine();

    // Create manager
    manager = new InstrumentManager(
      repository,
      assetLoader,
      renderEngine,
      soundEngine
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadInstrument', () => {
    it('should load an instrument successfully', async () => {
      const result = await manager.loadInstrument('ranat-ek');

      expect(result).toEqual(mockInstrument1);
      expect(result.id).toBe('ranat-ek');
      expect(assetLoader.loadModel).toHaveBeenCalledWith(
        mockInstrument1.model3D.filePath
      );
      expect(renderEngine.loadModel).toHaveBeenCalledWith(mockInstrument1.model3D);
      expect(soundEngine.loadAudioSamples).toHaveBeenCalledWith(
        mockInstrument1.audioSamples.samples
      );
    });

    it('should set loaded instrument as current instrument', async () => {
      await manager.loadInstrument('ranat-ek');

      const current = manager.getCurrentInstrument();
      expect(current).toEqual(mockInstrument1);
      expect(current?.id).toBe('ranat-ek');
    });

    it('should return cached instrument if already loaded', async () => {
      // Load first time
      await manager.loadInstrument('ranat-ek');
      
      // Clear mock calls
      jest.clearAllMocks();

      // Load second time
      const result = await manager.loadInstrument('ranat-ek');

      expect(result).toEqual(mockInstrument1);
      // Should not call asset loaders again
      expect(assetLoader.loadModel).not.toHaveBeenCalled();
      expect(renderEngine.loadModel).not.toHaveBeenCalled();
      expect(soundEngine.loadAudioSamples).not.toHaveBeenCalled();
    });

    it('should throw error for empty instrument ID', async () => {
      await expect(manager.loadInstrument('')).rejects.toThrow(
        InstrumentManagerError
      );
      await expect(manager.loadInstrument('')).rejects.toThrow(
        'Instrument ID cannot be empty'
      );
    });

    it('should throw error for non-existent instrument', async () => {
      await expect(manager.loadInstrument('non-existent')).rejects.toThrow(
        InstrumentManagerError
      );
      await expect(manager.loadInstrument('non-existent')).rejects.toThrow(
        'Instrument not found'
      );
    });

    it('should handle model load failure', async () => {
      jest.spyOn(assetLoader, 'loadModel').mockRejectedValue(
        new Error('Model file not found')
      );

      await expect(manager.loadInstrument('ranat-ek')).rejects.toThrow(
        InstrumentManagerError
      );
    });

    it('should handle audio load failure', async () => {
      jest.spyOn(assetLoader, 'loadAudio').mockRejectedValue(
        new Error('Audio file not found')
      );

      await expect(manager.loadInstrument('ranat-ek')).rejects.toThrow(
        InstrumentManagerError
      );
    });

    it('should retry loading on failure', async () => {
      let callCount = 0;
      jest.spyOn(assetLoader, 'loadModel').mockImplementation(async () => {
        callCount++;
        if (callCount < 2) {
          throw new Error('Temporary failure');
        }
        return {
          id: 'model-1',
          filePath: 'test.glb',
          format: 'glb',
          data: {},
        };
      });

      const result = await manager.loadInstrument('ranat-ek');

      expect(result).toEqual(mockInstrument1);
      expect(callCount).toBeGreaterThan(1);
    });

    it('should load multiple different instruments', async () => {
      await manager.loadInstrument('ranat-ek');
      await manager.loadInstrument('khong-wong');

      expect(manager.getLoadedInstrumentsCount()).toBe(2);
      expect(manager.isInstrumentLoaded('ranat-ek')).toBe(true);
      expect(manager.isInstrumentLoaded('khong-wong')).toBe(true);
    });

    it('should update current instrument when loading different instrument', async () => {
      await manager.loadInstrument('ranat-ek');
      expect(manager.getCurrentInstrument()?.id).toBe('ranat-ek');

      await manager.loadInstrument('khong-wong');
      expect(manager.getCurrentInstrument()?.id).toBe('khong-wong');
    });
  });

  describe('unloadInstrument', () => {
    it('should unload an instrument', async () => {
      await manager.loadInstrument('ranat-ek');
      expect(manager.isInstrumentLoaded('ranat-ek')).toBe(true);

      manager.unloadInstrument('ranat-ek');

      expect(manager.isInstrumentLoaded('ranat-ek')).toBe(false);
      expect(soundEngine.stopAll).toHaveBeenCalled();
    });

    it('should clear current instrument if unloading current', async () => {
      await manager.loadInstrument('ranat-ek');
      expect(manager.getCurrentInstrument()?.id).toBe('ranat-ek');

      manager.unloadInstrument('ranat-ek');

      expect(manager.getCurrentInstrument()).toBeNull();
    });

    it('should not clear current instrument if unloading different instrument', async () => {
      await manager.loadInstrument('ranat-ek');
      await manager.loadInstrument('khong-wong');
      expect(manager.getCurrentInstrument()?.id).toBe('khong-wong');

      manager.unloadInstrument('ranat-ek');

      expect(manager.getCurrentInstrument()?.id).toBe('khong-wong');
    });

    it('should handle unloading non-existent instrument gracefully', () => {
      expect(() => manager.unloadInstrument('non-existent')).not.toThrow();
    });

    it('should handle empty instrument ID gracefully', () => {
      expect(() => manager.unloadInstrument('')).not.toThrow();
    });

    it('should stop all sounds when unloading', async () => {
      await manager.loadInstrument('ranat-ek');
      
      manager.unloadInstrument('ranat-ek');

      expect(soundEngine.stopAll).toHaveBeenCalled();
    });
  });

  describe('getCurrentInstrument', () => {
    it('should return null when no instrument is loaded', () => {
      expect(manager.getCurrentInstrument()).toBeNull();
    });

    it('should return current instrument after loading', async () => {
      await manager.loadInstrument('ranat-ek');

      const current = manager.getCurrentInstrument();
      expect(current).not.toBeNull();
      expect(current?.id).toBe('ranat-ek');
    });

    it('should return null after unloading current instrument', async () => {
      await manager.loadInstrument('ranat-ek');
      manager.unloadInstrument('ranat-ek');

      expect(manager.getCurrentInstrument()).toBeNull();
    });
  });

  describe('preloadInstruments', () => {
    it('should preload multiple instruments', async () => {
      await manager.preloadInstruments(['ranat-ek', 'khong-wong']);

      expect(manager.isInstrumentLoaded('ranat-ek')).toBe(true);
      expect(manager.isInstrumentLoaded('khong-wong')).toBe(true);
    });

    it('should skip already loaded instruments', async () => {
      await manager.loadInstrument('ranat-ek');
      jest.clearAllMocks();

      await manager.preloadInstruments(['ranat-ek', 'khong-wong']);

      // ranat-ek should not be loaded again
      expect(assetLoader.loadModel).toHaveBeenCalledTimes(1); // Only for khong-wong
    });

    it('should handle empty array gracefully', async () => {
      await expect(manager.preloadInstruments([])).resolves.not.toThrow();
    });

    it('should filter out invalid instrument IDs', async () => {
      await manager.preloadInstruments(['', '  ', 'ranat-ek']);

      expect(manager.isInstrumentLoaded('ranat-ek')).toBe(true);
      expect(manager.getLoadedInstrumentsCount()).toBe(1);
    });

    it('should continue preloading even if one instrument fails', async () => {
      // Make first instrument fail
      jest.spyOn(repository, 'getInstrumentById').mockImplementation((id) => {
        if (id === 'ranat-ek') {
          return null; // Simulate not found
        }
        return mockInstrument2;
      });

      await manager.preloadInstruments(['ranat-ek', 'khong-wong']);

      // khong-wong should still be loaded
      expect(manager.isInstrumentLoaded('khong-wong')).toBe(true);
    });

    it('should respect preloading disabled config', async () => {
      const managerNoPreload = new InstrumentManager(
        repository,
        assetLoader,
        renderEngine,
        soundEngine,
        { enablePreloading: false }
      );

      await managerNoPreload.preloadInstruments(['ranat-ek']);

      expect(managerNoPreload.isInstrumentLoaded('ranat-ek')).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should return correct loaded instruments count', async () => {
      expect(manager.getLoadedInstrumentsCount()).toBe(0);

      await manager.loadInstrument('ranat-ek');
      expect(manager.getLoadedInstrumentsCount()).toBe(1);

      await manager.loadInstrument('khong-wong');
      expect(manager.getLoadedInstrumentsCount()).toBe(2);

      manager.unloadInstrument('ranat-ek');
      expect(manager.getLoadedInstrumentsCount()).toBe(1);
    });

    it('should check if instrument is loaded', async () => {
      expect(manager.isInstrumentLoaded('ranat-ek')).toBe(false);

      await manager.loadInstrument('ranat-ek');
      expect(manager.isInstrumentLoaded('ranat-ek')).toBe(true);

      manager.unloadInstrument('ranat-ek');
      expect(manager.isInstrumentLoaded('ranat-ek')).toBe(false);
    });

    it('should unload all instruments', async () => {
      await manager.loadInstrument('ranat-ek');
      await manager.loadInstrument('khong-wong');
      expect(manager.getLoadedInstrumentsCount()).toBe(2);

      manager.unloadAll();

      expect(manager.getLoadedInstrumentsCount()).toBe(0);
      expect(manager.getCurrentInstrument()).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should include instrument ID in error', async () => {
      try {
        await manager.loadInstrument('non-existent');
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(InstrumentManagerError);
        const err = error as InstrumentManagerError;
        expect(err.instrumentId).toBe('non-existent');
        expect(err.code).toBe('INSTRUMENT_NOT_FOUND');
      }
    });

    it('should include cause in error when asset loading fails', async () => {
      const originalError = new Error('Network timeout');
      jest.spyOn(assetLoader, 'loadModel').mockRejectedValue(originalError);

      try {
        await manager.loadInstrument('ranat-ek');
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(InstrumentManagerError);
        const err = error as InstrumentManagerError;
        expect(err.code).toBe('LOAD_FAILED');
        expect(err.cause).toBeDefined();
      }
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace-only instrument ID', async () => {
      await expect(manager.loadInstrument('   ')).rejects.toThrow(
        InstrumentManagerError
      );
    });

    it('should handle concurrent loads of same instrument', async () => {
      const promise1 = manager.loadInstrument('ranat-ek');
      const promise2 = manager.loadInstrument('ranat-ek');

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toEqual(result2);
      expect(manager.getLoadedInstrumentsCount()).toBe(1);
    });

    it('should handle instrument with no audio samples', async () => {
      const instrumentNoAudio = {
        ...mockInstrument1,
        id: 'no-audio',
        audioSamples: {
          samples: [],
          polyphony: 0,
        },
      };
      repository.addInstrument(instrumentNoAudio);

      const result = await manager.loadInstrument('no-audio');

      expect(result).toEqual(instrumentNoAudio);
      expect(soundEngine.loadAudioSamples).toHaveBeenCalledWith([]);
    });
  });
});
