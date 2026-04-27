/**
 * Application State Context
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ApplicationState, UserPreferences, DeviceInfo } from '@domain/entities/AppState';
import { Instrument } from '@domain/entities/Instrument';

// Action types
export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_PROGRESS'; payload: number }
  | { type: 'SET_SELECTED_INSTRUMENT'; payload: Instrument | null }
  | { type: 'SET_INSTRUMENTS'; payload: Instrument[] }
  | { type: 'SET_FILTERED_INSTRUMENTS'; payload: Instrument[] }
  | { type: 'SET_USER_PREFERENCES'; payload: UserPreferences }
  | { type: 'SET_DEVICE_INFO'; payload: DeviceInfo }
  | { type: 'SET_ERROR'; payload: any }
  | { type: 'CLEAR_ERROR' }
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
    case 'SET_DEVICE_INFO':
      return { ...state, deviceInfo: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: ApplicationState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
