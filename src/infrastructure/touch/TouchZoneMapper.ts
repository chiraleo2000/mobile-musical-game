/**
 * TouchZoneMapper
 * 
 * Maps touch coordinates to instrument interaction zones with automatic scaling
 * based on device screen size. Enforces minimum 44px touch targets for accessibility.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.3
 */

import { InteractionZone, Bounds2D } from '../../domain/entities/Instrument';
import { Point2D } from '../../domain/entities/Touch';
import { DeviceInfo } from '../../domain/entities/AppState';

export class TouchZoneMapper {
  private zones: InteractionZone[] = [];
  private screenScale: number = 1;
  private readonly BASE_WIDTH = 375; // Base design width (iPhone SE)
  private readonly MIN_TOUCH_TARGET = 44; // Minimum touch target size in pixels

  /**
   * Initialize the mapper with instrument zones and device info
   * Requirement 4.1: Touch-based instrument interaction
   */
  initialize(zones: InteractionZone[], deviceInfo: DeviceInfo): void {
    this.zones = zones;
    this.screenScale = this.calculateScreenScale(deviceInfo.screenWidth);
    this.scaleZones();
  }

  /**
   * Calculate screen scale factor based on device width
   * Requirement 5.3: Adaptive screen scaling
   */
  calculateScreenScale(screenWidth: number): number {
    return screenWidth / this.BASE_WIDTH;
  }

  /**
   * Scale all zones based on screen scale and enforce minimum touch targets
   * Requirements 4.2, 4.3, 4.4: Multi-touch support and touch target sizing
   * Requirement 5.3: Minimum 44x44 pixel touch targets
   */
  private scaleZones(): void {
    this.zones = this.zones.map(zone => ({
      ...zone,
      bounds: this.scaleBounds(zone.bounds),
    }));
  }

  /**
   * Scale a single bounds object with minimum size enforcement
   */
  private scaleBounds(bounds: Bounds2D): Bounds2D {
    const scaledWidth = bounds.width * this.screenScale;
    const scaledHeight = bounds.height * this.screenScale;

    return {
      x: bounds.x * this.screenScale,
      y: bounds.y * this.screenScale,
      width: Math.max(scaledWidth, this.MIN_TOUCH_TARGET),
      height: Math.max(scaledHeight, this.MIN_TOUCH_TARGET),
    };
  }

  /**
   * Get the interaction zone at a specific point (hit detection)
   * Requirement 4.5: Visual feedback for touch registration
   */
  getZoneAtPoint(point: Point2D): InteractionZone | null {
    return this.zones.find(zone => this.isPointInBounds(point, zone.bounds)) || null;
  }

  /**
   * Check if a point is within bounds
   */
  private isPointInBounds(point: Point2D, bounds: Bounds2D): boolean {
    return (
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    );
  }

  /**
   * Get all scaled zones
   */
  getZones(): InteractionZone[] {
    return this.zones;
  }

  /**
   * Get current screen scale factor
   */
  getScreenScale(): number {
    return this.screenScale;
  }
}
