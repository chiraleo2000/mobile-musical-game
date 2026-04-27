/**
 * SettingsScreen
 * Screen for managing user preferences and application settings
 * 
 * Features:
 * - Volume control (0-100%)
 * - Language selection (Thai/English/Auto)
 * - Visual quality selection (Low/Medium/High/Auto)
 * - Audio quality selection (Low/Medium/High/Auto)
 * - Haptic feedback toggle
 * - Automatic preference persistence
 * - Responsive layout for phones and tablets
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAppStateManager } from '@application/state/AppStateManager';
import { Language, QualityLevel } from '@domain/entities/AppState';
import { DeviceUtils } from '@infrastructure/utils/DeviceUtils';

interface SettingsScreenProps {
  onBack?: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { state, updatePreferences } = useAppStateManager();
  const { userPreferences } = state;

  // Local state for immediate UI updates
  const [volume, setVolume] = useState(userPreferences.volume);
  const [language, setLanguage] = useState(userPreferences.language);
  const [visualQuality, setVisualQuality] = useState(userPreferences.visualQuality);
  const [audioQuality, setAudioQuality] = useState(userPreferences.audioQuality);
  const [hapticFeedback, setHapticFeedback] = useState(userPreferences.hapticFeedback);

  // Get device info for responsive layout
  const deviceInfo = useMemo(() => DeviceUtils.getDeviceInfo(), []);
  const isTablet = deviceInfo.deviceType === 'tablet';

  // Sync local state with preferences when they change
  useEffect(() => {
    setVolume(userPreferences.volume);
    setLanguage(userPreferences.language);
    setVisualQuality(userPreferences.visualQuality);
    setAudioQuality(userPreferences.audioQuality);
    setHapticFeedback(userPreferences.hapticFeedback);
  }, [userPreferences]);

  // Handle volume change
  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);
    try {
      await updatePreferences({ volume: newVolume });
    } catch (error) {
      console.error('Failed to update volume:', error);
      Alert.alert('Error', 'Failed to save volume setting');
    }
  };

  // Handle language change
  const handleLanguageChange = async (newLanguage: Language) => {
    setLanguage(newLanguage);
    try {
      await updatePreferences({ language: newLanguage });
    } catch (error) {
      console.error('Failed to update language:', error);
      Alert.alert('Error', 'Failed to save language setting');
    }
  };

  // Handle visual quality change
  const handleVisualQualityChange = async (newQuality: QualityLevel) => {
    setVisualQuality(newQuality);
    try {
      await updatePreferences({ visualQuality: newQuality });
    } catch (error) {
      console.error('Failed to update visual quality:', error);
      Alert.alert('Error', 'Failed to save visual quality setting');
    }
  };

  // Handle audio quality change
  const handleAudioQualityChange = async (newQuality: QualityLevel) => {
    setAudioQuality(newQuality);
    try {
      await updatePreferences({ audioQuality: newQuality });
    } catch (error) {
      console.error('Failed to update audio quality:', error);
      Alert.alert('Error', 'Failed to save audio quality setting');
    }
  };

  // Handle haptic feedback toggle
  const handleHapticFeedbackToggle = async (enabled: boolean) => {
    setHapticFeedback(enabled);
    try {
      await updatePreferences({ hapticFeedback: enabled });
    } catch (error) {
      console.error('Failed to update haptic feedback:', error);
      Alert.alert('Error', 'Failed to save haptic feedback setting');
    }
  };

  // Render option button
  const renderOptionButton = (
    label: string,
    value: string,
    currentValue: string,
    onPress: () => void
  ) => {
    const isSelected = value === currentValue;
    return (
      <TouchableOpacity
        style={[
          styles.optionButton,
          isSelected && styles.optionButtonActive,
          isTablet && styles.optionButtonTablet,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.optionButtonText,
            isSelected && styles.optionButtonTextActive,
            isTablet && styles.optionButtonTextTablet,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render volume slider
  const renderVolumeControl = () => (
    <View style={styles.settingSection}>
      <Text style={[styles.settingLabel, isTablet && styles.settingLabelTablet]}>
        Volume / ระดับเสียง
      </Text>
      <View style={styles.volumeContainer}>
        <Text style={[styles.volumeValue, isTablet && styles.volumeValueTablet]}>
          {Math.round(volume * 100)}%
        </Text>
        <View style={styles.volumeButtons}>
          {[0, 0.25, 0.5, 0.75, 1.0].map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.volumeButton,
                volume === value && styles.volumeButtonActive,
                isTablet && styles.volumeButtonTablet,
              ]}
              onPress={() => handleVolumeChange(value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.volumeButtonText,
                  volume === value && styles.volumeButtonTextActive,
                  isTablet && styles.volumeButtonTextTablet,
                ]}
              >
                {Math.round(value * 100)}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // Render language selection
  const renderLanguageSelection = () => (
    <View style={styles.settingSection}>
      <Text style={[styles.settingLabel, isTablet && styles.settingLabelTablet]}>
        Language / ภาษา
      </Text>
      <View style={styles.optionRow}>
        {renderOptionButton('Auto / อัตโนมัติ', 'auto', language, () =>
          handleLanguageChange('auto')
        )}
        {renderOptionButton('English / อังกฤษ', 'english', language, () =>
          handleLanguageChange('english')
        )}
        {renderOptionButton('Thai / ไทย', 'thai', language, () =>
          handleLanguageChange('thai')
        )}
      </View>
    </View>
  );

  // Render visual quality selection
  const renderVisualQualitySelection = () => (
    <View style={styles.settingSection}>
      <Text style={[styles.settingLabel, isTablet && styles.settingLabelTablet]}>
        Visual Quality / คุณภาพภาพ
      </Text>
      <View style={styles.optionRow}>
        {renderOptionButton('Auto / อัตโนมัติ', 'auto', visualQuality, () =>
          handleVisualQualityChange('auto')
        )}
        {renderOptionButton('Low / ต่ำ', 'low', visualQuality, () =>
          handleVisualQualityChange('low')
        )}
        {renderOptionButton('Medium / กลาง', 'medium', visualQuality, () =>
          handleVisualQualityChange('medium')
        )}
        {renderOptionButton('High / สูง', 'high', visualQuality, () =>
          handleVisualQualityChange('high')
        )}
      </View>
    </View>
  );

  // Render audio quality selection
  const renderAudioQualitySelection = () => (
    <View style={styles.settingSection}>
      <Text style={[styles.settingLabel, isTablet && styles.settingLabelTablet]}>
        Audio Quality / คุณภาพเสียง
      </Text>
      <View style={styles.optionRow}>
        {renderOptionButton('Auto / อัตโนมัติ', 'auto', audioQuality, () =>
          handleAudioQualityChange('auto')
        )}
        {renderOptionButton('Low / ต่ำ', 'low', audioQuality, () =>
          handleAudioQualityChange('low')
        )}
        {renderOptionButton('Medium / กลาง', 'medium', audioQuality, () =>
          handleAudioQualityChange('medium')
        )}
        {renderOptionButton('High / สูง', 'high', audioQuality, () =>
          handleAudioQualityChange('high')
        )}
      </View>
    </View>
  );

  // Render haptic feedback toggle
  const renderHapticFeedbackToggle = () => (
    <View style={styles.settingSection}>
      <View style={styles.toggleRow}>
        <View style={styles.toggleLabelContainer}>
          <Text style={[styles.settingLabel, isTablet && styles.settingLabelTablet]}>
            Haptic Feedback
          </Text>
          <Text style={[styles.settingDescription, isTablet && styles.settingDescriptionTablet]}>
            การสั่นสะเทือนเมื่อสัมผัส
          </Text>
        </View>
        <Switch
          value={hapticFeedback}
          onValueChange={handleHapticFeedbackToggle}
          trackColor={{ false: '#D0D0D0', true: '#4A90E2' }}
          thumbColor={hapticFeedback ? '#FFFFFF' : '#F4F4F4'}
          ios_backgroundColor="#D0D0D0"
          style={isTablet && styles.switchTablet}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isTablet && styles.headerTablet]}>
        {onBack && (
          <TouchableOpacity
            style={[styles.backButton, isTablet && styles.backButtonTablet]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={[styles.backButtonText, isTablet && styles.backButtonTextTablet]}>
              ← Back
            </Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, isTablet && styles.headerTitleTablet]}>
          Settings
        </Text>
        <Text style={[styles.headerSubtitle, isTablet && styles.headerSubtitleTablet]}>
          การตั้งค่า
        </Text>
      </View>

      {/* Settings Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isTablet && styles.scrollContentTablet,
        ]}
        showsVerticalScrollIndicator={true}
      >
        {renderVolumeControl()}
        {renderLanguageSelection()}
        {renderVisualQualitySelection()}
        {renderAudioQualitySelection()}
        {renderHapticFeedbackToggle()}

        {/* Info Section */}
        <View style={[styles.infoSection, isTablet && styles.infoSectionTablet]}>
          <Text style={[styles.infoText, isTablet && styles.infoTextTablet]}>
            Settings are automatically saved
          </Text>
          <Text style={[styles.infoText, isTablet && styles.infoTextTablet]}>
            การตั้งค่าจะถูกบันทึกอัตโนมัติ
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTablet: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButtonTablet: {
    top: 60,
    minWidth: 60,
    minHeight: 60,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  backButtonTextTablet: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerTitleTablet: {
    fontSize: 32,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  headerSubtitleTablet: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  scrollContentTablet: {
    padding: 32,
  },
  settingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  settingLabelTablet: {
    fontSize: 20,
    marginBottom: 16,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  settingDescriptionTablet: {
    fontSize: 16,
  },
  volumeContainer: {
    gap: 12,
  },
  volumeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
  },
  volumeValueTablet: {
    fontSize: 28,
  },
  volumeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  volumeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E8E8E8',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeButtonTablet: {
    paddingVertical: 14,
    minHeight: 60,
  },
  volumeButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  volumeButtonText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  volumeButtonTextTablet: {
    fontSize: 16,
  },
  volumeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E8E8E8',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButtonTablet: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    minWidth: 60,
    minHeight: 60,
  },
  optionButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  optionButtonText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  optionButtonTextTablet: {
    fontSize: 16,
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  toggleLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchTablet: {
    transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }],
  },
  infoSection: {
    marginTop: 8,
    padding: 16,
    alignItems: 'center',
  },
  infoSectionTablet: {
    marginTop: 16,
    padding: 24,
  },
  infoText: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 4,
  },
  infoTextTablet: {
    fontSize: 16,
  },
});
