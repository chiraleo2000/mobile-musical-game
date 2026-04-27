/**
 * Unit tests for InstrumentGestureRecognizer
 * 
 * Tests gesture recognition for strike, pluck, and press interactions
 * with velocity calculation based on gesture characteristics.
 */

import { InstrumentGestureRecognizer, TouchEvent } from '../InstrumentGestureRecognizer';
import { InteractionZone } from '../../../domain/entities/Instrument';

describe('InstrumentGestureRecognizer', () => {
  let recognizer: InstrumentGestureRecognizer;

  // Helper to create mock interaction zones
  const createMockZone = (type: 'strike' | 'pluck' | 'press', sensitivity: number = 1.0): InteractionZone => ({
    id: `zone-${type}`,
    type,
    bounds: { x: 0, y: 0, width: 100, height: 100 },
    noteId: 'C4',
    visualFeedback: {
      type: 'highlight',
      duration: 200,
      intensity: 0.8,
    },
    touchSensitivity: sensitivity,
  });

  // Helper to create mock touch events
  const createTouchEvent = (
    type: 'touchstart' | 'touchmove' | 'touchend',
    x: number,
    y: number,
    force?: number
  ): TouchEvent => ({
    type,
    pageX: x,
    pageY: y,
    force,
    timestamp: Date.now(),
  });

  beforeEach(() => {
    recognizer = new InstrumentGestureRecognizer();
  });

  describe('Strike Gesture Recognition', () => {
    it('should recognize strike gesture on touchstart', () => {
      const zone = createMockZone('strike');
      const event = createTouchEvent('touchstart', 50, 50);

      const action = recognizer.recognizeGesture(event, zone);

      expect(action).not.toBeNull();
      expect(action?.type).toBe('strike');
      expect(action?.zoneId).toBe('zone-strike');
      expect(action?.position).toEqual({ x: 50, y: 50 });
    });

    it('should use touch pressure for strike velocity when available', () => {
      const zone = createMockZone('strike');
      const event = createTouchEvent('touchstart', 50, 50, 0.9);

      const action = recognizer.recognizeGesture(event, zone);

      expect(action?.velocity).toBe(0.9);
    });

    it('should use default velocity 0.7 when pressure not available', () => {
      const zone = createMockZone('strike');
      const event = createTouchEvent('touchstart', 50, 50);

      const action = recognizer.recognizeGesture(event, zone);

      expect(action?.velocity).toBe(0.7);
    });

    it('should apply zone sensitivity to strike velocity', () => {
      const zone = createMockZone('strike', 0.5);
      const event = createTouchEvent('touchstart', 50, 50, 0.8);

      const action = recognizer.recognizeGesture(event, zone);

      expect(action?.velocity).toBe(0.4); // 0.8 * 0.5
    });

    it('should not recognize strike on touchend', () => {
      const zone = createMockZone('strike');
      const event = createTouchEvent('touchend', 50, 50);

      const action = recognizer.recognizeGesture(event, zone);

      expect(action).toBeNull();
    });
  });

  describe('Pluck Gesture Recognition', () => {
    it('should not return action on touchstart (stores position)', () => {
      const zone = createMockZone('pluck');
      const event = createTouchEvent('touchstart', 50, 50);

      const action = recognizer.recognizeGesture(event, zone);

      expect(action).toBeNull();
    });

    it('should recognize pluck gesture on touchend with drag distance', () => {
      const zone = createMockZone('pluck');
      const startEvent = createTouchEvent('touchstart', 50, 50);
      const endEvent = createTouchEvent('touchend', 150, 50);

      recognizer.recognizeGesture(startEvent, zone);
      const action = recognizer.recognizeGesture(endEvent, zone);

      expect(action).not.toBeNull();
      expect(action?.type).toBe('pluck');
      expect(action?.zoneId).toBe('zone-pluck');
      expect(action?.position).toEqual({ x: 150, y: 50 });
    });

    it('should calculate velocity from drag distance (100px = 1.0)', () => {
      const zone = createMockZone('pluck');
      const startEvent = createTouchEvent('touchstart', 0, 0);
      const endEvent = createTouchEvent('touchend', 100, 0);

      recognizer.recognizeGesture(startEvent, zone);
      const action = recognizer.recognizeGesture(endEvent, zone);

      expect(action?.velocity).toBe(1.0);
    });

    it('should calculate velocity from drag distance (50px = 0.5)', () => {
      const zone = createMockZone('pluck');
      const startEvent = createTouchEvent('touchstart', 0, 0);
      const endEvent = createTouchEvent('touchend', 50, 0);

      recognizer.recognizeGesture(startEvent, zone);
      const action = recognizer.recognizeGesture(endEvent, zone);

      expect(action?.velocity).toBe(0.5);
    });

    it('should clamp velocity to 1.0 for long drags', () => {
      const zone = createMockZone('pluck');
      const startEvent = createTouchEvent('touchstart', 0, 0);
      const endEvent = createTouchEvent('touchend', 200, 0);

      recognizer.recognizeGesture(startEvent, zone);
      const action = recognizer.recognizeGesture(endEvent, zone);

      expect(action?.velocity).toBe(1.0);
    });

    it('should calculate diagonal drag distance correctly', () => {
      const zone = createMockZone('pluck');
      const startEvent = createTouchEvent('touchstart', 0, 0);
      const endEvent = createTouchEvent('touchend', 60, 80); // 3-4-5 triangle = 100px

      recognizer.recognizeGesture(startEvent, zone);
      const action = recognizer.recognizeGesture(endEvent, zone);

      expect(action?.velocity).toBe(1.0);
    });

    it('should apply zone sensitivity to pluck velocity', () => {
      const zone = createMockZone('pluck', 0.5);
      const startEvent = createTouchEvent('touchstart', 0, 0);
      const endEvent = createTouchEvent('touchend', 100, 0);

      recognizer.recognizeGesture(startEvent, zone);
      const action = recognizer.recognizeGesture(endEvent, zone);

      expect(action?.velocity).toBe(0.5); // 1.0 * 0.5
    });

    it('should return null if touchend without touchstart', () => {
      const zone = createMockZone('pluck');
      const endEvent = createTouchEvent('touchend', 100, 0);

      const action = recognizer.recognizeGesture(endEvent, zone);

      expect(action).toBeNull();
    });
  });

  describe('Press Gesture Recognition', () => {
    it('should recognize press gesture on touchstart', () => {
      const zone = createMockZone('press');
      const event = createTouchEvent('touchstart', 50, 50);

      const action = recognizer.recognizeGesture(event, zone);

      expect(action).not.toBeNull();
      expect(action?.type).toBe('press');
      expect(action?.zoneId).toBe('zone-press');
      expect(action?.position).toEqual({ x: 50, y: 50 });
    });

    it('should recognize release gesture on touchend', () => {
      const zone = createMockZone('press');
      const event = createTouchEvent('touchend', 50, 50);

      const action = recognizer.recognizeGesture(event, zone);

      expect(action).not.toBeNull();
      expect(action?.type).toBe('release');
      expect(action?.zoneId).toBe('zone-press');
    });

    it('should use touch pressure for press velocity when available', () => {
      const zone = createMockZone('press');
      const event = createTouchEvent('touchstart', 50, 50, 0.6);

      const action = recognizer.recognizeGesture(event, zone);

      expect(action?.velocity).toBe(0.6);
    });

    it('should use default velocity 0.8 when pressure not available', () => {
      const zone = createMockZone('press');
      const event = createTouchEvent('touchstart', 50, 50);

      const action = recognizer.recognizeGesture(event, zone);

      expect(action?.velocity).toBe(0.8);
    });

    it('should have zero velocity for release', () => {
      const zone = createMockZone('press');
      const event = createTouchEvent('touchend', 50, 50);

      const action = recognizer.recognizeGesture(event, zone);

      expect(action?.velocity).toBe(0.0);
    });

    it('should apply zone sensitivity to press velocity', () => {
      const zone = createMockZone('press', 0.75);
      const event = createTouchEvent('touchstart', 50, 50, 0.8);

      const action = recognizer.recognizeGesture(event, zone);

      expect(action?.velocity).toBeCloseTo(0.6, 5); // 0.8 * 0.75
    });

    it('should not recognize press on touchmove', () => {
      const zone = createMockZone('press');
      const event = createTouchEvent('touchmove', 50, 50);

      const action = recognizer.recognizeGesture(event, zone);

      expect(action).toBeNull();
    });
  });

  describe('Velocity Normalization', () => {
    it('should clamp velocity to 0.0 minimum', () => {
      const zone = createMockZone('strike', 0.0);
      const event = createTouchEvent('touchstart', 50, 50, 0.5);

      const action = recognizer.recognizeGesture(event, zone);

      expect(action?.velocity).toBe(0.0);
    });

    it('should clamp velocity to 1.0 maximum', () => {
      const zone = createMockZone('strike', 2.0);
      const event = createTouchEvent('touchstart', 50, 50, 0.8);

      const action = recognizer.recognizeGesture(event, zone);

      expect(action?.velocity).toBe(1.0); // Clamped from 1.6
    });
  });

  describe('Reset Functionality', () => {
    it('should reset internal state', () => {
      const zone = createMockZone('pluck');
      const startEvent = createTouchEvent('touchstart', 0, 0);
      
      recognizer.recognizeGesture(startEvent, zone);
      recognizer.reset();
      
      const endEvent = createTouchEvent('touchend', 100, 0);
      const action = recognizer.recognizeGesture(endEvent, zone);

      expect(action).toBeNull(); // Should not recognize without start
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero drag distance for pluck', () => {
      const zone = createMockZone('pluck');
      const startEvent = createTouchEvent('touchstart', 50, 50);
      const endEvent = createTouchEvent('touchend', 50, 50);

      recognizer.recognizeGesture(startEvent, zone);
      const action = recognizer.recognizeGesture(endEvent, zone);

      expect(action?.velocity).toBe(0.0);
    });

    it('should handle very small drag distances', () => {
      const zone = createMockZone('pluck');
      const startEvent = createTouchEvent('touchstart', 50, 50);
      const endEvent = createTouchEvent('touchend', 51, 50);

      recognizer.recognizeGesture(startEvent, zone);
      const action = recognizer.recognizeGesture(endEvent, zone);

      expect(action?.velocity).toBe(0.01);
    });

    it('should include timestamp in touch actions', () => {
      const zone = createMockZone('strike');
      const event = createTouchEvent('touchstart', 50, 50);

      const action = recognizer.recognizeGesture(event, zone);

      expect(action?.timestamp).toBe(event.timestamp);
    });
  });
});
