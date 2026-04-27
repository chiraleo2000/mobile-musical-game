/**
 * Application configuration
 */

export const AppConfig = {
  // Performance targets
  performance: {
    targetFPS: 30,
    maxAudioLatency: 100, // milliseconds
    maxLoadTime: 2000, // milliseconds
  },

  // Audio configuration
  audio: {
    minSampleRate: 44100, // Hz
    maxVoices: 16,
    defaultVolume: 0.8,
    fadeInDuration: 50, // milliseconds
    fadeOutDuration: 100, // milliseconds
  },

  // Rendering configuration
  rendering: {
    antialias: true,
    alpha: true,
    defaultFOV: 45,
    nearPlane: 0.1,
    farPlane: 1000,
    defaultCameraDistance: 5,
  },

  // Touch configuration
  touch: {
    minTargetSize: 44, // pixels
    doubleTapDelay: 300, // milliseconds
    longPressDelay: 500, // milliseconds
    swipeThreshold: 50, // pixels
  },

  // Device configuration
  device: {
    phoneMaxDiagonal: 7, // inches
    tabletMinDiagonal: 7, // inches
    baseScreenWidth: 375, // iPhone SE width
  },

  // Quality presets
  quality: {
    auto: {
      fpsThreshold: 25,
      adjustInterval: 5000, // milliseconds
    },
    low: {
      maxPolygons: 5000,
      textureSize: 512,
      audioSampleRate: 22050,
      audioBitrate: 64,
    },
    medium: {
      maxPolygons: 15000,
      textureSize: 1024,
      audioSampleRate: 44100,
      audioBitrate: 128,
    },
    high: {
      maxPolygons: 50000,
      textureSize: 2048,
      audioSampleRate: 44100,
      audioBitrate: 192,
    },
  },

  // Cache configuration
  cache: {
    maxModelCacheSize: 100 * 1024 * 1024, // 100 MB
    maxAudioCacheSize: 50 * 1024 * 1024, // 50 MB
    maxTextureCacheSize: 50 * 1024 * 1024, // 50 MB
    preloadCount: 3,
  },

  // Error handling
  error: {
    maxRetries: 3,
    retryDelay: 1000, // milliseconds
    maxErrorLogSize: 100,
  },

  // UI configuration
  ui: {
    animationDuration: 300, // milliseconds
    toastDuration: 3000, // milliseconds
    loadingTimeout: 10000, // milliseconds
  },
} as const;

export type AppConfigType = typeof AppConfig;
