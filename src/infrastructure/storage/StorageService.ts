/**
 * Storage Service Implementation using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IStorageService } from '@domain/interfaces/IStorageService';
import { UserPreferences, ErrorLogEntry } from '@domain/entities/AppState';

const STORAGE_KEYS = {
  PREFERENCES: '@mobile_musical_game:preferences',
  LAST_INSTRUMENT: '@mobile_musical_game:last_instrument',
  ERROR_LOGS: '@mobile_musical_game:error_logs',
} as const;

const MAX_ERROR_LOGS = 100; // Maximum number of error logs to keep

export class StorageService implements IStorageService {
  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      const jsonValue = JSON.stringify(preferences);
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, jsonValue);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw new Error('STORAGE_ERROR: Failed to save preferences');
    }
  }

  async loadPreferences(): Promise<UserPreferences | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return null;
    }
  }

  async saveLastInstrument(instrumentId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_INSTRUMENT, instrumentId);
    } catch (error) {
      console.error('Failed to save last instrument:', error);
      throw new Error('STORAGE_ERROR: Failed to save last instrument');
    }
  }

  async loadLastInstrument(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_INSTRUMENT);
    } catch (error) {
      console.error('Failed to load last instrument:', error);
      return null;
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_INSTRUMENT);
      await AsyncStorage.removeItem(STORAGE_KEYS.ERROR_LOGS);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw new Error('STORAGE_ERROR: Failed to clear storage');
    }
  }

  async saveErrorLog(errorLog: ErrorLogEntry): Promise<void> {
    try {
      // Load existing error logs
      const existingLogs = await this.loadErrorLogs();
      
      // Add new error log at the beginning
      const updatedLogs = [errorLog, ...existingLogs];
      
      // Keep only the most recent MAX_ERROR_LOGS entries
      const trimmedLogs = updatedLogs.slice(0, MAX_ERROR_LOGS);
      
      // Save back to storage
      const jsonValue = JSON.stringify(trimmedLogs);
      await AsyncStorage.setItem(STORAGE_KEYS.ERROR_LOGS, jsonValue);
    } catch (error) {
      console.error('Failed to save error log:', error);
      // Don't throw here to prevent error logging from causing more errors
    }
  }

  async loadErrorLogs(): Promise<ErrorLogEntry[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.ERROR_LOGS);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Failed to load error logs:', error);
      return [];
    }
  }

  async clearErrorLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ERROR_LOGS);
    } catch (error) {
      console.error('Failed to clear error logs:', error);
      throw new Error('STORAGE_ERROR: Failed to clear error logs');
    }
  }
}
