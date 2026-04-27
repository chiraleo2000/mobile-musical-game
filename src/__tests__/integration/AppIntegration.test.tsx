/**
 * End-to-End Integration Tests for Complete App Flow
 * 
 * Tests the integration of all components:
 * - App initialization with services
 * - Navigation between screens
 * - Instrument selection and loading
 * - Settings updates
 * - Lifecycle management
 * - State persistence
 * 
 * Requirements: 2.1, 2.2, 2.3, 4.1-4.5, 7.3, 11.4, 12.1-12.4, 13.1-13.4, 14.1-14.4, 15.1-15.4
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { AppStateManagerProvider } from '@application/state/AppStateManager';
import { StorageService } from '@infrastructure/storage/StorageService';
import { InstrumentManager } from '@domain/services/InstrumentManager';
import { InstrumentRepository } from '@data/repositories/InstrumentRepository';
import { AssetLoader } from '@infrastructure/assets/AssetLoader';
import { LowLatencySoundEngine } from '@infrastructure/audio/LowLatencySoundEngine';
import { LifecycleManager } from '@application/lifecycle/LifecycleManager';
import { InstrumentLibraryScreen } from '@presentation/screens/InstrumentLibraryScreen';
import { InstrumentPlayScreen } from '@presentation/screens/InstrumentPlayScreen';
import { SettingsScreen } from '@presentation/screens/SettingsScreen';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() =>
        Promise.resolve({
          sound: {
            playAsync: jest.fn(() => Promise.resolve()),
            stopAsync: jest.fn(() => Promise.resolve()),
            unloadAsync: jest.fn(() => Promise.resolve()),
            setVolumeAsync: jest.fn(() => Promise.resolve()),
          },
          status: { isLoaded: true },
        })
      ),
    },
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('expo-gl', () => ({
  GLView: 'GLView',
}));

describe('App Integration Tests', () => {
  let storageService: StorageService;
  let instrumentRepository: InstrumentRepository;
  let assetLoader: AssetLoader;
  let soundEngine: LowLatencySoundEngine;
  let instrumentManager: InstrumentManager;
  let lifecycleManager: LifecycleManager;

  beforeEach(async () => {
    // Initialize services
    storageService = new StorageService();
    instrumentRepository = new InstrumentRepository();
    assetLoader = new AssetLoader();
    soundEngine = new LowLatencySoundEngine();
    await soundEngine.initialize();
    
    instrumentManager = new InstrumentManager(
      instrumentRepository,
      assetLoader,
      soundEngine
    );
    
    lifecycleManager = new LifecycleManager(
      soundEngine,
      storageService,
      instrumentManager
    );
    lifecycleManager.initialize();
  });

  afterEach(() => {
    lifecycleManager.dispose();
    soundEngine.dispose();
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should initialize all services successfully', async () => {
      expect(soundEngine).toBeDefined();
      expect(instrumentManager).toBeDefined();
      expect(lifecycleManager).toBeDefined();
      expect(storageService).toBeDefined();
    });

    it('should initialize LifecycleManager with correct dependencies', () => {
      expect(lifecycleManager).toBeInstanceOf(LifecycleManager);
      expect(lifecycleManager.getState()).toMatchObject({
        appState: 'active',
        isInterrupted: false,
      });
    });
  });

  describe('AppStateManager Integration', () => {
    it('should provide AppStateManager context to children', () => {
      const { getByText } = render(
        <AppStateManagerProvider
          storageService={storageService}
          instrumentManager={instrumentManager}
        >
          <InstrumentLibraryScreen />
        </AppStateManagerProvider>
      );

      expect(getByText(/Instrument Library/i)).toBeTruthy();
    });

    it('should load preferences on mount', async () => {
      const mockPreferences = {
        volume: 0.7,
        language: 'thai' as const,
        visualQuality: 'high' as const,
        audioQuality: 'high' as const,
        favoriteInstruments: [],
        showTutorial: false,
        hapticFeedback: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      jest.spyOn(storageService, 'loadPreferences').mockResolvedValue(mockPreferences);

      const TestComponent = () => {
        const { state } = require('@application/state/AppStateManager').useAppStateManager();
        return <>{state.userPreferences.volume}</>;
      };

      render(
        <AppStateManagerProvider
          storageService={storageService}
          instrumentManager={instrumentManager}
        >
          <TestComponent />
        </AppStateManagerProvider>
      );

      await waitFor(() => {
        expect(storageService.loadPreferences).toHaveBeenCalled();
      });
    });
  });

  describe('Screen Navigation', () => {
    it('should render InstrumentLibraryScreen by default', () => {
      const { getByText } = render(
        <AppStateManagerProvider
          storageService={storageService}
          instrumentManager={instrumentManager}
          initialState={{ currentScreen: 'library' }}
        >
          <InstrumentLibraryScreen />
        </AppStateManagerProvider>
      );

      expect(getByText(/Instrument Library/i)).toBeTruthy();
      expect(getByText(/คลังเครื่องดนตรี/i)).toBeTruthy();
    });

    it('should render SettingsScreen when navigated', () => {
      const { getByText } = render(
        <AppStateManagerProvider
          storageService={storageService}
          instrumentManager={instrumentManager}
          initialState={{ currentScreen: 'settings' }}
        >
          <SettingsScreen />
        </AppStateManagerProvider>
      );

      expect(getByText(/Settings/i)).toBeTruthy();
      expect(getByText(/การตั้งค่า/i)).toBeTruthy();
    });
  });

  describe('Instrument Selection Flow', () => {
    it('should handle instrument selection', async () => {
      const mockInstrument = instrumentRepository.getAllInstruments()[0];
      
      jest.spyOn(instrumentManager, 'loadInstrument').mockResolvedValue(mockInstrument);
      jest.spyOn(storageService, 'saveLastInstrument').mockResolvedValue();

      const TestComponent = () => {
        const { selectInstrument } = require('@application/state/AppStateManager').useAppStateManager();
        
        React.useEffect(() => {
          selectInstrument(mockInstrument.id);
        }, []);

        return null;
      };

      render(
        <AppStateManagerProvider
          storageService={storageService}
          instrumentManager={instrumentManager}
        >
          <TestComponent />
        </AppStateManagerProvider>
      );

      await waitFor(() => {
        expect(instrumentManager.loadInstrument).toHaveBeenCalledWith(mockInstrument.id);
        expect(storageService.saveLastInstrument).toHaveBeenCalledWith(mockInstrument.id);
      });
    });

    it('should handle instrument loading errors', async () => {
      const error = new Error('Failed to load instrument');
      jest.spyOn(instrumentManager, 'loadInstrument').mockRejectedValue(error);

      const TestComponent = () => {
        const { selectInstrument, state } = require('@application/state/AppStateManager').useAppStateManager();
        
        React.useEffect(() => {
          selectInstrument('invalid-id').catch(() => {});
        }, []);

        return <>{state.error?.message}</>;
      };

      const { findByText } = render(
        <AppStateManagerProvider
          storageService={storageService}
          instrumentManager={instrumentManager}
        >
          <TestComponent />
        </AppStateManagerProvider>
      );

      await waitFor(() => {
        expect(instrumentManager.loadInstrument).toHaveBeenCalledWith('invalid-id');
      });
    });
  });

  describe('Settings Integration', () => {
    it('should update preferences through AppStateManager', async () => {
      jest.spyOn(storageService, 'savePreferences').mockResolvedValue();

      const TestComponent = () => {
        const { updatePreferences } = require('@application/state/AppStateManager').useAppStateManager();
        
        React.useEffect(() => {
          updatePreferences({ volume: 0.5 });
        }, []);

        return null;
      };

      render(
        <AppStateManagerProvider
          storageService={storageService}
          instrumentManager={instrumentManager}
        >
          <TestComponent />
        </AppStateManagerProvider>
      );

      await waitFor(() => {
        expect(storageService.savePreferences).toHaveBeenCalled();
      });
    });

    it('should handle preference update errors', async () => {
      const error = new Error('Storage error');
      jest.spyOn(storageService, 'savePreferences').mockRejectedValue(error);

      const TestComponent = () => {
        const { updatePreferences } = require('@application/state/AppStateManager').useAppStateManager();
        
        React.useEffect(() => {
          updatePreferences({ volume: 0.5 }).catch(() => {});
        }, []);

        return null;
      };

      render(
        <AppStateManagerProvider
          storageService={storageService}
          instrumentManager={instrumentManager}
        >
          <TestComponent />
        </AppStateManagerProvider>
      );

      await waitFor(() => {
        expect(storageService.savePreferences).toHaveBeenCalled();
      });
    });
  });

  describe('Lifecycle Management', () => {
    it('should handle app background transition', async () => {
      jest.spyOn(soundEngine, 'stopAll');
      jest.spyOn(storageService, 'saveLastInstrument').mockResolvedValue();

      const mockInstrument = instrumentRepository.getAllInstruments()[0];
      jest.spyOn(instrumentManager, 'getCurrentInstrument').mockReturnValue(mockInstrument);

      await lifecycleManager.triggerBackground();

      expect(soundEngine.stopAll).toHaveBeenCalled();
      expect(storageService.saveLastInstrument).toHaveBeenCalledWith(mockInstrument.id);
    });

    it('should handle app foreground transition', async () => {
      const mockInstrument = instrumentRepository.getAllInstruments()[0];
      jest.spyOn(storageService, 'loadLastInstrument').mockResolvedValue(mockInstrument.id);
      jest.spyOn(instrumentManager, 'loadInstrument').mockResolvedValue(mockInstrument);
      jest.spyOn(instrumentManager, 'getCurrentInstrument').mockReturnValue(null);

      await lifecycleManager.triggerForeground();

      expect(storageService.loadLastInstrument).toHaveBeenCalled();
      expect(instrumentManager.loadInstrument).toHaveBeenCalledWith(mockInstrument.id);
    });

    it('should handle audio interruption', async () => {
      jest.spyOn(soundEngine, 'stopAll');

      await lifecycleManager.triggerInterruption();

      expect(soundEngine.stopAll).toHaveBeenCalled();
      expect(lifecycleManager.isInterrupted()).toBe(true);
    });

    it('should handle resume after interruption', async () => {
      await lifecycleManager.triggerInterruption();
      expect(lifecycleManager.isInterrupted()).toBe(true);

      await lifecycleManager.triggerResume();
      expect(lifecycleManager.isInterrupted()).toBe(false);
    });
  });

  describe('Complete User Flow', () => {
    it('should complete full app flow: library -> select -> play -> settings -> back', async () => {
      const mockInstrument = instrumentRepository.getAllInstruments()[0];
      jest.spyOn(instrumentManager, 'loadInstrument').mockResolvedValue(mockInstrument);
      jest.spyOn(storageService, 'saveLastInstrument').mockResolvedValue();
      jest.spyOn(storageService, 'savePreferences').mockResolvedValue();

      const TestFlow = () => {
        const { state, dispatch, selectInstrument, updatePreferences } = 
          require('@application/state/AppStateManager').useAppStateManager();

        React.useEffect(() => {
          const runFlow = async () => {
            // Step 1: Start at library
            expect(state.currentScreen).toBe('library');

            // Step 2: Select instrument
            await selectInstrument(mockInstrument.id);
            expect(state.currentScreen).toBe('instrument');

            // Step 3: Navigate to settings
            dispatch({ type: 'SET_SCREEN', payload: 'settings' });
            expect(state.currentScreen).toBe('settings');

            // Step 4: Update preferences
            await updatePreferences({ volume: 0.6 });

            // Step 5: Navigate back to library
            dispatch({ type: 'SET_SCREEN', payload: 'library' });
            expect(state.currentScreen).toBe('library');
          };

          runFlow();
        }, []);

        return null;
      };

      render(
        <AppStateManagerProvider
          storageService={storageService}
          instrumentManager={instrumentManager}
          initialState={{ currentScreen: 'library' }}
        >
          <TestFlow />
        </AppStateManagerProvider>
      );

      await waitFor(() => {
        expect(instrumentManager.loadInstrument).toHaveBeenCalled();
        expect(storageService.savePreferences).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle and log errors through AppStateManager', async () => {
      const TestComponent = () => {
        const { handleError, state } = require('@application/state/AppStateManager').useAppStateManager();
        
        React.useEffect(() => {
          const error = new Error('Test error');
          handleError(error, 'test-action');
        }, []);

        return <>{state.error?.message}</>;
      };

      const { findByText } = render(
        <AppStateManagerProvider
          storageService={storageService}
          instrumentManager={instrumentManager}
        >
          <TestComponent />
        </AppStateManagerProvider>
      );

      await waitFor(() => {
        expect(storageService.saveErrorLog).toHaveBeenCalled();
      });
    });
  });

  describe('State Persistence', () => {
    it('should persist and restore user preferences', async () => {
      const mockPreferences = {
        volume: 0.9,
        language: 'english' as const,
        visualQuality: 'medium' as const,
        audioQuality: 'high' as const,
        favoriteInstruments: ['ranat-ek'],
        showTutorial: false,
        hapticFeedback: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      jest.spyOn(storageService, 'loadPreferences').mockResolvedValue(mockPreferences);
      jest.spyOn(storageService, 'savePreferences').mockResolvedValue();

      const TestComponent = () => {
        const { state, updatePreferences } = require('@application/state/AppStateManager').useAppStateManager();
        
        React.useEffect(() => {
          updatePreferences({ volume: 0.95 });
        }, []);

        return <>{state.userPreferences.volume}</>;
      };

      render(
        <AppStateManagerProvider
          storageService={storageService}
          instrumentManager={instrumentManager}
        >
          <TestComponent />
        </AppStateManagerProvider>
      );

      await waitFor(() => {
        expect(storageService.loadPreferences).toHaveBeenCalled();
        expect(storageService.savePreferences).toHaveBeenCalled();
      });
    });

    it('should persist and restore last selected instrument', async () => {
      const mockInstrument = instrumentRepository.getAllInstruments()[0];
      
      jest.spyOn(storageService, 'loadLastInstrument').mockResolvedValue(mockInstrument.id);
      jest.spyOn(storageService, 'saveLastInstrument').mockResolvedValue();

      render(
        <AppStateManagerProvider
          storageService={storageService}
          instrumentManager={instrumentManager}
        >
          <InstrumentLibraryScreen />
        </AppStateManagerProvider>
      );

      await waitFor(() => {
        expect(storageService.loadLastInstrument).toHaveBeenCalled();
      });
    });
  });
});
