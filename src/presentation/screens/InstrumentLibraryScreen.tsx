/**
 * InstrumentLibraryScreen
 * Main screen for browsing and selecting instruments
 * 
 * Features:
 * - Instruments grouped by nationality (Thai/International)
 * - Filter controls for playing methods (striking/plucked/pressed)
 * - Bilingual display (Thai/English)
 * - Responsive layout for phones and tablets
 * - Loading states
 * - Integration with AppStateManager
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useAppStateManager } from '@application/state/AppStateManager';
import { InstrumentLibrary } from '@data/models/InstrumentLibrary';
import { Instrument, PlayingMethod, Nationality } from '@domain/entities/Instrument';
import { DisplayManager } from '@infrastructure/rendering/DisplayManager';
import { DeviceUtils } from '@infrastructure/utils/DeviceUtils';
import { InstrumentCard } from '@presentation/components/InstrumentCard';

interface InstrumentLibraryScreenProps {
  onInstrumentSelect?: (instrumentId: string) => void;
}

export function InstrumentLibraryScreen({ onInstrumentSelect }: InstrumentLibraryScreenProps) {
  const { state, selectInstrument } = useAppStateManager();
  const [selectedNationality, setSelectedNationality] = useState<Nationality | 'all'>('all');
  const [selectedPlayingMethod, setSelectedPlayingMethod] = useState<PlayingMethod | 'all'>('all');
  const [instrumentLibrary] = useState(() => new InstrumentLibrary());
  const [displayManager] = useState(() => new DisplayManager());
  const [isLoading, setIsLoading] = useState(false);

  // Initialize display manager
  useEffect(() => {
    displayManager.initialize();
  }, [displayManager]);

  // Get device info for responsive layout
  const deviceInfo = useMemo(() => DeviceUtils.getDeviceInfo(), []);
  const isTablet = deviceInfo.deviceType === 'tablet';

  // Filter instruments based on selected filters
  const filteredInstruments = useMemo(() => {
    let instruments = instrumentLibrary.getAllInstruments();

    if (selectedNationality !== 'all') {
      instruments = instruments.filter(inst => inst.nationality === selectedNationality);
    }

    if (selectedPlayingMethod !== 'all') {
      instruments = instruments.filter(inst => inst.playingMethod === selectedPlayingMethod);
    }

    return instruments;
  }, [selectedNationality, selectedPlayingMethod, instrumentLibrary]);

  // Group instruments by nationality
  const groupedInstruments = useMemo(() => {
    const thai = filteredInstruments.filter(inst => inst.nationality === 'thai');
    const international = filteredInstruments.filter(inst => inst.nationality === 'international');

    return [
      { nationality: 'thai' as Nationality, instruments: thai },
      { nationality: 'international' as Nationality, instruments: international },
    ].filter(group => group.instruments.length > 0);
  }, [filteredInstruments]);

  // Handle instrument selection
  const handleInstrumentPress = async (instrument: Instrument) => {
    try {
      setIsLoading(true);
      
      // Call custom handler if provided
      if (onInstrumentSelect) {
        onInstrumentSelect(instrument.id);
      } else {
        // Use AppStateManager to select instrument
        await selectInstrument(instrument.id);
      }
    } catch (error) {
      console.error('Failed to select instrument:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render filter button
  const renderFilterButton = (
    label: string,
    value: string,
    currentValue: string,
    onPress: () => void
  ) => {
    const isSelected = value === currentValue;
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          isSelected && styles.filterButtonActive,
          isTablet && styles.filterButtonTablet,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.filterButtonText,
            isSelected && styles.filterButtonTextActive,
            isTablet && styles.filterButtonTextTablet,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render nationality filters
  const renderNationalityFilters = () => (
    <View style={styles.filterSection}>
      <Text style={[styles.filterLabel, isTablet && styles.filterLabelTablet]}>
        Nationality / สัญชาติ
      </Text>
      <View style={styles.filterRow}>
        {renderFilterButton('All / ทั้งหมด', 'all', selectedNationality, () =>
          setSelectedNationality('all')
        )}
        {renderFilterButton('Thai / ไทย', 'thai', selectedNationality, () =>
          setSelectedNationality('thai')
        )}
        {renderFilterButton('International / สากล', 'international', selectedNationality, () =>
          setSelectedNationality('international')
        )}
      </View>
    </View>
  );

  // Render playing method filters
  const renderPlayingMethodFilters = () => (
    <View style={styles.filterSection}>
      <Text style={[styles.filterLabel, isTablet && styles.filterLabelTablet]}>
        Playing Method / วิธีการเล่น
      </Text>
      <View style={styles.filterRow}>
        {renderFilterButton('All / ทั้งหมด', 'all', selectedPlayingMethod, () =>
          setSelectedPlayingMethod('all')
        )}
        {renderFilterButton('Striking / ตี', 'striking', selectedPlayingMethod, () =>
          setSelectedPlayingMethod('striking')
        )}
        {renderFilterButton('Plucked / ดีด', 'plucked', selectedPlayingMethod, () =>
          setSelectedPlayingMethod('plucked')
        )}
        {renderFilterButton('Pressed / กด', 'pressed', selectedPlayingMethod, () =>
          setSelectedPlayingMethod('pressed')
        )}
      </View>
    </View>
  );

  // Render instrument card
  const renderInstrumentCard = (instrument: Instrument) => (
    <InstrumentCard
      key={instrument.id}
      instrument={instrument}
      onPress={handleInstrumentPress}
      isTablet={isTablet}
    />
  );

  // Render nationality group
  const renderNationalityGroup = ({ item }: { item: { nationality: Nationality; instruments: Instrument[] } }) => (
    <View style={styles.nationalityGroup}>
      <Text style={[styles.nationalityHeader, isTablet && styles.nationalityHeaderTablet]}>
        {getNationalityLabel(item.nationality)}
      </Text>
      <View style={[styles.instrumentGrid, isTablet && styles.instrumentGridTablet]}>
        {item.instruments.map(instrument => renderInstrumentCard(instrument))}
      </View>
    </View>
  );

  // Render loading overlay
  const renderLoadingOverlay = () => {
    if (!isLoading && !state.isLoading) return null;

    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading instrument...</Text>
        {state.loadingProgress > 0 && (
          <Text style={styles.loadingProgress}>{Math.round(state.loadingProgress)}%</Text>
        )}
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, isTablet && styles.emptyStateTextTablet]}>
        No instruments found
      </Text>
      <Text style={[styles.emptyStateSubtext, isTablet && styles.emptyStateSubtextTablet]}>
        Try adjusting your filters
      </Text>
    </View>
  );

  // Handle settings navigation
  const handleSettingsPress = () => {
    state.dispatch({ type: 'SET_SCREEN', payload: 'settings' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isTablet && styles.headerTablet]}>
        <Text style={[styles.headerTitle, isTablet && styles.headerTitleTablet]}>
          Instrument Library
        </Text>
        <Text style={[styles.headerSubtitle, isTablet && styles.headerSubtitleTablet]}>
          คลังเครื่องดนตรี
        </Text>
        
        {/* Settings Button */}
        <TouchableOpacity
          style={[styles.settingsButton, isTablet && styles.settingsButtonTablet]}
          onPress={handleSettingsPress}
          accessibilityLabel="Settings"
        >
          <Text style={[styles.settingsButtonText, isTablet && styles.settingsButtonTextTablet]}>
            ⚙️
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={[styles.filtersContainer, isTablet && styles.filtersContainerTablet]}>
        {renderNationalityFilters()}
        {renderPlayingMethodFilters()}
      </View>

      {/* Instrument List */}
      <FlatList
        data={groupedInstruments}
        renderItem={renderNationalityGroup}
        keyExtractor={item => item.nationality}
        contentContainerStyle={[
          styles.listContent,
          isTablet && styles.listContentTablet,
          groupedInstruments.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={true}
      />

      {/* Loading Overlay */}
      {renderLoadingOverlay()}
    </View>
  );
}

// Helper functions
function getNationalityLabel(nationality: Nationality): string {
  return nationality === 'thai' ? 'Thai Instruments / เครื่องดนตรีไทย' : 'International Instruments / เครื่องดนตรีสากล';
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
    position: 'relative',
  },
  headerTablet: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  settingsButton: {
    position: 'absolute',
    right: 20,
    top: 50,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonTablet: {
    top: 60,
    minWidth: 60,
    minHeight: 60,
  },
  settingsButtonText: {
    fontSize: 24,
  },
  settingsButtonTextTablet: {
    fontSize: 32,
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
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersContainerTablet: {
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  filterLabelTablet: {
    fontSize: 18,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonTablet: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 60,
    minHeight: 60,
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  filterButtonTextTablet: {
    fontSize: 16,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  listContentTablet: {
    padding: 32,
  },
  listContentEmpty: {
    flex: 1,
  },
  nationalityGroup: {
    marginBottom: 24,
  },
  nationalityHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  nationalityHeaderTablet: {
    fontSize: 28,
    marginBottom: 16,
  },
  instrumentGrid: {
    gap: 12,
  },
  instrumentGridTablet: {
    gap: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  emptyStateTextTablet: {
    fontSize: 24,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
  },
  emptyStateSubtextTablet: {
    fontSize: 18,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loadingProgress: {
    marginTop: 8,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
