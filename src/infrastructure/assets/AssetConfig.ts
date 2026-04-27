/**
 * Asset loading configuration and paths
 */

export const AssetPaths = {
  models: {
    base: 'assets/models/',
    thai: {
      striking: 'assets/models/thai/striking/',
      plucked: 'assets/models/thai/plucked/',
      pressed: 'assets/models/thai/pressed/',
    },
    international: {
      striking: 'assets/models/international/striking/',
      plucked: 'assets/models/international/plucked/',
      pressed: 'assets/models/international/pressed/',
    },
  },
  audio: {
    base: 'assets/audio/',
    thai: {
      striking: 'assets/audio/thai/striking/',
      plucked: 'assets/audio/thai/plucked/',
      pressed: 'assets/audio/thai/pressed/',
    },
    international: {
      striking: 'assets/audio/international/striking/',
      plucked: 'assets/audio/international/plucked/',
      pressed: 'assets/audio/international/pressed/',
    },
  },
  textures: {
    base: 'assets/textures/',
    instruments: 'assets/textures/instruments/',
    ui: 'assets/textures/ui/',
  },
} as const;

export const AssetFormats = {
  models: {
    preferred: 'glb',
    supported: ['glb', 'gltf', 'obj'],
  },
  audio: {
    preferred: 'mp3',
    supported: ['mp3', 'wav', 'ogg', 'm4a'],
  },
  textures: {
    preferred: 'png',
    supported: ['png', 'jpg', 'jpeg'],
  },
} as const;

export const AssetQuality = {
  models: {
    low: { maxPolygons: 5000, textureSize: 512 },
    medium: { maxPolygons: 15000, textureSize: 1024 },
    high: { maxPolygons: 50000, textureSize: 2048 },
  },
  audio: {
    low: { sampleRate: 22050, bitrate: 64 },
    medium: { sampleRate: 44100, bitrate: 128 },
    high: { sampleRate: 44100, bitrate: 192 },
  },
} as const;

export const CacheConfig = {
  maxModelCacheSize: 100 * 1024 * 1024, // 100 MB
  maxAudioCacheSize: 50 * 1024 * 1024,  // 50 MB
  maxTextureCacheSize: 50 * 1024 * 1024, // 50 MB
  preloadCount: 3, // Number of instruments to preload
} as const;
