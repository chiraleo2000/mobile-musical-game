/**
 * Touch Controller Interface
 */

import { Instrument, InteractionZone } from '../entities/Instrument';
import { TouchAction, Point2D } from '../entities/Touch';

export interface ITouchController {
  initialize(instrument: Instrument): void;
  handleTouchStart(event: any): TouchAction | null;
  handleTouchMove(event: any): TouchAction | null;
  handleTouchEnd(event: any): TouchAction | null;
  getInteractionZone(position: Point2D): InteractionZone | null;
}
