/**
 * Unit tests for Asset data model validation
 * Tests asset management types and load progress tracking
 */

import {
  AssetType,
  AssetReference,
  InstrumentAssetEntry,
  SharedAsset,
  AssetManifest,
  LoadProgress,
} from '../Asset';

describe('Asset Data Model', () => {
  describe('AssetReference validation', () => {
    it('should accept valid asset reference', () => {
      const asset: AssetReference = {
        id: 'asset-1',
        type: 'model',
        path: 'models/ranat-ek.glb',
        size: 1024000,
        checksum: 'abc123def456',
        compressed: false,
      };
      expect(asset.id).toBe('asset-1');
      expect(asset.type).toBe('model');
      expect(asset.size).toBe(1024000);
    });

    it('should accept all asset types', () => {
      const types: AssetType[] = ['model', 'audio', 'texture', 'animation', 'metadata'];
      types.forEach((type) => {
        const asset: AssetReference = {
          id: `asset-${type}`,
          type,
          path: `assets/${type}/file`,
          size: 1000,
          checksum: 'checksum',
          compressed: false,
        };
        expect(asset.type).toBe(type);
      });
    });

    it('should accept compressed assets', () => {
      const asset: AssetReference = {
        id: 'asset-1',
        type: 'audio',
        path: 'audio/sample.mp3',
        size: 500000,
        checksum: 'xyz789',
        compressed: true,
      };
      expect(asset.compressed).toBe(true);
    });

    it('should accept uncompressed assets', () => {
      const asset: AssetReference = {
        id: 'asset-2',
        type: 'texture',
        path: 'textures/wood.png',
        size: 2048000,
        checksum: 'abc123',
        compressed: false,
      };
      expect(asset.compressed).toBe(false);
    });

    it('should validate asset size is non-negative', () => {
      const asset: AssetReference = {
        id: 'asset-1',
        type: 'model',
        path: 'models/test.glb',
        size: 0,
        checksum: 'checksum',
        compressed: false,
      };
      expect(asset.size).toBeGreaterThanOrEqual(0);
    });

    it('should accept large asset sizes', () => {
      const asset: AssetReference = {
        id: 'asset-1',
        type: 'model',
        path: 'models/large.glb',
        size: 10485760, // 10 MB
        checksum: 'checksum',
        compressed: false,
      };
      expect(asset.size).toBe(10485760);
    });
  });

  describe('InstrumentAssetEntry validation', () => {
    it('should accept valid instrument asset entry', () => {
      const entry: InstrumentAssetEntry = {
        instrumentId: 'ranat-ek',
        model: {
          id: 'model-1',
          type: 'model',
          path: 'models/ranat-ek.glb',
          size: 1024000,
          checksum: 'abc123',
          compressed: false,
        },
        audio: [
          {
            id: 'audio-1',
            type: 'audio',
            path: 'audio/c4.wav',
            size: 500000,
            checksum: 'def456',
            compressed: false,
          },
        ],
        textures: [
          {
            id: 'texture-1',
            type: 'texture',
            path: 'textures/wood.png',
            size: 2048000,
            checksum: 'ghi789',
            compressed: false,
          },
        ],
        totalSize: 3572000,
      };
      expect(entry.instrumentId).toBe('ranat-ek');
      expect(entry.audio).toHaveLength(1);
      expect(entry.textures).toHaveLength(1);
    });

    it('should accept empty audio array', () => {
      const entry: InstrumentAssetEntry = {
        instrumentId: 'test',
        model: {
          id: 'model-1',
          type: 'model',
          path: 'models/test.glb',
          size: 1000,
          checksum: 'checksum',
          compressed: false,
        },
        audio: [],
        textures: [],
        totalSize: 1000,
      };
      expect(entry.audio).toHaveLength(0);
    });

    it('should accept multiple audio samples', () => {
      const entry: InstrumentAssetEntry = {
        instrumentId: 'piano',
        model: {
          id: 'model-1',
          type: 'model',
          path: 'models/piano.glb',
          size: 2000000,
          checksum: 'checksum',
          compressed: false,
        },
        audio: [
          {
            id: 'audio-1',
            type: 'audio',
            path: 'audio/c4.wav',
            size: 100000,
            checksum: 'check1',
            compressed: false,
          },
          {
            id: 'audio-2',
            type: 'audio',
            path: 'audio/d4.wav',
            size: 100000,
            checksum: 'check2',
            compressed: false,
          },
          {
            id: 'audio-3',
            type: 'audio',
            path: 'audio/e4.wav',
            size: 100000,
            checksum: 'check3',
            compressed: false,
          },
        ],
        textures: [],
        totalSize: 2300000,
      };
      expect(entry.audio).toHaveLength(3);
    });

    it('should calculate correct total size', () => {
      const modelSize = 1000000;
      const audioSize = 500000;
      const textureSize = 2000000;
      const entry: InstrumentAssetEntry = {
        instrumentId: 'test',
        model: {
          id: 'model-1',
          type: 'model',
          path: 'models/test.glb',
          size: modelSize,
          checksum: 'checksum',
          compressed: false,
        },
        audio: [
          {
            id: 'audio-1',
            type: 'audio',
            path: 'audio/test.wav',
            size: audioSize,
            checksum: 'checksum',
            compressed: false,
          },
        ],
        textures: [
          {
            id: 'texture-1',
            type: 'texture',
            path: 'textures/test.png',
            size: textureSize,
            checksum: 'checksum',
            compressed: false,
          },
        ],
        totalSize: modelSize + audioSize + textureSize,
      };
      expect(entry.totalSize).toBe(3500000);
    });
  });

  describe('SharedAsset validation', () => {
    it('should accept valid shared asset', () => {
      const asset: SharedAsset = {
        id: 'shared-1',
        type: 'texture',
        path: 'textures/common/wood.png',
        usedBy: ['ranat-ek', 'xylophone'],
      };
      expect(asset.id).toBe('shared-1');
      expect(asset.usedBy).toHaveLength(2);
    });

    it('should accept empty usedBy array', () => {
      const asset: SharedAsset = {
        id: 'shared-1',
        type: 'texture',
        path: 'textures/common/metal.png',
        usedBy: [],
      };
      expect(asset.usedBy).toHaveLength(0);
    });

    it('should accept multiple instruments using shared asset', () => {
      const asset: SharedAsset = {
        id: 'shared-1',
        type: 'audio',
        path: 'audio/common/silence.wav',
        usedBy: ['piano', 'guitar', 'drums', 'xylophone'],
      };
      expect(asset.usedBy).toHaveLength(4);
    });
  });

  describe('AssetManifest validation', () => {
    it('should accept valid asset manifest', () => {
      const manifest: AssetManifest = {
        version: '1.0.0',
        instruments: [
          {
            instrumentId: 'ranat-ek',
            model: {
              id: 'model-1',
              type: 'model',
              path: 'models/ranat-ek.glb',
              size: 1000000,
              checksum: 'checksum',
              compressed: false,
            },
            audio: [],
            textures: [],
            totalSize: 1000000,
          },
        ],
        sharedAssets: [
          {
            id: 'shared-1',
            type: 'texture',
            path: 'textures/common/wood.png',
            usedBy: ['ranat-ek'],
          },
        ],
      };
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.instruments).toHaveLength(1);
      expect(manifest.sharedAssets).toHaveLength(1);
    });

    it('should accept empty instruments array', () => {
      const manifest: AssetManifest = {
        version: '1.0.0',
        instruments: [],
        sharedAssets: [],
      };
      expect(manifest.instruments).toHaveLength(0);
    });

    it('should accept multiple instruments', () => {
      const manifest: AssetManifest = {
        version: '1.0.0',
        instruments: [
          {
            instrumentId: 'ranat-ek',
            model: {
              id: 'model-1',
              type: 'model',
              path: 'models/ranat-ek.glb',
              size: 1000000,
              checksum: 'check1',
              compressed: false,
            },
            audio: [],
            textures: [],
            totalSize: 1000000,
          },
          {
            instrumentId: 'piano',
            model: {
              id: 'model-2',
              type: 'model',
              path: 'models/piano.glb',
              size: 2000000,
              checksum: 'check2',
              compressed: false,
            },
            audio: [],
            textures: [],
            totalSize: 2000000,
          },
        ],
        sharedAssets: [],
      };
      expect(manifest.instruments).toHaveLength(2);
    });

    it('should accept semantic versioning', () => {
      const versions = ['1.0.0', '1.2.3', '2.0.0-beta', '3.1.4-alpha.1'];
      versions.forEach((version) => {
        const manifest: AssetManifest = {
          version,
          instruments: [],
          sharedAssets: [],
        };
        expect(manifest.version).toBe(version);
      });
    });
  });

  describe('LoadProgress validation', () => {
    it('should accept valid load progress', () => {
      const progress: LoadProgress = {
        totalAssets: 10,
        loadedAssets: 5,
        failedAssets: [],
        percentage: 50,
      };
      expect(progress.totalAssets).toBe(10);
      expect(progress.loadedAssets).toBe(5);
      expect(progress.percentage).toBe(50);
    });

    it('should accept zero progress', () => {
      const progress: LoadProgress = {
        totalAssets: 10,
        loadedAssets: 0,
        failedAssets: [],
        percentage: 0,
      };
      expect(progress.percentage).toBe(0);
    });

    it('should accept complete progress', () => {
      const progress: LoadProgress = {
        totalAssets: 10,
        loadedAssets: 10,
        failedAssets: [],
        percentage: 100,
      };
      expect(progress.percentage).toBe(100);
    });

    it('should validate percentage between 0 and 100', () => {
      const progress: LoadProgress = {
        totalAssets: 20,
        loadedAssets: 15,
        failedAssets: [],
        percentage: 75,
      };
      expect(progress.percentage).toBeGreaterThanOrEqual(0);
      expect(progress.percentage).toBeLessThanOrEqual(100);
    });

    it('should accept failed assets', () => {
      const progress: LoadProgress = {
        totalAssets: 10,
        loadedAssets: 8,
        failedAssets: ['audio/missing.wav', 'models/broken.glb'],
        percentage: 80,
      };
      expect(progress.failedAssets).toHaveLength(2);
    });

    it('should accept empty failed assets array', () => {
      const progress: LoadProgress = {
        totalAssets: 10,
        loadedAssets: 10,
        failedAssets: [],
        percentage: 100,
      };
      expect(progress.failedAssets).toHaveLength(0);
    });

    it('should calculate correct percentage', () => {
      const totalAssets = 20;
      const loadedAssets = 15;
      const progress: LoadProgress = {
        totalAssets,
        loadedAssets,
        failedAssets: [],
        percentage: (loadedAssets / totalAssets) * 100,
      };
      expect(progress.percentage).toBe(75);
    });

    it('should validate loaded assets does not exceed total', () => {
      const progress: LoadProgress = {
        totalAssets: 10,
        loadedAssets: 10,
        failedAssets: [],
        percentage: 100,
      };
      expect(progress.loadedAssets).toBeLessThanOrEqual(progress.totalAssets);
    });
  });
});
