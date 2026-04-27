/**
 * Unit tests for StorageService
 * Tests preference persistence, last instrument state, and error log storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../StorageService';
import { UserPreferences, ErrorLogEntry } from '@domain/entities/AppState';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    storageService = new StorageService();
    jest.clearAllMocks();
  });

  describe('savePreferences and loadPreferences', () => {
    it('should save user preferences successfully', async () => {
      const preferences: UserPreferences = {
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

      await storageService.savePreferences(preferences);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@mobile_musical_game:preferences',
        JSON.stringify(preferences)
      );
    });

    it('should load user preferences successfully', async () => {
      const preferences: UserPreferences = {
        volume: 0.7,
        favoriteInstruments: ['guitar'],
        language: 'thai',
        visualQuality: 'medium',
        audioQuality: 'medium',
        showTutorial: false,
        hapticFeedback: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(preferences));

      const result = await storageService.loadPreferences();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@mobile_musical_game:preferences');
      expect(result).toEqual(preferences);
    });

    it('should return null when no preferences exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await storageService.loadPreferences();

      expect(result).toBeNull();
    });

    it('should throw error when save preferences fails', async () => {
      const preferences: UserPreferences = {
        volume: 0.5,
        favoriteInstruments: [],
        language: 'auto',
        visualQuality: 'auto',
        audioQuality: 'auto',
        showTutorial: false,
        hapticFeedback: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage full'));

      await expect(storageService.savePreferences(preferences)).rejects.toThrow(
        'STORAGE_ERROR: Failed to save preferences'
      );
    });

    it('should return null when load preferences fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Read error'));

      const result = await storageService.loadPreferences();

      expect(result).toBeNull();
    });
  });

  describe('saveLastInstrument and loadLastInstrument', () => {
    it('should save last instrument ID successfully', async () => {
      const instrumentId = 'ranat-ek';

      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.saveLastInstrument(instrumentId);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@mobile_musical_game:last_instrument',
        instrumentId
      );
    });

    it('should load last instrument ID successfully', async () => {
      const instrumentId = 'piano';

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(instrumentId);

      const result = await storageService.loadLastInstrument();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@mobile_musical_game:last_instrument');
      expect(result).toBe(instrumentId);
    });

    it('should return null when no last instrument exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await storageService.loadLastInstrument();

      expect(result).toBeNull();
    });

    it('should throw error when save last instrument fails', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(storageService.saveLastInstrument('guitar')).rejects.toThrow(
        'STORAGE_ERROR: Failed to save last instrument'
      );
    });

    it('should return null when load last instrument fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Read error'));

      const result = await storageService.loadLastInstrument();

      expect(result).toBeNull();
    });
  });

  describe('saveErrorLog and loadErrorLogs', () => {
    it('should save error log successfully', async () => {
      const errorLog: ErrorLogEntry = {
        error: {
          code: 'MODEL_LOAD_FAILED',
          message: 'Failed to load 3D model',
          timestamp: '2024-01-01T00:00:00Z',
          recoverable: true,
        },
        stackTrace: 'Error stack trace',
        userAction: 'Selected instrument',
        deviceState: {
          screenWidth: 375,
          screenHeight: 667,
          deviceType: 'phone',
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await storageService.saveErrorLog(errorLog);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@mobile_musical_game:error_logs',
        JSON.stringify([errorLog])
      );
    });

    it('should append new error log to existing logs', async () => {
      const existingLog: ErrorLogEntry = {
        error: {
          code: 'AUDIO_LOAD_FAILED',
          message: 'Failed to load audio',
          timestamp: '2024-01-01T00:00:00Z',
          recoverable: true,
        },
        deviceState: {},
      };

      const newLog: ErrorLogEntry = {
        error: {
          code: 'RENDER_ERROR',
          message: 'Render failed',
          timestamp: '2024-01-02T00:00:00Z',
          recoverable: false,
        },
        deviceState: {},
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([existingLog]));

      await storageService.saveErrorLog(newLog);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@mobile_musical_game:error_logs',
        JSON.stringify([newLog, existingLog])
      );
    });

    it('should limit error logs to MAX_ERROR_LOGS (100)', async () => {
      // Create 100 existing logs
      const existingLogs: ErrorLogEntry[] = Array.from({ length: 100 }, (_, i) => ({
        error: {
          code: 'UNKNOWN_ERROR',
          message: `Error ${i}`,
          timestamp: `2024-01-01T00:00:${i}Z`,
          recoverable: true,
        },
        deviceState: {},
      }));

      const newLog: ErrorLogEntry = {
        error: {
          code: 'STORAGE_ERROR',
          message: 'New error',
          timestamp: '2024-01-02T00:00:00Z',
          recoverable: true,
        },
        deviceState: {},
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingLogs));

      await storageService.saveErrorLog(newLog);

      const savedLogs = JSON.parse(
        (AsyncStorage.setItem as jest.Mock).mock.calls[0][1]
      );

      expect(savedLogs).toHaveLength(100);
      expect(savedLogs[0]).toEqual(newLog);
      expect(savedLogs[99]).toEqual(existingLogs[98]); // Oldest log is dropped
    });

    it('should load error logs successfully', async () => {
      const errorLogs: ErrorLogEntry[] = [
        {
          error: {
            code: 'NETWORK_ERROR',
            message: 'Network failed',
            timestamp: '2024-01-01T00:00:00Z',
            recoverable: true,
          },
          deviceState: {},
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(errorLogs));

      const result = await storageService.loadErrorLogs();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@mobile_musical_game:error_logs');
      expect(result).toEqual(errorLogs);
    });

    it('should return empty array when no error logs exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await storageService.loadErrorLogs();

      expect(result).toEqual([]);
    });

    it('should not throw when save error log fails', async () => {
      const errorLog: ErrorLogEntry = {
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Test error',
          timestamp: '2024-01-01T00:00:00Z',
          recoverable: true,
        },
        deviceState: {},
      };

      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      // Should not throw
      await expect(storageService.saveErrorLog(errorLog)).resolves.toBeUndefined();
    });

    it('should return empty array when load error logs fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Read error'));

      const result = await storageService.loadErrorLogs();

      expect(result).toEqual([]);
    });
  });

  describe('clearErrorLogs', () => {
    it('should clear error logs successfully', async () => {
      await storageService.clearErrorLogs();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@mobile_musical_game:error_logs');
    });

    it('should throw error when clear error logs fails', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Delete error'));

      await expect(storageService.clearErrorLogs()).rejects.toThrow(
        'STORAGE_ERROR: Failed to clear error logs'
      );
    });
  });

  describe('clearAll', () => {
    it('should clear all storage successfully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.clearAll();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@mobile_musical_game:preferences');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@mobile_musical_game:last_instrument');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@mobile_musical_game:error_logs');
      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(3);
    });

    it('should throw error when clear all fails', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Delete error'));

      await expect(storageService.clearAll()).rejects.toThrow(
        'STORAGE_ERROR: Failed to clear storage'
      );
    });
  });

  describe('error handling edge cases', () => {
    it('should handle malformed JSON in loadPreferences', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const result = await storageService.loadPreferences();

      expect(result).toBeNull();
    });

    it('should handle malformed JSON in loadErrorLogs', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const result = await storageService.loadErrorLogs();

      expect(result).toEqual([]);
    });

    it('should handle complex error details in error logs', async () => {
      const errorLog: ErrorLogEntry = {
        error: {
          code: 'AUDIO_ENGINE_ERROR',
          message: 'Audio engine crashed',
          details: {
            audioContext: 'suspended',
            activeVoices: 16,
            bufferSize: 4096,
          },
          timestamp: '2024-01-01T00:00:00Z',
          recoverable: false,
        },
        stackTrace: 'Long stack trace...',
        userAction: 'Playing multiple notes',
        deviceState: {
          screenWidth: 768,
          screenHeight: 1024,
          deviceType: 'tablet',
          platform: 'ios',
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await storageService.saveErrorLog(errorLog);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@mobile_musical_game:error_logs',
        JSON.stringify([errorLog])
      );
    });
  });
});
