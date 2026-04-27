/**
 * InstrumentCard Component
 * Displays a single instrument card with thumbnail, bilingual name, and playing method
 * 
 * Features:
 * - Bilingual display (Thai/English)
 * - Playing method icon
 * - Tap handler for selection
 * - Responsive sizing for phones and tablets
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Instrument, PlayingMethod } from '@domain/entities/Instrument';

interface InstrumentCardProps {
  instrument: Instrument;
  onPress: (instrument: Instrument) => void;
  isTablet?: boolean;
}

export function InstrumentCard({ instrument, onPress, isTablet = false }: InstrumentCardProps) {
  const handlePress = () => {
    onPress(instrument);
  };

  const getPlayingMethodIcon = (method: PlayingMethod): string => {
    const icons = {
      striking: '🥁',
      plucked: '🎸',
      pressed: '🎹',
    };
    return icons[method];
  };

  const getPlayingMethodLabel = (method: PlayingMethod): string => {
    const labels = {
      striking: 'Striking / ตี',
      plucked: 'Plucked / ดีด',
      pressed: 'Pressed / กด',
    };
    return labels[method];
  };

  return (
    <TouchableOpacity
      style={[styles.card, isTablet && styles.cardTablet]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${instrument.name.english}, ${instrument.name.thai}`}
      accessibilityHint="Tap to select this instrument"
    >
      {/* Thumbnail placeholder */}
      <View style={[styles.thumbnail, isTablet && styles.thumbnailTablet]}>
        <Text style={[styles.thumbnailIcon, isTablet && styles.thumbnailIconTablet]}>
          {getPlayingMethodIcon(instrument.playingMethod)}
        </Text>
      </View>

      {/* Instrument info */}
      <View style={styles.info}>
        <Text style={[styles.nameThai, isTablet && styles.nameThaiTablet]} numberOfLines={1}>
          {instrument.name.thai}
        </Text>
        <Text style={[styles.nameEnglish, isTablet && styles.nameEnglishTablet]} numberOfLines={1}>
          {instrument.name.english}
        </Text>
        
        {/* Metadata */}
        <View style={styles.meta}>
          <Text style={[styles.metaText, isTablet && styles.metaTextTablet]}>
            {getPlayingMethodLabel(instrument.playingMethod)}
          </Text>
          <Text style={[styles.metaText, isTablet && styles.metaTextTablet]}> • </Text>
          <Text style={[styles.metaText, isTablet && styles.metaTextTablet]}>
            {instrument.metadata.difficulty}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 44,
  },
  cardTablet: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    minHeight: 60,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  thumbnailTablet: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 24,
  },
  thumbnailIcon: {
    fontSize: 32,
  },
  thumbnailIconTablet: {
    fontSize: 42,
  },
  info: {
    flex: 1,
  },
  nameThai: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  nameThaiTablet: {
    fontSize: 24,
    marginBottom: 6,
  },
  nameEnglish: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  nameEnglishTablet: {
    fontSize: 20,
    marginBottom: 10,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#999999',
  },
  metaTextTablet: {
    fontSize: 16,
  },
});
