/**
 * DisplayManager Unit Tests
 */

import { Dimensions } from 'react-native';
import { DisplayManager } from '../DisplayManager';

// Mock React Native modules
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
  PixelRatio: {
    get: jest.fn(() => 2),
  },
}));

describe('DisplayManager', () => {
  let displayManager: DisplayManager;
  const mockDimensions = Dimensions as jest.Mocked<typeof Dimensions>;

  // Helper to create proper ScaledSize mock
  const mockScreenSize = (width: number, height: number) => ({
    width,
    height,
    scale: 2,
    fontScale: 1,
  });

  beforeEach(() => {
    displayManager = new DisplayManager();
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize with device information', () => {
      mockDimensions.get.mockReturnValue(mockScreenSize(375, 667));

      displayManager.initialize();
      const deviceInfo = displayManager.getDeviceInfo();

      expect(deviceInfo).toBeDefined();
      expect(deviceInfo.screenWidth).toBe(375);
      expect(deviceInfo.screenHeight).toBe(667);
      expect(deviceInfo.deviceType).toBe('phone');
    });

    it('should detect tablet device type for larger screens', () => {
      // Large tablet dimensions that will exceed 7 inch diagonal
      // With scale 2 and 160 DPI baseline: 1400 / (2*160) = 4.375", 1800 / (2*160) = 5.625"
      // diagonal = sqrt(4.375² + 5.625²) = 7.13 inches
      mockDimensions.get.mockReturnValue(mockScreenSize(1400, 1800));

      displayManager.initialize();
      const deviceInfo = displayManager.getDeviceInfo();

      expect(deviceInfo.deviceType).toBe('tablet');
      expect(deviceInfo.screenDiagonal).toBeGreaterThanOrEqual(7);
    });

    it('should detect phone device type for smaller screens', () => {
      mockDimensions.get.mockReturnValue(mockScreenSize(375, 667));

      displayManager.initialize();
      const deviceInfo = displayManager.getDeviceInfo();

      expect(deviceInfo.deviceType).toBe('phone');
    });
  });

  describe('calculateLayout', () => {
    beforeEach(() => {
      mockDimensions.get.mockReturnValue(mockScreenSize(375, 667));
      displayManager.initialize();
    });

    it('should calculate portrait layout correctly', () => {
      const layout = displayManager.calculateLayout('portrait');

      expect(layout.instrumentViewport.width).toBe(375);
      expect(layout.instrumentViewport.height).toBe(667 * 0.6);
      expect(layout.controlsArea.height).toBe(667 * 0.3);
      expect(layout.infoArea.height).toBe(667 * 0.1);
      expect(layout.minTouchTargetSize).toBe(44);
    });

    it('should calculate landscape layout correctly', () => {
      mockDimensions.get.mockReturnValue(mockScreenSize(667, 375));
      displayManager.initialize();

      const layout = displayManager.calculateLayout('landscape');

      expect(layout.instrumentViewport.width).toBe(667 * 0.7);
      expect(layout.instrumentViewport.height).toBe(375);
      expect(layout.controlsArea.width).toBe(667 * 0.25);
      expect(layout.infoArea.width).toBe(667 * 0.05);
      expect(layout.minTouchTargetSize).toBe(44);
    });

    it('should set correct aspect ratio for portrait', () => {
      const layout = displayManager.calculateLayout('portrait');
      const expectedAspectRatio = 375 / (667 * 0.6);

      expect(layout.instrumentViewport.aspectRatio).toBeCloseTo(expectedAspectRatio, 2);
    });

    it('should set correct aspect ratio for landscape', () => {
      mockDimensions.get.mockReturnValue(mockScreenSize(667, 375));
      displayManager.initialize();

      const layout = displayManager.calculateLayout('landscape');
      const expectedAspectRatio = (667 * 0.7) / 375;

      expect(layout.instrumentViewport.aspectRatio).toBeCloseTo(expectedAspectRatio, 2);
    });
  });

  describe('scaleElement', () => {
    beforeEach(() => {
      mockDimensions.get.mockReturnValue(mockScreenSize(375, 667));
      displayManager.initialize();
    });

    it('should scale element to fit target size', () => {
      const element = { width: 100, height: 100 };
      const targetSize = { width: 200, height: 200 };

      const scaled = displayManager.scaleElement(element, targetSize);

      expect(scaled.width).toBe(200);
      expect(scaled.height).toBe(200);
    });

    it('should maintain aspect ratio when scaling', () => {
      const element = { width: 100, height: 50 };
      const targetSize = { width: 200, height: 200 };

      const scaled = displayManager.scaleElement(element, targetSize);

      expect(scaled.width).toBe(200);
      expect(scaled.height).toBe(100);
    });

    it('should enforce minimum touch target size of 44px for width', () => {
      const element = { width: 10, height: 50 };
      const targetSize = { width: 20, height: 100 };

      const scaled = displayManager.scaleElement(element, targetSize);

      expect(scaled.width).toBe(44);
      expect(scaled.height).toBe(100);
    });

    it('should enforce minimum touch target size of 44px for height', () => {
      const element = { width: 50, height: 10 };
      const targetSize = { width: 100, height: 20 };

      const scaled = displayManager.scaleElement(element, targetSize);

      expect(scaled.width).toBe(100);
      expect(scaled.height).toBe(44);
    });

    it('should enforce minimum touch target size for both dimensions', () => {
      const element = { width: 10, height: 10 };
      const targetSize = { width: 20, height: 20 };

      const scaled = displayManager.scaleElement(element, targetSize);

      expect(scaled.width).toBe(44);
      expect(scaled.height).toBe(44);
    });

    it('should not modify elements already larger than minimum size', () => {
      const element = { width: 100, height: 100 };
      const targetSize = { width: 50, height: 50 };

      const scaled = displayManager.scaleElement(element, targetSize);

      expect(scaled.width).toBe(50);
      expect(scaled.height).toBe(50);
    });
  });

  describe('adaptToScreen', () => {
    it('should detect orientation change from portrait to landscape', () => {
      mockDimensions.get.mockReturnValue(mockScreenSize(375, 667));
      displayManager.initialize();
      expect(displayManager.getCurrentOrientation()).toBe('portrait');

      mockDimensions.get.mockReturnValue(mockScreenSize(667, 375));
      const layout = displayManager.adaptToScreen();

      expect(displayManager.getCurrentOrientation()).toBe('landscape');
      expect(layout.instrumentViewport.width).toBe(667 * 0.7);
    });

    it('should detect orientation change from landscape to portrait', () => {
      mockDimensions.get.mockReturnValue(mockScreenSize(667, 375));
      displayManager.initialize();
      expect(displayManager.getCurrentOrientation()).toBe('landscape');

      mockDimensions.get.mockReturnValue(mockScreenSize(375, 667));
      const layout = displayManager.adaptToScreen();

      expect(displayManager.getCurrentOrientation()).toBe('portrait');
      expect(layout.instrumentViewport.height).toBe(667 * 0.6);
    });

    it('should update device info when adapting to screen', () => {
      mockDimensions.get.mockReturnValue(mockScreenSize(375, 667));
      displayManager.initialize();

      mockDimensions.get.mockReturnValue(mockScreenSize(768, 1024));
      displayManager.adaptToScreen();

      const deviceInfo = displayManager.getDeviceInfo();
      expect(deviceInfo.screenWidth).toBe(768);
      expect(deviceInfo.screenHeight).toBe(1024);
    });
  });

  describe('showVisualFeedback', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      mockDimensions.get.mockReturnValue(mockScreenSize(375, 667));
      displayManager.initialize();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should show visual feedback for a zone', () => {
      displayManager.showVisualFeedback('zone1', 'highlight');

      const feedback = displayManager.getActiveFeedback('zone1');
      expect(feedback).toBeDefined();
      expect(feedback?.zoneId).toBe('zone1');
      expect(feedback?.type).toBe('highlight');
    });

    it('should trigger callback when feedback is shown', () => {
      const callback = jest.fn();
      displayManager.registerFeedbackCallback('zone1', callback);

      displayManager.showVisualFeedback('zone1', 'glow');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          zoneId: 'zone1',
          type: 'glow',
        })
      );
    });

    it('should auto-clear feedback after highlight duration (200ms)', () => {
      displayManager.showVisualFeedback('zone1', 'highlight');
      expect(displayManager.getActiveFeedback('zone1')).toBeDefined();

      jest.advanceTimersByTime(200);
      expect(displayManager.getActiveFeedback('zone1')).toBeUndefined();
    });

    it('should auto-clear feedback after glow duration (300ms)', () => {
      displayManager.showVisualFeedback('zone1', 'glow');
      expect(displayManager.getActiveFeedback('zone1')).toBeDefined();

      jest.advanceTimersByTime(300);
      expect(displayManager.getActiveFeedback('zone1')).toBeUndefined();
    });

    it('should auto-clear feedback after ripple duration (500ms)', () => {
      displayManager.showVisualFeedback('zone1', 'ripple');
      expect(displayManager.getActiveFeedback('zone1')).toBeDefined();

      jest.advanceTimersByTime(500);
      expect(displayManager.getActiveFeedback('zone1')).toBeUndefined();
    });

    it('should auto-clear feedback after animate duration (400ms)', () => {
      displayManager.showVisualFeedback('zone1', 'animate');
      expect(displayManager.getActiveFeedback('zone1')).toBeDefined();

      jest.advanceTimersByTime(400);
      expect(displayManager.getActiveFeedback('zone1')).toBeUndefined();
    });

    it('should handle multiple feedback zones simultaneously', () => {
      displayManager.showVisualFeedback('zone1', 'highlight');
      displayManager.showVisualFeedback('zone2', 'glow');
      displayManager.showVisualFeedback('zone3', 'ripple');

      expect(displayManager.getActiveFeedback('zone1')).toBeDefined();
      expect(displayManager.getActiveFeedback('zone2')).toBeDefined();
      expect(displayManager.getActiveFeedback('zone3')).toBeDefined();
    });

    it('should get all active feedback', () => {
      displayManager.showVisualFeedback('zone1', 'highlight');
      displayManager.showVisualFeedback('zone2', 'glow');

      const allFeedback = displayManager.getAllActiveFeedback();
      expect(allFeedback).toHaveLength(2);
      expect(allFeedback.map(f => f.zoneId)).toContain('zone1');
      expect(allFeedback.map(f => f.zoneId)).toContain('zone2');
    });
  });

  describe('clearVisualFeedback', () => {
    beforeEach(() => {
      mockDimensions.get.mockReturnValue(mockScreenSize(375, 667));
      displayManager.initialize();
    });

    it('should clear specific zone feedback', () => {
      displayManager.showVisualFeedback('zone1', 'highlight');
      expect(displayManager.getActiveFeedback('zone1')).toBeDefined();

      displayManager.clearVisualFeedback('zone1');
      expect(displayManager.getActiveFeedback('zone1')).toBeUndefined();
    });

    it('should clear all feedback', () => {
      displayManager.showVisualFeedback('zone1', 'highlight');
      displayManager.showVisualFeedback('zone2', 'glow');

      displayManager.clearAllFeedback();

      expect(displayManager.getActiveFeedback('zone1')).toBeUndefined();
      expect(displayManager.getActiveFeedback('zone2')).toBeUndefined();
      expect(displayManager.getAllActiveFeedback()).toHaveLength(0);
    });
  });

  describe('feedback callbacks', () => {
    beforeEach(() => {
      mockDimensions.get.mockReturnValue(mockScreenSize(375, 667));
      displayManager.initialize();
    });

    it('should register and trigger callback', () => {
      const callback = jest.fn();
      displayManager.registerFeedbackCallback('zone1', callback);
      displayManager.showVisualFeedback('zone1', 'highlight');

      expect(callback).toHaveBeenCalled();
    });

    it('should unregister callback', () => {
      const callback = jest.fn();
      displayManager.registerFeedbackCallback('zone1', callback);
      displayManager.unregisterFeedbackCallback('zone1');
      displayManager.showVisualFeedback('zone1', 'highlight');

      expect(callback).not.toHaveBeenCalled();
    });

    it('should not trigger callback for different zone', () => {
      const callback = jest.fn();
      displayManager.registerFeedbackCallback('zone1', callback);
      displayManager.showVisualFeedback('zone2', 'highlight');

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle getDeviceInfo before initialize', () => {
      mockDimensions.get.mockReturnValue(mockScreenSize(375, 667));
      const deviceInfo = displayManager.getDeviceInfo();

      expect(deviceInfo).toBeDefined();
      expect(deviceInfo.screenWidth).toBe(375);
    });

    it('should handle square screen dimensions', () => {
      mockDimensions.get.mockReturnValue(mockScreenSize(500, 500));
      displayManager.initialize();

      const orientation = displayManager.getCurrentOrientation();
      expect(orientation).toBe('portrait'); // Equal dimensions default to portrait
    });

    it('should handle very small elements', () => {
      mockDimensions.get.mockReturnValue(mockScreenSize(375, 667));
      displayManager.initialize();

      const element = { width: 1, height: 1 };
      const targetSize = { width: 2, height: 2 };
      const scaled = displayManager.scaleElement(element, targetSize);

      expect(scaled.width).toBe(44);
      expect(scaled.height).toBe(44);
    });

    it('should handle very large target sizes', () => {
      mockDimensions.get.mockReturnValue(mockScreenSize(375, 667));
      displayManager.initialize();

      const element = { width: 50, height: 50 };
      const targetSize = { width: 1000, height: 1000 };
      const scaled = displayManager.scaleElement(element, targetSize);

      expect(scaled.width).toBe(1000);
      expect(scaled.height).toBe(1000);
    });
  });
});
