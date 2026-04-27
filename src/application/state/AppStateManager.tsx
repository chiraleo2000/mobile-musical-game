/**
 * AppStateManager - Application state management with React Context and useReducer
 * Provides action creators for state updates and integrates with StorageService
 */

import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { ApplicationState, UserPreferences, AppError, ErrorLogEntry } from '@domain/entities/AppState';
import { Instrument } from '@domain/entities/Instrument';
import { IStorageService } from '@domain/interfaces/IStorageService';
import { IInstrumentManager } from '@domain/interfaces/IInstrumentManager';

// Action types
export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_PROGRESS'; payload: number }
  | { type: 'SET_SELECTED_INSTRUMENT'; payload: Instrument | null }
  | { type: 'SET_INSTRUMENTS'; payload: Instrument[] }
  | { type: 'SET_FILTERED_INSTRUMENTS'; payload: Instrument[] }
  | { type: 'SET_USER_PREFERENCES'; payload: UserPreferences }
  | { type: 'UPDATE_USER_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'SET_DEVICE_INFO'; payload: ApplicationState['deviceInfo'] }
  | { type: 'SET_ORIENTATION'; payload: ApplicationState['orientation'] }
  | { type: 'SET_QUALITY_LEVEL'; payload: ApplicationState['qualityLevel'] }
  | { type: 'SET_PERFORMANCE_METRICS'; payload: ApplicationState['performanceMetrics'] }
  | { type: 'SET_ERROR'; payload: AppError }
  | { type: 'CLEAR_ERROR' }
  | { type: 'ADD_ERROR_LOG'; payload: ErrorLogEntry }
  | { type: 'SET_SCREEN'; payload: ApplicationState['currentScreen'] };

// Initial state
const initialState: ApplicationState = {
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

// Reducer
function appReducer(state: ApplicationState, action: AppAction): ApplicationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_LOADING_PROGRESS':
      return { ...state, loadingProgress: action.payload };
    
    case 'SET_SELECTED_INSTRUMENT':
      return { ...state, selectedInstrument: action.payload };
    
    case 'SET_INSTRUMENTS':
      return {
        ...state,
        instrumentLibrary: { instruments: action.payload },
        filteredInstruments: action.payload,
      };
    
    case 'SET_FILTERED_INSTRUMENTS':
      return { ...state, filteredInstruments: action.payload };
    
    case 'SET_USER_PREFERENCES':
      return { ...state, userPreferences: action.payload };
    
    case 'UPDATE_USER_PREFERENCES':
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.payload,
          updatedAt: new Date().toISOString(),
        },
      };
    
    case 'SET_DEVICE_INFO':
      return { ...state, deviceInfo: action.payload };
    
    case 'SET_ORIENTATION':
      return { ...state, orientation: action.payload };
    
    case 'SET_QUALITY_LEVEL':
      return { ...state, qualityLevel: action.payload };
    
    case 'SET_PERFORMANCE_METRICS':
      return { ...state, performanceMetrics: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'ADD_ERROR_LOG':
      return {
        ...state,
        errorLog: [action.payload, ...state.errorLog].slice(0, 100), // Keep last 100 errors
      };
    
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload };
    
    default:
      return state;
  }
}

// Context type with action creators
interface AppStateManagerContextType {
  state: ApplicationState;
  dispatch: React.Dispatch<AppAction>;
  selectInstrument: (instrumentId: string) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  handleError: (error: Error | AppError, userAction?: string) => Promise<void>;
  clearError: () => void;
  setLoading: (isLoading: boolean, progress?: number) => void;
}

const AppStateManagerContext = createContext<AppStateManagerContextType | undefined>(undefined);

// Provider props
interface AppStateManagerProviderProps {
  children: ReactNode;
  storageService: IStorageService;
  instrumentManager: IInstrumentManager;
  initialState?: Partial<ApplicationState>;
}

/**
 * AppStateManager Provider Component
 * Manages global application state with React Context and useReducer
 */
export function AppStateManagerProvider({
  children,
  storageService,
  instrumentManager,
  initialState: customInitialState,
}: AppStateManagerProviderProps) {
  const [state, dispatch] = useReducer(
    appReducer,
    customInitialState ? { ...initialState, ...customInitialState } : initialState
  );

  // Load preferences and last instrument on mount
  useEffect(() => {
    const initializeState = async () => {
      try {
        // Load user preferences
        const savedPreferences = await storageService.loadPreferences();
        if (savedPreferences) {
          dispatch({ type: 'SET_USER_PREFERENCES', payload: savedPreferences });
        }

        // Load last selected instrument
        const lastInstrumentId = await storageService.loadLastInstrument();
        if (lastInstrumentId) {
          // Don't auto-load the instrument, just store the ID in preferences
          dispatch({
            type: 'UPDATE_USER_PREFERENCES',
            payload: { lastSelectedInstrument: lastInstrumentId },
          });
        }
      } catch (error) {
        console.error('Failed to initialize state:', error);
      }
    };

    initializeState();
  }, [storageService]);

  /**
   * Select and load an instrument
   * Integrates with InstrumentManager to load assets
   */
  const selectInstrument = useCallback(
    async (instrumentId: string): Promise<void> => {
      try {
        // Set loading state
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_LOADING_PROGRESS', payload: 0 });
        dispatch({ type: 'CLEAR_ERROR' });

        // Load instrument through InstrumentManager
        const instrument = await instrumentManager.loadInstrument(instrumentId);

        // Update state with loaded instrument
        dispatch({ type: 'SET_SELECTED_INSTRUMENT', payload: instrument });
        dispatch({ type: 'SET_LOADING_PROGRESS', payload: 100 });

        // Save to storage
        await storageService.saveLastInstrument(instrumentId);
        dispatch({
          type: 'UPDATE_USER_PREFERENCES',
          payload: { lastSelectedInstrument: instrumentId },
        });

        // Navigate to instrument screen
        dispatch({ type: 'SET_SCREEN', payload: 'instrument' });
      } catch (error) {
        const appError: AppError = {
          code: 'MODEL_LOAD_FAILED',
          message: error instanceof Error ? error.message : 'Failed to load instrument',
          details: { instrumentId },
          timestamp: new Date().toISOString(),
          recoverable: true,
        };

        dispatch({ type: 'SET_ERROR', payload: appError });
        dispatch({ type: 'SET_SELECTED_INSTRUMENT', payload: null });

        // Log error
        await handleError(error as Error, `selectInstrument(${instrumentId})`);

        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [instrumentManager, storageService]
  );

  /**
   * Update user preferences
   * Persists changes to storage
   */
  const updatePreferences = useCallback(
    async (preferences: Partial<UserPreferences>): Promise<void> => {
      try {
        // Update state
        dispatch({ type: 'UPDATE_USER_PREFERENCES', payload: preferences });

        // Persist to storage
        const updatedPreferences = {
          ...state.userPreferences,
          ...preferences,
          updatedAt: new Date().toISOString(),
        };
        await storageService.savePreferences(updatedPreferences);
      } catch (error) {
        const appError: AppError = {
          code: 'STORAGE_ERROR',
          message: 'Failed to save preferences',
          details: { preferences },
          timestamp: new Date().toISOString(),
          recoverable: true,
        };

        dispatch({ type: 'SET_ERROR', payload: appError });
        await handleError(error as Error, 'updatePreferences');

        throw error;
      }
    },
    [state.userPreferences, storageService]
  );

  /**
   * Handle application errors
   * Logs errors and updates error state
   */
  const handleError = useCallback(
    async (error: Error | AppError, userAction?: string): Promise<void> => {
      try {
        // Convert Error to AppError if needed
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

        // Create error log entry
        const errorLogEntry: ErrorLogEntry = {
          error: appError,
          stackTrace: error instanceof Error ? error.stack : undefined,
          userAction,
          deviceState: {
            screenWidth: state.deviceInfo.screenWidth,
            screenHeight: state.deviceInfo.screenHeight,
            deviceType: state.deviceInfo.deviceType,
            platform: state.deviceInfo.platform,
          },
        };

        // Update state
        dispatch({ type: 'SET_ERROR', payload: appError });
        dispatch({ type: 'ADD_ERROR_LOG', payload: errorLogEntry });

        // Persist error log to storage
        await storageService.saveErrorLog(errorLogEntry);

        // Log to console for debugging
        console.error('AppStateManager Error:', {
          error: appError,
          userAction,
          timestamp: appError.timestamp,
        });
      } catch (loggingError) {
        // If error logging fails, just log to console
        console.error('Failed to log error:', loggingError);
        console.error('Original error:', error);
      }
    },
    [state.deviceInfo, storageService]
  );

  /**
   * Clear current error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  /**
   * Set loading state with optional progress
   */
  const setLoading = useCallback((isLoading: boolean, progress?: number) => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
    if (progress !== undefined) {
      dispatch({ type: 'SET_LOADING_PROGRESS', payload: progress });
    }
  }, []);

  const contextValue: AppStateManagerContextType = {
    state,
    dispatch,
    selectInstrument,
    updatePreferences,
    handleError,
    clearError,
    setLoading,
  };

  return (
    <AppStateManagerContext.Provider value={contextValue}>
      {children}
    </AppStateManagerContext.Provider>
  );
}

/**
 * Hook to access AppStateManager context
 * Must be used within AppStateManagerProvider
 */
export function useAppStateManager(): AppStateManagerContextType {
  const context = useContext(AppStateManagerContext);
  if (context === undefined) {
    throw new Error('useAppStateManager must be used within an AppStateManagerProvider');
  }
  return context;
}

// Export types
export type { AppStateManagerContextType };
