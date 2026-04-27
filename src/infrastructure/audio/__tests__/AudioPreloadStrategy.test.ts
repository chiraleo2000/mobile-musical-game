/**
 * Unit tests for AudioPreloadStrategy
 * 
 * Tests priority-based loading, background loading, and progress tracking
 */

import { AudioPreloadStrategy } from '../AudioPreloadStrategy';
import { LowLatencySoundEngine } from '../LowLatencySoundEngine';
import { AudioSample, AudioSampleSet } from '../../../domain/entities/Instrument';

// Mock LowLatencySoundEngine
jest.mock('../LowLatencySoundEngine');

describe('AudioPreloadStrategy', () => {
  let mockSoundEngine: jest.Mocked<LowLatencySoundEngine>;
  let strategy: AudioPreloadStrategy;

  beforeEach(() => {
    // Create mock sound engine
    mockSoundEngine = new LowLatencySoundEngine() as jest.Mocked<LowLatencySoundEngine>;
    mockSoundEngine.loadAudioSamples = jest.fn().mockResolvedValue(undefined);

    strategy = new AudioPreloadStrategy(mockSoundEngine);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('preloadInstrument', () => {
    it('should handle empty sample set', async () => {
      const sampleSet: AudioSampleSet = {
        samples: [],
        polyphony: 4,
      };

      await strategy.preloadInstrument(sampleSet);

      const progress = strategy.getProgress();
      expect(progress.totalSamples).toBe(0);
      expect(progress.loadedSamples).toBe(0);
      expect(progress.priorityLoaded).toBe(true);
      expect(progress.percentage).toBe(100);
      expect(mockSoundEngine.loadAudioSamples).not.toHaveBeenCalled();
    });

    it('should load all samples when there are only 1-2 samples', async () => {
      const samples: AudioSample[] = [
        createMockSample('sample1', 'C4'),
        createMockSample('sample2', 'D4'),
      ];

      const sampleSet: AudioSampleSet = {
        samples,
        polyphony: 4,
      };

      await strategy.preloadInstrument(sampleSet);

      // All samples should be loaded as priority
      expect(mockSoundEngine.loadAudioSamples).toHaveBeenCalledTimes(1);
      expect(mockSoundEngine.loadAudioSamples).toHaveBeenCalledWith(samples);

      const progress = strategy.getProgress();
      expect(progress.priorityLoaded).toBe(true);
      expect(progress.totalSamples).toBe(2);
    });

    it('should load middle-range notes first (priority loading)', async () => {
      const samples: AudioSample[] = [
        createMockSample('s1', 'C3'),
        createMockSample('s2', 'D3'),
        createMockSample('s3', 'E3'),
        createMockSample('s4', 'F3'),
        createMockSample('s5', 'G3'),
        createMockSample('s6', 'A3'),
        createMockSample('s7', 'B3'),
        createMockSample('s8', 'C4'),
      ];

      const sampleSet: AudioSampleSet = {
        samples,
        polyphony: 8,
      };

      await strategy.preloadInstrument(sampleSet);

      // Should be called at least once for priority samples
      expect(mockSoundEngine.loadAudioSamples).toHaveBeenCalled();

      // First call should be priority samples (middle 50%)
      const firstCall = mockSoundEngine.loadAudioSamples.mock.calls[0][0];
      expect(firstCall.length).toBeGreaterThan(0);
      expect(firstCall.length).toBeLessThan(samples.length);

      const progress = strategy.getProgress();
      expect(progress.priorityLoaded).toBe(true);
      expect(progress.totalSamples).toBe(8);
    });

    it('should track loading progress correctly', async () => {
      const samples: AudioSample[] = [
        createMockSample('s1', 'C3'),
        createMockSample('s2', 'E3'),
        createMockSample('s3', 'G3'),
        createMockSample('s4', 'C4'),
      ];

      const sampleSet: AudioSampleSet = {
        samples,
        polyphony: 4,
      };

      // Initial progress
      let progress = strategy.getProgress();
      expect(progress.loadedSamples).toBe(0);
      expect(progress.percentage).toBe(0);

      await strategy.preloadInstrument(sampleSet);

      // After priority loading
      progress = strategy.getProgress();
      expect(progress.totalSamples).toBe(4);
      expect(progress.priorityLoaded).toBe(true);
      expect(progress.loadedSamples).toBeGreaterThan(0);
    });

    it('should load remaining samples in background', async () => {
      const samples: AudioSample[] = [
        createMockSample('s1', 'C3'),
        createMockSample('s2', 'D3'),
        createMockSample('s3', 'E3'),
        createMockSample('s4', 'F3'),
        createMockSample('s5', 'G3'),
        createMockSample('s6', 'A3'),
      ];

      const sampleSet: AudioSampleSet = {
        samples,
        polyphony: 6,
      };

      await strategy.preloadInstrument(sampleSet);

      // Priority samples should be loaded immediately
      expect(mockSoundEngine.loadAudioSamples).toHaveBeenCalled();
      
      const progress = strategy.getProgress();
      expect(progress.priorityLoaded).toBe(true);

      // Background loading happens asynchronously
      // Wait a bit for background loading to trigger
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should have been called for background samples too
      expect(mockSoundEngine.loadAudioSamples).toHaveBeenCalledTimes(2);
    });

    it('should handle background loading errors gracefully', async () => {
      const samples: AudioSample[] = [
        createMockSample('s1', 'C3'),
        createMockSample('s2', 'D3'),
        createMockSample('s3', 'E3'),
        createMockSample('s4', 'F3'),
      ];

      const sampleSet: AudioSampleSet = {
        samples,
        polyphony: 4,
      };

      // Make background loading fail
      let callCount = 0;
      mockSoundEngine.loadAudioSamples.mockImplementation(async () => {
        callCount++;
        if (callCount > 1) {
          throw new Error('Background load failed');
        }
      });

      // Should not throw even if background loading fails
      await expect(strategy.preloadInstrument(sampleSet)).resolves.not.toThrow();

      const progress = strategy.getProgress();
      expect(progress.priorityLoaded).toBe(true);
    });
  });

  describe('getProgress', () => {
    it('should return initial progress state', () => {
      const progress = strategy.getProgress();

      expect(progress).toEqual({
        totalSamples: 0,
        loadedSamples: 0,
        priorityLoaded: false,
        percentage: 0,
      });
    });

    it('should return a copy of progress (not reference)', () => {
      const progress1 = strategy.getProgress();
      const progress2 = strategy.getProgress();

      expect(progress1).toEqual(progress2);
      expect(progress1).not.toBe(progress2); // Different objects
    });
  });

  describe('note frequency sorting', () => {
    it('should sort standard note names correctly', async () => {
      const samples: AudioSample[] = [
        createMockSample('s1', 'C4'),
        createMockSample('s2', 'A3'),
        createMockSample('s3', 'E4'),
        createMockSample('s4', 'G3'),
      ];

      const sampleSet: AudioSampleSet = {
        samples,
        polyphony: 4,
      };

      await strategy.preloadInstrument(sampleSet);

      // Should load middle range (sorted: A3, G3, C4, E4 -> middle would be G3, C4)
      expect(mockSoundEngine.loadAudioSamples).toHaveBeenCalled();
    });

    it('should handle sharp and flat notes', async () => {
      const samples: AudioSample[] = [
        createMockSample('s1', 'C#4'),
        createMockSample('s2', 'Db4'),
        createMockSample('s3', 'F#3'),
        createMockSample('s4', 'Bb3'),
      ];

      const sampleSet: AudioSampleSet = {
        samples,
        polyphony: 4,
      };

      await strategy.preloadInstrument(sampleSet);

      expect(mockSoundEngine.loadAudioSamples).toHaveBeenCalled();
    });

    it('should handle non-standard note names', async () => {
      const samples: AudioSample[] = [
        createMockSample('s1', 'strike1'),
        createMockSample('s2', 'strike2'),
        createMockSample('s3', 'strike3'),
        createMockSample('s4', 'strike4'),
      ];

      const sampleSet: AudioSampleSet = {
        samples,
        polyphony: 4,
      };

      // Should not throw with non-standard names
      await expect(strategy.preloadInstrument(sampleSet)).resolves.not.toThrow();
      expect(mockSoundEngine.loadAudioSamples).toHaveBeenCalled();
    });
  });

  describe('priority sample selection', () => {
    it('should select middle 50% of samples as priority', async () => {
      const samples: AudioSample[] = Array.from({ length: 10 }, (_, i) =>
        createMockSample(`s${i}`, `C${i}`)
      );

      const sampleSet: AudioSampleSet = {
        samples,
        polyphony: 10,
      };

      await strategy.preloadInstrument(sampleSet);

      const firstCall = mockSoundEngine.loadAudioSamples.mock.calls[0][0];
      
      // Middle 50% of 10 samples should be around 5 samples
      expect(firstCall.length).toBeGreaterThanOrEqual(4);
      expect(firstCall.length).toBeLessThanOrEqual(6);
    });

    it('should not duplicate samples between priority and background', async () => {
      const samples: AudioSample[] = [
        createMockSample('s1', 'C3'),
        createMockSample('s2', 'D3'),
        createMockSample('s3', 'E3'),
        createMockSample('s4', 'F3'),
        createMockSample('s5', 'G3'),
        createMockSample('s6', 'A3'),
      ];

      const sampleSet: AudioSampleSet = {
        samples,
        polyphony: 6,
      };

      await strategy.preloadInstrument(sampleSet);

      // Wait for background loading
      await new Promise(resolve => setTimeout(resolve, 10));

      // Collect all loaded sample IDs
      const allLoadedIds = new Set<string>();
      mockSoundEngine.loadAudioSamples.mock.calls.forEach(call => {
        call[0].forEach((sample: AudioSample) => {
          expect(allLoadedIds.has(sample.id)).toBe(false); // No duplicates
          allLoadedIds.add(sample.id);
        });
      });

      // All samples should be loaded exactly once
      expect(allLoadedIds.size).toBe(6);
    });
  });

  describe('percentage calculation', () => {
    it('should calculate percentage correctly after priority loading', async () => {
      const samples: AudioSample[] = Array.from({ length: 8 }, (_, i) =>
        createMockSample(`s${i}`, `C${i}`)
      );

      const sampleSet: AudioSampleSet = {
        samples,
        polyphony: 8,
      };

      await strategy.preloadInstrument(sampleSet);

      const progress = strategy.getProgress();
      expect(progress.percentage).toBeGreaterThan(0);
      expect(progress.percentage).toBeLessThanOrEqual(100);
    });

    it('should reach 100% after all samples loaded', async () => {
      const samples: AudioSample[] = [
        createMockSample('s1', 'C3'),
        createMockSample('s2', 'D3'),
      ];

      const sampleSet: AudioSampleSet = {
        samples,
        polyphony: 2,
      };

      await strategy.preloadInstrument(sampleSet);

      // Wait for background loading
      await new Promise(resolve => setTimeout(resolve, 10));

      const progress = strategy.getProgress();
      expect(progress.percentage).toBe(100);
      expect(progress.loadedSamples).toBe(2);
    });
  });
});

/**
 * Helper function to create mock audio samples
 */
function createMockSample(id: string, noteId: string): AudioSample {
  return {
    id,
    noteId,
    filePath: `/audio/${id}.wav`,
    format: 'wav',
    sampleRate: 44100,
    bitDepth: 16,
    channels: 'mono',
    duration: 1.0,
    loopable: false,
  };
}
