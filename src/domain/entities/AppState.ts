/**
 * Application state types
 */

import { Instrument } from './Instrument';

export type Language = 'thai' | 'english' | 'auto';
export type QualityLevel = 'low' | 'medium' | 'high' | 'auto';
export type ScreenType = 'splash' | 'library' | 'instrument' | 'settings' | 'info';
export type Orientation = 'portrait' | 'landscape';
export type DeviceType = 'phone' | 'tablet';
export type Platform = 'ios' | 'android';

export interface UserPreferences {
  userId?: string;
  volume: number;
  lastSelectedInstrument?: string;
  favoriteInstruments: string[];
  language: Language;
  visualQuality: QualityLevel;
  audioQuality: QualityLevel;
  showTutorial: boolean;
  hapticFeedback: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceInfo {
  screenWidth: number;
  screenHeight: number;
  screenDiagonal: number;
  pixelDensity: number;
  deviceType: DeviceType;
  platform: Platform;
}

export interface PerformanceMetrics {
  fps: number;
  drawCalls: number;
  triangles: number;
  memoryUsage: number;
}

export type ErrorCode =
  | 'MODEL_LOAD_FAILED'
  | 'AUDIO_LOAD_FAILED'
  | 'RENDER_ERROR'
  | 'AUDIO_ENGINE_ERROR'
  | 'OUT_OF_MEMORY'
  | 'NETWORK_ERROR'
  | 'STORAGE_ERROR'
  | 'UNKNOWN_ERROR';

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: string;
  recoverable: boolean;
}

export interface ErrorLogEntry {
  error: AppError;
  stackTrace?: string;
  userAction?: string;
  deviceState: Partial<DeviceInfo>;
}

export interface InstrumentLibrary {
  instruments: Instrument[];
}

export interface ApplicationState {
  currentScreen: ScreenType;
  selectedInstrument: Instrument | null;
  isLoading: boolean;
  loadingProgress: number;
  instrumentLibrary: InstrumentLibrary;
  filteredInstruments: Instrument[];
  userPreferences: UserPreferences;
  deviceInfo: DeviceInfo;
  orientation: Orientation;
  performanceMetrics: PerformanceMetrics;
  qualityLevel: QualityLevel;
  error: AppError | null;
  errorLog: ErrorLogEntry[];
}
