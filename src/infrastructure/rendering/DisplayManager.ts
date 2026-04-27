/**
 * Display Manager
 * Handles responsive layout, screen adaptation, and visual feedback
 */

import { Dimensions } from 'react-native';
import { DeviceInfo, Orientation } from '@domain/entities/AppState';
import { DeviceUtils } from '@infrastructure/utils/DeviceUtils';

export interface Size {
  width: number;
  height: number;
}

export interface Bounds2D {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface Layout {
  instrumentViewport: Viewport;
  controlsArea: Bounds2D;
  infoArea: Bounds2D;
  minTouchTargetSize: number;
}

export interface UIElement {
  width: number;
  height: number;
}

export type FeedbackType = 'highlight' | 'glow' | 'ripple' | 'animate';

export interface VisualFeedback {
  zoneId: string;
  type: FeedbackType;
  timestamp: number;
}

export class DisplayManager {
  private deviceInfo: DeviceInfo | null = null;
  private currentOrientation: Orientation = 'portrait';
  private activeFeedback: Map<string, VisualFeedback> = new Map();
  private feedbackCallbacks: Map<string, (feedback: VisualFeedback) => void> = new Map();

  /**
   * Initialize display manager with device information
   */
  initialize(): void {
    this.deviceInfo = DeviceUtils.getDeviceInfo();
    this.currentOrientation = this.detectOrientation();
  }

  /**
   * Get current device information
   */
  getDeviceInfo(): DeviceInfo {
    if (!this.deviceInfo) {
      this.initialize();
    }
    return this.deviceInfo!;
  }

  /**
   * Detect current screen orientation
   */
  private detectOrientation(): Orientation {
    const { width, height } = Dimensions.get('window');
    return width > height ? 'landscape' : 'portrait';
  }

  /**
   * Calculate layout based on orientation
   */
  calculateLayout(orientation: Orientation): Layout {
    const deviceInfo = this.getDeviceInfo();
    const { screenWidth, screenHeight } = deviceInfo;
    
    const minTouchTargetSize = DeviceUtils.getMinTouchTargetSize();
    
    if (orientation === 'portrait') {
      return this.calculatePortraitLayout(screenWidth, screenHeight, minTouchTargetSize);
    } else {
      return this.calculateLandscapeLayout(screenWidth, screenHeight, minTouchTargetSize);
    }
  }

  /**
   * Calculate portrait layout
   */
  private calculatePortraitLayout(
    screenWidth: number,
    screenHeight: number,
    minTouchTargetSize: number
  ): Layout {
    // Portrait: instrument takes top 60%, controls 30%, info 10%
    const instrumentHeight = screenHeight * 0.6;
    const controlsHeight = screenHeight * 0.3;
    const infoHeight = screenHeight * 0.1;

    return {
      instrumentViewport: {
        x: 0,
        y: 0,
        width: screenWidth,
        height: instrumentHeight,
        aspectRatio: screenWidth / instrumentHeight,
      },
      controlsArea: {
        x: 0,
        y: instrumentHeight,
        width: screenWidth,
        height: controlsHeight,
      },
      infoArea: {
        x: 0,
        y: instrumentHeight + controlsHeight,
        width: screenWidth,
        height: infoHeight,
      },
      minTouchTargetSize,
    };
  }

  /**
   * Calculate landscape layout
   */
  private calculateLandscapeLayout(
    screenWidth: number,
    screenHeight: number,
    minTouchTargetSize: number
  ): Layout {
    // Landscape: instrument takes left 70%, controls right 25%, info bottom 5%
    const instrumentWidth = screenWidth * 0.7;
    const controlsWidth = screenWidth * 0.25;
    const infoWidth = screenWidth * 0.05;
    
    return {
      instrumentViewport: {
        x: 0,
        y: 0,
        width: instrumentWidth,
        height: screenHeight,
        aspectRatio: instrumentWidth / screenHeight,
      },
      controlsArea: {
        x: instrumentWidth,
        y: 0,
        width: controlsWidth,
        height: screenHeight,
      },
      infoArea: {
        x: instrumentWidth + controlsWidth,
        y: 0,
        width: infoWidth,
        height: screenHeight,
      },
      minTouchTargetSize,
    };
  }

  /**
   * Scale element with minimum touch target size enforcement
   */
  scaleElement(element: UIElement, targetSize: Size): Size {
    const minTouchTargetSize = DeviceUtils.getMinTouchTargetSize();
    
    // Calculate scale factor to fit target size
    const scaleX = targetSize.width / element.width;
    const scaleY = targetSize.height / element.height;
    const scale = Math.min(scaleX, scaleY);
    
    // Apply scale
    let scaledWidth = element.width * scale;
    let scaledHeight = element.height * scale;
    
    // Enforce minimum touch target size
    if (scaledWidth < minTouchTargetSize) {
      scaledWidth = minTouchTargetSize;
    }
    if (scaledHeight < minTouchTargetSize) {
      scaledHeight = minTouchTargetSize;
    }
    
    return {
      width: scaledWidth,
      height: scaledHeight,
    };
  }

  /**
   * Adapt to screen changes (orientation, size)
   */
  adaptToScreen(): Layout {
    // Re-detect device info
    this.deviceInfo = DeviceUtils.getDeviceInfo();
    
    // Detect new orientation
    const newOrientation = this.detectOrientation();
    this.currentOrientation = newOrientation;
    
    // Calculate and return new layout
    return this.calculateLayout(newOrientation);
  }

  /**
   * Get current orientation
   */
  getCurrentOrientation(): Orientation {
    return this.currentOrientation;
  }

  /**
   * Show visual feedback for touch interaction
   */
  showVisualFeedback(zoneId: string, type: FeedbackType): void {
    const feedback: VisualFeedback = {
      zoneId,
      type,
      timestamp: Date.now(),
    };
    
    // Store active feedback
    this.activeFeedback.set(zoneId, feedback);
    
    // Trigger callback if registered
    const callback = this.feedbackCallbacks.get(zoneId);
    if (callback) {
      callback(feedback);
    }
    
    // Auto-clear feedback after duration based on type
    const duration = this.getFeedbackDuration(type);
    setTimeout(() => {
      this.clearVisualFeedback(zoneId);
    }, duration);
  }

  /**
   * Get feedback duration based on type
   */
  private getFeedbackDuration(type: FeedbackType): number {
    switch (type) {
      case 'highlight':
        return 200;
      case 'glow':
        return 300;
      case 'ripple':
        return 500;
      case 'animate':
        return 400;
      default:
        return 250;
    }
  }

  /**
   * Clear visual feedback for a zone
   */
  clearVisualFeedback(zoneId: string): void {
    this.activeFeedback.delete(zoneId);
  }

  /**
   * Get active feedback for a zone
   */
  getActiveFeedback(zoneId: string): VisualFeedback | undefined {
    return this.activeFeedback.get(zoneId);
  }

  /**
   * Register callback for visual feedback
   */
  registerFeedbackCallback(zoneId: string, callback: (feedback: VisualFeedback) => void): void {
    this.feedbackCallbacks.set(zoneId, callback);
  }

  /**
   * Unregister feedback callback
   */
  unregisterFeedbackCallback(zoneId: string): void {
    this.feedbackCallbacks.delete(zoneId);
  }

  /**
   * Clear all visual feedback
   */
  clearAllFeedback(): void {
    this.activeFeedback.clear();
  }

  /**
   * Get all active feedback
   */
  getAllActiveFeedback(): VisualFeedback[] {
    return Array.from(this.activeFeedback.values());
  }
}
