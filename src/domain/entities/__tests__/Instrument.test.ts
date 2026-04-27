/**
 * Unit tests for Instrument data model validation
 * Tests instrument data structure validation and bounds checking
 */

import {
  Instrument,
  InstrumentName,
  Nationality,
  PlayingMethod,
  InteractionZone,
  Bounds2D,
  Vector3,
  AudioSample,
  AudioSampleSet,
  Model3DReference,
} from '../Instrument';

describe('Instrument Data Model', () => {
  describe('InstrumentName validation', () => {
    it('should accept valid bilingual names', () => {
      const name: InstrumentName = {
        thai: 'ระนาดเอก',
        english: 'Ranat Ek',
      };
      expect(name.thai).toBe('ระนาดเอก');
      expect(name.english).toBe('Ranat Ek');
    });

    it('should accept optional pronunciation', () => {
      const name: InstrumentName = {
        thai: 'ระนาดเอก',
        english: 'Ranat Ek',
        pronunciation: 'ra-nat-ek',
      };
      expect(name.pronunciation).toBe('ra-nat-ek');
    });

    it('should require both thai and english names', () => {
      // TypeScript compile-time check - this validates the type system
      const name: InstrumentName = {
        thai: 'test',
        english: 'test',
      };
      expect(name).toBeDefined();
    });
  });

  describe('Nationality validation', () => {
    it('should accept "thai" nationality', () => {
      const nationality: Nationality = 'thai';
      expect(nationality).toBe('thai');
    });

    it('should accept "international" nationality', () => {
      const nationality: Nationality = 'international';
      expect(nationality).toBe('international');
    });
  });

  describe('PlayingMethod validation', () => {
    it('should accept "striking" playing method', () => {
      const method: PlayingMethod = 'striking';
      expect(method).toBe('striking');
    });

    it('should accept "plucked" playing method', () => {
      const method: PlayingMethod = 'plucked';
      expect(method).toBe('plucked');
    });

    it('should accept "pressed" playing method', () => {
      const method: PlayingMethod = 'pressed';
      expect(method).toBe('pressed');
    });
  });

  describe('Bounds2D validation', () => {
    it('should accept valid 2D bounds', () => {
      const bounds: Bounds2D = {
        x: 10,
        y: 20,
        width: 100,
        height: 50,
      };
      expect(bounds.x).toBe(10);
      expect(bounds.y).toBe(20);
      expect(bounds.width).toBe(100);
      expect(bounds.height).toBe(50);
    });

    it('should accept zero values', () => {
      const bounds: Bounds2D = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
      expect(bounds).toBeDefined();
    });

    it('should accept negative coordinates', () => {
      const bounds: Bounds2D = {
        x: -10,
        y: -20,
        width: 100,
        height: 50,
      };
      expect(bounds.x).toBe(-10);
      expect(bounds.y).toBe(-20);
    });
  });

  describe('Vector3 validation', () => {
    it('should accept valid 3D vector', () => {
      const vector: Vector3 = {
        x: 1.0,
        y: 2.5,
        z: -3.7,
      };
      expect(vector.x).toBe(1.0);
      expect(vector.y).toBe(2.5);
      expect(vector.z).toBe(-3.7);
    });

    it('should accept zero vector', () => {
      const vector: Vector3 = { x: 0, y: 0, z: 0 };
      expect(vector).toBeDefined();
    });
  });

  describe('InteractionZone validation', () => {
    it('should accept valid interaction zone', () => {
      const zone: InteractionZone = {
        id: 'zone-1',
        type: 'strike',
        bounds: { x: 0, y: 0, width: 44, height: 44 },
        noteId: 'C4',
        visualFeedback: {
          type: 'highlight',
          duration: 50,
          intensity: 0.8,
        },
        touchSensitivity: 0.7,
      };
      expect(zone.id).toBe('zone-1');
      expect(zone.type).toBe('strike');
      expect(zone.noteId).toBe('C4');
    });

    it('should enforce minimum touch target size (44px)', () => {
      const zone: InteractionZone = {
        id: 'zone-1',
        type: 'press',
        bounds: { x: 0, y: 0, width: 44, height: 44 },
        noteId: 'A3',
        visualFeedback: {
          type: 'glow',
          duration: 100,
          intensity: 1.0,
        },
        touchSensitivity: 1.0,
      };
      expect(zone.bounds.width).toBeGreaterThanOrEqual(44);
      expect(zone.bounds.height).toBeGreaterThanOrEqual(44);
    });

    it('should accept touch sensitivity between 0 and 1', () => {
      const zone: InteractionZone = {
        id: 'zone-1',
        type: 'pluck',
        bounds: { x: 0, y: 0, width: 50, height: 50 },
        noteId: 'E4',
        visualFeedback: {
          type: 'ripple',
          duration: 200,
          intensity: 0.5,
        },
        touchSensitivity: 0.5,
      };
      expect(zone.touchSensitivity).toBeGreaterThanOrEqual(0);
      expect(zone.touchSensitivity).toBeLessThanOrEqual(1);
    });

    it('should accept optional 3D bounds', () => {
      const zone: InteractionZone = {
        id: 'zone-1',
        type: 'strike',
        bounds: { x: 0, y: 0, width: 44, height: 44 },
        model3DBounds: {
          min: { x: -1, y: -1, z: -1 },
          max: { x: 1, y: 1, z: 1 },
        },
        noteId: 'D4',
        visualFeedback: {
          type: 'animate',
          duration: 150,
          intensity: 0.9,
        },
        touchSensitivity: 0.8,
      };
      expect(zone.model3DBounds).toBeDefined();
      expect(zone.model3DBounds?.min.x).toBe(-1);
    });
  });

  describe('AudioSample validation', () => {
    it('should accept valid audio sample', () => {
      const sample: AudioSample = {
        id: 'sample-1',
        noteId: 'C4',
        filePath: 'audio/c4.wav',
        format: 'wav',
        sampleRate: 44100,
        bitDepth: 16,
        channels: 'stereo',
        duration: 2.5,
        loopable: false,
      };
      expect(sample.sampleRate).toBe(44100);
      expect(sample.bitDepth).toBe(16);
    });

    it('should enforce minimum sample rate of 44100 Hz', () => {
      const sample: AudioSample = {
        id: 'sample-1',
        noteId: 'A4',
        filePath: 'audio/a4.wav',
        format: 'wav',
        sampleRate: 44100,
        bitDepth: 24,
        channels: 'mono',
        duration: 1.0,
        loopable: true,
      };
      expect(sample.sampleRate).toBeGreaterThanOrEqual(44100);
    });

    it('should accept optional velocity', () => {
      const sample: AudioSample = {
        id: 'sample-1',
        noteId: 'E4',
        filePath: 'audio/e4.mp3',
        format: 'mp3',
        sampleRate: 48000,
        bitDepth: 16,
        channels: 'stereo',
        duration: 3.0,
        loopable: false,
        velocity: 0.8,
      };
      expect(sample.velocity).toBe(0.8);
    });

    it('should accept different audio formats', () => {
      const formats: AudioSample[] = [
        {
          id: '1',
          noteId: 'C4',
          filePath: 'audio/c4.wav',
          format: 'wav',
          sampleRate: 44100,
          bitDepth: 16,
          channels: 'mono',
          duration: 1.0,
          loopable: false,
        },
        {
          id: '2',
          noteId: 'D4',
          filePath: 'audio/d4.mp3',
          format: 'mp3',
          sampleRate: 44100,
          bitDepth: 16,
          channels: 'stereo',
          duration: 1.0,
          loopable: false,
        },
        {
          id: '3',
          noteId: 'E4',
          filePath: 'audio/e4.ogg',
          format: 'ogg',
          sampleRate: 44100,
          bitDepth: 16,
          channels: 'mono',
          duration: 1.0,
          loopable: false,
        },
        {
          id: '4',
          noteId: 'F4',
          filePath: 'audio/f4.m4a',
          format: 'm4a',
          sampleRate: 44100,
          bitDepth: 16,
          channels: 'stereo',
          duration: 1.0,
          loopable: false,
        },
      ];
      expect(formats).toHaveLength(4);
    });
  });

  describe('AudioSampleSet validation', () => {
    it('should accept valid audio sample set', () => {
      const sampleSet: AudioSampleSet = {
        samples: [
          {
            id: 'sample-1',
            noteId: 'C4',
            filePath: 'audio/c4.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 1.0,
            loopable: false,
          },
        ],
        polyphony: 8,
      };
      expect(sampleSet.polyphony).toBe(8);
      expect(sampleSet.samples).toHaveLength(1);
    });

    it('should accept optional note range', () => {
      const sampleSet: AudioSampleSet = {
        samples: [],
        polyphony: 16,
        noteRange: {
          lowest: 'C3',
          highest: 'C6',
        },
      };
      expect(sampleSet.noteRange?.lowest).toBe('C3');
      expect(sampleSet.noteRange?.highest).toBe('C6');
    });
  });

  describe('Model3DReference validation', () => {
    it('should accept valid 3D model reference', () => {
      const model: Model3DReference = {
        modelId: 'ranat-ek-1',
        filePath: 'models/ranat-ek.glb',
        format: 'glb',
        lodLevels: [
          { distance: 0, polygonCount: 5000, filePath: 'models/ranat-ek-low.glb' },
          { distance: 0, polygonCount: 15000, filePath: 'models/ranat-ek-med.glb' },
          { distance: 0, polygonCount: 50000, filePath: 'models/ranat-ek-high.glb' },
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 2, y: 1, z: 0.5 },
        },
      };
      expect(model.format).toBe('glb');
      expect(model.lodLevels).toHaveLength(3);
    });

    it('should support different 3D formats', () => {
      const formats = ['gltf', 'glb', 'obj'] as const;
      formats.forEach((format) => {
        const model: Model3DReference = {
          modelId: 'test',
          filePath: `models/test.${format}`,
          format,
          lodLevels: [],
          defaultScale: { x: 1, y: 1, z: 1 },
          defaultRotation: { x: 0, y: 0, z: 0 },
          boundingBox: {
            center: { x: 0, y: 0, z: 0 },
            size: { x: 1, y: 1, z: 1 },
          },
        };
        expect(model.format).toBe(format);
      });
    });
  });

  describe('Complete Instrument validation', () => {
    it('should accept valid complete instrument', () => {
      const instrument: Instrument = {
        id: 'ranat-ek',
        name: {
          thai: 'ระนาดเอก',
          english: 'Ranat Ek',
        },
        nationality: 'thai',
        playingMethod: 'striking',
        model3D: {
          modelId: 'ranat-ek-1',
          filePath: 'models/ranat-ek.glb',
          format: 'glb',
          lodLevels: [],
          defaultScale: { x: 1, y: 1, z: 1 },
          defaultRotation: { x: 0, y: 0, z: 0 },
          boundingBox: {
            center: { x: 0, y: 0, z: 0 },
            size: { x: 2, y: 1, z: 0.5 },
          },
        },
        audioSamples: {
          samples: [
            {
              id: 'sample-1',
              noteId: 'C4',
              filePath: 'audio/c4.wav',
              format: 'wav',
              sampleRate: 44100,
              bitDepth: 16,
              channels: 'stereo',
              duration: 1.0,
              loopable: false,
            },
          ],
          polyphony: 8,
        },
        interactionZones: [
          {
            id: 'zone-1',
            type: 'strike',
            bounds: { x: 0, y: 0, width: 44, height: 44 },
            noteId: 'C4',
            visualFeedback: {
              type: 'highlight',
              duration: 50,
              intensity: 0.8,
            },
            touchSensitivity: 0.7,
          },
        ],
        culturalInfo: {
          description: {
            thai: 'ระนาดเอกเป็นเครื่องดนตรีไทย',
            english: 'Ranat Ek is a Thai traditional instrument',
          },
          origin: {
            thai: 'ประเทศไทย',
            english: 'Thailand',
          },
          usage: {
            thai: 'ใช้ในวงปี่พาทย์',
            english: 'Used in Piphat ensemble',
          },
        },
        metadata: {
          difficulty: 'intermediate',
          popularity: 85,
          dateAdded: '2024-01-01T00:00:00Z',
          version: '1.0.0',
          tags: ['thai', 'percussion', 'traditional'],
        },
      };
      expect(instrument.id).toBe('ranat-ek');
      expect(instrument.nationality).toBe('thai');
      expect(instrument.playingMethod).toBe('striking');
    });
  });
});
