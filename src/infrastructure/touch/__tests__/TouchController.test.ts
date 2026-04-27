/**
 * TouchController Unit Tests
 * 
 * Tests the integration of TouchZoneMapper and InstrumentGestureRecognizer
 * for unified touch handling.
 */

import { TouchController } from '../TouchController';
import { Instrument } from '../../../domain/entities/Instrument';
import { DeviceInfo } from '../../../domain/entities/AppState';

describe('TouchController', () => {
  let controller: TouchController;
  let mockInstrument: Instrument;
  let mockDeviceInfo: DeviceInfo;

  beforeEach(() => {
    // Mock device info
    mockDeviceInfo = {
      screenWidth: 375,
      screenHeight: 667,
      screenDiagonal: 4.7,
      pixelDensity: 2,
      deviceType: 'phone',
      platform: 'ios',
    };

    // Mock instrument with interaction zones
    mockInstrument = {
      id: 'test-instrument',
      name: { thai: 'ทดสอบ', english: 'Test Instrument' },
      nationality: 'thai',
      playingMethod: 'striking',
      model3D: {
        modelId: 'test-model',
        filePath: 'models/test.glb',
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
      interactionZones: [
        {
          id: 'zone-1',
          type: 'strike',
          bounds: { x: 50, y: 100, width: 100, height: 100 },
          noteId: 'note-1',
          visualFeedback: {
            type: 'highlight',
            duration: 200,
            intensity: 0.8,
          },
          touchSensitivity: 1.0,
        },
        {
          id: 'zone-2',
          type: 'pluck',
          bounds: { x: 200, y: 100, width: 100, height: 100 },
          noteId: 'note-2',
          visualFeedback: {
            type: 'glow',
            duration: 300,
            intensity: 0.7,
          },
          touchSensitivity: 0.8,
        },
        {
          id: 'zone-3',
          type: 'press',
          bounds: { x: 50, y: 250, width: 100, height: 100 },
          noteId: 'note-3',
          visualFeedback: {
            type: 'ripple',
            duration: 150,
            intensity: 0.9,
          },
          touchSensitivity: 0.9,
        },
      ],
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

    controller = new TouchController(mockDeviceInfo);
  });

  describe('initialize', () => {
    it('should initialize with instrument and device info', () => {
      expect(() => {
        controller.initialize(mockInstrument, mockDeviceInfo);
      }).not.toThrow();

      expect(controller.getCurrentInstrument()).toBe(mockInstrument);
    });

    it('should throw error if device info is not provided', () => {
      const controllerWithoutDevice = new TouchController();
      
      expect(() => {
        controllerWithoutDevice.initialize(mockInstrument);
      }).toThrow('DeviceInfo is required for TouchController initialization');
    });

    it('should clear active touches on initialization', () => {
      controller.initialize(mockInstrument, mockDeviceInfo);
      
      // Simulate a touch
      const touchEvent = createMockTouchEvent(100, 150, 'touchstart');
      controller.handleTouchStart(touchEvent);
      
      expect(controller.getActiveTouches().size).toBe(1);
      
      // Re-initialize
      controller.initialize(mockInstrument, mockDeviceInfo);
      
      expect(controller.getActiveTouches().size).toBe(0);
    });
  });

  describe('handleTouchStart', () => {
    beforeEach(() => {
      controller.initialize(mockInstrument, mockDeviceInfo);
    });

    it('should return null if no instrument is initialized', () => {
      controller.reset();
      const touchEvent = createMockTouchEvent(100, 150, 'touchstart');
      
      const action = controller.handleTouchStart(touchEvent);
      
      expect(action).toBeNull();
    });

    it('should return null if touch is outside all zones', () => {
      const touchEvent = createMockTouchEvent(10, 10, 'touchstart');
      
      const action = controller.handleTouchStart(touchEvent);
      
      expect(action).toBeNull();
    });

    it('should recognize strike gesture in strike zone', () => {
      const touchEvent = createMockTouchEvent(100, 150, 'touchstart', 0.8);
      
      const action = controller.handleTouchStart(touchEvent);
      
      expect(action).not.toBeNull();
      expect(action?.type).toBe('strike');
      expect(action?.zoneId).toBe('zone-1');
      expect(action?.velocity).toBeCloseTo(0.8, 2);
    });

    it('should track active touches', () => {
      const touchEvent = createMockTouchEvent(100, 150, 'touchstart');
      
      controller.handleTouchStart(touchEvent);
      
      expect(controller.getActiveTouches().size).toBe(1);
    });

    it('should handle multi-touch scenarios', () => {
      const touch1 = createMockTouchEvent(100, 150, 'touchstart', 0.7, 0);
      const touch2 = createMockTouchEvent(250, 150, 'touchstart', 0.8, 1);
      
      controller.handleTouchStart(touch1);
      controller.handleTouchStart(touch2);
      
      expect(controller.getActiveTouches().size).toBe(2);
    });
  });

  describe('handleTouchMove', () => {
    beforeEach(() => {
      controller.initialize(mockInstrument, mockDeviceInfo);
    });

    it('should return null if no active touch for the touch ID', () => {
      const touchEvent = createMockTouchEvent(250, 150, 'touchmove');
      
      const action = controller.handleTouchMove(touchEvent);
      
      expect(action).toBeNull();
    });

    it('should track pluck gesture movement', () => {
      // Start touch in pluck zone
      const startEvent = createMockTouchEvent(250, 150, 'touchstart');
      controller.handleTouchStart(startEvent);
      
      // Move touch
      const moveEvent = createMockTouchEvent(260, 160, 'touchmove');
      const action = controller.handleTouchMove(moveEvent);
      
      // Move doesn't generate action for pluck, only end does
      expect(action).toBeNull();
    });
  });

  describe('handleTouchEnd', () => {
    beforeEach(() => {
      controller.initialize(mockInstrument, mockDeviceInfo);
    });

    it('should return null if no active touch for the touch ID', () => {
      const touchEvent = createMockTouchEvent(100, 150, 'touchend');
      
      const action = controller.handleTouchEnd(touchEvent);
      
      expect(action).toBeNull();
    });

    it('should recognize pluck gesture on touch end', () => {
      // Start touch in pluck zone
      const startEvent = createMockTouchEvent(250, 150, 'touchstart');
      controller.handleTouchStart(startEvent);
      
      // End touch with drag
      const endEvent = createMockTouchEvent(280, 180, 'touchend');
      const action = controller.handleTouchEnd(endEvent);
      
      expect(action).not.toBeNull();
      expect(action?.type).toBe('pluck');
      expect(action?.zoneId).toBe('zone-2');
      expect(action?.velocity).toBeGreaterThan(0);
    });

    it('should recognize release gesture for press zone', () => {
      // Start touch in press zone
      const startEvent = createMockTouchEvent(100, 300, 'touchstart');
      controller.handleTouchStart(startEvent);
      
      // End touch
      const endEvent = createMockTouchEvent(100, 300, 'touchend');
      const action = controller.handleTouchEnd(endEvent);
      
      expect(action).not.toBeNull();
      expect(action?.type).toBe('release');
      expect(action?.zoneId).toBe('zone-3');
    });

    it('should remove touch from active touches', () => {
      // Start touch
      const startEvent = createMockTouchEvent(100, 150, 'touchstart');
      controller.handleTouchStart(startEvent);
      
      expect(controller.getActiveTouches().size).toBe(1);
      
      // End touch
      const endEvent = createMockTouchEvent(100, 150, 'touchend');
      controller.handleTouchEnd(endEvent);
      
      expect(controller.getActiveTouches().size).toBe(0);
    });
  });

  describe('getInteractionZone', () => {
    beforeEach(() => {
      controller.initialize(mockInstrument, mockDeviceInfo);
    });

    it('should return zone at given position', () => {
      const zone = controller.getInteractionZone({ x: 100, y: 150 });
      
      expect(zone).not.toBeNull();
      expect(zone?.id).toBe('zone-1');
    });

    it('should return null if no zone at position', () => {
      const zone = controller.getInteractionZone({ x: 10, y: 10 });
      
      expect(zone).toBeNull();
    });
  });

  describe('reset', () => {
    it('should clear all state', () => {
      controller.initialize(mockInstrument, mockDeviceInfo);
      
      // Add active touch
      const touchEvent = createMockTouchEvent(100, 150, 'touchstart');
      controller.handleTouchStart(touchEvent);
      
      expect(controller.getActiveTouches().size).toBe(1);
      expect(controller.getCurrentInstrument()).not.toBeNull();
      
      // Reset
      controller.reset();
      
      expect(controller.getActiveTouches().size).toBe(0);
      expect(controller.getCurrentInstrument()).toBeNull();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      controller.initialize(mockInstrument, mockDeviceInfo);
    });

    it('should handle touch events with missing force property', () => {
      const touchEvent = createMockTouchEvent(100, 150, 'touchstart');
      delete touchEvent.nativeEvent.touches[0].force;
      
      const action = controller.handleTouchStart(touchEvent);
      
      expect(action).not.toBeNull();
      expect(action?.velocity).toBeGreaterThan(0); // Should use default
    });

    it('should handle rapid touch sequences', () => {
      // Rapid touches in same zone
      for (let i = 0; i < 5; i++) {
        const startEvent = createMockTouchEvent(100, 150, 'touchstart', 0.7, i);
        const action = controller.handleTouchStart(startEvent);
        expect(action?.type).toBe('strike');
      }
      
      expect(controller.getActiveTouches().size).toBe(5);
    });

    it('should handle touch at zone boundary', () => {
      // Touch at exact boundary (x: 50, y: 100)
      const touchEvent = createMockTouchEvent(50, 100, 'touchstart');
      
      const action = controller.handleTouchStart(touchEvent);
      
      expect(action).not.toBeNull();
      expect(action?.zoneId).toBe('zone-1');
    });
  });

  describe('integration with mapper and recognizer', () => {
    beforeEach(() => {
      controller.initialize(mockInstrument, mockDeviceInfo);
    });

    it('should apply zone sensitivity through recognizer', () => {
      // Zone 2 has sensitivity 0.8
      const touchEvent = createMockTouchEvent(250, 150, 'touchstart', 1.0);
      controller.handleTouchStart(touchEvent);
      
      const endEvent = createMockTouchEvent(350, 150, 'touchend');
      const action = controller.handleTouchEnd(endEvent);
      
      // Velocity should be affected by sensitivity
      expect(action?.velocity).toBeLessThan(1.0);
    });

    it('should scale zones based on device screen size', () => {
      // Create controller with larger screen
      const largeDeviceInfo: DeviceInfo = {
        ...mockDeviceInfo,
        screenWidth: 750, // 2x base width
      };
      
      const largeController = new TouchController(largeDeviceInfo);
      largeController.initialize(mockInstrument, largeDeviceInfo);
      
      // Touch at scaled position (original 100, 150 -> scaled 200, 300)
      const touchEvent = createMockTouchEvent(200, 300, 'touchstart');
      const action = largeController.handleTouchStart(touchEvent);
      
      expect(action).not.toBeNull();
      expect(action?.zoneId).toBe('zone-1');
    });
  });
});

/**
 * Helper function to create mock touch events
 */
function createMockTouchEvent(
  x: number,
  y: number,
  type: 'touchstart' | 'touchmove' | 'touchend',
  force: number = 0.7,
  identifier: number = 0
): any {
  return {
    nativeEvent: {
      touches: type !== 'touchend' ? [{
        pageX: x,
        pageY: y,
        locationX: x,
        locationY: y,
        force,
        identifier,
      }] : [],
      changedTouches: [{
        pageX: x,
        pageY: y,
        locationX: x,
        locationY: y,
        force,
        identifier,
      }],
      timestamp: Date.now(),
    },
  };
}
