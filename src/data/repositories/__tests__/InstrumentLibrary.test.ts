/**
 * Unit tests for InstrumentLibrary
 * Tests filtering by nationality, playing method, search functionality, and edge cases
 */

import { InstrumentLibrary } from '@data/models/InstrumentLibrary';

describe('InstrumentLibrary', () => {
  let library: InstrumentLibrary;

  beforeEach(() => {
    library = new InstrumentLibrary();
  });

  describe('getAllInstruments', () => {
    it('should return all instruments', () => {
      const instruments = library.getAllInstruments();
      expect(instruments.length).toBeGreaterThan(0);
    });

    it('should return exactly 16 instruments (8 Thai + 8 International)', () => {
      const instruments = library.getAllInstruments();
      expect(instruments.length).toBe(16);
    });

    it('should return instruments with valid IDs', () => {
      const instruments = library.getAllInstruments();
      instruments.forEach((instrument) => {
        expect(instrument.id).toBeDefined();
        expect(typeof instrument.id).toBe('string');
        expect(instrument.id.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getByNationality', () => {
    it('should return only Thai instruments when filtering by "thai"', () => {
      const thaiInstruments = library.getByNationality('thai');
      expect(thaiInstruments.length).toBe(8);
      thaiInstruments.forEach((instrument) => {
        expect(instrument.nationality).toBe('thai');
      });
    });

    it('should return only international instruments when filtering by "international"', () => {
      const intlInstruments = library.getByNationality('international');
      expect(intlInstruments.length).toBe(8);
      intlInstruments.forEach((instrument) => {
        expect(instrument.nationality).toBe('international');
      });
    });

    it('should return Thai instruments with bilingual names', () => {
      const thaiInstruments = library.getByNationality('thai');
      thaiInstruments.forEach((instrument) => {
        expect(instrument.name.thai).toBeDefined();
        expect(instrument.name.english).toBeDefined();
        expect(typeof instrument.name.thai).toBe('string');
        expect(typeof instrument.name.english).toBe('string');
      });
    });
  });

  describe('getByPlayingMethod', () => {
    it('should return only striking instruments', () => {
      const strikingInstruments = library.getByPlayingMethod('striking');
      expect(strikingInstruments.length).toBeGreaterThan(0);
      strikingInstruments.forEach((instrument) => {
        expect(instrument.playingMethod).toBe('striking');
      });
    });

    it('should return only plucked instruments', () => {
      const pluckedInstruments = library.getByPlayingMethod('plucked');
      expect(pluckedInstruments.length).toBeGreaterThan(0);
      pluckedInstruments.forEach((instrument) => {
        expect(instrument.playingMethod).toBe('plucked');
      });
    });

    it('should return only pressed instruments', () => {
      const pressedInstruments = library.getByPlayingMethod('pressed');
      expect(pressedInstruments.length).toBeGreaterThan(0);
      pressedInstruments.forEach((instrument) => {
        expect(instrument.playingMethod).toBe('pressed');
      });
    });

    it('should return 6 striking instruments (3 Thai + 3 International)', () => {
      const strikingInstruments = library.getByPlayingMethod('striking');
      expect(strikingInstruments.length).toBe(6);
    });

    it('should return 6 plucked instruments (3 Thai + 3 International)', () => {
      const pluckedInstruments = library.getByPlayingMethod('plucked');
      expect(pluckedInstruments.length).toBe(6);
    });

    it('should return 4 pressed instruments (2 Thai + 2 International)', () => {
      const pressedInstruments = library.getByPlayingMethod('pressed');
      expect(pressedInstruments.length).toBe(4);
    });
  });

  describe('getByCategory', () => {
    it('should return Thai striking instruments', () => {
      const instruments = library.getByCategory('thai', 'striking');
      expect(instruments.length).toBe(3);
      instruments.forEach((instrument) => {
        expect(instrument.nationality).toBe('thai');
        expect(instrument.playingMethod).toBe('striking');
      });
    });

    it('should return Thai plucked instruments', () => {
      const instruments = library.getByCategory('thai', 'plucked');
      expect(instruments.length).toBe(3);
      instruments.forEach((instrument) => {
        expect(instrument.nationality).toBe('thai');
        expect(instrument.playingMethod).toBe('plucked');
      });
    });

    it('should return Thai pressed instruments', () => {
      const instruments = library.getByCategory('thai', 'pressed');
      expect(instruments.length).toBe(2);
      instruments.forEach((instrument) => {
        expect(instrument.nationality).toBe('thai');
        expect(instrument.playingMethod).toBe('pressed');
      });
    });

    it('should return international striking instruments', () => {
      const instruments = library.getByCategory('international', 'striking');
      expect(instruments.length).toBe(3);
      instruments.forEach((instrument) => {
        expect(instrument.nationality).toBe('international');
        expect(instrument.playingMethod).toBe('striking');
      });
    });

    it('should return international plucked instruments', () => {
      const instruments = library.getByCategory('international', 'plucked');
      expect(instruments.length).toBe(3);
      instruments.forEach((instrument) => {
        expect(instrument.nationality).toBe('international');
        expect(instrument.playingMethod).toBe('plucked');
      });
    });

    it('should return international pressed instruments', () => {
      const instruments = library.getByCategory('international', 'pressed');
      expect(instruments.length).toBe(2);
      instruments.forEach((instrument) => {
        expect(instrument.nationality).toBe('international');
        expect(instrument.playingMethod).toBe('pressed');
      });
    });
  });

  describe('getInstrumentById', () => {
    it('should return instrument by valid ID', () => {
      const instrument = library.getInstrumentById('ranat-ek');
      expect(instrument).not.toBeNull();
      expect(instrument?.id).toBe('ranat-ek');
      expect(instrument?.name.english).toBe('Ranat Ek');
    });

    it('should return null for invalid ID', () => {
      const instrument = library.getInstrumentById('non-existent-id');
      expect(instrument).toBeNull();
    });

    it('should return null for empty string ID', () => {
      const instrument = library.getInstrumentById('');
      expect(instrument).toBeNull();
    });

    it('should return specific Thai instruments by ID', () => {
      const thaiIds = ['ranat-ek', 'mong', 'klong-thad', 'jakhe', 'saw-duang', 'pin', 'khim', 'khaen'];
      thaiIds.forEach((id) => {
        const instrument = library.getInstrumentById(id);
        expect(instrument).not.toBeNull();
        expect(instrument?.nationality).toBe('thai');
      });
    });

    it('should return specific international instruments by ID', () => {
      const intlIds = ['drums', 'xylophone', 'marimba', 'guitar', 'harp', 'ukulele', 'piano', 'accordion'];
      intlIds.forEach((id) => {
        const instrument = library.getInstrumentById(id);
        expect(instrument).not.toBeNull();
        expect(instrument?.nationality).toBe('international');
      });
    });
  });

  describe('searchInstruments', () => {
    it('should find instruments by English name', () => {
      const results = library.searchInstruments('guitar');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name.english.toLowerCase()).toContain('guitar');
    });

    it('should find instruments by Thai name', () => {
      const results = library.searchInstruments('ระนาด');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name.thai).toContain('ระนาด');
    });

    it('should be case-insensitive', () => {
      const resultsLower = library.searchInstruments('piano');
      const resultsUpper = library.searchInstruments('PIANO');
      const resultsMixed = library.searchInstruments('PiAnO');
      expect(resultsLower.length).toBe(resultsUpper.length);
      expect(resultsLower.length).toBe(resultsMixed.length);
    });

    it('should find instruments by tags', () => {
      const results = library.searchInstruments('percussion');
      expect(results.length).toBeGreaterThan(0);
      results.forEach((instrument) => {
        expect(instrument.metadata.tags).toContain('percussion');
      });
    });

    it('should return empty array for non-matching query', () => {
      const results = library.searchInstruments('xyz123nonexistent');
      expect(results).toEqual([]);
    });

    it('should return empty array for empty query', () => {
      const results = library.searchInstruments('');
      expect(results).toEqual([]);
    });

    it('should find multiple instruments with common tags', () => {
      const results = library.searchInstruments('traditional');
      expect(results.length).toBeGreaterThan(1);
    });

    it('should find instruments by partial name match', () => {
      const results = library.searchInstruments('drum');
      expect(results.length).toBeGreaterThan(0);
      const hasMatch = results.some(
        (inst) =>
          inst.name.english.toLowerCase().includes('drum') ||
          inst.name.thai.toLowerCase().includes('drum')
      );
      expect(hasMatch).toBe(true);
    });
  });

  describe('Instrument data validation', () => {
    it('should have all Thai traditional instruments with required metadata', () => {
      const thaiInstruments = library.getByNationality('thai');
      thaiInstruments.forEach((instrument) => {
        expect(instrument.name.thai).toBeDefined();
        expect(instrument.name.english).toBeDefined();
        expect(instrument.culturalInfo).toBeDefined();
        expect(instrument.culturalInfo.description.thai).toBeDefined();
        expect(instrument.culturalInfo.description.english).toBeDefined();
        expect(instrument.culturalInfo.origin.thai).toBeDefined();
        expect(instrument.culturalInfo.origin.english).toBeDefined();
        expect(instrument.culturalInfo.usage.thai).toBeDefined();
        expect(instrument.culturalInfo.usage.english).toBeDefined();
      });
    });

    it('should have all international instruments with required metadata', () => {
      const intlInstruments = library.getByNationality('international');
      intlInstruments.forEach((instrument) => {
        expect(instrument.name.thai).toBeDefined();
        expect(instrument.name.english).toBeDefined();
        expect(instrument.culturalInfo).toBeDefined();
        expect(instrument.culturalInfo.description).toBeDefined();
        expect(instrument.culturalInfo.origin).toBeDefined();
        expect(instrument.culturalInfo.usage).toBeDefined();
      });
    });

    it('should have all instruments with valid audio samples', () => {
      const allInstruments = library.getAllInstruments();
      allInstruments.forEach((instrument) => {
        expect(instrument.audioSamples).toBeDefined();
        expect(instrument.audioSamples.samples.length).toBeGreaterThan(0);
        expect(instrument.audioSamples.polyphony).toBeGreaterThan(0);
        instrument.audioSamples.samples.forEach((sample) => {
          expect(sample.sampleRate).toBeGreaterThanOrEqual(44100);
          expect(sample.filePath).toBeDefined();
        });
      });
    });

    it('should have all instruments with valid 3D models', () => {
      const allInstruments = library.getAllInstruments();
      allInstruments.forEach((instrument) => {
        expect(instrument.model3D).toBeDefined();
        expect(instrument.model3D.filePath).toBeDefined();
        expect(instrument.model3D.format).toMatch(/^(gltf|glb|obj)$/);
        expect(instrument.model3D.lodLevels.length).toBeGreaterThan(0);
      });
    });

    it('should have all instruments with interaction zones', () => {
      const allInstruments = library.getAllInstruments();
      allInstruments.forEach((instrument) => {
        expect(instrument.interactionZones).toBeDefined();
        expect(instrument.interactionZones.length).toBeGreaterThan(0);
        instrument.interactionZones.forEach((zone) => {
          expect(zone.bounds.width).toBeGreaterThanOrEqual(40);
          expect(zone.bounds.height).toBeGreaterThanOrEqual(40);
          expect(zone.touchSensitivity).toBeGreaterThanOrEqual(0);
          expect(zone.touchSensitivity).toBeLessThanOrEqual(1);
        });
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple calls without side effects', () => {
      const first = library.getAllInstruments();
      const second = library.getAllInstruments();
      expect(first.length).toBe(second.length);
    });

    it('should return different array instances', () => {
      const first = library.getAllInstruments();
      const second = library.getAllInstruments();
      expect(first).not.toBe(second);
    });

    it('should handle filtering with no results gracefully', () => {
      const results = library.searchInstruments('zzz_no_match_zzz');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('Specific instrument requirements', () => {
    it('should include Ranat Ek (Thai striking)', () => {
      const instrument = library.getInstrumentById('ranat-ek');
      expect(instrument).not.toBeNull();
      expect(instrument?.nationality).toBe('thai');
      expect(instrument?.playingMethod).toBe('striking');
    });

    it('should include Mong (Thai striking)', () => {
      const instrument = library.getInstrumentById('mong');
      expect(instrument).not.toBeNull();
      expect(instrument?.nationality).toBe('thai');
      expect(instrument?.playingMethod).toBe('striking');
    });

    it('should include Klong Thad (Thai striking)', () => {
      const instrument = library.getInstrumentById('klong-thad');
      expect(instrument).not.toBeNull();
      expect(instrument?.nationality).toBe('thai');
      expect(instrument?.playingMethod).toBe('striking');
    });

    it('should include Jakhe (Thai plucked)', () => {
      const instrument = library.getInstrumentById('jakhe');
      expect(instrument).not.toBeNull();
      expect(instrument?.nationality).toBe('thai');
      expect(instrument?.playingMethod).toBe('plucked');
    });

    it('should include Saw Duang (Thai plucked)', () => {
      const instrument = library.getInstrumentById('saw-duang');
      expect(instrument).not.toBeNull();
      expect(instrument?.nationality).toBe('thai');
      expect(instrument?.playingMethod).toBe('plucked');
    });

    it('should include Pin (Thai plucked)', () => {
      const instrument = library.getInstrumentById('pin');
      expect(instrument).not.toBeNull();
      expect(instrument?.nationality).toBe('thai');
      expect(instrument?.playingMethod).toBe('plucked');
    });

    it('should include Khim (Thai pressed)', () => {
      const instrument = library.getInstrumentById('khim');
      expect(instrument).not.toBeNull();
      expect(instrument?.nationality).toBe('thai');
      expect(instrument?.playingMethod).toBe('pressed');
    });

    it('should include Khaen (Thai pressed)', () => {
      const instrument = library.getInstrumentById('khaen');
      expect(instrument).not.toBeNull();
      expect(instrument?.nationality).toBe('thai');
      expect(instrument?.playingMethod).toBe('pressed');
    });

    it('should include Drums (International striking)', () => {
      const instrument = library.getInstrumentById('drums');
      expect(instrument).not.toBeNull();
      expect(instrument?.nationality).toBe('international');
      expect(instrument?.playingMethod).toBe('striking');
    });

    it('should include Xylophone (International striking)', () => {
      const instrument = library.getInstrumentById('xylophone');
      expect(instrument).not.toBeNull();
      expect(instrument?.nationality).toBe('international');
      expect(instrument?.playingMethod).toBe('striking');
    });

    it('should include Marimba (International striking)', () => {
      const instrument = library.getInstrumentById('marimba');
      expect(instrument).not.toBeNull();
      expect(instrument?.nationality).toBe('international');
      expect(instrument?.playingMethod).toBe('striking');
    });

    it('should include Guitar (International plucked)', () => {
      const instrument = library.getInstrumentById('guitar');
      expect(instrument).not.toBeNull();
      expect(instrument?.nationality).toBe('international');
      expect(instrument?.playingMethod).toBe('plucked');
    });

    it('should include Harp (International plucked)', () => {
      const instrument = library.getInstrumentById('harp');
      expect(instrument).not.toBeNull();
      expect(instrument?.nationality).toBe('international');
      expect(instrument?.playingMethod).toBe('plucked');
    });

    it('should include Ukulele (International plucked)', () => {
      const instrument = library.getInstrumentById('ukulele');
      expect(instrument).not.toBeNull();
      expect(instrument?.nationality).toBe('international');
      expect(instrument?.playingMethod).toBe('plucked');
    });

    it('should include Piano (International pressed)', () => {
      const instrument = library.getInstrumentById('piano');
      expect(instrument).not.toBeNull();
      expect(instrument?.nationality).toBe('international');
      expect(instrument?.playingMethod).toBe('pressed');
    });

    it('should include Accordion (International pressed)', () => {
      const instrument = library.getInstrumentById('accordion');
      expect(instrument).not.toBeNull();
      expect(instrument?.nationality).toBe('international');
      expect(instrument?.playingMethod).toBe('pressed');
    });
  });
});
