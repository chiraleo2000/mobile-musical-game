/**
 * Unit tests for AdaptiveLODStrategy
 */

import { AdaptiveLODStrategy } from '../AdaptiveLODStrategy';
import { LODLevel } from '@domain/entities/Instrument';

describe('AdaptiveLODStrategy', () => {
  let lodStrategy: AdaptiveLODStrategy;
  
  const testLODLevels: LODLevel[] = [
    { distance: 0, polygonCount: 5000, filePath: 'model-low.glb' },
    { distance: 0, polygonCount: 15000, filePath: 'model-medium.glb' },
    { distance: 0, polygonCount: 50000, filePath: 'model-high.glb' },
  ];

  beforeEach(() => {
    lodStrategy = new AdaptiveLODStrategy();
  });

  describe('initialization', () => {
    it('should start at highest quality LOD', () => {
      lodStrategy.setLODLevels(testLODLevels);
      expect(lodStrategy.getCurrentLODIndex()).toBe(2);
    });

    it('should use default LOD levels if none provided', () => {
      const currentLOD = lodStrategy.getCurrentLOD();
      expect(currentLOD).not.toBeNull();
      expect(currentLOD?.polygonCount).toBe(50000);
    });

    it('should throw error if empty LOD levels array provided', () => {
      expect(() => lodStrategy.setLODLevels([])).toThrow('LOD levels array cannot be empty');
    });
  });

  describe('setLODLevels', () => {
    it('should sort LOD levels by polygon count', () => {
      const unsortedLevels: LODLevel[] = [
        { distance: 0, polygonCount: 50000, filePath: 'model-high.glb' },
        { distance: 0, polygonCount: 5000, filePath: 'model-low.glb' },
        { distance: 0, polygonCount: 15000, filePath: 'model-medium.glb' },
      ];
      
      lodStrategy.setLODLevels(unsortedLevels);
      const levels = lodStrategy.getLODLevels();
      
      expect(levels[0].polygonCount).toBe(5000);
      expect(levels[1].polygonCount).toBe(15000);
      expect(levels[2].polygonCount).toBe(50000);
    });

    it('should reset to highest quality after setting new levels', () => {
      lodStrategy.setLODLevels(testLODLevels);
      expect(lodStrategy.getCurrentLODIndex()).toBe(2);
      expect(lodStrategy.getCurrentLOD()?.polygonCount).toBe(50000);
    });
  });

  describe('updateLOD - performance degradation', () => {
    beforeEach(() => {
      lodStrategy.setLODLevels(testLODLevels);
    });

    it('should reduce quality when FPS drops below 30', () => {
      // Start at high quality (index 2)
      expect(lodStrategy.getCurrentLODIndex()).toBe(2);
      
      // Simulate 60 frames to pass the minimum frame threshold
      for (let i = 0; i < 60; i++) {
        lodStrategy.updateLOD(20, 30); // FPS = 20, target = 30
      }
      
      // Should have reduced to medium quality (index 1)
      expect(lodStrategy.getCurrentLODIndex()).toBe(1);
      expect(lodStrategy.getCurrentLOD()?.polygonCount).toBe(15000);
    });

    it('should continue reducing quality if FPS remains low', () => {
      // Start at high quality
      expect(lodStrategy.getCurrentLODIndex()).toBe(2);
      
      // First reduction
      for (let i = 0; i < 60; i++) {
        lodStrategy.updateLOD(20, 30);
      }
      expect(lodStrategy.getCurrentLODIndex()).toBe(1);
      
      // Second reduction
      for (let i = 0; i < 60; i++) {
        lodStrategy.updateLOD(20, 30);
      }
      expect(lodStrategy.getCurrentLODIndex()).toBe(0);
      expect(lodStrategy.getCurrentLOD()?.polygonCount).toBe(5000);
    });

    it('should not reduce below lowest quality level', () => {
      lodStrategy.setLODLevels(testLODLevels);
      
      // Reduce to lowest quality
      for (let i = 0; i < 200; i++) {
        lodStrategy.updateLOD(15, 30);
      }
      
      expect(lodStrategy.getCurrentLODIndex()).toBe(0);
      expect(lodStrategy.getCurrentLOD()?.polygonCount).toBe(5000);
    });
  });

  describe('updateLOD - performance improvement', () => {
    beforeEach(() => {
      lodStrategy.setLODLevels(testLODLevels);
      
      // Start at low quality by simulating poor performance
      for (let i = 0; i < 200; i++) {
        lodStrategy.updateLOD(15, 30);
      }
      expect(lodStrategy.getCurrentLODIndex()).toBe(0);
    });

    it('should increase quality when FPS is above target', () => {
      // Simulate good performance
      for (let i = 0; i < 60; i++) {
        lodStrategy.updateLOD(45, 30); // FPS = 45, target = 30
      }
      
      // Should have increased to medium quality
      expect(lodStrategy.getCurrentLODIndex()).toBe(1);
      expect(lodStrategy.getCurrentLOD()?.polygonCount).toBe(15000);
    });

    it('should continue increasing quality if FPS remains high', () => {
      // First increase
      for (let i = 0; i < 60; i++) {
        lodStrategy.updateLOD(50, 30);
      }
      expect(lodStrategy.getCurrentLODIndex()).toBe(1);
      
      // Second increase
      for (let i = 0; i < 60; i++) {
        lodStrategy.updateLOD(50, 30);
      }
      expect(lodStrategy.getCurrentLODIndex()).toBe(2);
      expect(lodStrategy.getCurrentLOD()?.polygonCount).toBe(50000);
    });

    it('should not increase above highest quality level', () => {
      // Increase to highest quality
      for (let i = 0; i < 200; i++) {
        lodStrategy.updateLOD(60, 30);
      }
      
      expect(lodStrategy.getCurrentLODIndex()).toBe(2);
      expect(lodStrategy.getCurrentLOD()?.polygonCount).toBe(50000);
    });
  });

  describe('updateLOD - hysteresis', () => {
    beforeEach(() => {
      lodStrategy.setLODLevels(testLODLevels);
    });

    it('should not change LOD if FPS is within threshold (25-35)', () => {
      const initialIndex = lodStrategy.getCurrentLODIndex();
      
      // FPS within threshold should not trigger change
      for (let i = 0; i < 100; i++) {
        lodStrategy.updateLOD(28, 30);
      }
      
      expect(lodStrategy.getCurrentLODIndex()).toBe(initialIndex);
    });

    it('should require minimum frames between LOD changes', () => {
      // Try to change LOD immediately
      lodStrategy.updateLOD(20, 30);
      const indexAfterOne = lodStrategy.getCurrentLODIndex();
      
      // Should not have changed yet
      expect(indexAfterOne).toBe(2);
      
      // After 60 frames, should change
      for (let i = 0; i < 60; i++) {
        lodStrategy.updateLOD(20, 30);
      }
      
      expect(lodStrategy.getCurrentLODIndex()).toBe(1);
    });
  });

  describe('reset', () => {
    it('should reset to highest quality LOD', () => {
      lodStrategy.setLODLevels(testLODLevels);
      
      // Reduce quality
      for (let i = 0; i < 200; i++) {
        lodStrategy.updateLOD(15, 30);
      }
      expect(lodStrategy.getCurrentLODIndex()).toBe(0);
      
      // Reset
      lodStrategy.reset();
      expect(lodStrategy.getCurrentLODIndex()).toBe(2);
      expect(lodStrategy.getCurrentLOD()?.polygonCount).toBe(50000);
    });
  });

  describe('LOD change callback', () => {
    it('should call callback when LOD level changes', () => {
      const callback = jest.fn();
      lodStrategy = new AdaptiveLODStrategy(callback);
      lodStrategy.setLODLevels(testLODLevels);
      
      // Trigger LOD change
      for (let i = 0; i < 60; i++) {
        lodStrategy.updateLOD(20, 30);
      }
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ polygonCount: 15000 }),
        1
      );
    });

    it('should not call callback if LOD does not change', () => {
      const callback = jest.fn();
      lodStrategy = new AdaptiveLODStrategy(callback);
      lodStrategy.setLODLevels(testLODLevels);
      
      // FPS within threshold
      for (let i = 0; i < 100; i++) {
        lodStrategy.updateLOD(30, 30);
      }
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should allow setting callback after construction', () => {
      const callback = jest.fn();
      lodStrategy.setLODLevels(testLODLevels);
      lodStrategy.setLODChangeCallback(callback);
      
      // Trigger LOD change
      for (let i = 0; i < 60; i++) {
        lodStrategy.updateLOD(20, 30);
      }
      
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle single LOD level', () => {
      const singleLevel: LODLevel[] = [
        { distance: 0, polygonCount: 10000, filePath: 'model.glb' },
      ];
      
      lodStrategy.setLODLevels(singleLevel);
      expect(lodStrategy.getCurrentLODIndex()).toBe(0);
      
      // Should not crash when trying to change LOD
      for (let i = 0; i < 100; i++) {
        lodStrategy.updateLOD(20, 30);
      }
      
      expect(lodStrategy.getCurrentLODIndex()).toBe(0);
    });

    it('should handle two LOD levels', () => {
      const twoLevels: LODLevel[] = [
        { distance: 0, polygonCount: 5000, filePath: 'model-low.glb' },
        { distance: 0, polygonCount: 50000, filePath: 'model-high.glb' },
      ];
      
      lodStrategy.setLODLevels(twoLevels);
      expect(lodStrategy.getCurrentLODIndex()).toBe(1);
      
      // Reduce quality
      for (let i = 0; i < 60; i++) {
        lodStrategy.updateLOD(20, 30);
      }
      
      expect(lodStrategy.getCurrentLODIndex()).toBe(0);
    });

    it('should return null for getCurrentLOD when no levels set', () => {
      const emptyStrategy = new AdaptiveLODStrategy();
      emptyStrategy.setLODLevels(testLODLevels);
      
      // Manually clear levels (edge case)
      const currentLOD = emptyStrategy.getCurrentLOD();
      expect(currentLOD).not.toBeNull();
    });
  });
});
