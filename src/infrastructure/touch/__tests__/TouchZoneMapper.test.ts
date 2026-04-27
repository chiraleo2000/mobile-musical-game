/**
 * TouchZoneMapper Unit Tests
 * 
 * Tests for touch zone mapping, scaling, and hit detection
 */

import { TouchZoneMapper } from '../TouchZoneMapper';
import { InteractionZone } from '../../../domain/entities/Instrument';
import { Point2D } from '../../../domain/entities/Touch';
import { DeviceInfo } from '../../../domain/entities/AppState';

describe('TouchZoneMapper', () => {
  let mapper: TouchZoneMapper;

  beforeEach(() => {
    mapper = new TouchZoneMapper();
  });

  describe('calculateScreenScale', () => {
    it('should return 1.0 for base width (375px)', () => {
      const scale = mapper.calculateScreenScale(375);
      expect(scale).toBe(1.0);
    });

    it('should return 2.0 for double base width (750px)', () => {
      const scale = mapper.calculateScreenScale(750);
      expect(scale).toBe(2.0);
    });

    it('should return 0.5 for half base width (187.5px)', () => {
      const scale = mapper.calculateScreenScale(187.5);
      expect(scale).toBe(0.5);
    });

    it('should handle typical phone widths', () => {
      // iPhone 12 Pro
      expect(mapper.calculateScreenScale(390)).toBeCloseTo(1.04, 2);
      
      // Samsung Galaxy S21
      expect(mapper.calculateScreenScale(360)).toBeCloseTo(0.96, 2);
    });

    it('should handle tablet widths', () => {
      // iPad Mini
      expect(mapper.calculateScreenScale(768)).toBeCloseTo(2.048, 2);
      
      // iPad Pro
      expect(mapper.calculateScreenScale(1024)).toBeCloseTo(2.731, 2);
    });
  });

  describe('initialize', () => {
    it('should initialize with zones and device info', () => {
      const zones: InteractionZone[] = [
        createMockZone('zone1', 0, 0, 50, 50),
      ];
      const deviceInfo = createMockDeviceInfo(375, 667);

      mapper.initialize(zones, deviceInfo);

      expect(mapper.getZones()).toHaveLength(1);
      expect(mapper.getScreenScale()).toBe(1.0);
    });

    it('should scale zones based on device width', () => {
      const zones: InteractionZone[] = [
        createMockZone('zone1', 0, 0, 50, 50),
      ];
      const deviceInfo = createMockDeviceInfo(750, 1334); // 2x scale

      mapper.initialize(zones, deviceInfo);

      const scaledZones = mapper.getZones();
      expect(scaledZones[0].bounds.width).toBe(100); // 50 * 2
      expect(scaledZones[0].bounds.height).toBe(100);
    });

    it('should enforce minimum 44px touch targets', () => {
      const zones: InteractionZone[] = [
        createMockZone('zone1', 0, 0, 20, 20), // Too small
      ];
      const deviceInfo = createMockDeviceInfo(375, 667);

      mapper.initialize(zones, deviceInfo);

      const scaledZones = mapper.getZones();
      expect(scaledZones[0].bounds.width).toBe(44); // Enforced minimum
      expect(scaledZones[0].bounds.height).toBe(44);
    });

    it('should enforce minimum touch targets even with scaling', () => {
      const zones: InteractionZone[] = [
        createMockZone('zone1', 0, 0, 30, 30),
      ];
      const deviceInfo = createMockDeviceInfo(187.5, 333); // 0.5x scale

      mapper.initialize(zones, deviceInfo);

      const scaledZones = mapper.getZones();
      // 30 * 0.5 = 15, but should be enforced to 44
      expect(scaledZones[0].bounds.width).toBe(44);
      expect(scaledZones[0].bounds.height).toBe(44);
    });

    it('should scale zone positions correctly', () => {
      const zones: InteractionZone[] = [
        createMockZone('zone1', 100, 200, 50, 50),
      ];
      const deviceInfo = createMockDeviceInfo(750, 1334); // 2x scale

      mapper.initialize(zones, deviceInfo);

      const scaledZones = mapper.getZones();
      expect(scaledZones[0].bounds.x).toBe(200); // 100 * 2
      expect(scaledZones[0].bounds.y).toBe(400); // 200 * 2
    });

    it('should handle multiple zones', () => {
      const zones: InteractionZone[] = [
        createMockZone('zone1', 0, 0, 50, 50),
        createMockZone('zone2', 100, 100, 60, 60),
        createMockZone('zone3', 200, 200, 70, 70),
      ];
      const deviceInfo = createMockDeviceInfo(375, 667);

      mapper.initialize(zones, deviceInfo);

      expect(mapper.getZones()).toHaveLength(3);
    });
  });

  describe('getZoneAtPoint', () => {
    beforeEach(() => {
      const zones: InteractionZone[] = [
        createMockZone('zone1', 0, 0, 100, 100),
        createMockZone('zone2', 150, 150, 100, 100),
        createMockZone('zone3', 300, 300, 100, 100),
      ];
      const deviceInfo = createMockDeviceInfo(375, 667);
      mapper.initialize(zones, deviceInfo);
    });

    it('should return zone when point is inside bounds', () => {
      const point: Point2D = { x: 50, y: 50 };
      const zone = mapper.getZoneAtPoint(point);

      expect(zone).not.toBeNull();
      expect(zone?.id).toBe('zone1');
    });

    it('should return correct zone for different points', () => {
      const point1: Point2D = { x: 200, y: 200 };
      const zone1 = mapper.getZoneAtPoint(point1);
      expect(zone1?.id).toBe('zone2');

      const point2: Point2D = { x: 350, y: 350 };
      const zone2 = mapper.getZoneAtPoint(point2);
      expect(zone2?.id).toBe('zone3');
    });

    it('should return null when point is outside all zones', () => {
      const point: Point2D = { x: 500, y: 500 };
      const zone = mapper.getZoneAtPoint(point);

      expect(zone).toBeNull();
    });

    it('should detect hit at zone boundaries', () => {
      // Top-left corner
      const topLeft: Point2D = { x: 0, y: 0 };
      expect(mapper.getZoneAtPoint(topLeft)).not.toBeNull();

      // Bottom-right corner (inclusive)
      const bottomRight: Point2D = { x: 100, y: 100 };
      expect(mapper.getZoneAtPoint(bottomRight)).not.toBeNull();
    });

    it('should not detect hit just outside zone boundaries', () => {
      const justOutside: Point2D = { x: 101, y: 101 };
      const zone = mapper.getZoneAtPoint(justOutside);

      // Should either be null or zone2, but not zone1
      if (zone) {
        expect(zone.id).not.toBe('zone1');
      }
    });

    it('should work with scaled zones', () => {
      const zones: InteractionZone[] = [
        createMockZone('zone1', 50, 50, 50, 50),
      ];
      const deviceInfo = createMockDeviceInfo(750, 1334); // 2x scale
      mapper.initialize(zones, deviceInfo);

      // Original zone at (50, 50, 50, 50) becomes (100, 100, 100, 100)
      const insideScaled: Point2D = { x: 150, y: 150 };
      expect(mapper.getZoneAtPoint(insideScaled)).not.toBeNull();

      const outsideScaled: Point2D = { x: 50, y: 50 };
      expect(mapper.getZoneAtPoint(outsideScaled)).toBeNull();
    });

    it('should return first matching zone when zones overlap', () => {
      const overlappingZones: InteractionZone[] = [
        createMockZone('zone1', 0, 0, 100, 100),
        createMockZone('zone2', 50, 50, 100, 100), // Overlaps with zone1
      ];
      const deviceInfo = createMockDeviceInfo(375, 667);
      mapper.initialize(overlappingZones, deviceInfo);

      const point: Point2D = { x: 75, y: 75 }; // In overlap area
      const zone = mapper.getZoneAtPoint(point);

      expect(zone).not.toBeNull();
      expect(zone?.id).toBe('zone1'); // First zone wins
    });
  });

  describe('getZones', () => {
    it('should return empty array when not initialized', () => {
      expect(mapper.getZones()).toEqual([]);
    });

    it('should return all scaled zones after initialization', () => {
      const zones: InteractionZone[] = [
        createMockZone('zone1', 0, 0, 50, 50),
        createMockZone('zone2', 100, 100, 60, 60),
      ];
      const deviceInfo = createMockDeviceInfo(375, 667);
      mapper.initialize(zones, deviceInfo);

      const result = mapper.getZones();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('zone1');
      expect(result[1].id).toBe('zone2');
    });
  });

  describe('getScreenScale', () => {
    it('should return 1 when not initialized', () => {
      expect(mapper.getScreenScale()).toBe(1);
    });

    it('should return correct scale after initialization', () => {
      const zones: InteractionZone[] = [createMockZone('zone1', 0, 0, 50, 50)];
      const deviceInfo = createMockDeviceInfo(750, 1334);
      mapper.initialize(zones, deviceInfo);

      expect(mapper.getScreenScale()).toBe(2.0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty zones array', () => {
      const deviceInfo = createMockDeviceInfo(375, 667);
      mapper.initialize([], deviceInfo);

      expect(mapper.getZones()).toEqual([]);
      expect(mapper.getZoneAtPoint({ x: 0, y: 0 })).toBeNull();
    });

    it('should handle zero-sized zones', () => {
      const zones: InteractionZone[] = [
        createMockZone('zone1', 0, 0, 0, 0),
      ];
      const deviceInfo = createMockDeviceInfo(375, 667);
      mapper.initialize(zones, deviceInfo);

      const scaledZones = mapper.getZones();
      // Should be enforced to minimum size
      expect(scaledZones[0].bounds.width).toBe(44);
      expect(scaledZones[0].bounds.height).toBe(44);
    });

    it('should handle negative coordinates', () => {
      const zones: InteractionZone[] = [
        createMockZone('zone1', -50, -50, 100, 100),
      ];
      const deviceInfo = createMockDeviceInfo(375, 667);
      mapper.initialize(zones, deviceInfo);

      const scaledZones = mapper.getZones();
      expect(scaledZones[0].bounds.x).toBe(-50);
      expect(scaledZones[0].bounds.y).toBe(-50);
    });

    it('should handle very large zones', () => {
      const zones: InteractionZone[] = [
        createMockZone('zone1', 0, 0, 10000, 10000),
      ];
      const deviceInfo = createMockDeviceInfo(375, 667);
      mapper.initialize(zones, deviceInfo);

      const scaledZones = mapper.getZones();
      expect(scaledZones[0].bounds.width).toBe(10000);
      expect(scaledZones[0].bounds.height).toBe(10000);
    });

    it('should handle very small screen widths', () => {
      const zones: InteractionZone[] = [
        createMockZone('zone1', 0, 0, 50, 50),
      ];
      const deviceInfo = createMockDeviceInfo(100, 200); // Very small
      mapper.initialize(zones, deviceInfo);

      expect(mapper.getScreenScale()).toBeCloseTo(0.267, 2);
      // Zone should still meet minimum size
      const scaledZones = mapper.getZones();
      expect(scaledZones[0].bounds.width).toBe(44);
    });
  });
});

// Helper functions

function createMockZone(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number
): InteractionZone {
  return {
    id,
    type: 'strike',
    bounds: { x, y, width, height },
    noteId: `note-${id}`,
    visualFeedback: {
      type: 'highlight',
      duration: 100,
      intensity: 0.8,
    },
    touchSensitivity: 1.0,
  };
}

function createMockDeviceInfo(
  screenWidth: number,
  screenHeight: number
): DeviceInfo {
  return {
    screenWidth,
    screenHeight,
    screenDiagonal: 5.5,
    pixelDensity: 2,
    deviceType: 'phone',
    platform: 'ios',
  };
}
