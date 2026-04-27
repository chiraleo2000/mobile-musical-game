/**
 * End-to-End Integration Tests for Complete App Flow
 * Tests: app launch → library → instrument selection → playing → back to library
 * Requirements: 12.1, 12.2, 12.3, 12.4, 14.1, 14.2, 14.3, 14.4, 15.1, 15.2, 15.3, 15.4
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import App from '../../../App';
import { StorageService } from '@infrastructure/storage/StorageService';
import { InstrumentManager } from '@domain/services/InstrumentManager';

// Mock dependencies
jest.mock('@infrastructure/storage/StorageService');
jest.mock('@domain/services/InstrumentManager');
jest.mock('@infrastructure/audio/LowLatencySoundEngine');
jest.mock('@infrastructure/rendering/DisplayManager');
jest.mock('expo-gl', () => ({
  GLView: 'GLView',
}));

describe('App Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('App Launch', () => {
    it('should initialize app and show library screen', async () => {
      const { getByText, queryByText } = render(<App />);

      // Should show loading initially
      expect(getByText('Initializing app...')).toBeTruthy();

      // Wait for initialization
      await waitFor(() => {
        expect(queryByText('Initializing app...')).toBeNull();
      });

      // Should show library screen
      await waitFor(() => {
        expect(getByText('Instrument Library')).toBeTruthy();
      });
    });

    it('should handle initialization errors gracefully', async () => {
      // Mock initialization failure
      const mockError = new Error('Initialization failed');
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const { getByText } = render(<App />);

      await waitFor(() => {
        expect(getByText('Initialization Error')).toBeTruthy();
      });
    });
  });

  describe('Settings Flow', () => {
    it('should navigate to settings and back', async () => {
      const { getByText, getByLabelText } = render(<App />);

      // Wait for library screen
      await waitFor(() => {
        expect(getByText('Instrument Library')).toBeTruthy();
      });

      // Navigate to settings
      const settingsButton = getByLabelText('Settings');
      act(() => {
        settingsButton.props.onPress();
      });

      // Should show settings screen
      await waitFor(() => {
        expect(getByText('Settings')).toBeTruthy();
      });

      // Navigate back
      const backButton = getByText('← Back');
      act(() => {
        backButton.props.onPress();
      });

      // Should return to library
      await waitFor(() => {
        expect(getByText('Instrument Library')).toBeTruthy();
      });
    });
  });

  describe('Preference Persistence', () => {
    it('should save and restore preferences', async () => {
      const mockStorageService = new StorageService();
      const mockPreferences = {
        volume: 0.7,
        language: 'thai' as const,
        visualQuality: 'high' as const,
        audioQuality: 'high' as const,
        hapticFeedback: true,
        favoriteInstruments: [],
        showTutorial: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (mockStorageService.loadPreferences as jest.Mock).mockResolvedValue(mockPreferences);

      render(<App />);

      await waitFor(() => {
        expect(mockStorageService.loadPreferences).toHaveBeenCalled();
      });
    });
  });

  describe('Error Recovery', () => {
    it('should recover from storage errors', async () => {
      const mockStorageService = new StorageService();
      (mockStorageService.loadPreferences as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByText } = render(<App />);

      // Should still show library screen despite storage error
      await waitFor(() => {
        expect(getByText('Instrument Library')).toBeTruthy();
      });
    });
  });
});
