/**
 * TouchController
 * 
 * Unified touch controller that integrates TouchZoneMapper for zone detection
 * and InstrumentGestureRecognizer for gesture recognition. Handles multi-touch
 * scenarios and tracks active touches.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { ITouchController } from '../../domain/interfaces/ITouchController';
import { Instrument, InteractionZone } from '../../domain/entities/Instrument';
import { TouchAction, Point2D } from '../../domain/entities/Touch';
import { DeviceInfo } from '../../domain/entities/AppState';
import { TouchZoneMapper } from './TouchZoneMapper';
import { InstrumentGestureRecognizer, TouchEvent } from './InstrumentGestureRecognizer';

export class TouchController implements ITouchController {
  private mapper: TouchZoneMapper;
  private recognizer: InstrumentGestureRecognizer;
  private activeTouches: Map<number, InteractionZone>;
  private currentInstrument: Instrument | null = null;
  private deviceInfo: DeviceInfo | null = null;

  constructor(deviceInfo?: DeviceInfo) {
    this.mapper = new TouchZoneMapper();
    this.recognizer = new InstrumentGestureRecognizer();
    this.activeTouches = new Map();
    
    if (deviceInfo) {
      this.deviceInfo = deviceInfo;
    }
  }

  /**
   * Initialize the controller with an instrument
   * Sets up zones for the current instrument
   * Requirement 4.1: Touch-based instrument interaction
   */
  initialize(instrument: Instrument, deviceInfo?: DeviceInfo): void {
    this.currentInstrument = instrument;
    
    // Update device info if provided
    if (deviceInfo) {
      this.deviceInfo = deviceInfo;
    }
    
    // Ensure we have device info
    if (!this.deviceInfo) {
      throw new Error('DeviceInfo is required for TouchController initialization');
    }
    
    // Initialize mapper with instrument zones and device info
    this.mapper.initialize(instrument.interactionZones, this.deviceInfo);
    
    // Reset recognizer state
    this.recognizer.reset();
    
    // Clear active touches
    this.activeTouches.clear();
  }

  /**
   * Handle touch start event
   * Requirement 4.4: Multi-touch support
   */
  handleTouchStart(event: any): TouchAction | null {
    if (!this.currentInstrument) {
      return null;
    }

    const touchEvent = this.convertToTouchEvent(event, 'touchstart');
    const position: Point2D = { x: touchEvent.pageX, y: touchEvent.pageY };
    
    // Find the zone at touch position
    const zone = this.mapper.getZoneAtPoint(position);
    
    if (!zone) {
      return null;
    }
    
    // Track active touch
    const touchId = this.getTouchId(event);
    this.activeTouches.set(touchId, zone);
    
    // Recognize gesture
    const action = this.recognizer.recognizeGesture(touchEvent, zone);
    
    return action;
  }

  /**
   * Handle touch move event
   * Requirement 4.2: Pluck gesture with drag detection
   */
  handleTouchMove(event: any): TouchAction | null {
    if (!this.currentInstrument) {
      return null;
    }

    const touchEvent = this.convertToTouchEvent(event, 'touchmove');
    const touchId = this.getTouchId(event);
    
    // Get the zone associated with this touch
    const zone = this.activeTouches.get(touchId);
    
    if (!zone) {
      return null;
    }
    
    // Recognize gesture (mainly for pluck gestures that track movement)
    const action = this.recognizer.recognizeGesture(touchEvent, zone);
    
    return action;
  }

  /**
   * Handle touch end event
   * Requirement 4.3: Press/release detection
   */
  handleTouchEnd(event: any): TouchAction | null {
    if (!this.currentInstrument) {
      return null;
    }

    const touchEvent = this.convertToTouchEvent(event, 'touchend');
    const touchId = this.getTouchId(event);
    
    // Get the zone associated with this touch
    const zone = this.activeTouches.get(touchId);
    
    if (!zone) {
      return null;
    }
    
    // Recognize gesture
    const action = this.recognizer.recognizeGesture(touchEvent, zone);
    
    // Remove from active touches
    this.activeTouches.delete(touchId);
    
    return action;
  }

  /**
   * Get interaction zone at a specific position
   * Requirement 4.5: Visual feedback for touch registration
   */
  getInteractionZone(position: Point2D): InteractionZone | null {
    return this.mapper.getZoneAtPoint(position);
  }

  /**
   * Convert native touch event to internal TouchEvent format
   */
  private convertToTouchEvent(
    event: any,
    type: 'touchstart' | 'touchmove' | 'touchend'
  ): TouchEvent {
    // Handle React Native touch event structure
    const touch = event.nativeEvent?.touches?.[0] || event.nativeEvent?.changedTouches?.[0] || event;
    
    return {
      type,
      pageX: touch.pageX || touch.locationX || 0,
      pageY: touch.pageY || touch.locationY || 0,
      force: touch.force,
      timestamp: event.nativeEvent?.timestamp || Date.now(),
    };
  }

  /**
   * Get unique touch identifier
   * Requirement 4.4: Multi-touch tracking
   */
  private getTouchId(event: any): number {
    // Try to get touch identifier from event
    const touch = event.nativeEvent?.touches?.[0] || event.nativeEvent?.changedTouches?.[0];
    return touch?.identifier ?? 0;
  }

  /**
   * Get all active touches
   */
  getActiveTouches(): Map<number, InteractionZone> {
    return new Map(this.activeTouches);
  }

  /**
   * Get current instrument
   */
  getCurrentInstrument(): Instrument | null {
    return this.currentInstrument;
  }

  /**
   * Reset controller state
   */
  reset(): void {
    this.activeTouches.clear();
    this.recognizer.reset();
    this.currentInstrument = null;
  }
}
