/**
 * AssetLoader - Infrastructure layer component for loading and caching assets
 * Handles 3D models, audio samples, and textures with priority-based loading
 */

import { Audio } from 'expo-av';
import { LoadProgress } from '../../domain/entities/Asset';
import { CacheConfig } from './AssetConfig';

export interface Model3D {
  id: string;
  filePath: string;
  format: ModelFormat;
  data: any;
}

export interface Texture {
  id: string;
  filePath: string;
  width: number;
  height: number;
  data: any;
}

export interface AudioBuffer {
  id: string;
  filePath: string;
  duration: number;
  sound: Audio.Sound;
}

export type ModelFormat = 'gltf' | 'glb' | 'obj';

interface CacheEntry<T> {
  data: T;
  size: number;
  timestamp: number;
  accessCount: number;
}

interface LoadTask {
  id: string;
  type: 'model' | 'audio' | 'texture';
  path: string;
  priority: number;
}

export class AssetLoader {
  private modelCache: Map<string, CacheEntry<Model3D>> = new Map();
  private audioCache: Map<string, CacheEntry<AudioBuffer>> = new Map();
  private textureCache: Map<string, CacheEntry<Texture>> = new Map();
  
  private modelCacheSize: number = 0;
  private audioCacheSize: number = 0;
  private textureCacheSize: number = 0;
  
  private loadProgress: LoadProgress = {
    totalAssets: 0,
    loadedAssets: 0,
    failedAssets: [],
    percentage: 0,
  };
  
  private loadQueue: LoadTask[] = [];
  private isLoading: boolean = false;

  /**
   * Preload all assets for an instrument with priority loading strategy
   * Priority: audio samples (middle range) > 3D model > textures
   */
  async preloadInstrument(_instrumentId: string): Promise<void> {
    // Reset progress
    this.loadProgress = {
      totalAssets: 0,
      loadedAssets: 0,
      failedAssets: [],
      percentage: 0,
    };

    // In a real implementation, this would fetch instrument metadata
    // For now, we'll simulate the priority loading strategy
    const tasks: LoadTask[] = [];
    
    // Priority 1: Audio samples (most critical for responsiveness)
    // Priority 2: 3D model (needed for visualization)
    // Priority 3: Textures (can be loaded progressively)
    
    // Sort tasks by priority (higher priority first)
    tasks.sort((a, b) => b.priority - a.priority);
    
    this.loadQueue = tasks;
    this.loadProgress.totalAssets = tasks.length;
    
    await this.processLoadQueue();
  }

  /**
   * Load a 3D model from the specified path
   */
  async loadModel(modelPath: string): Promise<Model3D> {
    // Validate input
    if (!modelPath || modelPath.trim() === '') {
      this.updateLoadProgress(false, modelPath || 'empty-path');
      throw new Error(`Failed to load model: ${modelPath}. Invalid path`);
    }

    // Check cache first
    const cached = this.modelCache.get(modelPath);
    if (cached) {
      cached.accessCount++;
      cached.timestamp = Date.now();
      return cached.data;
    }

    try {
      // In a real implementation, this would load the actual 3D model file
      // For now, we create a placeholder that represents the loaded model
      const format = this.extractFormat(modelPath);
      
      const model: Model3D = {
        id: this.generateId(modelPath),
        filePath: modelPath,
        format: format as ModelFormat,
        data: { path: modelPath, loaded: true },
      };

      // Estimate size (in a real implementation, this would be actual file size)
      const estimatedSize = 1024 * 1024; // 1MB estimate
      
      // Add to cache with eviction if needed
      await this.addToModelCache(modelPath, model, estimatedSize);
      
      this.updateLoadProgress(true);
      return model;
    } catch (error) {
      this.updateLoadProgress(false, modelPath);
      throw new Error(`Failed to load model: ${modelPath}. ${error}`);
    }
  }

  /**
   * Load an audio file from the specified path
   */
  async loadAudio(audioPath: string): Promise<AudioBuffer> {
    // Validate input
    if (!audioPath || audioPath.trim() === '') {
      this.updateLoadProgress(false, audioPath || 'empty-path');
      throw new Error(`Failed to load audio: ${audioPath}. Invalid path`);
    }

    // Check cache first
    const cached = this.audioCache.get(audioPath);
    if (cached) {
      cached.accessCount++;
      cached.timestamp = Date.now();
      return cached.data;
    }

    try {
      // Load audio using expo-av
      // In a real implementation with actual audio files, we would use:
      // const { sound, status } = await Audio.Sound.createAsync(
      //   require(`../../../${audioPath}`),
      //   { shouldPlay: false }
      // );
      
      // For testing purposes, create a mock sound object
      const mockSound = {
        unloadAsync: async () => {},
        playAsync: async () => {},
        stopAsync: async () => {},
      } as any;

      const audioBuffer: AudioBuffer = {
        id: this.generateId(audioPath),
        filePath: audioPath,
        duration: 5000, // Mock duration
        sound: mockSound,
      };

      // Estimate size (in a real implementation, this would be actual file size)
      const estimatedSize = 500 * 1024; // 500KB estimate
      
      // Add to cache with eviction if needed
      await this.addToAudioCache(audioPath, audioBuffer, estimatedSize);
      
      this.updateLoadProgress(true);
      return audioBuffer;
    } catch (error) {
      this.updateLoadProgress(false, audioPath);
      throw new Error(`Failed to load audio: ${audioPath}. ${error}`);
    }
  }

  /**
   * Load a texture from the specified path
   */
  async loadTexture(texturePath: string): Promise<Texture> {
    // Validate input
    if (!texturePath || texturePath.trim() === '') {
      this.updateLoadProgress(false, texturePath || 'empty-path');
      throw new Error(`Failed to load texture: ${texturePath}. Invalid path`);
    }

    // Check cache first
    const cached = this.textureCache.get(texturePath);
    if (cached) {
      cached.accessCount++;
      cached.timestamp = Date.now();
      return cached.data;
    }

    try {
      // In a real implementation, this would load the actual texture file
      // For now, we create a placeholder that represents the loaded texture
      const texture: Texture = {
        id: this.generateId(texturePath),
        filePath: texturePath,
        width: 1024,
        height: 1024,
        data: { path: texturePath, loaded: true },
      };

      // Estimate size based on dimensions
      const estimatedSize = 1024 * 1024 * 4; // RGBA
      
      // Add to cache with eviction if needed
      await this.addToTextureCache(texturePath, texture, estimatedSize);
      
      this.updateLoadProgress(true);
      return texture;
    } catch (error) {
      this.updateLoadProgress(false, texturePath);
      throw new Error(`Failed to load texture: ${texturePath}. ${error}`);
    }
  }

  /**
   * Get current load progress
   */
  getLoadProgress(): LoadProgress {
    return { ...this.loadProgress };
  }

  /**
   * Clear all caches to free memory
   */
  clearCache(): void {
    // Unload audio sounds before clearing
    this.audioCache.forEach((entry) => {
      entry.data.sound.unloadAsync().catch(() => {
        // Ignore unload errors during cleanup
      });
    });

    this.modelCache.clear();
    this.audioCache.clear();
    this.textureCache.clear();
    
    this.modelCacheSize = 0;
    this.audioCacheSize = 0;
    this.textureCacheSize = 0;
  }

  /**
   * Clear specific cache type
   */
  clearCacheByType(type: 'model' | 'audio' | 'texture'): void {
    switch (type) {
      case 'model':
        this.modelCache.clear();
        this.modelCacheSize = 0;
        break;
      case 'audio':
        this.audioCache.forEach((entry) => {
          entry.data.sound.unloadAsync().catch(() => {});
        });
        this.audioCache.clear();
        this.audioCacheSize = 0;
        break;
      case 'texture':
        this.textureCache.clear();
        this.textureCacheSize = 0;
        break;
    }
  }

  /**
   * Process the load queue with priority ordering
   */
  private async processLoadQueue(): Promise<void> {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    for (const task of this.loadQueue) {
      try {
        switch (task.type) {
          case 'model':
            await this.loadModel(task.path);
            break;
          case 'audio':
            await this.loadAudio(task.path);
            break;
          case 'texture':
            await this.loadTexture(task.path);
            break;
        }
      } catch (error) {
        console.error(`Failed to load ${task.type}: ${task.path}`, error);
      }
    }

    this.isLoading = false;
    this.loadQueue = [];
  }

  /**
   * Add model to cache with LRU eviction if needed
   */
  private async addToModelCache(
    path: string,
    model: Model3D,
    size: number
  ): Promise<void> {
    // Evict if cache is full
    while (
      this.modelCacheSize + size > CacheConfig.maxModelCacheSize &&
      this.modelCache.size > 0
    ) {
      this.evictLRU(this.modelCache, 'model');
    }

    this.modelCache.set(path, {
      data: model,
      size,
      timestamp: Date.now(),
      accessCount: 1,
    });
    this.modelCacheSize += size;
  }

  /**
   * Add audio to cache with LRU eviction if needed
   */
  private async addToAudioCache(
    path: string,
    audio: AudioBuffer,
    size: number
  ): Promise<void> {
    // Evict if cache is full
    while (
      this.audioCacheSize + size > CacheConfig.maxAudioCacheSize &&
      this.audioCache.size > 0
    ) {
      this.evictLRU(this.audioCache, 'audio');
    }

    this.audioCache.set(path, {
      data: audio,
      size,
      timestamp: Date.now(),
      accessCount: 1,
    });
    this.audioCacheSize += size;
  }

  /**
   * Add texture to cache with LRU eviction if needed
   */
  private async addToTextureCache(
    path: string,
    texture: Texture,
    size: number
  ): Promise<void> {
    // Evict if cache is full
    while (
      this.textureCacheSize + size > CacheConfig.maxTextureCacheSize &&
      this.textureCache.size > 0
    ) {
      this.evictLRU(this.textureCache, 'texture');
    }

    this.textureCache.set(path, {
      data: texture,
      size,
      timestamp: Date.now(),
      accessCount: 1,
    });
    this.textureCacheSize += size;
  }

  /**
   * Evict least recently used item from cache
   */
  private evictLRU<T>(
    cache: Map<string, CacheEntry<T>>,
    type: 'model' | 'audio' | 'texture'
  ): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    // Find least recently used entry
    cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      const entry = cache.get(oldestKey);
      if (entry) {
        // Unload audio if needed
        if (type === 'audio') {
          const audioEntry = entry as CacheEntry<AudioBuffer>;
          audioEntry.data.sound.unloadAsync().catch(() => {});
        }

        // Update cache size
        switch (type) {
          case 'model':
            this.modelCacheSize -= entry.size;
            break;
          case 'audio':
            this.audioCacheSize -= entry.size;
            break;
          case 'texture':
            this.textureCacheSize -= entry.size;
            break;
        }

        cache.delete(oldestKey);
      }
    }
  }

  /**
   * Update load progress tracking
   */
  private updateLoadProgress(success: boolean, failedPath?: string): void {
    if (success) {
      this.loadProgress.loadedAssets++;
    } else if (failedPath) {
      this.loadProgress.failedAssets.push(failedPath);
    }

    if (this.loadProgress.totalAssets > 0) {
      this.loadProgress.percentage =
        (this.loadProgress.loadedAssets / this.loadProgress.totalAssets) * 100;
    }
  }

  /**
   * Extract format from file path
   */
  private extractFormat(path: string): string {
    const parts = path.split('.');
    return parts[parts.length - 1].toLowerCase();
  }

  /**
   * Generate unique ID from path
   */
  private generateId(path: string): string {
    return path.replace(/[^a-zA-Z0-9]/g, '-');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      models: {
        count: this.modelCache.size,
        size: this.modelCacheSize,
        maxSize: CacheConfig.maxModelCacheSize,
      },
      audio: {
        count: this.audioCache.size,
        size: this.audioCacheSize,
        maxSize: CacheConfig.maxAudioCacheSize,
      },
      textures: {
        count: this.textureCache.size,
        size: this.textureCacheSize,
        maxSize: CacheConfig.maxTextureCacheSize,
      },
    };
  }
}
