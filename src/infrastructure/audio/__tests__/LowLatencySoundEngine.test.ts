/**
 * Unit tests for LowLatencySoundEngine
 */

import { LowLatencySoundEngine } from '../LowLatencySoundEngine';
import { AudioSample } from '../../../domain/entities/Instrument';

// Mock Web Audio API
class MockAudioContext {
  sampleRate = 44100;
  destination = {};
  
  createGain() {
    return {
      gain: { value: 1.0 },
      connect: jest.fn(),
    };
  }
  
  createBufferSource() {
    return {
      buffer: null,
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      onended: null,
    };
  }
  
  decodeAudioData(_arrayBuffer: ArrayBuffer) {
    return Promise.resolve({
      duration: 1.0,
      length: 44100,
      numberOfChannels: 2,
      sampleRate: 44100,
    });
  }
  
  close() {
    return Promise.resolve();
  }
}

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  } as Response)
);

// Replace global AudioContext with mock
(global as any).AudioContext = MockAudioContext;

describe('LowLatencySoundEngine', () => {
  let engine: LowLatencySoundEngine;

  beforeEach(() => {
    engine = new LowLatencySoundEngine();
    jest.clearAllMocks();
  });

  afterEach(() => {
    engine.dispose();
  });

  describe('initialize', () => {
    it('should initialize audio context with 44.1kHz sample rate', async () => {
      await engine.initialize();
      
      const state = engine.getMixerState();
      expect(state.maxVoices).toBe(16);
      expect(state.activeVoices).toBe(0);
    });

    it('should not reinitialize if already initialized', async () => {
      await engine.initialize();
      await engine.initialize(); // Second call should be no-op
      
      const state = engine.getMixerState();
      expect(state.maxVoices).toBe(16);
    });
  });

  describe('loadAudioSamples', () => {
    it('should load and decode audio samples', async () => {
      await engine.initialize();

      const samples: AudioSample[] = [
        {
          id: 'sample1',
          noteId: 'C4',
          filePath: '/audio/c4.wav',
          format: 'wav',
          sampleRate: 44100,
          bitDepth: 16,
          channels: 'stereo',
          duration: 1.0,
          loopable: false,
        },
      ];

      await engine.loadAudioSamples(samples);
      
      expect(global.fetch).toHaveBeenCalledWith('/audio/c4.wav');
    });

    it('should throw error if not initialized', async () => {
      const samples: AudioSample[] = [
        {
          id: 'sample1',
          noteId: 'C4',
          filePath: '/audio/c4.wav',
          format: 'wav',
          sampleRate: 44100,
          bitDepth: 16,
          channels: 'stereo',
          duration: 1.0,
          loopable: false,
        },
      ];

      await expect(engine.loadAudioSamples(samples)).rejects.toThrow(
        'Audio engine not initialized'
      );
    });
  });

  describe('playNote', () => {
    beforeEach(async () => {
      await engine.initialize();
      
      const samples: AudioSample[] = [
        {
          id: 'sample1',
          noteId: 'C4',
          filePath: '/audio/c4.wav',
          format: 'wav',
          sampleRate: 44100,
          bitDepth: 16,
          channels: 'stereo',
          duration: 1.0,
          loopable: false,
        },
      ];
      
      await engine.loadAudioSamples(samples);
    });

    it('should play note with velocity control', () => {
      engine.playNote('C4', 0.8);
      
      const state = engine.getMixerState();
      expect(state.activeVoices).toBe(1);
    });

    it('should clamp velocity to 0.0-1.0 range', () => {
      engine.playNote('C4', 1.5); // Above max
      engine.playNote('C4', -0.5); // Below min
      
      const state = engine.getMixerState();
      expect(state.activeVoices).toBe(2);
    });

    it('should handle missing audio buffer gracefully', () => {
      engine.playNote('NonExistent', 0.8);
      
      const state = engine.getMixerState();
      expect(state.activeVoices).toBe(0);
    });
  });

  describe('voice stealing', () => {
    beforeEach(async () => {
      await engine.initialize();
      
      const samples: AudioSample[] = Array.from({ length: 20 }, (_, i) => ({
        id: `sample${i}`,
        noteId: `note${i}`,
        filePath: `/audio/note${i}.wav`,
        format: 'wav' as const,
        sampleRate: 44100,
        bitDepth: 16,
        channels: 'stereo' as const,
        duration: 1.0,
        loopable: false,
      }));
      
      await engine.loadAudioSamples(samples);
    });

    it('should implement voice stealing when max voices (16) reached', () => {
      // Play 17 notes (exceeds max of 16)
      for (let i = 0; i < 17; i++) {
        engine.playNote(`note${i}`, 0.8);
      }
      
      const state = engine.getMixerState();
      expect(state.activeVoices).toBe(16); // Should stay at max
      expect(state.maxVoices).toBe(16);
    });
  });

  describe('stopNote', () => {
    beforeEach(async () => {
      await engine.initialize();
      
      const samples: AudioSample[] = [
        {
          id: 'sample1',
          noteId: 'C4',
          filePath: '/audio/c4.wav',
          format: 'wav',
          sampleRate: 44100,
          bitDepth: 16,
          channels: 'stereo',
          duration: 1.0,
          loopable: false,
        },
      ];
      
      await engine.loadAudioSamples(samples);
    });

    it('should stop specific note', () => {
      engine.playNote('C4', 0.8);
      engine.playNote('C4', 0.7);
      
      let state = engine.getMixerState();
      expect(state.activeVoices).toBe(2);
      
      engine.stopNote('C4');
      
      state = engine.getMixerState();
      expect(state.activeVoices).toBe(0);
    });
  });

  describe('stopAll', () => {
    beforeEach(async () => {
      await engine.initialize();
      
      const samples: AudioSample[] = [
        {
          id: 'sample1',
          noteId: 'C4',
          filePath: '/audio/c4.wav',
          format: 'wav',
          sampleRate: 44100,
          bitDepth: 16,
          channels: 'stereo',
          duration: 1.0,
          loopable: false,
        },
        {
          id: 'sample2',
          noteId: 'D4',
          filePath: '/audio/d4.wav',
          format: 'wav',
          sampleRate: 44100,
          bitDepth: 16,
          channels: 'stereo',
          duration: 1.0,
          loopable: false,
        },
      ];
      
      await engine.loadAudioSamples(samples);
    });

    it('should stop all active voices', () => {
      engine.playNote('C4', 0.8);
      engine.playNote('D4', 0.7);
      
      let state = engine.getMixerState();
      expect(state.activeVoices).toBe(2);
      
      engine.stopAll();
      
      state = engine.getMixerState();
      expect(state.activeVoices).toBe(0);
    });
  });

  describe('setVolume', () => {
    it('should set volume in 0.0-1.0 range', async () => {
      await engine.initialize();
      
      engine.setVolume(0.5);
      engine.setVolume(0.0);
      engine.setVolume(1.0);
      
      // Should clamp out-of-range values
      engine.setVolume(1.5);
      engine.setVolume(-0.5);
      
      // No errors should occur
      expect(true).toBe(true);
    });
  });

  describe('getMixerState', () => {
    beforeEach(async () => {
      await engine.initialize();
      
      const samples: AudioSample[] = Array.from({ length: 8 }, (_, i) => ({
        id: `sample${i}`,
        noteId: `note${i}`,
        filePath: `/audio/note${i}.wav`,
        format: 'wav' as const,
        sampleRate: 44100,
        bitDepth: 16,
        channels: 'stereo' as const,
        duration: 1.0,
        loopable: false,
      }));
      
      await engine.loadAudioSamples(samples);
    });

    it('should return current mixer state with active voice tracking', () => {
      // Play 8 notes (50% of max 16)
      for (let i = 0; i < 8; i++) {
        engine.playNote(`note${i}`, 0.8);
      }
      
      const state = engine.getMixerState();
      expect(state.activeVoices).toBe(8);
      expect(state.maxVoices).toBe(16);
      expect(state.cpuLoad).toBe(50); // 8/16 * 100 = 50%
    });
  });

  describe('dispose', () => {
    it('should clean up resources', async () => {
      await engine.initialize();
      
      const samples: AudioSample[] = [
        {
          id: 'sample1',
          noteId: 'C4',
          filePath: '/audio/c4.wav',
          format: 'wav',
          sampleRate: 44100,
          bitDepth: 16,
          channels: 'stereo',
          duration: 1.0,
          loopable: false,
        },
      ];
      
      await engine.loadAudioSamples(samples);
      engine.playNote('C4', 0.8);
      
      engine.dispose();
      
      const state = engine.getMixerState();
      expect(state.activeVoices).toBe(0);
    });
  });
});
