/**
 * App Root Component
 * 
 * Integrates all application layers:
 * - AppStateManager for global state management
 * - LifecycleManager for background/foreground handling
 * - Screen navigation (Library, Play, Settings)
 * - Service initialization (Storage, InstrumentManager)
 * - Preference and instrument restoration
 * 
 * Requirements: 2.1, 2.2, 2.3, 4.1-4.5, 7.3, 11.4, 12.1-12.4, 13.1-13.4, 14.1-14.4, 15.1-15.4
 */

import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text, Dimensions } from 'react-native';
import { AppStateManagerProvider, useAppStateManager } from './src/application/state/AppStateManager';
import { LifecycleManager } from './src/application/lifecycle/LifecycleManager';
import { StorageService } from './src/infrastructure/storage/StorageService';
import { InstrumentManager } from './src/domain/services/InstrumentManager';
import { InstrumentRepository } from './src/data/repositories/InstrumentRepository';
import { AssetLoader } from './src/infrastructure/assets/AssetLoader';
import { LowLatencySoundEngine } from './src/infrastructure/audio/LowLatencySoundEngine';
import { DisplayManager } from './src/infrastructure/rendering/DisplayManager';
import { DeviceUtils } from './src/infrastructure/utils/DeviceUtils';
import { InstrumentLibraryScreen } from './src/presentation/screens/InstrumentLibraryScreen';
import { InstrumentPlayScreen } from './src/presentation/screens/InstrumentPlayScreen';
import { SettingsScreen } from './src/presentation/screens/SettingsScreen';

/**
 * Main App Content Component
 * Handles screen rendering based on current state
 */
function AppContent() {
  const { state, dispatch } = useAppStateManager();
  const { currentScreen } = state;

  // Render current screen
  switch (currentScreen) {
    case 'library':
      return <InstrumentLibraryScreen />;
    
    case 'instrument':
      return <InstrumentPlayScreen />;
    
    case 'settings':
      return <SettingsScreen onBack={() => dispatch({ type: 'SET_SCREEN', payload: 'library' })} />;
    
    case 'splash':
    default:
      return (
        <View style={styles.splashContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.splashText}>Loading...</Text>
        </View>
      );
  }
}

/**
 * App Root Component with Service Initialization
 */
export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  
  // Service instances (created once)
  const storageServiceRef = useRef<StorageService>(new StorageService());
  const instrumentRepositoryRef = useRef<InstrumentRepository>(new InstrumentRepository());
  const assetLoaderRef = useRef<AssetLoader>(new AssetLoader());
  const soundEngineRef = useRef<LowLatencySoundEngine>(new LowLatencySoundEngine());
  const instrumentManagerRef = useRef<InstrumentManager>(
    new InstrumentManager(
      instrumentRepositoryRef.current,
      assetLoaderRef.current,
      soundEngineRef.current
    )
  );
  const lifecycleManagerRef = useRef<LifecycleManager | null>(null);
  const displayManagerRef = useRef<DisplayManager>(new DisplayManager());

  /**
   * Initialize all services on mount
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize DisplayManager
        displayManagerRef.current.initialize();

        // Get device info
        const deviceInfo = DeviceUtils.getDeviceInfo();
        
        // Initialize SoundEngine
        await soundEngineRef.current.initialize();

        // Initialize LifecycleManager
        lifecycleManagerRef.current = new LifecycleManager(
          soundEngineRef.current,
          storageServiceRef.current,
          instrumentManagerRef.current
        );
        lifecycleManagerRef.current.initialize();

        // App is ready
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      if (lifecycleManagerRef.current) {
        lifecycleManagerRef.current.dispose();
      }
      if (soundEngineRef.current) {
        soundEngineRef.current.dispose();
      }
    };
  }, []);

  /**
   * Handle orientation changes
   */
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      displayManagerRef.current.adaptToScreen();
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Show error state
  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Initialization Error</Text>
        <Text style={styles.errorMessage}>{initError}</Text>
      </View>
    );
  }

  // Show loading state
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Initializing app...</Text>
      </View>
    );
  }

  // Render app with state management
  return (
    <AppStateManagerProvider
      storageService={storageServiceRef.current}
      instrumentManager={instrumentManagerRef.current}
      initialState={{ currentScreen: 'library' }}
    >
      <View style={styles.container}>
        <StatusBar style="auto" />
        <AppContent />
      </View>
    </AppStateManagerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});
