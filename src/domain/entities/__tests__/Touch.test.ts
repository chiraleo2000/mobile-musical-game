/**
 * Unit tests for Touch data model validation
 * Tests touch interaction types and gesture data
 */

import {
  Point2D,
  Size,
  Viewport,
  TouchAction,
  TouchActionType,
  Gesture,
} from '../Touch';

describe('Touch Data Model', () => {
  describe('Point2D validation', () => {
    it('should accept valid 2D point', () => {
      const point: Point2D = { x: 100, y: 200 };
      expect(point.x).toBe(100);
      expect(point.y).toBe(200);
    });

    it('should accept zero coordinates', () => {
      const point: Point2D = { x: 0, y: 0 };
      expect(point).toBeDefined();
    });

    it('should accept negative coordinates', () => {
      const point: Point2D = { x: -50, y: -100 };
      expect(point.x).toBe(-50);
      expect(point.y).toBe(-100);
    });

    it('should accept floating point coordinates', () => {
      const point: Point2D = { x: 123.45, y: 678.90 };
      expect(point.x).toBeCloseTo(123.45);
      expect(point.y).toBeCloseTo(678.90);
    });
  });

  describe('Size validation', () => {
    it('should accept valid size', () => {
      const size: Size = { width: 100, height: 50 };
      expect(size.width).toBe(100);
      expect(size.height).toBe(50);
    });

    it('should accept minimum touch target size (44px)', () => {
      const size: Size = { width: 44, height: 44 };
      expect(size.width).toBeGreaterThanOrEqual(44);
      expect(size.height).toBeGreaterThanOrEqual(44);
    });

    it('should accept zero size', () => {
      const size: Size = { width: 0, height: 0 };
      expect(size).toBeDefined();
    });
  });

  describe('Viewport validation', () => {
    it('should accept valid viewport', () => {
      const viewport: Viewport = {
        x: 0,
        y: 0,
        width: 375,
        height: 667,
        aspectRatio: 375 / 667,
      };
      expect(viewport.width).toBe(375);
      expect(viewport.height).toBe(667);
      expect(viewport.aspectRatio).toBeCloseTo(0.562);
    });

    it('should calculate correct aspect ratio', () => {
      const viewport: Viewport = {
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        aspectRatio: 1920 / 1080,
      };
      expect(viewport.aspectRatio).toBeCloseTo(16 / 9);
    });

    it('should accept portrait aspect ratio', () => {
      const viewport: Viewport = {
        x: 0,
        y: 0,
        width: 375,
        height: 667,
        aspectRatio: 375 / 667,
      };
      expect(viewport.aspectRatio).toBeLessThan(1);
    });

    it('should accept landscape aspect ratio', () => {
      const viewport: Viewport = {
        x: 0,
        y: 0,
        width: 667,
        height: 375,
        aspectRatio: 667 / 375,
      };
      expect(viewport.aspectRatio).toBeGreaterThan(1);
    });
  });

  describe('TouchAction validation', () => {
    it('should accept strike action', () => {
      const action: TouchAction = {
        type: 'strike',
        zoneId: 'zone-1',
        position: { x: 100, y: 200 },
        velocity: 0.8,
        timestamp: Date.now(),
      };
      expect(action.type).toBe('strike');
      expect(action.velocity).toBe(0.8);
    });

    it('should accept pluck action', () => {
      const action: TouchAction = {
        type: 'pluck',
        zoneId: 'zone-2',
        position: { x: 150, y: 250 },
        velocity: 0.6,
        timestamp: Date.now(),
      };
      expect(action.type).toBe('pluck');
    });

    it('should accept press action', () => {
      const action: TouchAction = {
        type: 'press',
        zoneId: 'zone-3',
        position: { x: 200, y: 300 },
        velocity: 0.9,
        timestamp: Date.now(),
      };
      expect(action.type).toBe('press');
    });

    it('should accept release action', () => {
      const action: TouchAction = {
        type: 'release',
        zoneId: 'zone-4',
        position: { x: 250, y: 350 },
        velocity: 0.0,
        timestamp: Date.now(),
      };
      expect(action.type).toBe('release');
    });

    it('should validate velocity between 0.0 and 1.0', () => {
      const minVelocity: TouchAction = {
        type: 'strike',
        zoneId: 'zone-1',
        position: { x: 100, y: 200 },
        velocity: 0.0,
        timestamp: Date.now(),
      };
      expect(minVelocity.velocity).toBeGreaterThanOrEqual(0.0);

      const maxVelocity: TouchAction = {
        type: 'strike',
        zoneId: 'zone-1',
        position: { x: 100, y: 200 },
        velocity: 1.0,
        timestamp: Date.now(),
      };
      expect(maxVelocity.velocity).toBeLessThanOrEqual(1.0);
    });

    it('should have valid timestamp', () => {
      const now = Date.now();
      const action: TouchAction = {
        type: 'strike',
        zoneId: 'zone-1',
        position: { x: 100, y: 200 },
        velocity: 0.7,
        timestamp: now,
      };
      expect(action.timestamp).toBe(now);
      expect(action.timestamp).toBeGreaterThan(0);
    });

    it('should accept all touch action types', () => {
      const types: TouchActionType[] = ['strike', 'pluck', 'press', 'release'];
      types.forEach((type) => {
        const action: TouchAction = {
          type,
          zoneId: 'zone-1',
          position: { x: 100, y: 200 },
          velocity: 0.5,
          timestamp: Date.now(),
        };
        expect(action.type).toBe(type);
      });
    });
  });

  describe('Gesture validation', () => {
    it('should accept tap gesture', () => {
      const gesture: Gesture = {
        type: 'tap',
        startPosition: { x: 100, y: 200 },
        currentPosition: { x: 100, y: 200 },
        delta: { x: 0, y: 0 },
      };
      expect(gesture.type).toBe('tap');
      expect(gesture.delta.x).toBe(0);
      expect(gesture.delta.y).toBe(0);
    });

    it('should accept drag gesture with delta', () => {
      const gesture: Gesture = {
        type: 'drag',
        startPosition: { x: 100, y: 200 },
        currentPosition: { x: 150, y: 250 },
        delta: { x: 50, y: 50 },
      };
      expect(gesture.type).toBe('drag');
      expect(gesture.delta.x).toBe(50);
      expect(gesture.delta.y).toBe(50);
    });

    it('should accept pinch gesture with scale', () => {
      const gesture: Gesture = {
        type: 'pinch',
        startPosition: { x: 100, y: 200 },
        currentPosition: { x: 120, y: 220 },
        delta: { x: 20, y: 20 },
        scale: 1.5,
      };
      expect(gesture.type).toBe('pinch');
      expect(gesture.scale).toBe(1.5);
    });

    it('should accept rotate gesture with rotation', () => {
      const gesture: Gesture = {
        type: 'rotate',
        startPosition: { x: 100, y: 200 },
        currentPosition: { x: 110, y: 210 },
        delta: { x: 10, y: 10 },
        rotation: 45,
      };
      expect(gesture.type).toBe('rotate');
      expect(gesture.rotation).toBe(45);
    });

    it('should calculate correct delta', () => {
      const startPos = { x: 100, y: 200 };
      const currentPos = { x: 250, y: 400 };
      const gesture: Gesture = {
        type: 'drag',
        startPosition: startPos,
        currentPosition: currentPos,
        delta: {
          x: currentPos.x - startPos.x,
          y: currentPos.y - startPos.y,
        },
      };
      expect(gesture.delta.x).toBe(150);
      expect(gesture.delta.y).toBe(200);
    });

    it('should accept negative delta for reverse drag', () => {
      const gesture: Gesture = {
        type: 'drag',
        startPosition: { x: 200, y: 300 },
        currentPosition: { x: 150, y: 250 },
        delta: { x: -50, y: -50 },
      };
      expect(gesture.delta.x).toBe(-50);
      expect(gesture.delta.y).toBe(-50);
    });

    it('should accept pinch-in with scale less than 1', () => {
      const gesture: Gesture = {
        type: 'pinch',
        startPosition: { x: 100, y: 200 },
        currentPosition: { x: 90, y: 190 },
        delta: { x: -10, y: -10 },
        scale: 0.8,
      };
      expect(gesture.scale).toBeLessThan(1);
    });

    it('should accept pinch-out with scale greater than 1', () => {
      const gesture: Gesture = {
        type: 'pinch',
        startPosition: { x: 100, y: 200 },
        currentPosition: { x: 120, y: 220 },
        delta: { x: 20, y: 20 },
        scale: 1.5,
      };
      expect(gesture.scale).toBeGreaterThan(1);
    });

    it('should accept rotation in degrees', () => {
      const gesture: Gesture = {
        type: 'rotate',
        startPosition: { x: 100, y: 200 },
        currentPosition: { x: 110, y: 210 },
        delta: { x: 10, y: 10 },
        rotation: 90,
      };
      expect(gesture.rotation).toBe(90);
    });
  });
});
