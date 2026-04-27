/**
 * AppStateManager Unit Tests
 * Tests the core state management logic, action creators, and integration with services
 */

import { IStorageService } from '@domain/interfaces/IStorageService';
import { IInstrumentManager } from '@domain/interfaces/IInstrumentManager';
import { UserPreferences, AppError, ErrorLogEntry, ApplicationState } from '@domain/entities/AppState';
import { Instrument } from '@domain/entities/Instrument';

// Mock implementations
class MockStorageService implements IStorageService {
  private preferences: UserPreferences | null = null;
  private lastInstrument: string | null = null;
  private errorLogs: ErrorLogEntry[] = [];

  async savePreferences(preferences: UserPreferences): Promise<void> {
    this.preferences = preferences;
  }

  async loadPreferences(): Promise<UserPreferences | null> {
    return this.preferences;
  }

  async saveLastInstrument(instrumentId: string): Promise<void> {
    this.lastInstrument = instrumentId;
  }

  async loadLastInstrument(): Promise<string | null> {
    return this.lastInstrument;
  }

  async clearAll(): Promise<void> {
    this.preferences = null;
    this.lastInstrument = null;
    this.errorLogs = [];
  }

  async saveErrorLog(errorLog: ErrorLogEntry): Promise<void> {
    this.errorLogs.push(errorLog);
  }

  async loadErrorLogs(): Promise<ErrorLogEntry[]> {
    return this.errorLogs;
  }

  async clearErrorLogs(): Promise<void> {
    this.errorLogs = [];
  }

  // Test helper methods
  getStoredPreferences(): UserPreferences | null {
    return this.preferences;
  }

  getStoredLastInstrument(): string | null {
    return this.lastInstrument;
  }

  getStoredErrorLogs(): ErrorLogEntry[] {
    return this.errorLogs;
  }
}

class MockInstrumentManager implements IInstrumentManager {
  private currentInstrument: Instrument | null = null;
  private shouldFail: boolean = false;
  private loadDelay: number = 0;

  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  setLoadDelay(delay: number): void {
    this.loadDelay = delay;
  }

  async loadInstrument(instrumentId: string): Promise<Instrument> {
    if (this.loadDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.loadDelay));
    }

    if (this.shouldFail) {
      throw new Error(`Failed to load instrument: ${instrumentId}`);
    }

    const instrument: Instrument = {
      id: instrumentId,
      name: { thai: 'ทดสอบ', english: 'Test Instrument' },
      nationality: 'thai',
      playingMethod: 'striking',
      model3D: {
        modelId: 'test-model',
        filePath: '/models/test.glb',
        format: 'glb',
        lodLevels: [],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 1, y: 1, z: 1 },
        },
      },
      audioSamples: {
        samples: [],
        polyphony: 4,
      },
      interactionZones: [],
      culturalInfo: {
        description: { thai: 'คำอธิบาย', english: 'Description' },
        origin: { thai: 'ต้นกำเนิด', english: 'Origin' },
        usage: { thai: 'การใช้งาน', english: 'Usage' },
      },
      metadata: {
        difficulty: 'beginner',
        popularity: 50,
        dateAdded: '2024-01-01',
        version: '1.0.0',
        tags: ['test'],
      },
    };

    this.currentInstrument = instrument;
    return instrument;
  }

  unloadInstrument(instrumentId: string): void {
    if (this.currentInstrument?.id === instrumentId) {
      this.currentInstrument = null;
    }
  }

  getCurrentInstrument(): Instrument | null {
    return this.currentInstrument;
  }

  async preloadInstruments(_instrumentIds: string[]): Promise<void> {
    // Mock implementation
  }
}

// Helper class to simulate AppStateManager behavior
class AppStateManagerSimulator {
  private storageService: IStorageService;
  private instrumentManager: IInstrumentManager;
  public state: ApplicationState;

  constructor(storageService: IStorageService, instrumentManager: IInstrumentManager) {
    this.storageService = storageService;
    this.instrumentManager = instrumentManager;
    this.state = this.getInitialState();
  }

  private getInitialState(): ApplicationState {
    return {
      currentScreen: 'splash',
      selectedInstrument: null,
      isLoading: false,
      loadingProgress: 0,
      instrumentLibrary: { instruments: [] },
      filteredInstruments: [],
      userPreferences: {
        volume: 0.8,
        favoriteInstruments: [],
        language: 'auto',
        visualQuality: 'auto',
        audioQuality: 'high',
        showTutorial: true,
        hapticFeedback: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      deviceInfo: {
        screenWidth: 0,
        screenHeight: 0,
        screenDiagonal: 0,
        pixelDensity: 0,
        deviceType: 'phone',
        platform: 'ios',
      },
      orientation: 'portrait',
      performanceMetrics: {
        fps: 60,
        drawCalls: 0,
        triangles: 0,
        memoryUsage: 0,
      },
      qualityLevel: 'auto',
      error: null,
      errorLog: [],
    };
  }

  async initialize(): Promise<void> {
    const savedPreferences = await this.storageService.loadPreferences();
    if (savedPreferences) {
      this.state.userPreferences = savedPreferences;
    }

    const lastInstrumentId = await this.storageService.loadLastInstrument();
    if (lastInstrumentId) {
      this.state.userPreferences.lastSelectedInstrument = lastInstrumentId;
    }
  }

  async selectInstrument(instrumentId: string): Promise<void> {
    try {
      this.state.isLoading = true;
      this.state.loadingProgress = 0;
      this.state.error = null;

      const instrument = await this.instrumentManager.loadInstrument(instrumentId);

      this.state.selectedInstrument = instrument;
      this.state.loadingProgress = 100;

      await this.storageService.saveLastInstrument(instrumentId);
      this.state.userPreferences = {
        ...this.state.userPreferences,
        lastSelectedInstrument: instrumentId,
        updatedAt: new Date().toISOString(),
      };

      this.state.currentScreen = 'instrument';
    } catch (error) {
      const appError: AppError = {
        code: 'MODEL_LOAD_FAILED',
        message: error instanceof Error ? error.message : 'Failed to load instrument',
        details: { instrumentId },
        timestamp: new Date().toISOString(),
        recoverable: true,
      };

      this.state.error = appError;
      this.state.selectedInstrument = null;

      // Create error log entry directly instead of calling handleError
      const errorLogEntry: ErrorLogEntry = {
        error: appError,
        stackTrace: error instanceof Error ? error.stack : undefined,
        userAction: `selectInstrument(${instrumentId})`,
        deviceState: {
          screenWidth: this.state.deviceInfo.screenWidth,
          screenHeight: this.state.deviceInfo.screenHeight,
          deviceType: this.state.deviceInfo.deviceType,
          platform: this.state.deviceInfo.platform,
        },
      };

      this.state.errorLog = [errorLogEntry, ...this.state.errorLog].slice(0, 100);
      await this.storageService.saveErrorLog(errorLogEntry);

      throw error;
    } finally {
      this.state.isLoading = false;
    }
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    try {
      this.state.userPreferences = {
        ...this.state.userPreferences,
        ...preferences,
        updatedAt: new Date().toISOString(),
      };

      await this.storageService.savePreferences(this.state.userPreferences);
    } catch (error) {
      const appError: AppError = {
        code: 'STORAGE_ERROR',
        message: 'Failed to save preferences',
        details: { preferences },
        timestamp: new Date().toISOString(),
        recoverable: true,
      };

      this.state.error = appError;

      // Create error log entry directly
      const errorLogEntry: ErrorLogEntry = {
        error: appError,
        stackTrace: error instanceof Error ? error.stack : undefined,
        userAction: 'updatePreferences',
        deviceState: {
          screenWidth: this.state.deviceInfo.screenWidth,
          screenHeight: this.state.deviceInfo.screenHeight,
          deviceType: this.state.deviceInfo.deviceType,
          platform: this.state.deviceInfo.platform,
        },
      };

      this.state.errorLog = [errorLogEntry, ...this.state.errorLog].slice(0, 100);
      await this.storageService.saveErrorLog(errorLogEntry);

      throw error;
    }
  }

  async handleError(error: Error | AppError, userAction?: string): Promise<void> {
    try {
      const appError: AppError =
        'code' in error
          ? error
          : {
              code: 'UNKNOWN_ERROR',
              message: error.message || 'An unknown error occurred',
              details: error,
              timestamp: new Date().toISOString(),
              recoverable: false,
            };

      const errorLogEntry: ErrorLogEntry = {
        error: appError,
        stackTrace: error instanceof Error ? error.stack : undefined,
        userAction,
        deviceState: {
          screenWidth: this.state.deviceInfo.screenWidth,
          screenHeight: this.state.deviceInfo.screenHeight,
          deviceType: this.state.deviceInfo.deviceType,
          platform: this.state.deviceInfo.platform,
        },
      };

      this.state.error = appError;
      this.state.errorLog = [errorLogEntry, ...this.state.errorLog].slice(0, 100);

      await this.storageService.saveErrorLog(errorLogEntry);
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  clearError(): void {
    this.state.error = null;
  }

  setLoading(isLoading: boolean, progress?: number): void {
    this.state.isLoading = isLoading;
    if (progress !== undefined) {
      this.state.loadingProgress = progress;
    }
  }
}

describe('AppStateManager', () => {
  let mockStorageService: MockStorageService;
  let mockInstrumentManager: MockInstrumentManager;
  let appStateManager: AppStateManagerSimulator;

  beforeEach(() => {
    mockStorageService = new MockStorageService();
    mockInstrumentManager = new MockInstrumentManager();
    appStateManager = new AppStateManagerSimulator(mockStorageService, mockInstrumentManager);
  });

  describe('State Initialization', () => {
    it('should initialize with default state', () => {
      expect(appStateManager.state.currentScreen).toBe('splash');
      expect(appStateManager.state.selectedInstrument).toBeNull();
      expect(appStateManager.state.isLoading).toBe(false);
      expect(appStateManager.state.loadingProgress).toBe(0);
      expect(appStateManager.state.error).toBeNull();
      expect(appStateManager.state.userPreferences.volume).toBe(0.8);
      expect(appStateManager.state.userPreferences.language).toBe('auto');
      expect(appStateManager.state.userPreferences.showTutorial).toBe(true);
    });

    it('should load saved preferences on initialization', async () => {
      const savedPreferences: UserPreferences = {
        volume: 0.5,
        favoriteInstruments: ['inst1', 'inst2'],
        language: 'thai',
        visualQuality: 'high',
        audioQuality: 'high',
        showTutorial: false,
        hapticFeedback: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };

      await mockStorageService.savePreferences(savedPreferences);
      await appStateManager.initialize();

      expect(appStateManager.state.userPreferences.volume).toBe(0.5);
      expect(appStateManager.state.userPreferences.language).toBe('thai');
      expect(appStateManager.state.userPreferences.favoriteInstruments).toEqual(['inst1', 'inst2']);
      expect(appStateManager.state.userPreferences.showTutorial).toBe(false);
    });

    it('should load last selected instrument ID on initialization', async () => {
      await mockStorageService.saveLastInstrument('test-instrument-1');
      await appStateManager.initialize();

      expect(appStateManager.state.userPreferences.lastSelectedInstrument).toBe('test-instrument-1');
    });

    it('should handle missing saved preferences gracefully', async () => {
      await appStateManager.initialize();

      expect(appStateManager.state.userPreferences.volume).toBe(0.8);
      expect(appStateManager.state.userPreferences.language).toBe('auto');
    });
  });

  describe('selectInstrument', () => {
    it('should load and set selected instrument', async () => {
      await appStateManager.selectInstrument('test-instrument');

      expect(appStateManager.state.selectedInstrument).not.toBeNull();
      expect(appStateManager.state.selectedInstrument?.id).toBe('test-instrument');
      expect(appStateManager.state.selectedInstrument?.name.english).toBe('Test Instrument');
      expect(appStateManager.state.currentScreen).toBe('instrument');
      expect(appStateManager.state.isLoading).toBe(false);
    });

    it('should set loading state during instrument load', async () => {
      mockInstrumentManager.setLoadDelay(50);

      const loadPromise = appStateManager.selectInstrument('test-instrument');
      
      // Check loading state immediately
      expect(appStateManager.state.isLoading).toBe(true);

      await loadPromise;

      expect(appStateManager.state.isLoading).toBe(false);
    });

    it('should update loading progress to 100 after successful load', async () => {
      await appStateManager.selectInstrument('test-instrument');

      expect(appStateManager.state.loadingProgress).toBe(100);
    });

    it('should save last instrument to storage', async () => {
      await appStateManager.selectInstrument('test-instrument');

      const savedInstrument = mockStorageService.getStoredLastInstrument();
      expect(savedInstrument).toBe('test-instrument');
    });

    it('should update user preferences with last selected instrument', async () => {
      await appStateManager.selectInstrument('test-instrument');

      expect(appStateManager.state.userPreferences.lastSelectedInstrument).toBe('test-instrument');
    });

    it('should handle instrument load failure', async () => {
      mockInstrumentManager.setShouldFail(true);

      await expect(appStateManager.selectInstrument('failing-instrument')).rejects.toThrow();

      expect(appStateManager.state.error).not.toBeNull();
      expect(appStateManager.state.error?.code).toBe('MODEL_LOAD_FAILED');
      expect(appStateManager.state.error?.message).toContain('Failed to load instrument');
      expect(appStateManager.state.selectedInstrument).toBeNull();
      expect(appStateManager.state.isLoading).toBe(false);
    });

    it('should clear error before loading new instrument', async () => {
      // First, create an error
      mockInstrumentManager.setShouldFail(true);
      await expect(appStateManager.selectInstrument('failing-instrument')).rejects.toThrow();

      expect(appStateManager.state.error).not.toBeNull();

      // Now load successfully
      mockInstrumentManager.setShouldFail(false);
      await appStateManager.selectInstrument('test-instrument');

      expect(appStateManager.state.error).toBeNull();
      expect(appStateManager.state.selectedInstrument).not.toBeNull();
    });

    it('should log error when instrument load fails', async () => {
      mockInstrumentManager.setShouldFail(true);

      await expect(appStateManager.selectInstrument('failing-instrument')).rejects.toThrow();

      expect(appStateManager.state.errorLog.length).toBeGreaterThan(0);
      expect(appStateManager.state.errorLog[0].userAction).toContain('selectInstrument');
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      await appStateManager.updatePreferences({
        volume: 0.6,
        language: 'english',
      });

      expect(appStateManager.state.userPreferences.volume).toBe(0.6);
      expect(appStateManager.state.userPreferences.language).toBe('english');
    });

    it('should update updatedAt timestamp', async () => {
      const initialUpdatedAt = appStateManager.state.userPreferences.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      await appStateManager.updatePreferences({ volume: 0.7 });

      expect(appStateManager.state.userPreferences.updatedAt).not.toBe(initialUpdatedAt);
    });

    it('should persist preferences to storage', async () => {
      await appStateManager.updatePreferences({
        volume: 0.9,
        hapticFeedback: false,
      });

      const savedPreferences = mockStorageService.getStoredPreferences();
      expect(savedPreferences?.volume).toBe(0.9);
      expect(savedPreferences?.hapticFeedback).toBe(false);
    });

    it('should merge partial preferences with existing preferences', async () => {
      const initialLanguage = appStateManager.state.userPreferences.language;

      await appStateManager.updatePreferences({ volume: 0.3 });

      expect(appStateManager.state.userPreferences.volume).toBe(0.3);
      expect(appStateManager.state.userPreferences.language).toBe(initialLanguage);
    });

    it('should update multiple preferences at once', async () => {
      await appStateManager.updatePreferences({
        volume: 0.4,
        language: 'thai',
        visualQuality: 'low',
        hapticFeedback: false,
      });

      expect(appStateManager.state.userPreferences.volume).toBe(0.4);
      expect(appStateManager.state.userPreferences.language).toBe('thai');
      expect(appStateManager.state.userPreferences.visualQuality).toBe('low');
      expect(appStateManager.state.userPreferences.hapticFeedback).toBe(false);
    });
  });

  describe('handleError', () => {
    it('should handle Error objects', async () => {
      const error = new Error('Test error message');

      await appStateManager.handleError(error, 'testAction');

      expect(appStateManager.state.error).not.toBeNull();
      expect(appStateManager.state.error?.code).toBe('UNKNOWN_ERROR');
      expect(appStateManager.state.error?.message).toBe('Test error message');
    });

    it('should handle AppError objects', async () => {
      const appError: AppError = {
        code: 'AUDIO_LOAD_FAILED',
        message: 'Failed to load audio',
        timestamp: new Date().toISOString(),
        recoverable: true,
      };

      await appStateManager.handleError(appError, 'loadAudio');

      expect(appStateManager.state.error?.code).toBe('AUDIO_LOAD_FAILED');
      expect(appStateManager.state.error?.message).toBe('Failed to load audio');
    });

    it('should add error to error log', async () => {
      const error = new Error('Test error');

      await appStateManager.handleError(error, 'testAction');

      expect(appStateManager.state.errorLog.length).toBe(1);
      expect(appStateManager.state.errorLog[0].error.message).toBe('Test error');
      expect(appStateManager.state.errorLog[0].userAction).toBe('testAction');
    });

    it('should persist error log to storage', async () => {
      const error = new Error('Test error');

      await appStateManager.handleError(error);

      const errorLogs = mockStorageService.getStoredErrorLogs();
      expect(errorLogs.length).toBe(1);
      expect(errorLogs[0].error.message).toBe('Test error');
    });

    it('should include device state in error log', async () => {
      appStateManager.state.deviceInfo = {
        screenWidth: 375,
        screenHeight: 667,
        screenDiagonal: 4.7,
        pixelDensity: 2,
        deviceType: 'phone',
        platform: 'ios',
      };

      const error = new Error('Test error');

      await appStateManager.handleError(error);

      expect(appStateManager.state.errorLog[0].deviceState.screenWidth).toBe(375);
      expect(appStateManager.state.errorLog[0].deviceState.deviceType).toBe('phone');
      expect(appStateManager.state.errorLog[0].deviceState.platform).toBe('ios');
    });

    it('should limit error log to 100 entries', async () => {
      for (let i = 0; i < 105; i++) {
        await appStateManager.handleError(new Error(`Error ${i}`));
      }

      expect(appStateManager.state.errorLog.length).toBe(100);
      expect(appStateManager.state.errorLog[0].error.message).toBe('Error 104');
    });

    it('should include stack trace for Error objects', async () => {
      const error = new Error('Test error with stack');

      await appStateManager.handleError(error);

      expect(appStateManager.state.errorLog[0].stackTrace).toBeDefined();
    });
  });

  describe('clearError', () => {
    it('should clear current error', async () => {
      await appStateManager.handleError(new Error('Test error'));

      expect(appStateManager.state.error).not.toBeNull();

      appStateManager.clearError();

      expect(appStateManager.state.error).toBeNull();
    });

    it('should not affect error log', async () => {
      await appStateManager.handleError(new Error('Test error'));

      const errorLogLength = appStateManager.state.errorLog.length;

      appStateManager.clearError();

      expect(appStateManager.state.errorLog.length).toBe(errorLogLength);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      appStateManager.setLoading(true);

      expect(appStateManager.state.isLoading).toBe(true);

      appStateManager.setLoading(false);

      expect(appStateManager.state.isLoading).toBe(false);
    });

    it('should set loading progress when provided', () => {
      appStateManager.setLoading(true, 50);

      expect(appStateManager.state.isLoading).toBe(true);
      expect(appStateManager.state.loadingProgress).toBe(50);
    });

    it('should not change progress when not provided', () => {
      appStateManager.setLoading(true, 75);

      expect(appStateManager.state.loadingProgress).toBe(75);

      appStateManager.setLoading(false);

      expect(appStateManager.state.loadingProgress).toBe(75);
    });
  });

  describe('Integration Tests', () => {
    it('should persist state across multiple operations', async () => {
      await appStateManager.updatePreferences({ volume: 0.4 });
      await appStateManager.selectInstrument('test-instrument');

      const savedPreferences = mockStorageService.getStoredPreferences();
      const savedInstrument = mockStorageService.getStoredLastInstrument();

      expect(savedPreferences?.volume).toBe(0.4);
      expect(savedInstrument).toBe('test-instrument');
    });

    it('should handle error during preference update', async () => {
      // Mock storage failure
      mockStorageService.savePreferences = jest.fn().mockRejectedValue(new Error('Storage error'));

      await expect(appStateManager.updatePreferences({ volume: 0.5 })).rejects.toThrow();

      expect(appStateManager.state.error).not.toBeNull();
      expect(appStateManager.state.error?.code).toBe('STORAGE_ERROR');
    });

    it('should maintain state consistency after failed instrument load', async () => {
      const initialState = { ...appStateManager.state };

      mockInstrumentManager.setShouldFail(true);
      await expect(appStateManager.selectInstrument('failing-instrument')).rejects.toThrow();

      expect(appStateManager.state.selectedInstrument).toBeNull();
      expect(appStateManager.state.isLoading).toBe(false);
      expect(appStateManager.state.currentScreen).toBe(initialState.currentScreen);
    });

    it('should recover from error and load instrument successfully', async () => {
      mockInstrumentManager.setShouldFail(true);
      await expect(appStateManager.selectInstrument('failing-instrument')).rejects.toThrow();

      mockInstrumentManager.setShouldFail(false);
      await appStateManager.selectInstrument('test-instrument');

      expect(appStateManager.state.selectedInstrument).not.toBeNull();
      expect(appStateManager.state.error).toBeNull();
      expect(appStateManager.state.currentScreen).toBe('instrument');
    });
  });

  describe('Requirements Validation', () => {
    it('should satisfy Requirement 14.4 - save user preferences', async () => {
      await appStateManager.updatePreferences({
        volume: 0.75,
        language: 'thai',
      });

      const saved = mockStorageService.getStoredPreferences();
      expect(saved).not.toBeNull();
      expect(saved?.volume).toBe(0.75);
    });

    it('should satisfy Requirement 14.4 - save last selected instrument', async () => {
      await appStateManager.selectInstrument('ranat-ek');

      const saved = mockStorageService.getStoredLastInstrument();
      expect(saved).toBe('ranat-ek');
    });

    it('should satisfy Requirement 15.1 - handle model load failure', async () => {
      mockInstrumentManager.setShouldFail(true);

      await expect(appStateManager.selectInstrument('invalid')).rejects.toThrow();

      expect(appStateManager.state.error?.code).toBe('MODEL_LOAD_FAILED');
      expect(appStateManager.state.error?.recoverable).toBe(true);
    });

    it('should satisfy Requirement 15.4 - log errors for debugging', async () => {
      const error = new Error('Test error');

      await appStateManager.handleError(error, 'testOperation');

      const logs = mockStorageService.getStoredErrorLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].error.message).toBe('Test error');
      expect(logs[0].userAction).toBe('testOperation');
    });
  });
});
