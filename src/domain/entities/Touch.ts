/**
 * Touch interaction types
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Size {
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

export type TouchActionType = 'strike' | 'pluck' | 'press' | 'release';

export interface TouchAction {
  type: TouchActionType;
  zoneId: string;
  position: Point2D;
  velocity: number;
  timestamp: number;
}

export interface Gesture {
  type: 'tap' | 'drag' | 'pinch' | 'rotate';
  startPosition: Point2D;
  currentPosition: Point2D;
  delta: Point2D;
  scale?: number;
  rotation?: number;
}
