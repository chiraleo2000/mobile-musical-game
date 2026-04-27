/**
 * Instrument Manager Interface
 */

import { Instrument } from '../entities/Instrument';

export interface IInstrumentManager {
  loadInstrument(instrumentId: string): Promise<Instrument>;
  unloadInstrument(instrumentId: string): void;
  getCurrentInstrument(): Instrument | null;
  preloadInstruments(instrumentIds: string[]): Promise<void>;
}
