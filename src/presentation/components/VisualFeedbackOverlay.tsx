/**
 * VisualFeedbackOverlay - Displays touch feedback on interaction zones
 * Shows highlights, animations, and visual responses to user touch
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  GestureResponderEvent,
} from 'react-native';
import { InteractionZone } from '@domain/entities/Instrument';

interface VisualFeedbackOverlayProps {
  interactionZones: InteractionZone[];
  activeFeedback: string[];
  onTouchStart: (event: GestureResponderEvent) => void;
  onTouchMove: (event: GestureResponderEvent) => void;
  onTouchEnd: (event: GestureResponderEvent) => void;
}

interface FeedbackAnimation {
  zoneId: string;
  opacity: Animated.Value;
  scale: Animated.Value;
}

export function VisualFeedbackOverlay({
  interactionZones,
  activeFeedback,
  onTouchStart,
  onTouchEnd,
}: VisualFeedbackOverlayProps) {
  const animationsRef = useRef<Map<string, FeedbackAnimation>>(new Map());

  /**
   * Initialize animations for each zone
   */
  useEffect(() => {
    interactionZones.forEach((zone) => {
      if (!animationsRef.current.has(zone.id)) {
        animationsRef.current.set(zone.id, {
          zoneId: zone.id,
          opacity: new Animated.Value(0),
          scale: new Animated.Value(1),
        });
      }
    });
  }, [interactionZones]);

  /**
   * Trigger animations when feedback becomes active
   */
  useEffect(() => {
    activeFeedback.forEach((zoneId) => {
      const animation = animationsRef.current.get(zoneId);
      if (!animation) return;

      const zone = interactionZones.find((z) => z.id === zoneId);
      if (!zone) return;

      // Animate based on interaction type
      switch (zone.type) {
        case 'strike':
          animateStrike(animation);
          break;
        case 'pluck':
          animatePluck(animation);
          break;
        case 'press':
          animatePress(animation);
          break;
      }
    });
  }, [activeFeedback, interactionZones]);

  /**
   * Strike animation - quick flash
   */
  const animateStrike = (animation: FeedbackAnimation) => {
    // Reset values
    animation.opacity.setValue(1);
    animation.scale.setValue(1.2);

    // Animate out
    Animated.parallel([
      Animated.timing(animation.opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animation.scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /**
   * Pluck animation - ripple effect
   */
  const animatePluck = (animation: FeedbackAnimation) => {
    // Reset values
    animation.opacity.setValue(0.8);
    animation.scale.setValue(1);

    // Animate ripple
    Animated.parallel([
      Animated.timing(animation.opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animation.scale, {
        toValue: 1.5,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /**
   * Press animation - glow effect
   */
  const animatePress = (animation: FeedbackAnimation) => {
    // Reset values
    animation.opacity.setValue(0.9);
    animation.scale.setValue(1.1);

    // Animate glow
    Animated.parallel([
      Animated.timing(animation.opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animation.scale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /**
   * Get feedback color based on zone type
   */
  const getFeedbackColor = (type: InteractionZone['type']): string => {
    switch (type) {
      case 'strike':
        return '#ff6b6b'; // Red for striking
      case 'pluck':
        return '#4ecdc4'; // Cyan for plucking
      case 'press':
        return '#ffe66d'; // Yellow for pressing
      default:
        return '#ffffff';
    }
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={onTouchStart}
      onPressOut={onTouchEnd}
    >
      <View style={styles.overlay}>
        {interactionZones.map((zone) => {
          const animation = animationsRef.current.get(zone.id);
          if (!animation) return null;

          return (
            <Animated.View
              key={zone.id}
              style={[
                styles.feedbackZone,
                {
                  left: zone.bounds.x,
                  top: zone.bounds.y,
                  width: zone.bounds.width,
                  height: zone.bounds.height,
                  backgroundColor: getFeedbackColor(zone.type),
                  opacity: animation.opacity,
                  transform: [{ scale: animation.scale }],
                },
              ]}
            />
          );
        })}

        {/* Interaction zones overlay (invisible but touchable) */}
        {interactionZones.map((zone) => (
          <View
            key={`touch-${zone.id}`}
            style={[
              styles.touchZone,
              {
                left: zone.bounds.x,
                top: zone.bounds.y,
                width: zone.bounds.width,
                height: zone.bounds.height,
              },
            ]}
          />
        ))}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  feedbackZone: {
    position: 'absolute',
    borderRadius: 8,
    pointerEvents: 'none',
  },
  touchZone: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
});
