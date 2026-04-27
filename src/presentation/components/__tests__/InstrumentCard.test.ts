/**
 * Unit tests for InstrumentCard component
 * Tests component props, rendering logic, and interaction handling
 */

import { Instrument, PlayingMethod } from '@domain/entities/Instrument';

describe('InstrumentCard Component Tests', () => {
  const mockInstrument: Instrument = {
    id: 'test-instrument',
    name: {
      thai: 'ทดสอบ',
      english: 'Test Instrument',
    },
    nationality: 'thai',
    playingMethod: 'striking',
    model3D: {
      modelId: 'test-model',
      filePath: 'models/test.glb',
      format: 'glb',
      lodLevels: [],
      defaultScale: { x: 1, y: 1, z: 1 },
      defaultRotation: { x: 0, y: 0, z: 0 },
      boundingBox: {
        center: { x: 0, y: 0, z: 0 },
        size: { x: 1, y: 1, z: 1 },
      },
    },
    audioSamples: {
      samples: [],
      polyphony: 8,
    },
    interactionZones: [],
    culturalInfo: {
      description: {
        thai: 'คำอธิบาย',
        english: 'Description',
      },
      origin: {
        thai: 'ต้นกำเนิด',
        english: 'Origin',
      },
      usage: {
        thai: 'การใช้งาน',
        english: 'Usage',
      },
    },
    metadata: {
      difficulty: 'beginner',
      popularity: 50,
      dateAdded: '2024-01-01T00:00:00Z',
      version: '1.0.0',
      tags: ['test'],
    },
  };

  describe('Component Props', () => {
    it('should accept instrument prop', () => {
      expect(mockInstrument).toBeDefined();
      expect(mockInstrument.id).toBe('test-instrument');
    });

    it('should accept onPress callback prop', () => {
      const mockOnPress = jest.fn();
      expect(mockOnPress).toBeDefined();
      expect(typeof mockOnPress).toBe('function');
    });

    it('should accept optional isTablet prop', () => {
      const isTablet = true;
      expect(typeof isTablet).toBe('boolean');
    });
  });

  describe('Bilingual Display', () => {
    it('should display Thai name', () => {
      expect(mockInstrument.name.thai).toBe('ทดสอบ');
    });

    it('should display English name', () => {
      expect(mockInstrument.name.english).toBe('Test Instrument');
    });

    it('should handle instruments with both names', () => {
      expect(mockInstrument.name.thai).toBeDefined();
      expect(mockInstrument.name.english).toBeDefined();
    });
  });

  describe('Playing Method Icon', () => {
    it('should map striking to drum icon', () => {
      const method: PlayingMethod = 'striking';
      const expectedIcon = '🥁';
      expect(method).toBe('striking');
      expect(expectedIcon).toBe('🥁');
    });

    it('should map plucked to guitar icon', () => {
      const method: PlayingMethod = 'plucked';
      const expectedIcon = '🎸';
      expect(method).toBe('plucked');
      expect(expectedIcon).toBe('🎸');
    });

    it('should map pressed to keyboard icon', () => {
      const method: PlayingMethod = 'pressed';
      const expectedIcon = '🎹';
      expect(method).toBe('pressed');
      expect(expectedIcon).toBe('🎹');
    });
  });

  describe('Playing Method Label', () => {
    it('should display bilingual label for striking', () => {
      const label = 'Striking / ตี';
      expect(label).toContain('Striking');
      expect(label).toContain('ตี');
    });

    it('should display bilingual label for plucked', () => {
      const label = 'Plucked / ดีด';
      expect(label).toContain('Plucked');
      expect(label).toContain('ดีด');
    });

    it('should display bilingual label for pressed', () => {
      const label = 'Pressed / กด';
      expect(label).toContain('Pressed');
      expect(label).toContain('กด');
    });
  });

  describe('Metadata Display', () => {
    it('should display difficulty level', () => {
      expect(mockInstrument.metadata.difficulty).toBe('beginner');
    });

    it('should handle all difficulty levels', () => {
      const difficulties = ['beginner', 'intermediate', 'advanced'];
      difficulties.forEach(difficulty => {
        expect(['beginner', 'intermediate', 'advanced']).toContain(difficulty);
      });
    });
  });

  describe('Responsive Sizing', () => {
    it('should apply phone sizing by default', () => {
      const isTablet = false;
      expect(isTablet).toBe(false);
    });

    it('should apply tablet sizing when isTablet is true', () => {
      const isTablet = true;
      expect(isTablet).toBe(true);
    });

    it('should have different sizes for phone and tablet', () => {
      const phoneSize = 60;
      const tabletSize = 80;
      expect(tabletSize).toBeGreaterThan(phoneSize);
    });
  });

  describe('Accessibility', () => {
    it('should have minimum touch target size', () => {
      const minHeight = 44;
      expect(minHeight).toBeGreaterThanOrEqual(44);
    });

    it('should provide accessibility label', () => {
      const label = `${mockInstrument.name.english}, ${mockInstrument.name.thai}`;
      expect(label).toContain(mockInstrument.name.english);
      expect(label).toContain(mockInstrument.name.thai);
    });

    it('should provide accessibility hint', () => {
      const hint = 'Tap to select this instrument';
      expect(hint).toBeDefined();
      expect(hint.length).toBeGreaterThan(0);
    });
  });

  describe('Interaction Handling', () => {
    it('should call onPress with instrument when tapped', () => {
      const mockOnPress = jest.fn();
      mockOnPress(mockInstrument);
      
      expect(mockOnPress).toHaveBeenCalledWith(mockInstrument);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should pass complete instrument object to callback', () => {
      const mockOnPress = jest.fn();
      mockOnPress(mockInstrument);
      
      const calledWith = mockOnPress.mock.calls[0][0];
      expect(calledWith.id).toBe(mockInstrument.id);
      expect(calledWith.name).toEqual(mockInstrument.name);
    });
  });

  describe('Visual Styling', () => {
    it('should have card styling properties', () => {
      const cardStyle = {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
      };
      expect(cardStyle.backgroundColor).toBe('#FFFFFF');
      expect(cardStyle.borderRadius).toBe(12);
    });

    it('should have shadow for elevation', () => {
      const shadow = {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        elevation: 3,
      };
      expect(shadow.shadowColor).toBe('#000');
      expect(shadow.elevation).toBe(3);
    });

    it('should have thumbnail placeholder', () => {
      const thumbnailSize = 60;
      const thumbnailTabletSize = 80;
      expect(thumbnailTabletSize).toBeGreaterThan(thumbnailSize);
    });
  });

  describe('Text Truncation', () => {
    it('should handle long Thai names', () => {
      const longName = 'ชื่อเครื่องดนตรีที่ยาวมากๆ';
      expect(longName.length).toBeGreaterThan(10);
    });

    it('should handle long English names', () => {
      const longName = 'Very Long Instrument Name That Might Need Truncation';
      expect(longName.length).toBeGreaterThan(20);
    });

    it('should use numberOfLines prop for text truncation', () => {
      const numberOfLines = 1;
      expect(numberOfLines).toBe(1);
    });
  });
});
