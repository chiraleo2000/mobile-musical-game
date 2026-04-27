/**
 * Instrument Repository
 * Manages instrument data access and filtering
 */

import { Instrument, PlayingMethod, Nationality } from '@domain/entities/Instrument';

export class InstrumentRepository {
  private instruments: Instrument[] = [];

  constructor(instruments: Instrument[] = []) {
    this.instruments = instruments;
  }

  getAllInstruments(): Instrument[] {
    return [...this.instruments];
  }

  getInstrumentById(id: string): Instrument | null {
    return this.instruments.find(inst => inst.id === id) || null;
  }

  getByNationality(nationality: Nationality): Instrument[] {
    return this.instruments.filter(inst => inst.nationality === nationality);
  }

  getByPlayingMethod(method: PlayingMethod): Instrument[] {
    return this.instruments.filter(inst => inst.playingMethod === method);
  }

  getByCategory(nationality: Nationality, method: PlayingMethod): Instrument[] {
    return this.instruments.filter(
      inst => inst.nationality === nationality && inst.playingMethod === method
    );
  }

  searchInstruments(query: string): Instrument[] {
    if (!query || query.trim() === '') {
      return [];
    }
    const lowerQuery = query.toLowerCase();
    return this.instruments.filter(
      inst =>
        inst.name.thai.toLowerCase().includes(lowerQuery) ||
        inst.name.english.toLowerCase().includes(lowerQuery) ||
        inst.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  addInstrument(instrument: Instrument): void {
    this.instruments.push(instrument);
  }

  removeInstrument(id: string): boolean {
    const index = this.instruments.findIndex(inst => inst.id === id);
    if (index !== -1) {
      this.instruments.splice(index, 1);
      return true;
    }
    return false;
  }

  updateInstrument(id: string, updates: Partial<Instrument>): boolean {
    const index = this.instruments.findIndex(inst => inst.id === id);
    if (index !== -1) {
      this.instruments[index] = { ...this.instruments[index], ...updates };
      return true;
    }
    return false;
  }
}
