/**
 * Sound Engine Interface
 */

import { AudioSample } from '../entities/Instrument';

export interface MixerState {
  activeVoices: number;
  maxVoices: number;
  cpuLoad: number;
}

export interface ISoundEngine {
  initialize(): Promise<void>;
  loadAudioSamples(samples: AudioSample[]): Promise<void>;
  playNote(noteId: string, velocity: number): void;
  stopNote(noteId: string): void;
  stopAll(): void;
  setVolume(volume: number): void;
  getMixerState(): MixerState;
  dispose(): void;
}
