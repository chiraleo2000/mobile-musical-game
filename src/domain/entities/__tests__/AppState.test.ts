/**
 * Unit tests for AppState data model validation
 * Tests user preferences validation and application state
 */

import {
  UserPreferences,
  DeviceInfo,
  ApplicationState,
  AppError,
  Language,
  QualityLevel,
  Platform,
  ErrorCode,
} from '../AppState';

describe('AppState Data Model', () => {
  describe('UserPreferences validation', () => {
    it('should accept valid user preferences', () => {
      const prefs: UserPreferences = {
        volume: 0.8,
        favoriteInstruments: ['ranat-ek', 'piano'],
        language: 'english',
        visualQuality: 'high',
        audioQuality: 'high',
        showTutorial: true,
        hapticFeedback: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      expect(prefs.volume).toBe(0.8);
      expect(prefs.favoriteInstruments).toHaveLength(2);
    });

    it('should accept volume between 0.0 and 1.0', () => {
      const minVolume: UserPreferences = {
        volume: 0.0,
        favoriteInstruments: [],
        language: 'auto',
        visualQuality: 'auto',
        audioQuality: 'auto',
        showTutorial: false,
        hapticFeedback: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      expect(minVolume.volume).toBe(0.0);

      const maxVolume: UserPreferences = {
        volume: 1.0,
        favoriteInstruments: [],
        language: 'thai',
        visualQuality: 'low',
        audioQuality: 'medium',
        showTutorial: true,
        hapticFeedback: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      expect(maxVolume.volume).toBe(1.0);
    });

    it('should validate volume is within range', () => {
      const prefs: UserPreferences = {
        volume: 0.5,
        favoriteInstruments: [],
        language: 'english',
        visualQuality: 'medium',
        audioQuality: 'medium',
        showTutorial: false,
        hapticFeedback: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      expect(prefs.volume).toBeGreaterThanOrEqual(0.0);
      expect(prefs.volume).toBeLessThanOrEqual(1.0);
    });

    it('should accept optional userId', () => {
      const prefs: UserPreferences = {
        userId: 'user-123',
        volume: 0.7,
        favoriteInstruments: [],
        language: 'thai',
        visualQuality: 'high',
        audioQuality: 'high',
        showTutorial: false,
        hapticFeedback: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      expect(prefs.userId).toBe('user-123');
    });

    it('should accept optional lastSelectedInstrument', () => {
      const prefs: UserPreferences = {
        volume: 0.8,
        lastSelectedInstrument: 'ranat-ek',
        favoriteInstruments: ['ranat-ek'],
        language: 'english',
        visualQuality: 'auto',
        audioQuality: 'auto',
        showTutorial: false,
        hapticFeedback: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      expect(prefs.lastSelectedInstrument).toBe('ranat-ek');
    });

    it('should accept all language options', () => {
      const languages: Language[] = ['thai', 'english', 'auto'];
      languages.forEach((lang) => {
        const prefs: UserPreferences = {
          volume: 0.5,
          favoriteInstruments: [],
          language: lang,
          visualQuality: 'medium',
          audioQuality: 'medium',
          showTutorial: false,
          hapticFeedback: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        };
        expect(prefs.language).toBe(lang);
      });
    });

    it('should accept all quality levels', () => {
      const qualityLevels: QualityLevel[] = ['low', 'medium', 'high', 'auto'];
      qualityLevels.forEach((quality) => {
        const prefs: UserPreferences = {
          volume: 0.5,
          favoriteInstruments: [],
          language: 'auto',
          visualQuality: quality,
          audioQuality: quality,
          showTutorial: false,
          hapticFeedback: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        };
        expect(prefs.visualQuality).toBe(quality);
        expect(prefs.audioQuality).toBe(quality);
      });
    });

    it('should accept empty favorite instruments array', () => {
      const prefs: UserPreferences = {
        volume: 0.5,
        favoriteInstruments: [],
        language: 'english',
        visualQuality: 'medium',
        audioQuality: 'medium',
        showTutorial: false,
        hapticFeedback: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      expect(prefs.favoriteInstruments).toHaveLength(0);
    });

    it('should accept multiple favorite instruments', () => {
      const prefs: UserPreferences = {
        volume: 0.5,
        favoriteInstruments: ['ranat-ek', 'piano', 'guitar', 'drums'],
        language: 'english',
        visualQuality: 'medium',
        audioQuality: 'medium',
        showTutorial: false,
        hapticFeedback: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      expect(prefs.favoriteInstruments).toHaveLength(4);
    });
  });

  describe('DeviceInfo validation', () => {
    it('should accept valid phone device info', () => {
      const deviceInfo: DeviceInfo = {
        screenWidth: 375,
        screenHeight: 667,
        screenDiagonal: 4.7,
        pixelDensity: 2,
        deviceType: 'phone',
        platform: 'ios',
      };
      expect(deviceInfo.deviceType).toBe('phone');
      expect(deviceInfo.screenDiagonal).toBeGreaterThanOrEqual(4);
      expect(deviceInfo.screenDiagonal).toBeLessThanOrEqual(7);
    });

    it('should accept valid tablet device info', () => {
      const deviceInfo: DeviceInfo = {
        screenWidth: 768,
        screenHeight: 1024,
        screenDiagonal: 9.7,
        pixelDensity: 2,
        deviceType: 'tablet',
        platform: 'android',
      };
      expect(deviceInfo.deviceType).toBe('tablet');
      expect(deviceInfo.screenDiagonal).toBeGreaterThanOrEqual(7);
      expect(deviceInfo.screenDiagonal).toBeLessThanOrEqual(13);
    });

    it('should validate phone screen size range (4-7 inches)', () => {
      const smallPhone: DeviceInfo = {
        screenWidth: 320,
        screenHeight: 568,
        screenDiagonal: 4.0,
        pixelDensity: 2,
        deviceType: 'phone',
        platform: 'ios',
      };
      expect(smallPhone.screenDiagonal).toBeGreaterThanOrEqual(4);

      const largePhone: DeviceInfo = {
        screenWidth: 414,
        screenHeight: 896,
        screenDiagonal: 6.5,
        pixelDensity: 3,
        deviceType: 'phone',
        platform: 'android',
      };
      expect(largePhone.screenDiagonal).toBeLessThanOrEqual(7);
    });

    it('should validate tablet screen size range (7-13 inches)', () => {
      const smallTablet: DeviceInfo = {
        screenWidth: 600,
        screenHeight: 960,
        screenDiagonal: 7.0,
        pixelDensity: 1.5,
        deviceType: 'tablet',
        platform: 'android',
      };
      expect(smallTablet.screenDiagonal).toBeGreaterThanOrEqual(7);

      const largeTablet: DeviceInfo = {
        screenWidth: 1024,
        screenHeight: 1366,
        screenDiagonal: 12.9,
        pixelDensity: 2,
        deviceType: 'tablet',
        platform: 'ios',
      };
      expect(largeTablet.screenDiagonal).toBeLessThanOrEqual(13);
    });

    it('should accept both iOS and Android platforms', () => {
      const platforms: Platform[] = ['ios', 'android'];
      platforms.forEach((platform) => {
        const deviceInfo: DeviceInfo = {
          screenWidth: 375,
          screenHeight: 667,
          screenDiagonal: 4.7,
          pixelDensity: 2,
          deviceType: 'phone',
          platform,
        };
        expect(deviceInfo.platform).toBe(platform);
      });
    });
  });

  describe('AppError validation', () => {
    it('should accept valid app error', () => {
      const error: AppError = {
        code: 'MODEL_LOAD_FAILED',
        message: 'Failed to load 3D model',
        timestamp: '2024-01-01T00:00:00Z',
        recoverable: true,
      };
      expect(error.code).toBe('MODEL_LOAD_FAILED');
      expect(error.recoverable).toBe(true);
    });

    it('should accept all error codes', () => {
      const errorCodes: ErrorCode[] = [
        'MODEL_LOAD_FAILED',
        'AUDIO_LOAD_FAILED',
        'RENDER_ERROR',
        'AUDIO_ENGINE_ERROR',
        'OUT_OF_MEMORY',
        'NETWORK_ERROR',
        'STORAGE_ERROR',
        'UNKNOWN_ERROR',
      ];
      errorCodes.forEach((code) => {
        const error: AppError = {
          code,
          message: 'Test error',
          timestamp: '2024-01-01T00:00:00Z',
          recoverable: false,
        };
        expect(error.code).toBe(code);
      });
    });

    it('should accept optional error details', () => {
      const error: AppError = {
        code: 'AUDIO_LOAD_FAILED',
        message: 'Failed to load audio sample',
        details: { filePath: 'audio/c4.wav', reason: 'File not found' },
        timestamp: '2024-01-01T00:00:00Z',
        recoverable: true,
      };
      expect(error.details).toBeDefined();
      expect(error.details.filePath).toBe('audio/c4.wav');
    });

    it('should distinguish between recoverable and non-recoverable errors', () => {
      const recoverableError: AppError = {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        timestamp: '2024-01-01T00:00:00Z',
        recoverable: true,
      };
      expect(recoverableError.recoverable).toBe(true);

      const nonRecoverableError: AppError = {
        code: 'OUT_OF_MEMORY',
        message: 'Device out of memory',
        timestamp: '2024-01-01T00:00:00Z',
        recoverable: false,
      };
      expect(nonRecoverableError.recoverable).toBe(false);
    });
  });

  describe('ApplicationState validation', () => {
    it('should accept valid application state', () => {
      const state: ApplicationState = {
        currentScreen: 'library',
        selectedInstrument: null,
        isLoading: false,
        loadingProgress: 0,
        instrumentLibrary: { instruments: [] },
        filteredInstruments: [],
        userPreferences: {
          volume: 0.8,
          favoriteInstruments: [],
          language: 'english',
          visualQuality: 'high',
          audioQuality: 'high',
          showTutorial: true,
          hapticFeedback: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        deviceInfo: {
          screenWidth: 375,
          screenHeight: 667,
          screenDiagonal: 4.7,
          pixelDensity: 2,
          deviceType: 'phone',
          platform: 'ios',
        },
        orientation: 'portrait',
        performanceMetrics: {
          fps: 60,
          drawCalls: 10,
          triangles: 5000,
          memoryUsage: 100,
        },
        qualityLevel: 'high',
        error: null,
        errorLog: [],
      };
      expect(state.currentScreen).toBe('library');
      expect(state.isLoading).toBe(false);
    });

    it('should accept loading progress between 0 and 100', () => {
      const state: ApplicationState = {
        currentScreen: 'library',
        selectedInstrument: null,
        isLoading: true,
        loadingProgress: 50,
        instrumentLibrary: { instruments: [] },
        filteredInstruments: [],
        userPreferences: {
          volume: 0.5,
          favoriteInstruments: [],
          language: 'auto',
          visualQuality: 'auto',
          audioQuality: 'auto',
          showTutorial: false,
          hapticFeedback: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        deviceInfo: {
          screenWidth: 375,
          screenHeight: 667,
          screenDiagonal: 4.7,
          pixelDensity: 2,
          deviceType: 'phone',
          platform: 'ios',
        },
        orientation: 'portrait',
        performanceMetrics: {
          fps: 30,
          drawCalls: 5,
          triangles: 2500,
          memoryUsage: 50,
        },
        qualityLevel: 'medium',
        error: null,
        errorLog: [],
      };
      expect(state.loadingProgress).toBeGreaterThanOrEqual(0);
      expect(state.loadingProgress).toBeLessThanOrEqual(100);
    });

    it('should accept all screen types', () => {
      const screens = ['splash', 'library', 'instrument', 'settings', 'info'] as const;
      screens.forEach((screen) => {
        const state: Partial<ApplicationState> = {
          currentScreen: screen,
        };
        expect(state.currentScreen).toBe(screen);
      });
    });

    it('should accept both portrait and landscape orientations', () => {
      const orientations = ['portrait', 'landscape'] as const;
      orientations.forEach((orientation) => {
        const state: Partial<ApplicationState> = {
          orientation,
        };
        expect(state.orientation).toBe(orientation);
      });
    });

    it('should validate FPS is at least 30', () => {
      const state: Partial<ApplicationState> = {
        performanceMetrics: {
          fps: 30,
          drawCalls: 10,
          triangles: 5000,
          memoryUsage: 100,
        },
      };
      expect(state.performanceMetrics?.fps).toBeGreaterThanOrEqual(30);
    });
  });
});
