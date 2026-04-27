/**
 * Asset management types
 */

export type AssetType = 'model' | 'audio' | 'texture' | 'animation' | 'metadata';

export interface AssetReference {
  id: string;
  type: AssetType;
  path: string;
  size: number;
  checksum: string;
  compressed: boolean;
}

export interface InstrumentAssetEntry {
  instrumentId: string;
  model: AssetReference;
  audio: AssetReference[];
  textures: AssetReference[];
  totalSize: number;
}

export interface SharedAsset {
  id: string;
  type: AssetType;
  path: string;
  usedBy: string[];
}

export interface AssetManifest {
  version: string;
  instruments: InstrumentAssetEntry[];
  sharedAssets: SharedAsset[];
}

export interface LoadProgress {
  totalAssets: number;
  loadedAssets: number;
  failedAssets: string[];
  percentage: number;
}
