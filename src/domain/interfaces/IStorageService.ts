/**
 * Storage Service Interface
 */

import { UserPreferences, ErrorLogEntry } from '../entities/AppState';

export interface IStorageService {
  savePreferences(preferences: UserPreferences): Promise<void>;
  loadPreferences(): Promise<UserPreferences | null>;
  saveLastInstrument(instrumentId: string): Promise<void>;
  loadLastInstrument(): Promise<string | null>;
  saveErrorLog(errorLog: ErrorLogEntry): Promise<void>;
  loadErrorLogs(): Promise<ErrorLogEntry[]>;
  clearErrorLogs(): Promise<void>;
  clearAll(): Promise<void>;
}
