/**
 * InstrumentPlayScreen - Main screen for playing instruments
 * Integrates 3D rendering, touch interaction, audio playback, and cultural information
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { GLView } from 'expo-gl';
import { useAppStateManager } from '@application/state/AppStateManager';
import { DisplayManager } from '@infrastructure/rendering/DisplayManager';
import { TouchController } from '@infrastructure/touch/TouchController';
import { LowLatencySoundEngine } from '@infrastructure/audio/LowLatencySoundEngine';
import { ThreeJSRenderEngine } from '@infrastructure/rendering/ThreeJSRenderEngine';
import { TouchAction } from '@domain/entities/Touch';
import { VisualFeedbackOverlay } from '@presentation/components/VisualFeedbackOverlay';
import { CulturalInfoPanel } from '@presentation/components/CulturalInfoPanel';

interface InstrumentPlayScreenProps {
  onBack?: () => void;
}

export function InstrumentPlayScreen({ onBack }: InstrumentPlayScreenProps) {
  const { state, updatePreferences, dispatch } = useAppStateManager();
  const { selectedInstrument, userPreferences, orientation } = state;

  // Refs for services
  const displayManagerRef = useRef<DisplayManager>(new DisplayManager());
  const renderEngineRef = useRef<ThreeJSRenderEngine | null>(null);
  const soundEngineRef = useRef<LowLatencySoundEngine | null>(null);
  const touchControllerRef = useRef<TouchController | null>(null);

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [volume, setVolume] = useState(userPreferences.volume);
  const [layout, setLayout] = useState(() =>
    displayManagerRef.current.calculateLayout(orientation)
  );
  const [activeFeedback, setActiveFeedback] = useState<string[]>([]);

  /**
   * Initialize services when instrument is loaded
   */
  useEffect(() => {
    if (!selectedInstrument) return;

    const initializeServices = async () => {
      try {
        // Initialize display manager
        displayManagerRef.current.initialize();

        // Initialize sound engine
        const soundEngine = new LowLatencySoundEngine();
        await soundEngine.initialize();
        await soundEngine.loadAudioSamples(selectedInstrument.audioSamples.samples);
        soundEngine.setVolume(volume);
        soundEngineRef.current = soundEngine;

        // Initialize touch controller
        const touchController = new TouchController();
        touchController.initialize(selectedInstrument);
        touchControllerRef.current = touchController;

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }
    };

    initializeServices();

    // Cleanup on unmount
    return () => {
      if (soundEngineRef.current) {
        soundEngineRef.current.stopAll();
        soundEngineRef.current.dispose();
      }
      if (renderEngineRef.current) {
        renderEngineRef.current.dispose();
      }
    };
  }, [selectedInstrument, volume]);

  /**
   * Handle orientation changes
   */
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      const newLayout = displayManagerRef.current.adaptToScreen();
      setLayout(newLayout);
      dispatch({ type: 'SET_ORIENTATION', payload: displayManagerRef.current.getCurrentOrientation() });
    });

    return () => {
      subscription?.remove();
    };
  }, [dispatch]);

  /**
   * Initialize GL context and render engine
   */
  const onGLContextCreate = useCallback(
    async (gl: any) => {
      if (!selectedInstrument) return;

      try {
        // Initialize render engine
        const renderEngine = new ThreeJSRenderEngine();
        renderEngine.initialize(gl);
        await renderEngine.loadModel(selectedInstrument.model3D);
        renderEngineRef.current = renderEngine;

        // Start render loop
        const render = () => {
          if (renderEngineRef.current) {
            renderEngineRef.current.render(0.016); // ~60fps
            gl.endFrameEXP();
          }
          requestAnimationFrame(render);
        };
        render();
      } catch (error) {
        console.error('Failed to initialize render engine:', error);
      }
    },
    [selectedInstrument]
  );

  /**
   * Handle touch interactions
   */
  const handleTouchStart = useCallback(
    (event: any) => {
      if (!touchControllerRef.current || !soundEngineRef.current) return;

      const touchAction = touchControllerRef.current.handleTouchStart(event);
      if (touchAction) {
        handleTouchAction(touchAction);
      }
    },
    []
  );

  const handleTouchMove = useCallback(
    (event: any) => {
      if (!touchControllerRef.current || !soundEngineRef.current) return;

      const touchAction = touchControllerRef.current.handleTouchMove(event);
      if (touchAction) {
        handleTouchAction(touchAction);
      }
    },
    []
  );

  const handleTouchEnd = useCallback(
    (event: any) => {
      if (!touchControllerRef.current || !soundEngineRef.current) return;

      const touchAction = touchControllerRef.current.handleTouchEnd(event);
      if (touchAction) {
        handleTouchAction(touchAction);
      }
    },
    []
  );

  /**
   * Process touch action - play sound and show feedback
   */
  const handleTouchAction = useCallback((action: TouchAction) => {
    if (!soundEngineRef.current) return;

    // Play sound
    if (action.type !== 'release') {
      soundEngineRef.current.playNote(action.zoneId, action.velocity);
    }

    // Show visual feedback
    displayManagerRef.current.showVisualFeedback(
      action.zoneId,
      action.type === 'strike' ? 'highlight' : action.type === 'pluck' ? 'ripple' : 'glow'
    );

    // Update active feedback state
    setActiveFeedback((prev) => [...prev, action.zoneId]);
    setTimeout(() => {
      setActiveFeedback((prev) => prev.filter((id) => id !== action.zoneId));
    }, 300);
  }, []);

  /**
   * Handle volume change
   */
  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      setVolume(newVolume);
      if (soundEngineRef.current) {
        soundEngineRef.current.setVolume(newVolume);
      }
      updatePreferences({ volume: newVolume });
    },
    [updatePreferences]
  );

  /**
   * Handle back button
   */
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      dispatch({ type: 'SET_SCREEN', payload: 'library' });
      dispatch({ type: 'SET_SELECTED_INSTRUMENT', payload: null });
    }
  }, [onBack, dispatch]);

  if (!selectedInstrument) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No instrument selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 3D Instrument View */}
      <View
        style={[
          styles.instrumentViewport,
          {
            width: layout.instrumentViewport.width,
            height: layout.instrumentViewport.height,
          },
        ]}
      >
        <GLView
          style={styles.glView}
          onContextCreate={onGLContextCreate}
        />
        
        {/* Visual Feedback Overlay */}
        {isInitialized && (
          <VisualFeedbackOverlay
            interactionZones={selectedInstrument.interactionZones}
            activeFeedback={activeFeedback}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        )}
      </View>

      {/* Controls Area */}
      <View
        style={[
          styles.controlsArea,
          orientation === 'portrait' ? styles.controlsPortrait : styles.controlsLandscape,
          {
            width: layout.controlsArea.width,
            height: layout.controlsArea.height,
          },
        ]}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={handleBack}
          accessibilityLabel="Back to library"
        >
          <Text style={styles.buttonText}>← Back</Text>
        </TouchableOpacity>

        {/* Instrument Name */}
        <View style={styles.instrumentInfo}>
          <Text style={styles.instrumentNameThai}>{selectedInstrument.name.thai}</Text>
          <Text style={styles.instrumentNameEnglish}>{selectedInstrument.name.english}</Text>
        </View>

        {/* Volume Control */}
        <View style={styles.volumeControl}>
          <Text style={styles.volumeLabel}>Volume</Text>
          <View style={styles.volumeSlider}>
            <TouchableOpacity
              style={styles.volumeButton}
              onPress={() => handleVolumeChange(Math.max(0, volume - 0.1))}
            >
              <Text style={styles.volumeButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.volumeValue}>{Math.round(volume * 100)}%</Text>
            <TouchableOpacity
              style={styles.volumeButton}
              onPress={() => handleVolumeChange(Math.min(1, volume + 0.1))}
            >
              <Text style={styles.volumeButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Cultural Info Panel */}
      <CulturalInfoPanel
        culturalInfo={selectedInstrument.culturalInfo}
        layout={layout.infoArea}
        orientation={orientation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  instrumentViewport: {
    position: 'relative',
  },
  glView: {
    flex: 1,
  },
  controlsArea: {
    backgroundColor: '#2a2a2a',
    padding: 16,
  },
  controlsPortrait: {
    flexDirection: 'column',
  },
  controlsLandscape: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3a3a3a',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  instrumentInfo: {
    marginBottom: 16,
  },
  instrumentNameThai: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  instrumentNameEnglish: {
    color: '#cccccc',
    fontSize: 18,
  },
  volumeControl: {
    marginTop: 8,
  },
  volumeLabel: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
  },
  volumeSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  volumeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  volumeValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
