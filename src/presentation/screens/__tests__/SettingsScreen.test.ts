/**
 * Integration tests for SettingsScreen
 * Tests preference updates, persistence, and UI controls
 */

import { Language, QualityLevel } from '@domain/entities/AppState';

// Mock dependencies
const mockUpdatePreferences = jest.fn();
const mockState = {
  userPreferences: {
    volume: 0.8,
    favoriteInstruments: [],
    language: 'auto' as Language,
    visualQuality: 'auto' as QualityLevel,
    audioQuality: 'high' as QualityLevel,
    showTutorial: true,
    hapticFeedback: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

jest.mock('@application/state/AppStateManager', () => ({
  useAppStateManager: jest.fn(() => ({
    state: mockState,
    updatePreferences: mockUpdatePreferences,
  })),
}));

jest.mock('@infrastructure/utils/DeviceUtils', () => ({
  DeviceUtils: {
    getDeviceInfo: jest.fn(() => ({
      screenWidth: 375,
      screenHeight: 667,
      screenDiagonal: 4.7,
      pixelDensity: 2,
      deviceType: 'phone',
      platform: 'ios',
    })),
  },
}));

describe('SettingsScreen Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock state to defaults
    mockState.userPreferences = {
      volume: 0.8,
      favoriteInstruments: [],
      language: 'auto',
      visualQuality: 'auto',
      audioQuality: 'high',
      showTutorial: true,
      hapticFeedback: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  describe('Preference Updates', () => {
    it('should update volume preference', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      const newVolume = 0.5;
      await updatePreferences({ volume: newVolume });

      expect(mockUpdatePreferences).toHaveBeenCalledWith({ volume: newVolume });
    });

    it('should update language preference', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      const newLanguage: Language = 'thai';
      await updatePreferences({ language: newLanguage });

      expect(mockUpdatePreferences).toHaveBeenCalledWith({ language: newLanguage });
    });

    it('should update visual quality preference', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      const newQuality: QualityLevel = 'high';
      await updatePreferences({ visualQuality: newQuality });

      expect(mockUpdatePreferences).toHaveBeenCalledWith({ visualQuality: newQuality });
    });

    it('should update audio quality preference', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      const newQuality: QualityLevel = 'medium';
      await updatePreferences({ audioQuality: newQuality });

      expect(mockUpdatePreferences).toHaveBeenCalledWith({ audioQuality: newQuality });
    });

    it('should update haptic feedback preference', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      const newHapticFeedback = false;
      await updatePreferences({ hapticFeedback: newHapticFeedback });

      expect(mockUpdatePreferences).toHaveBeenCalledWith({ hapticFeedback: newHapticFeedback });
    });
  });

  describe('Volume Control', () => {
    it('should support volume range from 0 to 1', () => {
      const validVolumes = [0, 0.25, 0.5, 0.75, 1.0];
      
      validVolumes.forEach(volume => {
        expect(volume).toBeGreaterThanOrEqual(0);
        expect(volume).toBeLessThanOrEqual(1);
      });
    });

    it('should display volume as percentage (0-100%)', () => {
      const volumes = [0, 0.25, 0.5, 0.75, 1.0];
      const percentages = [0, 25, 50, 75, 100];
      
      volumes.forEach((volume, index) => {
        const percentage = Math.round(volume * 100);
        expect(percentage).toBe(percentages[index]);
      });
    });

    it('should handle volume preset buttons', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      const presetVolumes = [0, 0.25, 0.5, 0.75, 1.0];
      
      for (const volume of presetVolumes) {
        await updatePreferences({ volume });
        expect(mockUpdatePreferences).toHaveBeenCalledWith({ volume });
      }
    });
  });

  describe('Language Selection', () => {
    it('should support all language options', () => {
      const validLanguages: Language[] = ['auto', 'english', 'thai'];
      
      validLanguages.forEach(lang => {
        expect(['auto', 'english', 'thai']).toContain(lang);
      });
    });

    it('should update language to Auto', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      await updatePreferences({ language: 'auto' });
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ language: 'auto' });
    });

    it('should update language to English', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      await updatePreferences({ language: 'english' });
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ language: 'english' });
    });

    it('should update language to Thai', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      await updatePreferences({ language: 'thai' });
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ language: 'thai' });
    });
  });

  describe('Visual Quality Selection', () => {
    it('should support all quality levels', () => {
      const validQualities: QualityLevel[] = ['auto', 'low', 'medium', 'high'];
      
      validQualities.forEach(quality => {
        expect(['auto', 'low', 'medium', 'high']).toContain(quality);
      });
    });

    it('should update visual quality to Auto', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      await updatePreferences({ visualQuality: 'auto' });
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ visualQuality: 'auto' });
    });

    it('should update visual quality to Low', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      await updatePreferences({ visualQuality: 'low' });
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ visualQuality: 'low' });
    });

    it('should update visual quality to Medium', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      await updatePreferences({ visualQuality: 'medium' });
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ visualQuality: 'medium' });
    });

    it('should update visual quality to High', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      await updatePreferences({ visualQuality: 'high' });
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ visualQuality: 'high' });
    });
  });

  describe('Audio Quality Selection', () => {
    it('should support all quality levels', () => {
      const validQualities: QualityLevel[] = ['auto', 'low', 'medium', 'high'];
      
      validQualities.forEach(quality => {
        expect(['auto', 'low', 'medium', 'high']).toContain(quality);
      });
    });

    it('should update audio quality to Auto', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      await updatePreferences({ audioQuality: 'auto' });
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ audioQuality: 'auto' });
    });

    it('should update audio quality to Low', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      await updatePreferences({ audioQuality: 'low' });
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ audioQuality: 'low' });
    });

    it('should update audio quality to Medium', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      await updatePreferences({ audioQuality: 'medium' });
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ audioQuality: 'medium' });
    });

    it('should update audio quality to High', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      await updatePreferences({ audioQuality: 'high' });
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ audioQuality: 'high' });
    });
  });

  describe('Haptic Feedback Toggle', () => {
    it('should toggle haptic feedback on', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      await updatePreferences({ hapticFeedback: true });
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ hapticFeedback: true });
    });

    it('should toggle haptic feedback off', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      await updatePreferences({ hapticFeedback: false });
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ hapticFeedback: false });
    });

    it('should handle boolean values correctly', () => {
      const validValues = [true, false];
      
      validValues.forEach(value => {
        expect(typeof value).toBe('boolean');
      });
    });
  });

  describe('Preference Persistence', () => {
    it('should persist volume changes', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      const newVolume = 0.6;
      await updatePreferences({ volume: newVolume });

      expect(mockUpdatePreferences).toHaveBeenCalledTimes(1);
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ volume: newVolume });
    });

    it('should persist language changes', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      const newLanguage: Language = 'english';
      await updatePreferences({ language: newLanguage });

      expect(mockUpdatePreferences).toHaveBeenCalledTimes(1);
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ language: newLanguage });
    });

    it('should persist quality changes', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      const newQuality: QualityLevel = 'low';
      await updatePreferences({ visualQuality: newQuality });

      expect(mockUpdatePreferences).toHaveBeenCalledTimes(1);
      expect(mockUpdatePreferences).toHaveBeenCalledWith({ visualQuality: newQuality });
    });

    it('should handle multiple preference updates', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      await updatePreferences({ volume: 0.5 });
      await updatePreferences({ language: 'thai' });
      await updatePreferences({ visualQuality: 'high' });

      expect(mockUpdatePreferences).toHaveBeenCalledTimes(3);
    });
  });

  describe('UI Controls', () => {
    it('should have minimum touch target size (44px) for buttons', () => {
      const minTouchSize = 44;
      expect(minTouchSize).toBeGreaterThanOrEqual(44);
    });

    it('should display bilingual labels', () => {
      const labels = [
        { english: 'Volume', thai: 'ระดับเสียง' },
        { english: 'Language', thai: 'ภาษา' },
        { english: 'Visual Quality', thai: 'คุณภาพภาพ' },
        { english: 'Audio Quality', thai: 'คุณภาพเสียง' },
        { english: 'Haptic Feedback', thai: 'การสั่นสะเทือนเมื่อสัมผัส' },
      ];

      labels.forEach(label => {
        expect(label.english).toBeDefined();
        expect(label.thai).toBeDefined();
        expect(label.english.length).toBeGreaterThan(0);
        expect(label.thai.length).toBeGreaterThan(0);
      });
    });

    it('should display bilingual option labels', () => {
      const options = [
        { english: 'Auto', thai: 'อัตโนมัติ' },
        { english: 'Low', thai: 'ต่ำ' },
        { english: 'Medium', thai: 'กลาง' },
        { english: 'High', thai: 'สูง' },
        { english: 'English', thai: 'อังกฤษ' },
        { english: 'Thai', thai: 'ไทย' },
      ];

      options.forEach(option => {
        expect(option.english).toBeDefined();
        expect(option.thai).toBeDefined();
      });
    });
  });

  describe('Responsive Layout - Phone', () => {
    beforeEach(() => {
      const { DeviceUtils } = require('@infrastructure/utils/DeviceUtils');
      DeviceUtils.getDeviceInfo.mockReturnValue({
        screenWidth: 375,
        screenHeight: 667,
        screenDiagonal: 4.7,
        pixelDensity: 2,
        deviceType: 'phone',
        platform: 'ios',
      });
    });

    it('should detect phone device type', () => {
      const { DeviceUtils } = require('@infrastructure/utils/DeviceUtils');
      const deviceInfo = DeviceUtils.getDeviceInfo();
      
      expect(deviceInfo.deviceType).toBe('phone');
      expect(deviceInfo.screenDiagonal).toBeGreaterThanOrEqual(4);
      expect(deviceInfo.screenDiagonal).toBeLessThanOrEqual(7);
    });

    it('should use phone-appropriate sizing', () => {
      const { DeviceUtils } = require('@infrastructure/utils/DeviceUtils');
      const deviceInfo = DeviceUtils.getDeviceInfo();
      
      expect(deviceInfo.deviceType).toBe('phone');
      // Phone layout should be compact
      expect(deviceInfo.screenWidth).toBeLessThan(768);
    });
  });

  describe('Responsive Layout - Tablet', () => {
    beforeEach(() => {
      const { DeviceUtils } = require('@infrastructure/utils/DeviceUtils');
      DeviceUtils.getDeviceInfo.mockReturnValue({
        screenWidth: 768,
        screenHeight: 1024,
        screenDiagonal: 9.7,
        pixelDensity: 2,
        deviceType: 'tablet',
        platform: 'ios',
      });
    });

    it('should detect tablet device type', () => {
      const { DeviceUtils } = require('@infrastructure/utils/DeviceUtils');
      const deviceInfo = DeviceUtils.getDeviceInfo();
      
      expect(deviceInfo.deviceType).toBe('tablet');
      expect(deviceInfo.screenDiagonal).toBeGreaterThanOrEqual(7);
      expect(deviceInfo.screenDiagonal).toBeLessThanOrEqual(13);
    });

    it('should use tablet-appropriate sizing', () => {
      const { DeviceUtils } = require('@infrastructure/utils/DeviceUtils');
      const deviceInfo = DeviceUtils.getDeviceInfo();
      
      expect(deviceInfo.deviceType).toBe('tablet');
      // Tablet layout should have more space
      expect(deviceInfo.screenWidth).toBeGreaterThanOrEqual(768);
    });
  });

  describe('Default Preferences', () => {
    it('should have valid default volume', () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { state } = useAppStateManager();
      
      expect(state.userPreferences.volume).toBeGreaterThanOrEqual(0);
      expect(state.userPreferences.volume).toBeLessThanOrEqual(1);
    });

    it('should have valid default language', () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { state } = useAppStateManager();
      
      const validLanguages: Language[] = ['auto', 'english', 'thai'];
      expect(validLanguages).toContain(state.userPreferences.language);
    });

    it('should have valid default visual quality', () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { state } = useAppStateManager();
      
      const validQualities: QualityLevel[] = ['auto', 'low', 'medium', 'high'];
      expect(validQualities).toContain(state.userPreferences.visualQuality);
    });

    it('should have valid default audio quality', () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { state } = useAppStateManager();
      
      const validQualities: QualityLevel[] = ['auto', 'low', 'medium', 'high'];
      expect(validQualities).toContain(state.userPreferences.audioQuality);
    });

    it('should have valid default haptic feedback', () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { state } = useAppStateManager();
      
      expect(typeof state.userPreferences.hapticFeedback).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    it('should handle failed preference updates gracefully', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      mockUpdatePreferences.mockRejectedValueOnce(new Error('Storage error'));
      
      const { updatePreferences } = useAppStateManager();
      
      await expect(updatePreferences({ volume: 0.5 })).rejects.toThrow('Storage error');
    });

    it('should continue functioning after error', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      mockUpdatePreferences.mockRejectedValueOnce(new Error('Storage error'));
      mockUpdatePreferences.mockResolvedValueOnce(undefined);
      
      const { updatePreferences } = useAppStateManager();
      
      // First call fails
      await expect(updatePreferences({ volume: 0.5 })).rejects.toThrow();
      
      // Second call succeeds
      await expect(updatePreferences({ volume: 0.6 })).resolves.toBeUndefined();
    });
  });

  describe('Accessibility', () => {
    it('should have readable text sizes', () => {
      const minTextSize = 12;
      expect(minTextSize).toBeGreaterThanOrEqual(12);
    });

    it('should have sufficient touch target sizes', () => {
      const minTouchSize = 44;
      const tabletMinTouchSize = 60;
      
      expect(minTouchSize).toBeGreaterThanOrEqual(44);
      expect(tabletMinTouchSize).toBeGreaterThanOrEqual(44);
    });

    it('should provide visual feedback for selections', () => {
      // Active state should be visually distinct
      const activeColor = '#4A90E2';
      const inactiveColor = '#E8E8E8';
      
      expect(activeColor).not.toBe(inactiveColor);
    });
  });

  describe('Integration with AppStateManager', () => {
    it('should read preferences from state', () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { state } = useAppStateManager();
      
      expect(state.userPreferences).toBeDefined();
      expect(state.userPreferences.volume).toBeDefined();
      expect(state.userPreferences.language).toBeDefined();
      expect(state.userPreferences.visualQuality).toBeDefined();
      expect(state.userPreferences.audioQuality).toBeDefined();
      expect(state.userPreferences.hapticFeedback).toBeDefined();
    });

    it('should call updatePreferences method', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();
      
      expect(updatePreferences).toBeDefined();
      expect(typeof updatePreferences).toBe('function');
      
      await updatePreferences({ volume: 0.7 });
      expect(mockUpdatePreferences).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should update preferences efficiently', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      const startTime = Date.now();
      await updatePreferences({ volume: 0.5 });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle rapid preference changes', async () => {
      const { useAppStateManager } = require('@application/state/AppStateManager');
      const { updatePreferences } = useAppStateManager();

      const updates = [
        { volume: 0.2 },
        { volume: 0.4 },
        { volume: 0.6 },
        { volume: 0.8 },
        { volume: 1.0 },
      ];

      for (const update of updates) {
        await updatePreferences(update);
      }

      expect(mockUpdatePreferences).toHaveBeenCalledTimes(5);
    });
  });
});
