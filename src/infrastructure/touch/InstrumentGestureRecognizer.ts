/**
 * InstrumentGestureRecognizer
 * 
 * Recognizes different gesture types for instrument interaction and calculates
 * velocity values based on gesture characteristics.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { InteractionZone } from '../../domain/entities/Instrument';
import { Point2D, TouchAction } from '../../domain/entities/Touch';

export interface TouchEvent {
  type: 'touchstart' | 'touchmove' | 'touchend';
  pageX: number;
  pageY: number;
  force?: number; // Touch pressure (0.0-1.0), if available
  timestamp: number;
}

export class InstrumentGestureRecognizer {
  private touchStartPosition: Point2D | null = null;

  /**
   * Main dispatcher for gesture recognition based on zone type
   * Requirement 4.1: Touch-based instrument interaction
   */
  recognizeGesture(
    event: TouchEvent,
    zone: InteractionZone
  ): TouchAction | null {
    switch (zone.type) {
      case 'strike':
        return this.recognizeStrike(event, zone);
      case 'pluck':
        return this.recognizePluck(event, zone);
      case 'press':
        return this.recognizePress(event, zone);
      default:
        return null;
    }
  }

  /**
   * Recognize strike gesture with velocity from touch pressure
   * Requirement 4.1: Strike action registration
   * 
   * Strike velocity is calculated from:
   * - Touch pressure (force) if available
   * - Default to 0.7 if pressure not available
   */
  private recognizeStrike(event: TouchEvent, zone: InteractionZone): TouchAction | null {
    if (event.type !== 'touchstart') {
      return null;
    }

    // Use touch pressure if available, otherwise default to 0.7
    const velocity = event.force !== undefined ? event.force : 0.7;
    
    // Apply zone sensitivity
    const adjustedVelocity = this.applyZoneSensitivity(velocity, zone.touchSensitivity);

    return {
      type: 'strike',
      zoneId: zone.id,
      position: { x: event.pageX, y: event.pageY },
      velocity: adjustedVelocity,
      timestamp: event.timestamp,
    };
  }

  /**
   * Recognize pluck gesture with velocity from drag distance
   * Requirement 4.2: Pluck action registration
   * 
   * Pluck velocity is calculated from:
   * - Distance dragged from start to end position
   * - Normalized to 0.0-1.0 range (100px = max velocity)
   */
  private recognizePluck(event: TouchEvent, zone: InteractionZone): TouchAction | null {
    if (event.type === 'touchstart') {
      // Store start position for distance calculation
      this.touchStartPosition = { x: event.pageX, y: event.pageY };
      return null;
    }

    if (event.type === 'touchend' && this.touchStartPosition) {
      const endPosition = { x: event.pageX, y: event.pageY };
      const distance = this.calculateDistance(this.touchStartPosition, endPosition);
      
      // Calculate velocity based on drag distance
      // 100px drag = velocity 1.0, clamped to 0.0-1.0 range
      const velocity = Math.min(distance / 100, 1.0);
      
      // Apply zone sensitivity
      const adjustedVelocity = this.applyZoneSensitivity(velocity, zone.touchSensitivity);

      // Reset tracking
      this.touchStartPosition = null;

      return {
        type: 'pluck',
        zoneId: zone.id,
        position: endPosition,
        velocity: adjustedVelocity,
        timestamp: event.timestamp,
      };
    }

    return null;
  }

  /**
   * Recognize press gesture for key press/release
   * Requirement 4.3: Key press action registration
   * 
   * Press gestures support sustained notes:
   * - touchstart = press (note on)
   * - touchend = release (note off)
   */
  private recognizePress(event: TouchEvent, zone: InteractionZone): TouchAction | null {
    if (event.type === 'touchstart') {
      // Use touch pressure if available, otherwise default to 0.8
      const velocity = event.force !== undefined ? event.force : 0.8;
      const adjustedVelocity = this.applyZoneSensitivity(velocity, zone.touchSensitivity);

      return {
        type: 'press',
        zoneId: zone.id,
        position: { x: event.pageX, y: event.pageY },
        velocity: adjustedVelocity,
        timestamp: event.timestamp,
      };
    }

    if (event.type === 'touchend') {
      return {
        type: 'release',
        zoneId: zone.id,
        position: { x: event.pageX, y: event.pageY },
        velocity: 0.0, // Release has no velocity
        timestamp: event.timestamp,
      };
    }

    return null;
  }

  /**
   * Calculate Euclidean distance between two points
   */
  private calculateDistance(p1: Point2D, p2: Point2D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Apply zone sensitivity to velocity
   * Requirement 4.4: Touch sensitivity adjustment
   * 
   * Zone sensitivity (0.0-1.0) scales the velocity:
   * - 1.0 = full sensitivity (no change)
   * - 0.5 = half sensitivity (velocity * 0.5)
   * - 0.0 = no sensitivity (velocity = 0)
   */
  private applyZoneSensitivity(velocity: number, sensitivity: number): number {
    const adjustedVelocity = velocity * sensitivity;
    // Ensure result is clamped to 0.0-1.0 range
    return Math.max(0.0, Math.min(1.0, adjustedVelocity));
  }

  /**
   * Reset internal state (useful for cleanup)
   */
  reset(): void {
    this.touchStartPosition = null;
  }
}
