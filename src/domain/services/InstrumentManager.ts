/**
 * InstrumentManager - Domain service for managing instrument lifecycle
 * Coordinates loading/unloading of instruments with AssetLoader, RenderEngine, and SoundEngine
 */

import { Instrument } from '../entities/Instrument';
import { IInstrumentManager } from '../interfaces/IInstrumentManager';
import { IRenderEngine } from '../interfaces/IRenderEngine';
import { ISoundEngine } from '../interfaces/ISoundEngine';
import { AssetLoader } from '../../infrastructure/assets/AssetLoader';
import { InstrumentRepository } from '../../data/repositories/InstrumentRepository';

export interface InstrumentManagerConfig {
  enablePreloading?: boolean;
  maxConcurrentLoads?: number;
  retryAttempts?: number;
}

export class InstrumentManagerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly instrumentId?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'InstrumentManagerError';
  }
}

export class InstrumentManager implements IInstrumentManager {
  private currentInstrument: Instrument | null = null;
  private loadedInstruments: Map<string, Instrument> = new Map();
  private preloadQueue: string[] = [];
  private isPreloading: boolean = false;
  private config: Required<InstrumentManagerConfig>;

  constructor(
    private repository: InstrumentRepository,
    private assetLoader: AssetLoader,
    private renderEngine: IRenderEngine,
    private soundEngine: ISoundEngine,
    config: InstrumentManagerConfig = {}
  ) {
    this.config = {
      enablePreloading: config.enablePreloading ?? true,
      maxConcurrentLoads: config.maxConcurrentLoads ?? 3,
      retryAttempts: config.retryAttempts ?? 2,
    };
  }

  async loadInstrument(instrumentId: string): Promise<Instrument> {
    if (!instrumentId || instrumentId.trim() === '') {
      throw new InstrumentManagerError(
        'Instrument ID cannot be empty',
        'INVALID_INSTRUMENT_ID'
      );
    }

    const cached = this.loadedInstruments.get(instrumentId);
    if (cached) {
      this.currentInstrument = cached;
      return cached;
    }

    const instrument = this.repository.getInstrumentById(instrumentId);
    if (!instrument) {
      throw new InstrumentManagerError(
        `Instrument not found: ${instrumentId}`,
        'INSTRUMENT_NOT_FOUND',
        instrumentId
      );
    }

    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        await this.loadInstrumentAssets(instrument);
        this.loadedInstruments.set(instrumentId, instrument);
        this.currentInstrument = instrument;
        return instrument;
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.config.retryAttempts) {
          await this.delay(Math.pow(2, attempt) * 100);
        }
      }
    }

    throw new InstrumentManagerError(
      `Failed to load instrument after ${this.config.retryAttempts + 1} attempts: ${instrumentId}`,
      'LOAD_FAILED',
      instrumentId,
      lastError
    );
  }

  private async loadInstrumentAssets(instrument: Instrument): Promise<void> {
    const errors: Error[] = [];

    try {
      await this.assetLoader.loadModel(instrument.model3D.filePath);
      await this.renderEngine.loadModel(instrument.model3D);
    } catch (error) {
      errors.push(new Error(`Model load failed: ${error}`));
    }

    try {
      const audioLoadPromises = instrument.audioSamples.samples.map(sample =>
        this.assetLoader.loadAudio(sample.filePath)
      );
      await Promise.all(audioLoadPromises);
      await this.soundEngine.loadAudioSamples(instrument.audioSamples.samples);
    } catch (error) {
      errors.push(new Error(`Audio load failed: ${error}`));
    }

    if (errors.length > 0) {
      throw new InstrumentManagerError(
        `Asset loading failed: ${errors.map(e => e.message).join(', ')}`,
        'ASSET_LOAD_FAILED',
        instrument.id,
        errors[0]
      );
    }
  }

  unloadInstrument(instrumentId: string): void {
    if (!instrumentId || instrumentId.trim() === '') {
      return;
    }

    const instrument = this.loadedInstruments.get(instrumentId);
    if (!instrument) {
      return;
    }

    try {
      this.soundEngine.stopAll();
      if (this.currentInstrument?.id === instrumentId) {
        this.currentInstrument = null;
      }
      this.loadedInstruments.delete(instrumentId);
    } catch (error) {
      console.error(`Error unloading instrument ${instrumentId}:`, error);
    }
  }

  getCurrentInstrument(): Instrument | null {
    return this.currentInstrument;
  }

  async preloadInstruments(instrumentIds: string[]): Promise<void> {
    if (!this.config.enablePreloading) {
      return;
    }

    if (!Array.isArray(instrumentIds) || instrumentIds.length === 0) {
      return;
    }

    const toPreload = instrumentIds.filter(
      id => id && id.trim() !== '' && !this.loadedInstruments.has(id)
    );

    if (toPreload.length === 0) {
      return;
    }

    this.preloadQueue.push(...toPreload);

    if (!this.isPreloading) {
      await this.processPreloadQueue();
    }
  }

  private async processPreloadQueue(): Promise<void> {
    if (this.isPreloading || this.preloadQueue.length === 0) {
      return;
    }

    this.isPreloading = true;

    try {
      while (this.preloadQueue.length > 0) {
        const batch = this.preloadQueue.splice(0, this.config.maxConcurrentLoads);
        const loadPromises = batch.map(async (id) => {
          try {
            await this.loadInstrument(id);
          } catch (error) {
            console.warn(`Failed to preload instrument ${id}:`, error);
          }
        });
        await Promise.all(loadPromises);
      }
    } finally {
      this.isPreloading = false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getLoadedInstrumentsCount(): number {
    return this.loadedInstruments.size;
  }

  isInstrumentLoaded(instrumentId: string): boolean {
    return this.loadedInstruments.has(instrumentId);
  }

  unloadAll(): void {
    const instrumentIds = Array.from(this.loadedInstruments.keys());
    instrumentIds.forEach(id => this.unloadInstrument(id));
    this.currentInstrument = null;
  }
}
