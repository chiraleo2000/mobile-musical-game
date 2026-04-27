/**
 * Low Latency Sound Engine Implementation
 * 
 * Implements ISoundEngine using Web Audio API for low-latency audio playback.
 * Supports polyphonic playback with voice stealing and velocity control.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 11.1, 11.2, 11.3, 11.4
 */

import { ISoundEngine, MixerState } from '../../domain/interfaces/ISoundEngine';
import { AudioSample } from '../../domain/entities/Instrument';

interface ActiveVoice {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  noteId: string;
  startTime: number;
}

export class LowLatencySoundEngine implements ISoundEngine {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private activeVoices: Map<string, ActiveVoice> = new Map();
  private masterGain: GainNode | null = null;
  private readonly maxVoices: number = 16;
  private isInitialized: boolean = false;

  /**
   * Initialize the audio engine with Web Audio API context
   * Sets up 44.1kHz sample rate and interactive latency hint for low latency
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Initialize Web Audio API context with low-latency settings
    this.audioContext = new AudioContext({
      sampleRate: 44100, // 44.1kHz as per requirement 11.1
      latencyHint: 'interactive', // Optimize for low latency (<100ms target)
    });

    // Create master gain node for volume control
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 1.0; // Default volume at 100%
    this.masterGain.connect(this.audioContext.destination);

    this.isInitialized = true;
  }

  /**
   * Load audio samples and decode them into audio buffers
   * Pre-loads samples to prevent delays during playback (Requirement 10.3)
   */
  async loadAudioSamples(samples: AudioSample[]): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Audio engine not initialized. Call initialize() first.');
    }

    const loadPromises = samples.map(async (sample) => {
      try {
        // Fetch audio file
        const response = await fetch(sample.filePath);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${sample.filePath}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        
        // Decode audio data
        const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
        
        // Store in buffer map using noteId as key
        this.audioBuffers.set(sample.noteId, audioBuffer);
      } catch (error) {
        console.error(`Failed to load audio sample ${sample.noteId}:`, error);
        throw error;
      }
    });

    await Promise.all(loadPromises);
  }

  /**
   * Play a note with velocity control
   * Implements voice stealing when max voices (16) reached
   * 
   * @param noteId - The note identifier to play
   * @param velocity - Volume level from 0.0 to 1.0
   */
  playNote(noteId: string, velocity: number): void {
    if (!this.audioContext || !this.masterGain) {
      console.warn('Audio engine not initialized');
      return;
    }

    const buffer = this.audioBuffers.get(noteId);
    if (!buffer) {
      console.warn(`Audio buffer not found for note: ${noteId}`);
      return;
    }

    // Voice stealing: remove oldest voice if max voices reached
    if (this.activeVoices.size >= this.maxVoices) {
      this.stealOldestVoice();
    }

    // Clamp velocity to valid range
    const clampedVelocity = Math.max(0.0, Math.min(1.0, velocity));

    // Create audio buffer source node
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    // Create gain node for velocity control
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = clampedVelocity;

    // Connect audio graph: source -> gain -> master -> destination
    source.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Start playback immediately
    source.start(0);

    // Generate unique voice ID and track active voice
    const voiceId = `${noteId}-${Date.now()}-${Math.random()}`;
    const voice: ActiveVoice = {
      source,
      gainNode,
      noteId,
      startTime: Date.now(),
    };
    this.activeVoices.set(voiceId, voice);

    // Remove from active voices when playback ends
    source.onended = () => {
      this.activeVoices.delete(voiceId);
    };
  }

  /**
   * Stop a specific note
   * Stops all active voices playing the given noteId
   */
  stopNote(noteId: string): void {
    const voicesToStop: string[] = [];

    // Find all voices playing this note
    this.activeVoices.forEach((voice, voiceId) => {
      if (voice.noteId === noteId) {
        voicesToStop.push(voiceId);
      }
    });

    // Stop and remove each voice
    voicesToStop.forEach((voiceId) => {
      const voice = this.activeVoices.get(voiceId);
      if (voice) {
        try {
          voice.source.stop();
        } catch (error) {
          // Source may have already stopped naturally
          console.debug('Voice already stopped:', voiceId);
        }
        this.activeVoices.delete(voiceId);
      }
    });
  }

  /**
   * Stop all currently playing notes
   */
  stopAll(): void {
    this.activeVoices.forEach((voice, voiceId) => {
      try {
        voice.source.stop();
      } catch (error) {
        // Source may have already stopped naturally
        console.debug('Voice already stopped:', voiceId);
      }
    });
    this.activeVoices.clear();
  }

  /**
   * Set master volume level
   * 
   * @param volume - Volume level from 0.0 (silent) to 1.0 (full volume)
   */
  setVolume(volume: number): void {
    if (!this.masterGain) {
      console.warn('Audio engine not initialized');
      return;
    }

    // Clamp volume to valid range (0.0 - 1.0)
    const clampedVolume = Math.max(0.0, Math.min(1.0, volume));
    this.masterGain.gain.value = clampedVolume;
  }

  /**
   * Get current mixer state for monitoring and debugging
   * 
   * @returns Current mixer state with active voice count and CPU load estimate
   */
  getMixerState(): MixerState {
    // Calculate CPU load estimate based on active voices
    // Simple heuristic: each voice uses approximately 6.25% of max capacity
    const cpuLoad = (this.activeVoices.size / this.maxVoices) * 100;

    return {
      activeVoices: this.activeVoices.size,
      maxVoices: this.maxVoices,
      cpuLoad: Math.round(cpuLoad),
    };
  }

  /**
   * Clean up resources and close audio context
   */
  dispose(): void {
    // Stop all active voices
    this.stopAll();

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Clear buffers
    this.audioBuffers.clear();
    this.masterGain = null;
    this.isInitialized = false;
  }

  /**
   * Voice stealing implementation: removes the oldest active voice
   * Called when max voices limit is reached
   */
  private stealOldestVoice(): void {
    let oldestVoiceId: string | null = null;
    let oldestStartTime = Infinity;

    // Find the oldest voice by start time
    this.activeVoices.forEach((voice, voiceId) => {
      if (voice.startTime < oldestStartTime) {
        oldestStartTime = voice.startTime;
        oldestVoiceId = voiceId;
      }
    });

    // Stop and remove the oldest voice
    if (oldestVoiceId) {
      const voice = this.activeVoices.get(oldestVoiceId);
      if (voice) {
        try {
          voice.source.stop();
        } catch (error) {
          // Voice may have already stopped
          console.debug('Voice already stopped during stealing:', oldestVoiceId);
        }
        this.activeVoices.delete(oldestVoiceId);
      }
    }
  }
}
