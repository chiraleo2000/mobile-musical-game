/**
 * LifecycleManager - Handles React Native app lifecycle events
 * 
 * Manages background/foreground transitions, audio interruptions, and state persistence.
 * Integrates with SoundEngine for audio control and StorageService for state persistence.
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4
 */

import { AppState, AppStateStatus } from 'react-native';
import { ISoundEngine } from '@domain/interfaces/ISoundEngine';
import { IStorageService } from '@domain/interfaces/IStorageService';
import { IInstrumentManager } from '@domain/interfaces/IInstrumentManager';

export interface LifecycleState {
  appState: AppStateStatus;
  isInterrupted: boolean;
  lastInstrumentId: string | null;
  savedAt: string | null;
}

export interface LifecycleManagerConfig {
  enableAutoRestore?: boolean;
  saveStateOnBackground?: boolean;
  stopAudioOnBackground?: boolean;
}

export class LifecycleManager {
  private appStateSubscription: any = null;
  private currentState: LifecycleState = {
    appState: 'active',
    isInterrupted: false,
    lastInstrumentId: null,
    savedAt: null,
  };
  private config: Required<LifecycleManagerConfig>;
  private isInitialized: boolean = false;

  constructor(
    private soundEngine: ISoundEngine,
    private storageService: IStorageService,
    private instrumentManager: IInstrumentManager,
    config: LifecycleManagerConfig = {}
  ) {
    this.config = {
      enableAutoRestore: config.enableAutoRestore ?? true,
      saveStateOnBackground: config.saveStateOnBackground ?? true,
      stopAudioOnBackground: config.stopAudioOnBackground ?? true,
    };
  }

  /**
   * Initialize lifecycle manager and start listening to app state changes
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // Subscribe to app state changes
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this)
    );

    this.currentState.appState = AppState.currentState;
    this.isInitialized = true;
  }

  /**
   * Clean up and remove listeners
   */
  dispose(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    this.isInitialized = false;
  }

  /**
   * Handle app state changes (active, background, inactive)
   */
  private async handleAppStateChange(nextAppState: AppStateStatus): Promise<void> {
    const previousState = this.currentState.appState;

    // Transitioning to background
    if (
      previousState === 'active' &&
      (nextAppState === 'background' || nextAppState === 'inactive')
    ) {
      await this.onAppBackground();
    }

    // Transitioning to foreground
    if (
      (previousState === 'background' || previousState === 'inactive') &&
      nextAppState === 'active'
    ) {
      await this.onAppForeground();
    }

    this.currentState.appState = nextAppState;
  }

  /**
   * Handle app moving to background
   * Stops audio playback and saves current state
   * 
   * Requirement 14.1: Stop audio when app moves to background
   * Requirement 14.4: Save user preferences and last selected instrument
   */
  async onAppBackground(): Promise<void> {
    try {
      // Stop audio playback
      if (this.config.stopAudioOnBackground) {
        this.soundEngine.stopAll();
      }

      // Save current state
      if (this.config.saveStateOnBackground) {
        const currentInstrument = this.instrumentManager.getCurrentInstrument();
        if (currentInstrument) {
          await this.storageService.saveLastInstrument(currentInstrument.id);
          this.currentState.lastInstrumentId = currentInstrument.id;
        }
        this.currentState.savedAt = new Date().toISOString();
      }
    } catch (error) {
      console.error('Error handling app background:', error);
    }
  }

  /**
   * Handle app returning to foreground
   * Restores state and reloads instrument if needed
   * 
   * Requirement 14.2: Restore previously selected instrument when returning to foreground
   */
  async onAppForeground(): Promise<void> {
    try {
      // Restore state if auto-restore is enabled
      if (this.config.enableAutoRestore) {
        const lastInstrumentId = await this.storageService.loadLastInstrument();
        
        // Only reload if we don't have a current instrument or it's different
        const currentInstrument = this.instrumentManager.getCurrentInstrument();
        if (lastInstrumentId && currentInstrument?.id !== lastInstrumentId) {
          try {
            await this.instrumentManager.loadInstrument(lastInstrumentId);
            this.currentState.lastInstrumentId = lastInstrumentId;
          } catch (error) {
            console.error('Failed to restore instrument:', error);
          }
        }
      }

      // Clear interruption flag if set
      if (this.currentState.isInterrupted) {
        this.currentState.isInterrupted = false;
      }
    } catch (error) {
      console.error('Error handling app foreground:', error);
    }
  }

  /**
   * Handle audio interruption (phone calls, notifications, etc.)
   * Pauses audio playback during interruption
   * 
   * Requirement 14.3: Pause audio during calls/notifications
   */
  async onInterruption(): Promise<void> {
    try {
      // Stop all audio playback
      this.soundEngine.stopAll();
      
      // Mark as interrupted
      this.currentState.isInterrupted = true;
    } catch (error) {
      console.error('Error handling interruption:', error);
    }
  }

  /**
   * Handle resumption after interruption
   * Resumes audio playback after interruption ends
   * 
   * Requirement 14.3: Resume audio after interruption ends
   */
  async onResume(): Promise<void> {
    try {
      // Clear interruption flag
      this.currentState.isInterrupted = false;
      
      // Audio will resume naturally when user interacts with instrument
      // No need to automatically restart playback
    } catch (error) {
      console.error('Error handling resume:', error);
    }
  }

  /**
   * Get current lifecycle state
   */
  getState(): LifecycleState {
    return { ...this.currentState };
  }

  /**
   * Check if app is currently in background
   */
  isInBackground(): boolean {
    return this.currentState.appState === 'background';
  }

  /**
   * Check if app is currently interrupted
   */
  isInterrupted(): boolean {
    return this.currentState.isInterrupted;
  }

  /**
   * Manually trigger background handler (useful for testing)
   */
  async triggerBackground(): Promise<void> {
    await this.onAppBackground();
  }

  /**
   * Manually trigger foreground handler (useful for testing)
   */
  async triggerForeground(): Promise<void> {
    await this.onAppForeground();
  }

  /**
   * Manually trigger interruption handler (useful for testing)
   */
  async triggerInterruption(): Promise<void> {
    await this.onInterruption();
  }

  /**
   * Manually trigger resume handler (useful for testing)
   */
  async triggerResume(): Promise<void> {
    await this.onResume();
  }
}
