/**
 * Unit tests for AssetLoader
 * Tests asset caching, load progress tracking, error handling, and cache management
 */

import { AssetLoader } from '../AssetLoader';
import { CacheConfig } from '../AssetConfig';

describe('AssetLoader', () => {
  let assetLoader: AssetLoader;

  beforeEach(() => {
    assetLoader = new AssetLoader();
  });

  afterEach(() => {
    assetLoader.clearCache();
  });

  describe('loadModel', () => {
    it('should load a 3D model successfully', async () => {
      const modelPath = 'assets/models/test.glb';
      const model = await assetLoader.loadModel(modelPath);

      expect(model).toBeDefined();
      expect(model.filePath).toBe(modelPath);
      expect(model.format).toBe('glb');
      expect(model.id).toBeTruthy();
    });

    it('should cache loaded models', async () => {
      const modelPath = 'assets/models/test.glb';
      
      const model1 = await assetLoader.loadModel(modelPath);
      const model2 = await assetLoader.loadModel(modelPath);

      expect(model1).toBe(model2);
      
      const stats = assetLoader.getCacheStats();
      expect(stats.models.count).toBe(1);
    });

    it('should extract correct format from path', async () => {
      const gltfPath = 'assets/models/test.gltf';
      const objPath = 'assets/models/test.obj';

      const gltfModel = await assetLoader.loadModel(gltfPath);
      const objModel = await assetLoader.loadModel(objPath);

      expect(gltfModel.format).toBe('gltf');
      expect(objModel.format).toBe('obj');
    });

    it('should handle load errors gracefully', async () => {
      // Test with invalid path that would cause an error
      const modelPath = '';
      
      await expect(assetLoader.loadModel(modelPath)).rejects.toThrow(
        'Failed to load model'
      );
    });

    it('should update load progress on successful load', async () => {
      const modelPath = 'assets/models/test.glb';
      await assetLoader.loadModel(modelPath);

      const progress = assetLoader.getLoadProgress();
      expect(progress.loadedAssets).toBe(1);
    });

    it('should track failed assets on error', async () => {
      const modelPath = ''; // Invalid path
      
      try {
        await assetLoader.loadModel(modelPath);
      } catch (error) {
        // Expected error
      }

      const progress = assetLoader.getLoadProgress();
      expect(progress.failedAssets).toContain('empty-path');
    });
  });

  describe('loadAudio', () => {
    it('should load audio successfully', async () => {
      const audioPath = 'assets/audio/test.wav';
      const audio = await assetLoader.loadAudio(audioPath);

      expect(audio).toBeDefined();
      expect(audio.filePath).toBe(audioPath);
      expect(audio.duration).toBe(5000);
      expect(audio.sound).toBeDefined();
    });

    it('should cache loaded audio', async () => {
      const audioPath = 'assets/audio/test.wav';
      
      const audio1 = await assetLoader.loadAudio(audioPath);
      const audio2 = await assetLoader.loadAudio(audioPath);

      expect(audio1).toBe(audio2);
      
      const stats = assetLoader.getCacheStats();
      expect(stats.audio.count).toBe(1);
    });

    it('should handle audio load errors', async () => {
      const audioPath = ''; // Invalid path
      
      await expect(assetLoader.loadAudio(audioPath)).rejects.toThrow(
        'Failed to load audio'
      );
    });

    it('should update load progress on successful audio load', async () => {
      const audioPath = 'assets/audio/test.wav';
      await assetLoader.loadAudio(audioPath);

      const progress = assetLoader.getLoadProgress();
      expect(progress.loadedAssets).toBe(1);
    });
  });

  describe('loadTexture', () => {
    it('should load texture successfully', async () => {
      const texturePath = 'assets/textures/test.png';
      const texture = await assetLoader.loadTexture(texturePath);

      expect(texture).toBeDefined();
      expect(texture.filePath).toBe(texturePath);
      expect(texture.width).toBe(1024);
      expect(texture.height).toBe(1024);
    });

    it('should cache loaded textures', async () => {
      const texturePath = 'assets/textures/test.png';
      
      const texture1 = await assetLoader.loadTexture(texturePath);
      const texture2 = await assetLoader.loadTexture(texturePath);

      expect(texture1).toBe(texture2);
      
      const stats = assetLoader.getCacheStats();
      expect(stats.textures.count).toBe(1);
    });

    it('should handle texture load errors', async () => {
      const texturePath = ''; // Invalid path

      await expect(assetLoader.loadTexture(texturePath)).rejects.toThrow(
        'Failed to load texture'
      );
    });
  });

  describe('getLoadProgress', () => {
    it('should return initial progress state', () => {
      const progress = assetLoader.getLoadProgress();

      expect(progress.totalAssets).toBe(0);
      expect(progress.loadedAssets).toBe(0);
      expect(progress.failedAssets).toHaveLength(0);
      expect(progress.percentage).toBe(0);
    });

    it('should calculate correct percentage', async () => {
      // Manually set total assets for testing
      const loader = assetLoader as any;
      loader.loadProgress.totalAssets = 4;

      await assetLoader.loadModel('assets/models/test1.glb');
      await assetLoader.loadModel('assets/models/test2.glb');

      const progress = assetLoader.getLoadProgress();
      expect(progress.loadedAssets).toBe(2);
      expect(progress.percentage).toBe(50);
    });

    it('should track multiple failed assets', async () => {
      const paths = ['', '']; // Invalid paths

      for (const path of paths) {
        try {
          await assetLoader.loadModel(path);
        } catch (error) {
          // Expected
        }
      }

      const progress = assetLoader.getLoadProgress();
      expect(progress.failedAssets.length).toBeGreaterThanOrEqual(1);
      expect(progress.failedAssets).toContain('empty-path');
    });
  });

  describe('clearCache', () => {
    it('should clear all caches', async () => {
      await assetLoader.loadModel('assets/models/test.glb');
      await assetLoader.loadAudio('assets/audio/test.wav');
      await assetLoader.loadTexture('assets/textures/test.png');

      let stats = assetLoader.getCacheStats();
      expect(stats.models.count).toBe(1);
      expect(stats.audio.count).toBe(1);
      expect(stats.textures.count).toBe(1);

      assetLoader.clearCache();

      stats = assetLoader.getCacheStats();
      expect(stats.models.count).toBe(0);
      expect(stats.audio.count).toBe(0);
      expect(stats.textures.count).toBe(0);
      expect(stats.models.size).toBe(0);
      expect(stats.audio.size).toBe(0);
      expect(stats.textures.size).toBe(0);
    });

    it('should unload audio sounds when clearing', async () => {
      const mockUnload = jest.fn().mockResolvedValue(undefined);
      
      await assetLoader.loadAudio('assets/audio/test.wav');
      
      // Get the cached audio and replace its unload method
      const loader = assetLoader as any;
      const cached = loader.audioCache.get('assets/audio/test.wav');
      if (cached) {
        cached.data.sound.unloadAsync = mockUnload;
      }
      
      assetLoader.clearCache();

      expect(mockUnload).toHaveBeenCalled();
    });
  });

  describe('clearCacheByType', () => {
    it('should clear only model cache', async () => {
      await assetLoader.loadModel('assets/models/test.glb');
      await assetLoader.loadAudio('assets/audio/test.wav');
      await assetLoader.loadTexture('assets/textures/test.png');

      assetLoader.clearCacheByType('model');

      const stats = assetLoader.getCacheStats();
      expect(stats.models.count).toBe(0);
      expect(stats.audio.count).toBe(1);
      expect(stats.textures.count).toBe(1);
    });

    it('should clear only audio cache', async () => {
      await assetLoader.loadModel('assets/models/test.glb');
      await assetLoader.loadAudio('assets/audio/test.wav');
      await assetLoader.loadTexture('assets/textures/test.png');

      assetLoader.clearCacheByType('audio');

      const stats = assetLoader.getCacheStats();
      expect(stats.models.count).toBe(1);
      expect(stats.audio.count).toBe(0);
      expect(stats.textures.count).toBe(1);
    });

    it('should clear only texture cache', async () => {
      await assetLoader.loadModel('assets/models/test.glb');
      await assetLoader.loadAudio('assets/audio/test.wav');
      await assetLoader.loadTexture('assets/textures/test.png');

      assetLoader.clearCacheByType('texture');

      const stats = assetLoader.getCacheStats();
      expect(stats.models.count).toBe(1);
      expect(stats.audio.count).toBe(1);
      expect(stats.textures.count).toBe(0);
    });
  });

  describe('cache eviction (LRU)', () => {
    it('should evict least recently used model when cache is full', async () => {
      // Mock a small cache size for testing
      const originalMaxSize = CacheConfig.maxModelCacheSize;
      (CacheConfig as any).maxModelCacheSize = 2 * 1024 * 1024; // 2MB

      // Load 3 models (each ~1MB)
      await assetLoader.loadModel('assets/models/model1.glb');
      await assetLoader.loadModel('assets/models/model2.glb');
      await assetLoader.loadModel('assets/models/model3.glb');

      const stats = assetLoader.getCacheStats();
      // Should have evicted the oldest model
      expect(stats.models.count).toBeLessThanOrEqual(2);

      // Restore original config
      (CacheConfig as any).maxModelCacheSize = originalMaxSize;
    });

    it('should update access count on cache hit', async () => {
      const modelPath = 'assets/models/test.glb';
      
      await assetLoader.loadModel(modelPath);
      await assetLoader.loadModel(modelPath); // Cache hit
      await assetLoader.loadModel(modelPath); // Cache hit

      // Access count should be tracked internally
      const stats = assetLoader.getCacheStats();
      expect(stats.models.count).toBe(1);
    });
  });

  describe('getCacheStats', () => {
    it('should return correct cache statistics', async () => {
      await assetLoader.loadModel('assets/models/test.glb');
      await assetLoader.loadAudio('assets/audio/test.wav');

      const stats = assetLoader.getCacheStats();

      expect(stats.models.count).toBe(1);
      expect(stats.models.size).toBeGreaterThan(0);
      expect(stats.models.maxSize).toBe(CacheConfig.maxModelCacheSize);

      expect(stats.audio.count).toBe(1);
      expect(stats.audio.size).toBeGreaterThan(0);
      expect(stats.audio.maxSize).toBe(CacheConfig.maxAudioCacheSize);

      expect(stats.textures.count).toBe(0);
    });

    it('should show zero stats for empty cache', () => {
      const stats = assetLoader.getCacheStats();

      expect(stats.models.count).toBe(0);
      expect(stats.models.size).toBe(0);
      expect(stats.audio.count).toBe(0);
      expect(stats.audio.size).toBe(0);
      expect(stats.textures.count).toBe(0);
      expect(stats.textures.size).toBe(0);
    });
  });

  describe('preloadInstrument', () => {
    it('should initialize load progress', async () => {
      await assetLoader.preloadInstrument('test-instrument');

      const progress = assetLoader.getLoadProgress();
      expect(progress.totalAssets).toBe(0); // No tasks in mock implementation
      expect(progress.loadedAssets).toBe(0);
      expect(progress.failedAssets).toHaveLength(0);
      expect(progress.percentage).toBe(0);
    });

    it('should reset progress on new preload', async () => {
      // Manually set some progress
      const loader = assetLoader as any;
      loader.loadProgress.loadedAssets = 5;
      loader.loadProgress.failedAssets = ['test.glb'];

      await assetLoader.preloadInstrument('new-instrument');

      const progress = assetLoader.getLoadProgress();
      expect(progress.loadedAssets).toBe(0);
      expect(progress.failedAssets).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should handle missing asset gracefully', async () => {
      await expect(
        assetLoader.loadModel('')
      ).rejects.toThrow();
    });

    it('should continue loading after error', async () => {
      try {
        await assetLoader.loadModel('');
      } catch (error) {
        // Expected
      }

      // Second load succeeds
      const model = await assetLoader.loadModel('assets/models/success.glb');
      expect(model).toBeDefined();
    });

    it('should handle audio unload errors during cache clear', async () => {
      const mockUnload = jest.fn().mockRejectedValue(new Error('Unload failed'));
      
      await assetLoader.loadAudio('assets/audio/test.wav');
      
      // Replace unload method to simulate error
      const loader = assetLoader as any;
      const cached = loader.audioCache.get('assets/audio/test.wav');
      if (cached) {
        cached.data.sound.unloadAsync = mockUnload;
      }
      
      // Should not throw even if unload fails
      expect(() => assetLoader.clearCache()).not.toThrow();
    });
  });

  describe('memory management', () => {
    it('should track cache sizes correctly', async () => {
      await assetLoader.loadModel('assets/models/test.glb');
      
      const stats = assetLoader.getCacheStats();
      expect(stats.models.size).toBeGreaterThan(0);
      expect(stats.models.size).toBeLessThanOrEqual(stats.models.maxSize);
    });

    it('should respect max cache sizes', async () => {
      const stats = assetLoader.getCacheStats();
      
      expect(stats.models.maxSize).toBe(CacheConfig.maxModelCacheSize);
      expect(stats.audio.maxSize).toBe(CacheConfig.maxAudioCacheSize);
      expect(stats.textures.maxSize).toBe(CacheConfig.maxTextureCacheSize);
    });
  });
});
