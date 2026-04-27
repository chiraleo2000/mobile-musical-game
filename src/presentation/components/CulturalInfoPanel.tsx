/**
 * CulturalInfoPanel - Displays cultural and educational information about instruments
 * Shows bilingual descriptions, origin, usage, and fun facts
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { CulturalInfo } from '@domain/entities/Instrument';
import { Orientation } from '@domain/entities/AppState';

interface Bounds2D {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CulturalInfoPanelProps {
  culturalInfo: CulturalInfo;
  layout: Bounds2D;
  orientation: Orientation;
  language?: 'thai' | 'english' | 'auto';
}

export function CulturalInfoPanel({
  culturalInfo,
  layout,
  orientation,
  language = 'auto',
}: CulturalInfoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandAnimation] = useState(new Animated.Value(0));

  /**
   * Toggle panel expansion
   */
  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.spring(expandAnimation, {
      toValue,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();

    setIsExpanded(!isExpanded);
  };

  /**
   * Get text in appropriate language
   */
  const getText = (localizedText: { thai: string; english: string }): string => {
    if (language === 'thai') return localizedText.thai;
    if (language === 'english') return localizedText.english;
    // Auto: show both
    return `${localizedText.thai}\n${localizedText.english}`;
  };

  /**
   * Calculate panel height based on expansion state
   */
  const panelHeight = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [layout.height, Math.min(400, layout.height * 4)],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        orientation === 'portrait' ? styles.containerPortrait : styles.containerLandscape,
        {
          width: layout.width,
          height: panelHeight,
          left: layout.x,
          top: layout.y,
        },
      ]}
    >
      {/* Header with toggle button */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        accessibilityLabel={isExpanded ? 'Collapse info panel' : 'Expand info panel'}
      >
        <Text style={styles.headerText}>
          {isExpanded ? '▼' : '▲'} Cultural Information
        </Text>
      </TouchableOpacity>

      {/* Content - only visible when expanded */}
      {isExpanded && (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sectionText}>{getText(culturalInfo.description)}</Text>
          </View>

          {/* Origin */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Origin</Text>
            <Text style={styles.sectionText}>{getText(culturalInfo.origin)}</Text>
          </View>

          {/* Usage */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usage</Text>
            <Text style={styles.sectionText}>{getText(culturalInfo.usage)}</Text>
          </View>

          {/* Fun Facts */}
          {culturalInfo.funFacts && culturalInfo.funFacts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fun Facts</Text>
              {culturalInfo.funFacts.map((fact, index) => (
                <View key={index} style={styles.factItem}>
                  <Text style={styles.factBullet}>•</Text>
                  <Text style={styles.factText}>{getText(fact)}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Collapsed preview */}
      {!isExpanded && (
        <View style={styles.preview}>
          <Text style={styles.previewText} numberOfLines={2}>
            {culturalInfo.description.english}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: '#2a2a2a',
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
    overflow: 'hidden',
  },
  containerPortrait: {
    bottom: 0,
  },
  containerLandscape: {
    right: 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#333333',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
    minHeight: 44,
    justifyContent: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#4ecdc4',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionText: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
  },
  factItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  factBullet: {
    color: '#4ecdc4',
    fontSize: 14,
    marginRight: 8,
    fontWeight: 'bold',
  },
  factText: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  preview: {
    padding: 16,
    flex: 1,
  },
  previewText: {
    color: '#999999',
    fontSize: 12,
    lineHeight: 16,
  },
});
