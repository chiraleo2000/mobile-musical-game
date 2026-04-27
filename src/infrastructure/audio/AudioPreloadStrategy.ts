/**
 * Audio Pre-loading Strategy
 * 
 * Implements intelligent audio sample loading with priority-based strategy.
 * Loads middle-range notes first (most commonly used), then loads remaining
 * samples in the background.
 * 
 * Requirements: 3.3, 10.3
 */

import { AudioSample, AudioSampleSet } from '../../domain/entities/Instrument';
import { LowLatencySoundEngine } from './LowLatencySoundEngine';

export interface LoadProgress {
  totalSamples: number;
  loadedSamples: number;
  priorityLoaded: boolean;
  percentage: number;
}

/**
 * Strategy for pre-loading audio samples with priority-based loading
 */
export class AudioPreloadStrategy {
  private soundEngine: LowLatencySoundEngine;
  private loadProgress: LoadProgress = {
    totalSamples: 0,
    loadedSamples: 0,
    priorityLoaded: false,
    percentage: 0,
  };

  constructor(soundEngine: LowLatencySoundEngine) {
    this.soundEngine = soundEngine;
  }

  /**
   * Pre-load instrument audio samples with priority loading strategy
   * 
   * Priority loading: Loads middle-range notes first (most commonly used)
   * Background loading: Loads remaining samples after priority samples
   * 
   * @param audioSampleSet - The audio sample set to preload
   * @returns Promise that resolves when priority samples are loaded
   */
  async preloadInstrument(audioSampleSet: AudioSampleSet): Promise<void> {
    const samples = audioSampleSet.samples;
    
    // Reset progress tracking
    this.loadProgress = {
      totalSamples: samples.length,
      loadedSamples: 0,
      priorityLoaded: false,
      percentage: 0,
    };

    if (samples.length === 0) {
      this.loadProgress.priorityLoaded = true;
      this.loadProgress.percentage = 100;
      return;
    }

    // Get priority samples (middle range notes)
    const prioritySamples = this.getPrioritySamples(samples);
    
    // Load priority samples first (blocking)
    await this.loadSamples(prioritySamples);
    this.loadProgress.priorityLoaded = true;

    // Get remaining samples
    const remainingSamples = this.getRemainingSamples(samples, prioritySamples);
    
    // Load remaining samples in background (non-blocking)
    if (remainingSamples.length > 0) {
      this.loadInBackground(remainingSamples);
    } else {
      // All samples were priority samples
      this.loadProgress.percentage = 100;
    }
  }

  /**
   * Get current loading progress
   */
  getProgress(): LoadProgress {
    return { ...this.loadProgress };
  }

  /**
   * Get priority samples (middle-range notes that are most commonly used)
   * 
   * Strategy: Load the middle 50% of notes by frequency/pitch
   * For non-pitched instruments, load the middle 50% by sample order
   */
  private getPrioritySamples(samples: AudioSample[]): AudioSample[] {
    if (samples.length <= 2) {
      // If very few samples, all are priority
      return samples;
    }

    // Sort samples by note frequency (if pitched) or by noteId
    const sortedSamples = this.sortSamplesByPitch(samples);

    // Calculate middle 50% range
    const quarterPoint = Math.floor(sortedSamples.length / 4);
    const threeQuarterPoint = Math.ceil((sortedSamples.length * 3) / 4);

    // Return middle 50% of samples
    return sortedSamples.slice(quarterPoint, threeQuarterPoint);
  }

  /**
   * Get remaining samples (low and high range notes)
   */
  private getRemainingSamples(
    allSamples: AudioSample[],
    prioritySamples: AudioSample[]
  ): AudioSample[] {
    const priorityIds = new Set(prioritySamples.map(s => s.id));
    return allSamples.filter(s => !priorityIds.has(s.id));
  }

  /**
   * Sort samples by pitch/frequency
   * 
   * Attempts to parse note names (e.g., "C4", "A#3") to determine pitch order.
   * Falls back to alphabetical sorting for non-standard note names.
   */
  private sortSamplesByPitch(samples: AudioSample[]): AudioSample[] {
    return [...samples].sort((a, b) => {
      const freqA = this.getNoteFrequency(a.noteId);
      const freqB = this.getNoteFrequency(b.noteId);
      return freqA - freqB;
    });
  }

  /**
   * Get approximate frequency for a note ID
   * 
   * Parses standard note notation (e.g., "C4", "A#3", "Bb5")
   * Returns a numeric value for sorting purposes
   */
  private getNoteFrequency(noteId: string): number {
    // Standard note names to semitone mapping (C = 0, C# = 1, etc.)
    const noteMap: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'Db': 1,
      'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4,
      'F': 5, 'F#': 6, 'Gb': 6,
      'G': 7, 'G#': 8, 'Ab': 8,
      'A': 9, 'A#': 10, 'Bb': 10,
      'B': 11,
    };

    // Try to parse note name (e.g., "C4", "A#3")
    const match = noteId.match(/^([A-G][#b]?)(\d+)/i);
    
    if (match) {
      const noteName = match[1].toUpperCase();
      const octave = parseInt(match[2], 10);
      
      const semitone = noteMap[noteName] ?? 0;
      // Calculate MIDI note number: (octave + 1) * 12 + semitone
      return (octave + 1) * 12 + semitone;
    }

    // Fallback: use character code sum for consistent ordering
    return noteId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  }

  /**
   * Load samples using the sound engine
   */
  private async loadSamples(samples: AudioSample[]): Promise<void> {
    await this.soundEngine.loadAudioSamples(samples);
    
    // Update progress
    this.loadProgress.loadedSamples += samples.length;
    this.loadProgress.percentage = Math.round(
      (this.loadProgress.loadedSamples / this.loadProgress.totalSamples) * 100
    );
  }

  /**
   * Load remaining samples in background (non-blocking)
   * 
   * Uses setTimeout to defer loading without blocking the main thread
   */
  private loadInBackground(samples: AudioSample[]): void {
    // Defer to next tick to avoid blocking
    setTimeout(async () => {
      try {
        await this.loadSamples(samples);
      } catch (error) {
        console.error('Background audio loading failed:', error);
        // Don't throw - background loading failure shouldn't break the app
      }
    }, 0);
  }
}
