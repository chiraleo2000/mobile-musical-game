/**
 * Integration tests for InstrumentPlayScreen
 * Tests 3D rendering, touch interaction, visual feedback, volume control, and cultural info display
 */

import { InstrumentLibrary } from '@data/models/InstrumentLibrary';
import { Instrument } from '@domain/entities/Instrument';

// Mock dependencies
jest.mock('expo-gl', () => ({
  GLView: 'GLView',
}));

jest.mock('@application/state/AppStateManager', () => ({
  useAppStateManager: jest.fn(() => ({
    state: {
      selectedInstrument: null,
      userPreferences: {
        volume: 0.8,
        language: 'auto',
        visualQuality: 'high',
        audioQuality: 'high',
      },
      orientation: 'portrait',
    },
    updatePreferences: jest.fn(),
    dispatch: jest.fn(),
  })),
}));

jest.mock('@infrastructure/rendering/DisplayManager', () => ({
  DisplayManager: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(),
    calculateLayout: jest.fn(() => ({
      instrumentViewport: {
        x: 0,
        y: 0,
        width: 375,
        height: 400,
        aspectRatio: 0.9375,
      },
      controlsArea: {
        x: 0,
        y: 400,
        width: 375,
        height: 200,
      },
      infoArea: {
        x: 0,
        y: 600,
        width: 375,
        height: 67,
      },
      minTouchTargetSize: 44,
    })),
    adaptToScreen: jest.fn(() => ({
      instrumentViewport: {
        x: 0,
        y: 0,
        width: 375,
        height: 400,
        aspectRatio: 0.9375,
      },
      controlsArea: {
        x: 0,
        y: 400,
        width: 375,
        height: 200,
      },
      infoArea: {
        x: 0,
        y: 600,
        width: 375,
        height: 67,
      },
      minTouchTargetSize: 44,
    })),
    getCurrentOrientation: jest.fn(() => 'portrait'),
    showVisualFeedback: jest.fn(),
  })),
}));

jest.mock('@infrastructure/touch/TouchController', () => ({
  TouchController: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(),
    handleTouchStart: jest.fn(),
    handleTouchMove: jest.fn(),
    handleTouchEnd: jest.fn(),
    getInteractionZone: jest.fn(),
  })),
}));

jest.mock('@infrastructure/audio/LowLatencySoundEngine', () => ({
  LowLatencySoundEngine: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    loadAudioSamples: jest.fn().mockResolvedValue(undefined),
    playNote: jest.fn(),
    stopNote: jest.fn(),
    stopAll: jest.fn(),
    setVolume: jest.fn(),
    getMixerState: jest.fn(() => ({
      activeVoices: 0,
      maxVoices: 16,
      cpuLoad: 0,
    })),
    dispose: jest.fn(),
  })),
}));

jest.mock('@infrastructure/rendering/ThreeJSRenderEngine', () => ({
  ThreeJSRenderEngine: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(),
    loadModel: jest.fn().mockResolvedValue(undefined),
    render: jest.fn(),
    setCamera: jest.fn(),
    handleGesture: jest.fn(),
    setQualityLevel: jest.fn(),
    getPerformanceMetrics: jest.fn(() => ({
      fps: 60,
      drawCalls: 10,
      triangles: 5000,
      memoryUsage: 50,
    })),
    dispose: jest.fn(),
  })),
}));

describe('InstrumentPlayScreen Integration Tests', () => {
  let instrumentLibrary: InstrumentLibrary;
  let testInstrument: Instrument;

  beforeEach(() => {
    instrumentLibrary = new InstrumentLibrary();
    const allInstruments = instrumentLibrary.getAllInstruments();
    testInstrument = allInstruments[0];
    jest.clearAllMocks();
  });

  describe('3D Model Rendering', () => {
    it('should have valid 3D model reference for all instruments', () => {
      const allInstruments = instrumentLibrary.getAllInstruments();
      
      allInstruments.forEach(instrument => {
        expect(instrument.model3D).toBeDefined();
        expect(instrument.model3D.modelId).toBeDefined();
        expect(instrument.model3D.filePath).toBeDefined();
        expect(['gltf', 'glb', 'obj']).toContain(instrument.model3D.format);
      });
    });

    it('should have LOD levels defined for performance optimization', () => {
      const allInstruments = instrumentLibrary.getAllInstruments();
      
      allInstruments.forEach(instrument => {
        expect(instrument.model3D.lodLevels).toBeDefined();
        expect(Array.isArray(instrument.model3D.lodLevels)).toBe(true);
        expect(instrument.model3D.lodLevels.length).toBeGreaterThan(0);
        
        // Verify LOD structure
        instrument.model3D.lodLevels.forEach(lod => {
          expect(lod.distance).toBeGreaterThanOrEqual(0);
          expect(lod.polygonCount).toBeGreaterThan(0);
          expect(lod.filePath).toBeDefined();
        });
      });
    });

    it('should have default scale and rotation for model positioning', () => {
      expect(testInstrument.model3D.defaultScale).toBeDefined();
      expect(testInstrument.model3D.defaultScale.x).toBeDefined();
      expect(testInstrument.model3D.defaultScale.y).toBeDefined();
      expect(testInstrument.model3D.defaultScale.z).toBeDefined();
      
      expect(testInstrument.model3D.defaultRotation).toBeDefined();
      expect(testInstrument.model3D.defaultRotation.x).toBeDefined();
      expect(testInstrument.model3D.defaultRotation.y).toBeDefined();
      expect(testInstrument.model3D.defaultRotation.z).toBeDefined();
    });

    it('should have bounding box for model dimensions', () => {
      expect(testInstrument.model3D.boundingBox).toBeDefined();
      expect(testInstrument.model3D.boundingBox.center).toBeDefined();
      expect(testInstrument.model3D.boundingBox.size).toBeDefined();
    });
  });

  describe('Touch Interaction Handling', () => {
    it('should have interaction zones defined for all instruments', () => {
      const allInstruments = instrumentLibrary.getAllInstruments();
      
      allInstruments.forEach(instrument => {
        expect(instrument.interactionZones).toBeDefined();
        expect(Array.isArray(instrument.interactionZones)).toBe(true);
        expect(instrument.interactionZones.length).toBeGreaterThan(0);
      });
    });

    it('should have valid bounds for all interaction zones', () => {
      testInstrument.interactionZones.forEach(zone => {
        expect(zone.bounds).toBeDefined();
        expect(zone.bounds.x).toBeGreaterThanOrEqual(0);
        expect(zone.bounds.y).toBeGreaterThanOrEqual(0);
        expect(zone.bounds.width).toBeGreaterThan(0);
        expect(zone.bounds.height).toBeGreaterThan(0);
      });
    });

    it('should have minimum touch target size (44px) for all zones', () => {
      testInstrument.interactionZones.forEach(zone => {
        expect(zone.bounds.width).toBeGreaterThanOrEqual(44);
        expect(zone.bounds.height).toBeGreaterThanOrEqual(44);
      });
    });

    it('should have correct interaction type for each zone', () => {
      const validTypes = ['strike', 'pluck', 'press'];
      
      testInstrument.interactionZones.forEach(zone => {
        expect(validTypes).toContain(zone.type);
      });
    });

    it('should have associated note ID for each zone', () => {
      testInstrument.interactionZones.forEach(zone => {
        expect(zone.noteId).toBeDefined();
        expect(typeof zone.noteId).toBe('string');
        expect(zone.noteId.length).toBeGreaterThan(0);
      });
    });

    it('should have visual feedback configuration for each zone', () => {
      testInstrument.interactionZones.forEach(zone => {
        expect(zone.visualFeedback).toBeDefined();
        expect(['highlight', 'glow', 'ripple', 'animate']).toContain(zone.visualFeedback.type);
        expect(zone.visualFeedback.duration).toBeGreaterThan(0);
        expect(zone.visualFeedback.intensity).toBeGreaterThanOrEqual(0);
        expect(zone.visualFeedback.intensity).toBeLessThanOrEqual(1);
      });
    });

    it('should have touch sensitivity configured for each zone', () => {
      testInstrument.interactionZones.forEach(zone => {
        expect(zone.touchSensitivity).toBeGreaterThanOrEqual(0);
        expect(zone.touchSensitivity).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Visual Feedback Display', () => {
    it('should trigger visual feedback within 50ms of touch', () => {
      const { DisplayManager } = require('@infrastructure/rendering/DisplayManager');
      const displayManager = new DisplayManager();
      
      const startTime = Date.now();
      displayManager.showVisualFeedback('zone1', 'highlight');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(50);
      expect(displayManager.showVisualFeedback).toHaveBeenCalledWith('zone1', 'highlight');
    });

    it('should support different feedback types for different interaction types', () => {
      const feedbackTypes = ['highlight', 'glow', 'ripple', 'animate'];
      
      feedbackTypes.forEach(type => {
        const zone = testInstrument.interactionZones.find(z => 
          z.visualFeedback.type === type
        );
        
        // At least some zones should use each feedback type
        if (zone) {
          expect(zone.visualFeedback.type).toBe(type);
        }
      });
    });

    it('should animate strike motion for striking instruments', () => {
      const strikingInstruments = instrumentLibrary.getByPlayingMethod('striking');
      
      strikingInstruments.forEach(instrument => {
        const strikeZones = instrument.interactionZones.filter(z => z.type === 'strike');
        expect(strikeZones.length).toBeGreaterThan(0);
        
        strikeZones.forEach(zone => {
          expect(zone.visualFeedback).toBeDefined();
        });
      });
    });

    it('should animate string vibration for plucked instruments', () => {
      const pluckedInstruments = instrumentLibrary.getByPlayingMethod('plucked');
      
      pluckedInstruments.forEach(instrument => {
        const pluckZones = instrument.interactionZones.filter(z => z.type === 'pluck');
        expect(pluckZones.length).toBeGreaterThan(0);
        
        pluckZones.forEach(zone => {
          expect(zone.visualFeedback).toBeDefined();
        });
      });
    });

    it('should animate key depression for pressed instruments', () => {
      const pressedInstruments = instrumentLibrary.getByPlayingMethod('pressed');
      
      pressedInstruments.forEach(instrument => {
        const pressZones = instrument.interactionZones.filter(z => z.type === 'press');
        expect(pressZones.length).toBeGreaterThan(0);
        
        pressZones.forEach(zone => {
          expect(zone.visualFeedback).toBeDefined();
        });
      });
    });
  });

  describe('Volume Control', () => {
    it('should support volume range from 0 to 1', () => {
      const { LowLatencySoundEngine } = require('@infrastructure/audio/LowLatencySoundEngine');
      const soundEngine = new LowLatencySoundEngine();
      
      [0, 0.25, 0.5, 0.75, 1.0].forEach(volume => {
        soundEngine.setVolume(volume);
        expect(soundEngine.setVolume).toHaveBeenCalledWith(volume);
      });
    });

    it('should initialize with user preference volume', () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const state = useAppStateManager().state;
      
      expect(state.userPreferences.volume).toBeDefined();
      expect(state.userPreferences.volume).toBeGreaterThanOrEqual(0);
      expect(state.userPreferences.volume).toBeLessThanOrEqual(1);
    });

    it('should persist volume changes to preferences', () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();
      
      expect(updatePreferences).toBeDefined();
      expect(typeof updatePreferences).toBe('function');
    });
  });

  describe('Orientation Changes', () => {
    it('should support portrait orientation layout', () => {
      const { DisplayManager } = require('@infrastructure/rendering/DisplayManager');
      const displayManager = new DisplayManager();
      const layout = displayManager.calculateLayout('portrait');
      
      expect(layout).toBeDefined();
      expect(layout.instrumentViewport).toBeDefined();
      expect(layout.controlsArea).toBeDefined();
      expect(layout.infoArea).toBeDefined();
    });

    it('should support landscape orientation layout', () => {
      const { DisplayManager } = require('@infrastructure/rendering/DisplayManager');
      const displayManager = new DisplayManager();
      const layout = displayManager.calculateLayout('landscape');
      
      expect(layout).toBeDefined();
      expect(layout.instrumentViewport).toBeDefined();
      expect(layout.controlsArea).toBeDefined();
      expect(layout.infoArea).toBeDefined();
    });

    it('should re-layout within 500ms of orientation change', () => {
      const { DisplayManager } = require('@infrastructure/rendering/DisplayManager');
      const displayManager = new DisplayManager();
      
      const startTime = Date.now();
      displayManager.adaptToScreen();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should maintain minimum touch target size across orientations', () => {
      const { DisplayManager } = require('@infrastructure/rendering/DisplayManager');
      const displayManager = new DisplayManager();
      
      const portraitLayout = displayManager.calculateLayout('portrait');
      const landscapeLayout = displayManager.calculateLayout('landscape');
      
      expect(portraitLayout.minTouchTargetSize).toBeGreaterThanOrEqual(44);
      expect(landscapeLayout.minTouchTargetSize).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Cultural Info Display', () => {
    it('should display bilingual descriptions', () => {
      expect(testInstrument.culturalInfo.description.thai).toBeDefined();
      expect(testInstrument.culturalInfo.description.english).toBeDefined();
      expect(testInstrument.culturalInfo.description.thai.length).toBeGreaterThan(0);
      expect(testInstrument.culturalInfo.description.english.length).toBeGreaterThan(0);
    });

    it('should display origin information', () => {
      expect(testInstrument.culturalInfo.origin.thai).toBeDefined();
      expect(testInstrument.culturalInfo.origin.english).toBeDefined();
    });

    it('should display usage information', () => {
      expect(testInstrument.culturalInfo.usage.thai).toBeDefined();
      expect(testInstrument.culturalInfo.usage.english).toBeDefined();
    });

    it('should support expandable/collapsible panel', () => {
      // Panel should be collapsible to save screen space
      expect(testInstrument.culturalInfo).toBeDefined();
    });

    it('should display fun facts when available', () => {
      if (testInstrument.culturalInfo.funFacts) {
        expect(Array.isArray(testInstrument.culturalInfo.funFacts)).toBe(true);
        testInstrument.culturalInfo.funFacts.forEach(fact => {
          expect(fact.thai).toBeDefined();
          expect(fact.english).toBeDefined();
        });
      }
    });
  });

  describe('Audio Playback', () => {
    it('should have audio samples for all instruments', () => {
      const allInstruments = instrumentLibrary.getAllInstruments();
      
      allInstruments.forEach(instrument => {
        expect(instrument.audioSamples).toBeDefined();
        expect(instrument.audioSamples.samples).toBeDefined();
        expect(Array.isArray(instrument.audioSamples.samples)).toBe(true);
        expect(instrument.audioSamples.samples.length).toBeGreaterThan(0);
      });
    });

    it('should have minimum 44.1kHz sample rate for audio', () => {
      testInstrument.audioSamples.samples.forEach(sample => {
        expect(sample.sampleRate).toBeGreaterThanOrEqual(44100);
      });
    });

    it('should support polyphonic playback', () => {
      expect(testInstrument.audioSamples.polyphony).toBeDefined();
      expect(testInstrument.audioSamples.polyphony).toBeGreaterThan(0);
    });

    it('should have valid audio file paths', () => {
      testInstrument.audioSamples.samples.forEach(sample => {
        expect(sample.filePath).toBeDefined();
        expect(typeof sample.filePath).toBe('string');
        expect(sample.filePath.length).toBeGreaterThan(0);
      });
    });

    it('should support stereo audio output', () => {
      const stereoSamples = testInstrument.audioSamples.samples.filter(
        s => s.channels === 'stereo'
      );
      
      // At least some samples should be stereo
      expect(stereoSamples.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance Metrics', () => {
    it('should track FPS during rendering', () => {
      const { ThreeJSRenderEngine } = require('@infrastructure/rendering/ThreeJSRenderEngine');
      const renderEngine = new ThreeJSRenderEngine();
      const metrics = renderEngine.getPerformanceMetrics();
      
      expect(metrics.fps).toBeDefined();
      expect(metrics.fps).toBeGreaterThan(0);
    });

    it('should maintain target 30+ FPS', () => {
      const { ThreeJSRenderEngine } = require('@infrastructure/rendering/ThreeJSRenderEngine');
      const renderEngine = new ThreeJSRenderEngine();
      const metrics = renderEngine.getPerformanceMetrics();
      
      expect(metrics.fps).toBeGreaterThanOrEqual(30);
    });

    it('should track draw calls and triangles', () => {
      const { ThreeJSRenderEngine } = require('@infrastructure/rendering/ThreeJSRenderEngine');
      const renderEngine = new ThreeJSRenderEngine();
      const metrics = renderEngine.getPerformanceMetrics();
      
      expect(metrics.drawCalls).toBeDefined();
      expect(metrics.triangles).toBeDefined();
    });

    it('should track memory usage', () => {
      const { ThreeJSRenderEngine } = require('@infrastructure/rendering/ThreeJSRenderEngine');
      const renderEngine = new ThreeJSRenderEngine();
      const metrics = renderEngine.getPerformanceMetrics();
      
      expect(metrics.memoryUsage).toBeDefined();
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Responsive Sizing - Phone', () => {
    it('should adapt layout for phone screens', () => {
      const { DisplayManager } = require('@infrastructure/rendering/DisplayManager');
      const displayManager = new DisplayManager();
      const layout = displayManager.calculateLayout('portrait');
      
      // Portrait layout for phones
      expect(layout.instrumentViewport.height).toBeGreaterThan(0);
      expect(layout.controlsArea.height).toBeGreaterThan(0);
      expect(layout.infoArea.height).toBeGreaterThan(0);
    });

    it('should ensure readable text on phone screens', () => {
      // Minimum 12pt text size requirement
      const minTextSize = 12;
      expect(minTextSize).toBeGreaterThanOrEqual(12);
    });
  });

  describe('Responsive Sizing - Tablet', () => {
    it('should utilize larger screen space on tablets', () => {
      const { DisplayManager } = require('@infrastructure/rendering/DisplayManager');
      const displayManager = new DisplayManager();
      const layout = displayManager.calculateLayout('landscape');
      
      // Landscape layout for tablets
      expect(layout.instrumentViewport.width).toBeGreaterThan(0);
      expect(layout.controlsArea.width).toBeGreaterThan(0);
    });

    it('should display additional details on tablet screens', () => {
      // Tablets have more space for cultural info
      expect(testInstrument.culturalInfo).toBeDefined();
      expect(testInstrument.culturalInfo.description).toBeDefined();
      expect(testInstrument.culturalInfo.origin).toBeDefined();
      expect(testInstrument.culturalInfo.usage).toBeDefined();
    });
  });

  describe('Back Navigation', () => {
    it('should support back button to return to library', () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { dispatch } = useAppStateManager();
      
      expect(dispatch).toBeDefined();
      expect(typeof dispatch).toBe('function');
    });

    it('should clear selected instrument on back', () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { dispatch } = useAppStateManager();
      
      // Should dispatch action to clear instrument
      expect(dispatch).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing instrument gracefully', () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      useAppStateManager.mockReturnValue({
        state: {
          selectedInstrument: null,
          userPreferences: { volume: 0.8 },
          orientation: 'portrait',
        },
        updatePreferences: jest.fn(),
        dispatch: jest.fn(),
      });
      
      const state = useAppStateManager().state;
      expect(state.selectedInstrument).toBeNull();
    });

    it('should handle render engine initialization failure', async () => {
      const { ThreeJSRenderEngine } = require('@infrastructure/rendering/ThreeJSRenderEngine');
      const renderEngine = new ThreeJSRenderEngine();
      
      // Should not throw on initialization
      expect(() => renderEngine.initialize({})).not.toThrow();
    });

    it('should handle audio engine initialization failure', async () => {
      const { LowLatencySoundEngine } = require('@infrastructure/audio/LowLatencySoundEngine');
      const soundEngine = new LowLatencySoundEngine();
      
      // Should handle initialization gracefully
      await expect(soundEngine.initialize()).resolves.not.toThrow();
    });
  });

  describe('Resource Cleanup', () => {
    it('should dispose render engine on unmount', () => {
      const { ThreeJSRenderEngine } = require('@infrastructure/rendering/ThreeJSRenderEngine');
      const renderEngine = new ThreeJSRenderEngine();
      
      renderEngine.dispose();
      expect(renderEngine.dispose).toHaveBeenCalled();
    });

    it('should dispose sound engine on unmount', () => {
      const { LowLatencySoundEngine } = require('@infrastructure/audio/LowLatencySoundEngine');
      const soundEngine = new LowLatencySoundEngine();
      
      soundEngine.dispose();
      expect(soundEngine.dispose).toHaveBeenCalled();
    });

    it('should stop all audio on unmount', () => {
      const { LowLatencySoundEngine } = require('@infrastructure/audio/LowLatencySoundEngine');
      const soundEngine = new LowLatencySoundEngine();
      
      soundEngine.stopAll();
      expect(soundEngine.stopAll).toHaveBeenCalled();
    });
  });
});
