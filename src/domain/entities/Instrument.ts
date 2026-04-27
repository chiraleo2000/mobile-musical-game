/**
 * Core instrument entity types
 */

export type Nationality = 'thai' | 'international';
export type PlayingMethod = 'striking' | 'plucked' | 'pressed';
export type Format3D = 'gltf' | 'glb' | 'obj';
export type AudioFormat = 'wav' | 'mp3' | 'ogg' | 'm4a';
export type AudioChannels = 'mono' | 'stereo';
export type InteractionType = 'strike' | 'pluck' | 'press';
export type FeedbackType = 'highlight' | 'glow' | 'ripple' | 'animate';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface InstrumentName {
  thai: string;
  english: string;
  pronunciation?: string;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Bounds2D {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Bounds3D {
  min: Vector3;
  max: Vector3;
}

export interface BoundingBox {
  center: Vector3;
  size: Vector3;
}

export interface LODLevel {
  distance: number;
  polygonCount: number;
  filePath: string;
}

export interface Model3DReference {
  modelId: string;
  filePath: string;
  format: Format3D;
  lodLevels: LODLevel[];
  defaultScale: Vector3;
  defaultRotation: Vector3;
  boundingBox: BoundingBox;
}

export interface NoteRange {
  lowest: string;
  highest: string;
}

export interface AudioSample {
  id: string;
  noteId: string;
  filePath: string;
  format: AudioFormat;
  sampleRate: number;
  bitDepth: number;
  channels: AudioChannels;
  duration: number;
  loopable: boolean;
  velocity?: number;
}

export interface AudioSampleSet {
  samples: AudioSample[];
  polyphony: number;
  noteRange?: NoteRange;
}

export interface VisualFeedback {
  type: FeedbackType;
  color?: string;
  animation?: string;
  duration: number;
  intensity: number;
}

export interface InteractionZone {
  id: string;
  type: InteractionType;
  bounds: Bounds2D;
  model3DBounds?: Bounds3D;
  noteId: string;
  visualFeedback: VisualFeedback;
  touchSensitivity: number;
}

export interface LocalizedText {
  thai: string;
  english: string;
}

export interface CulturalInfo {
  description: LocalizedText;
  origin: LocalizedText;
  usage: LocalizedText;
  funFacts?: LocalizedText[];
  imageUrls?: string[];
  videoUrls?: string[];
}

export interface InstrumentMetadata {
  difficulty: DifficultyLevel;
  popularity: number;
  dateAdded: string;
  version: string;
  tags: string[];
}

export interface Instrument {
  id: string;
  name: InstrumentName;
  nationality: Nationality;
  playingMethod: PlayingMethod;
  model3D: Model3DReference;
  audioSamples: AudioSampleSet;
  interactionZones: InteractionZone[];
  culturalInfo: CulturalInfo;
  metadata: InstrumentMetadata;
}
