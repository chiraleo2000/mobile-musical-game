/**
 * Instrument Library
 * Contains metadata for all available instruments
 */

import { Instrument } from '@domain/entities/Instrument';
import { InstrumentRepository } from '@data/repositories/InstrumentRepository';

export class InstrumentLibrary extends InstrumentRepository {
  constructor() {
    super(createInstrumentData());
  }
}

/**
 * Creates the complete instrument dataset
 */
function createInstrumentData(): Instrument[] {
  return [
    // Thai Traditional Instruments - Striking
    {
      id: 'ranat-ek',
      name: {
        thai: 'ระนาดเอก',
        english: 'Ranat Ek',
        pronunciation: 'ra-nat-ek'
      },
      nationality: 'thai',
      playingMethod: 'striking',
      model3D: {
        modelId: 'ranat-ek-model',
        filePath: 'models/ranat-ek.glb',
        format: 'glb',
        lodLevels: [
          { distance: 10, polygonCount: 5000, filePath: 'models/ranat-ek-low.glb' },
          { distance: 5, polygonCount: 15000, filePath: 'models/ranat-ek-medium.glb' },
          { distance: 0, polygonCount: 50000, filePath: 'models/ranat-ek-high.glb' }
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 2, y: 0.5, z: 0.8 }
        }
      },
      audioSamples: {
        samples: [
          {
            id: 'ranat-ek-c4',
            noteId: 'C4',
            filePath: 'audio/ranat-ek/c4.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 2.5,
            loopable: false,
            velocity: 0.8
          }
        ],
        polyphony: 8,
        noteRange: { lowest: 'C4', highest: 'C6' }
      },
      interactionZones: [
        {
          id: 'ranat-ek-zone-1',
          type: 'strike',
          bounds: { x: 50, y: 200, width: 60, height: 80 },
          noteId: 'C4',
          visualFeedback: {
            type: 'highlight',
            color: '#FFD700',
            duration: 200,
            intensity: 0.8
          },
          touchSensitivity: 0.8
        }
      ],
      culturalInfo: {
        description: {
          thai: 'ระนาดเอกเป็นเครื่องดนตรีไทยประเภทเครื่องตีที่มีเสียงสูง ทำจากไม้แข็งเรียงเป็นแถว',
          english: 'Ranat Ek is a Thai xylophone with high-pitched tones, made from hardwood bars arranged in a row'
        },
        origin: {
          thai: 'มีต้นกำเนิดในประเทศไทย ใช้ในวงปี่พาทย์',
          english: 'Originated in Thailand, used in Piphat ensembles'
        },
        usage: {
          thai: 'ใช้บรรเลงในพิธีการและการแสดงดนตรีไทยดั้งเดิม',
          english: 'Used in ceremonies and traditional Thai music performances'
        },
        funFacts: [
          {
            thai: 'ระนาดเอกมักเป็นเครื่องดนตรีหลักในวงปี่พาทย์',
            english: 'Ranat Ek is often the lead instrument in Piphat ensembles'
          }
        ]
      },
      metadata: {
        difficulty: 'intermediate',
        popularity: 85,
        dateAdded: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        tags: ['thai', 'xylophone', 'striking', 'traditional', 'piphat']
      }
    },

    {
      id: 'mong',
      name: {
        thai: 'โหม่ง',
        english: 'Mong',
        pronunciation: 'mong'
      },
      nationality: 'thai',
      playingMethod: 'striking',
      model3D: {
        modelId: 'mong-model',
        filePath: 'models/mong.glb',
        format: 'glb',
        lodLevels: [
          { distance: 10, polygonCount: 3000, filePath: 'models/mong-low.glb' },
          { distance: 5, polygonCount: 10000, filePath: 'models/mong-medium.glb' },
          { distance: 0, polygonCount: 30000, filePath: 'models/mong-high.glb' }
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 0.4, y: 0.4, z: 0.4 }
        }
      },
      audioSamples: {
        samples: [
          {
            id: 'mong-strike',
            noteId: 'strike1',
            filePath: 'audio/mong/strike.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 3.0,
            loopable: false,
            velocity: 0.7
          }
        ],
        polyphony: 2
      },
      interactionZones: [
        {
          id: 'mong-zone-1',
          type: 'strike',
          bounds: { x: 150, y: 250, width: 100, height: 100 },
          noteId: 'strike1',
          visualFeedback: {
            type: 'ripple',
            color: '#CD7F32',
            duration: 300,
            intensity: 0.9
          },
          touchSensitivity: 0.7
        }
      ],
      culturalInfo: {
        description: {
          thai: 'โหม่งเป็นฆ้องขนาดใหญ่ที่ให้เสียงทุ้มและก้องกังวาน',
          english: 'Mong is a large gong that produces deep, resonant tones'
        },
        origin: {
          thai: 'มีต้นกำเนิดในเอเชียตะวันออกเฉียงใต้ ใช้ในวงปี่พาทย์',
          english: 'Originated in Southeast Asia, used in Piphat ensembles'
        },
        usage: {
          thai: 'ใช้เป็นจังหวะและสร้างบรรยากาศในดนตรีไทย',
          english: 'Used for rhythm and atmosphere in Thai music'
        }
      },
      metadata: {
        difficulty: 'beginner',
        popularity: 70,
        dateAdded: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        tags: ['thai', 'gong', 'striking', 'traditional', 'percussion']
      }
    },

    {
      id: 'klong-thad',
      name: {
        thai: 'กลองทัด',
        english: 'Klong Thad',
        pronunciation: 'glong-tat'
      },
      nationality: 'thai',
      playingMethod: 'striking',
      model3D: {
        modelId: 'klong-thad-model',
        filePath: 'models/klong-thad.glb',
        format: 'glb',
        lodLevels: [
          { distance: 10, polygonCount: 4000, filePath: 'models/klong-thad-low.glb' },
          { distance: 5, polygonCount: 12000, filePath: 'models/klong-thad-medium.glb' },
          { distance: 0, polygonCount: 35000, filePath: 'models/klong-thad-high.glb' }
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 0.5, y: 0.8, z: 0.5 }
        }
      },
      audioSamples: {
        samples: [
          {
            id: 'klong-thad-low',
            noteId: 'low',
            filePath: 'audio/klong-thad/low.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 1.5,
            loopable: false,
            velocity: 0.8
          },
          {
            id: 'klong-thad-high',
            noteId: 'high',
            filePath: 'audio/klong-thad/high.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 1.2,
            loopable: false,
            velocity: 0.8
          }
        ],
        polyphony: 4
      },
      interactionZones: [
        {
          id: 'klong-thad-zone-low',
          type: 'strike',
          bounds: { x: 120, y: 200, width: 80, height: 80 },
          noteId: 'low',
          visualFeedback: {
            type: 'highlight',
            color: '#8B4513',
            duration: 150,
            intensity: 0.7
          },
          touchSensitivity: 0.8
        },
        {
          id: 'klong-thad-zone-high',
          type: 'strike',
          bounds: { x: 220, y: 200, width: 80, height: 80 },
          noteId: 'high',
          visualFeedback: {
            type: 'highlight',
            color: '#8B4513',
            duration: 150,
            intensity: 0.7
          },
          touchSensitivity: 0.8
        }
      ],
      culturalInfo: {
        description: {
          thai: 'กลองทัดเป็นกลองสองหน้าที่ให้เสียงทั้งทุ้มและสูง',
          english: 'Klong Thad is a double-headed drum that produces both low and high tones'
        },
        origin: {
          thai: 'เป็นกลองไทยโบราณที่ใช้ในวงดนตรีพื้นบ้าน',
          english: 'An ancient Thai drum used in folk music ensembles'
        },
        usage: {
          thai: 'ใช้สร้างจังหวะและลีลาในดนตรีไทย',
          english: 'Used to create rhythm and groove in Thai music'
        }
      },
      metadata: {
        difficulty: 'beginner',
        popularity: 75,
        dateAdded: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        tags: ['thai', 'drum', 'striking', 'traditional', 'percussion']
      }
    },

    // Thai Traditional Instruments - Plucked
    {
      id: 'jakhe',
      name: {
        thai: 'จะเข้',
        english: 'Jakhe',
        pronunciation: 'ja-keh'
      },
      nationality: 'thai',
      playingMethod: 'plucked',
      model3D: {
        modelId: 'jakhe-model',
        filePath: 'models/jakhe.glb',
        format: 'glb',
        lodLevels: [
          { distance: 10, polygonCount: 6000, filePath: 'models/jakhe-low.glb' },
          { distance: 5, polygonCount: 18000, filePath: 'models/jakhe-medium.glb' },
          { distance: 0, polygonCount: 55000, filePath: 'models/jakhe-high.glb' }
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 1.2, y: 0.3, z: 0.4 }
        }
      },
      audioSamples: {
        samples: [
          {
            id: 'jakhe-string1',
            noteId: 'string1',
            filePath: 'audio/jakhe/string1.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 2.0,
            loopable: false,
            velocity: 0.7
          }
        ],
        polyphony: 6
      },
      interactionZones: [
        {
          id: 'jakhe-string-1',
          type: 'pluck',
          bounds: { x: 80, y: 220, width: 50, height: 120 },
          noteId: 'string1',
          visualFeedback: {
            type: 'animate',
            animation: 'string-vibrate',
            duration: 250,
            intensity: 0.8
          },
          touchSensitivity: 0.7
        }
      ],
      culturalInfo: {
        description: {
          thai: 'จะเข้เป็นเครื่องดนตรีไทยที่มีสายสามสาย รูปร่างคล้ายจระเข้',
          english: 'Jakhe is a Thai three-stringed zither shaped like a crocodile'
        },
        origin: {
          thai: 'มีต้นกำเนิดในประเทศไทย ใช้ในวงมโหรี',
          english: 'Originated in Thailand, used in Mahori ensembles'
        },
        usage: {
          thai: 'ใช้บรรเลงเพลงไทยเดิมและเพลงพื้นบ้าน',
          english: 'Used to play traditional Thai songs and folk music'
        },
        funFacts: [
          {
            thai: 'รูปร่างของจะเข้ออกแบบให้คล้ายจระเข้',
            english: 'The shape of Jakhe is designed to resemble a crocodile'
          }
        ]
      },
      metadata: {
        difficulty: 'intermediate',
        popularity: 65,
        dateAdded: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        tags: ['thai', 'zither', 'plucked', 'traditional', 'strings']
      }
    },

    {
      id: 'saw-duang',
      name: {
        thai: 'ซอด้วง',
        english: 'Saw Duang',
        pronunciation: 'saw-duang'
      },
      nationality: 'thai',
      playingMethod: 'plucked',
      model3D: {
        modelId: 'saw-duang-model',
        filePath: 'models/saw-duang.glb',
        format: 'glb',
        lodLevels: [
          { distance: 10, polygonCount: 5000, filePath: 'models/saw-duang-low.glb' },
          { distance: 5, polygonCount: 14000, filePath: 'models/saw-duang-medium.glb' },
          { distance: 0, polygonCount: 42000, filePath: 'models/saw-duang-high.glb' }
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 0.3, y: 0.8, z: 0.3 }
        }
      },
      audioSamples: {
        samples: [
          {
            id: 'saw-duang-d4',
            noteId: 'D4',
            filePath: 'audio/saw-duang/d4.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 2.5,
            loopable: false,
            velocity: 0.75
          }
        ],
        polyphony: 4,
        noteRange: { lowest: 'D4', highest: 'D6' }
      },
      interactionZones: [
        {
          id: 'saw-duang-string-1',
          type: 'pluck',
          bounds: { x: 140, y: 180, width: 60, height: 140 },
          noteId: 'D4',
          visualFeedback: {
            type: 'animate',
            animation: 'string-vibrate',
            duration: 200,
            intensity: 0.75
          },
          touchSensitivity: 0.75
        }
      ],
      culturalInfo: {
        description: {
          thai: 'ซอด้วงเป็นเครื่องสีสองสายที่มีเสียงสูงและไพเราะ',
          english: 'Saw Duang is a two-stringed fiddle with high-pitched, melodious tones'
        },
        origin: {
          thai: 'เป็นเครื่องดนตรีไทยโบราณที่ใช้ในวงมโหรี',
          english: 'An ancient Thai instrument used in Mahori ensembles'
        },
        usage: {
          thai: 'ใช้บรรเลงทำนองหลักในดนตรีไทย',
          english: 'Used to play main melodies in Thai music'
        }
      },
      metadata: {
        difficulty: 'advanced',
        popularity: 60,
        dateAdded: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        tags: ['thai', 'fiddle', 'plucked', 'traditional', 'strings']
      }
    },

    {
      id: 'pin',
      name: {
        thai: 'พิณ',
        english: 'Pin',
        pronunciation: 'pin'
      },
      nationality: 'thai',
      playingMethod: 'plucked',
      model3D: {
        modelId: 'pin-model',
        filePath: 'models/pin.glb',
        format: 'glb',
        lodLevels: [
          { distance: 10, polygonCount: 5500, filePath: 'models/pin-low.glb' },
          { distance: 5, polygonCount: 16000, filePath: 'models/pin-medium.glb' },
          { distance: 0, polygonCount: 48000, filePath: 'models/pin-high.glb' }
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 0.4, y: 1.0, z: 0.3 }
        }
      },
      audioSamples: {
        samples: [
          {
            id: 'pin-string1',
            noteId: 'string1',
            filePath: 'audio/pin/string1.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 2.2,
            loopable: false,
            velocity: 0.7
          }
        ],
        polyphony: 5
      },
      interactionZones: [
        {
          id: 'pin-string-1',
          type: 'pluck',
          bounds: { x: 160, y: 200, width: 50, height: 100 },
          noteId: 'string1',
          visualFeedback: {
            type: 'animate',
            animation: 'string-vibrate',
            duration: 220,
            intensity: 0.7
          },
          touchSensitivity: 0.7
        }
      ],
      culturalInfo: {
        description: {
          thai: 'พิณเป็นเครื่องดนตรีพื้นบ้านอีสานที่มีสายสามสาย',
          english: 'Pin is an Isan folk instrument with three strings'
        },
        origin: {
          thai: 'มีต้นกำเนิดในภาคอีสานของประเทศไทย',
          english: 'Originated in the Isan region of Thailand'
        },
        usage: {
          thai: 'ใช้บรรเลงเพลงพื้นบ้านอีสานและหมอลำ',
          english: 'Used to play Isan folk songs and Mor Lam music'
        }
      },
      metadata: {
        difficulty: 'intermediate',
        popularity: 55,
        dateAdded: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        tags: ['thai', 'lute', 'plucked', 'folk', 'isan', 'strings']
      }
    },

    // Thai Traditional Instruments - Pressed
    {
      id: 'khim',
      name: {
        thai: 'ขิม',
        english: 'Khim',
        pronunciation: 'kim'
      },
      nationality: 'thai',
      playingMethod: 'pressed',
      model3D: {
        modelId: 'khim-model',
        filePath: 'models/khim.glb',
        format: 'glb',
        lodLevels: [
          { distance: 10, polygonCount: 7000, filePath: 'models/khim-low.glb' },
          { distance: 5, polygonCount: 20000, filePath: 'models/khim-medium.glb' },
          { distance: 0, polygonCount: 60000, filePath: 'models/khim-high.glb' }
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 1.0, y: 0.2, z: 0.6 }
        }
      },
      audioSamples: {
        samples: [
          {
            id: 'khim-c5',
            noteId: 'C5',
            filePath: 'audio/khim/c5.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 2.0,
            loopable: false,
            velocity: 0.75
          }
        ],
        polyphony: 10,
        noteRange: { lowest: 'C4', highest: 'C7' }
      },
      interactionZones: [
        {
          id: 'khim-key-1',
          type: 'press',
          bounds: { x: 100, y: 240, width: 50, height: 60 },
          noteId: 'C5',
          visualFeedback: {
            type: 'highlight',
            color: '#FFE4B5',
            duration: 180,
            intensity: 0.75
          },
          touchSensitivity: 0.75
        }
      ],
      culturalInfo: {
        description: {
          thai: 'ขิมเป็นเครื่องดนตรีที่ตีด้วยไม้ตีเล็กๆ มีสายหลายสาย',
          english: 'Khim is a hammered dulcimer played with small mallets, featuring many strings'
        },
        origin: {
          thai: 'มีต้นกำเนิดจากจีน แพร่หลายในเอเชียตะวันออกเฉียงใต้',
          english: 'Originated from China, widespread in Southeast Asia'
        },
        usage: {
          thai: 'ใช้ในวงดนตรีไทยและดนตรีพื้นบ้าน',
          english: 'Used in Thai music ensembles and folk music'
        }
      },
      metadata: {
        difficulty: 'advanced',
        popularity: 70,
        dateAdded: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        tags: ['thai', 'dulcimer', 'pressed', 'traditional', 'strings']
      }
    },

    {
      id: 'khaen',
      name: {
        thai: 'แคน',
        english: 'Khaen',
        pronunciation: 'kaen'
      },
      nationality: 'thai',
      playingMethod: 'pressed',
      model3D: {
        modelId: 'khaen-model',
        filePath: 'models/khaen.glb',
        format: 'glb',
        lodLevels: [
          { distance: 10, polygonCount: 4000, filePath: 'models/khaen-low.glb' },
          { distance: 5, polygonCount: 12000, filePath: 'models/khaen-medium.glb' },
          { distance: 0, polygonCount: 36000, filePath: 'models/khaen-high.glb' }
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 0.4, y: 0.8, z: 0.3 }
        }
      },
      audioSamples: {
        samples: [
          {
            id: 'khaen-note1',
            noteId: 'note1',
            filePath: 'audio/khaen/note1.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 3.0,
            loopable: true,
            velocity: 0.7
          }
        ],
        polyphony: 8
      },
      interactionZones: [
        {
          id: 'khaen-key-1',
          type: 'press',
          bounds: { x: 180, y: 220, width: 40, height: 80 },
          noteId: 'note1',
          visualFeedback: {
            type: 'glow',
            color: '#DEB887',
            duration: 200,
            intensity: 0.7
          },
          touchSensitivity: 0.7
        }
      ],
      culturalInfo: {
        description: {
          thai: 'แคนเป็นเครื่องดนตรีพื้นบ้านอีสานที่เป่าและกดท่อไม้ไผ่',
          english: 'Khaen is an Isan folk mouth organ made of bamboo pipes'
        },
        origin: {
          thai: 'มีต้นกำเนิดในภาคอีสานและลาว',
          english: 'Originated in Isan and Laos'
        },
        usage: {
          thai: 'ใช้บรรเลงเพลงหมอลำและเพลงพื้นบ้านอีสาน',
          english: 'Used to play Mor Lam and Isan folk music'
        },
        funFacts: [
          {
            thai: 'แคนสามารถเล่นได้ทั้งเป่าเข้าและเป่าออก',
            english: 'Khaen can be played both by inhaling and exhaling'
          }
        ]
      },
      metadata: {
        difficulty: 'intermediate',
        popularity: 65,
        dateAdded: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        tags: ['thai', 'mouth-organ', 'pressed', 'folk', 'isan', 'wind']
      }
    },

    // International Instruments - Striking
    {
      id: 'drums',
      name: {
        thai: 'กลองชุด',
        english: 'Drums'
      },
      nationality: 'international',
      playingMethod: 'striking',
      model3D: {
        modelId: 'drums-model',
        filePath: 'models/drums.glb',
        format: 'glb',
        lodLevels: [
          { distance: 10, polygonCount: 8000, filePath: 'models/drums-low.glb' },
          { distance: 5, polygonCount: 24000, filePath: 'models/drums-medium.glb' },
          { distance: 0, polygonCount: 70000, filePath: 'models/drums-high.glb' }
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 1.5, y: 1.2, z: 1.5 }
        }
      },
      audioSamples: {
        samples: [
          {
            id: 'drums-kick',
            noteId: 'kick',
            filePath: 'audio/drums/kick.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 1.0,
            loopable: false,
            velocity: 0.9
          },
          {
            id: 'drums-snare',
            noteId: 'snare',
            filePath: 'audio/drums/snare.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 0.8,
            loopable: false,
            velocity: 0.85
          }
        ],
        polyphony: 12
      },
      interactionZones: [
        {
          id: 'drums-kick-zone',
          type: 'strike',
          bounds: { x: 150, y: 300, width: 100, height: 80 },
          noteId: 'kick',
          visualFeedback: {
            type: 'ripple',
            color: '#000000',
            duration: 150,
            intensity: 0.9
          },
          touchSensitivity: 0.9
        },
        {
          id: 'drums-snare-zone',
          type: 'strike',
          bounds: { x: 100, y: 200, width: 90, height: 90 },
          noteId: 'snare',
          visualFeedback: {
            type: 'ripple',
            color: '#FFFFFF',
            duration: 120,
            intensity: 0.85
          },
          touchSensitivity: 0.85
        }
      ],
      culturalInfo: {
        description: {
          thai: 'กลองชุดเป็นเครื่องเคาะจังหวะที่ใช้ในดนตรีสมัยใหม่',
          english: 'Drums are a percussion instrument set used in modern music'
        },
        origin: {
          thai: 'พัฒนาขึ้นในสหรัฐอเมริกาในช่วงต้นศตวรรษที่ 20',
          english: 'Developed in the United States in the early 20th century'
        },
        usage: {
          thai: 'ใช้ในดนตรีแจ๊ส ร็อค ป๊อป และแนวเพลงสมัยใหม่',
          english: 'Used in jazz, rock, pop, and modern music genres'
        }
      },
      metadata: {
        difficulty: 'intermediate',
        popularity: 95,
        dateAdded: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        tags: ['international', 'drums', 'striking', 'percussion', 'modern']
      }
    },

    {
      id: 'xylophone',
      name: {
        thai: 'ไซโลโฟน',
        english: 'Xylophone'
      },
      nationality: 'international',
      playingMethod: 'striking',
      model3D: {
        modelId: 'xylophone-model',
        filePath: 'models/xylophone.glb',
        format: 'glb',
        lodLevels: [
          { distance: 10, polygonCount: 5000, filePath: 'models/xylophone-low.glb' },
          { distance: 5, polygonCount: 15000, filePath: 'models/xylophone-medium.glb' },
          { distance: 0, polygonCount: 45000, filePath: 'models/xylophone-high.glb' }
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 1.8, y: 0.4, z: 0.6 }
        }
      },
      audioSamples: {
        samples: [
          {
            id: 'xylophone-c5',
            noteId: 'C5',
            filePath: 'audio/xylophone/c5.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 1.5,
            loopable: false,
            velocity: 0.8
          }
        ],
        polyphony: 8,
        noteRange: { lowest: 'C4', highest: 'C7' }
      },
      interactionZones: [
        {
          id: 'xylophone-key-1',
          type: 'strike',
          bounds: { x: 80, y: 220, width: 50, height: 80 },
          noteId: 'C5',
          visualFeedback: {
            type: 'highlight',
            color: '#FFD700',
            duration: 150,
            intensity: 0.8
          },
          touchSensitivity: 0.8
        }
      ],
      culturalInfo: {
        description: {
          thai: 'ไซโลโฟนเป็นเครื่องดนตรีที่ทำจากแท่งไม้เรียงเป็นแถว',
          english: 'Xylophone is a musical instrument made of wooden bars arranged in a row'
        },
        origin: {
          thai: 'มีต้นกำเนิดในแอฟริกาและเอเชีย แพร่หลายทั่วโลก',
          english: 'Originated in Africa and Asia, widespread globally'
        },
        usage: {
          thai: 'ใช้ในวงออเคสตราและดนตรีการศึกษา',
          english: 'Used in orchestras and educational music'
        }
      },
      metadata: {
        difficulty: 'beginner',
        popularity: 80,
        dateAdded: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        tags: ['international', 'xylophone', 'striking', 'percussion', 'melodic']
      }
    },

    {
      id: 'marimba',
      name: {
        thai: 'มาริมบา',
        english: 'Marimba'
      },
      nationality: 'international',
      playingMethod: 'striking',
      model3D: {
        modelId: 'marimba-model',
        filePath: 'models/marimba.glb',
        format: 'glb',
        lodLevels: [
          { distance: 10, polygonCount: 6000, filePath: 'models/marimba-low.glb' },
          { distance: 5, polygonCount: 18000, filePath: 'models/marimba-medium.glb' },
          { distance: 0, polygonCount: 54000, filePath: 'models/marimba-high.glb' }
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 2.2, y: 0.8, z: 0.8 }
        }
      },
      audioSamples: {
        samples: [
          {
            id: 'marimba-c4',
            noteId: 'C4',
            filePath: 'audio/marimba/c4.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 2.5,
            loopable: false,
            velocity: 0.75
          }
        ],
        polyphony: 10,
        noteRange: { lowest: 'C3', highest: 'C7' }
      },
      interactionZones: [
        {
          id: 'marimba-key-1',
          type: 'strike',
          bounds: { x: 90, y: 230, width: 55, height: 85 },
          noteId: 'C4',
          visualFeedback: {
            type: 'highlight',
            color: '#8B4513',
            duration: 200,
            intensity: 0.75
          },
          touchSensitivity: 0.75
        }
      ],
      culturalInfo: {
        description: {
          thai: 'มาริมบาเป็นเครื่องดนตรีคล้ายไซโลโฟนแต่มีเสียงทุ้มและอบอุ่นกว่า',
          english: 'Marimba is similar to xylophone but with deeper, warmer tones'
        },
        origin: {
          thai: 'มีต้นกำเนิดในแอฟริกาและอเมริกากลาง',
          english: 'Originated in Africa and Central America'
        },
        usage: {
          thai: 'ใช้ในวงออเคสตราและดนตรีร่วมสมัย',
          english: 'Used in orchestras and contemporary music'
        }
      },
      metadata: {
        difficulty: 'intermediate',
        popularity: 75,
        dateAdded: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        tags: ['international', 'marimba', 'striking', 'percussion', 'melodic']
      }
    },

    // International Instruments - Plucked
    {
      id: 'guitar',
      name: {
        thai: 'กีตาร์',
        english: 'Guitar'
      },
      nationality: 'international',
      playingMethod: 'plucked',
      model3D: {
        modelId: 'guitar-model',
        filePath: 'models/guitar.glb',
        format: 'glb',
        lodLevels: [
          { distance: 10, polygonCount: 7000, filePath: 'models/guitar-low.glb' },
          { distance: 5, polygonCount: 21000, filePath: 'models/guitar-medium.glb' },
          { distance: 0, polygonCount: 63000, filePath: 'models/guitar-high.glb' }
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 0.4, y: 1.0, z: 0.15 }
        }
      },
      audioSamples: {
        samples: [
          {
            id: 'guitar-e2',
            noteId: 'E2',
            filePath: 'audio/guitar/e2.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 3.0,
            loopable: false,
            velocity: 0.75
          }
        ],
        polyphony: 6,
        noteRange: { lowest: 'E2', highest: 'E5' }
      },
      interactionZones: [
        {
          id: 'guitar-string-1',
          type: 'pluck',
          bounds: { x: 160, y: 200, width: 60, height: 120 },
          noteId: 'E2',
          visualFeedback: {
            type: 'animate',
            animation: 'string-vibrate',
            duration: 250,
            intensity: 0.75
          },
          touchSensitivity: 0.75
        }
      ],
      culturalInfo: {
        description: {
          thai: 'กีตาร์เป็นเครื่องดนตรีสายที่ได้รับความนิยมมากที่สุดในโลก',
          english: 'Guitar is the most popular stringed instrument in the world'
        },
        origin: {
          thai: 'พัฒนาขึ้นในสเปนในศตวรรษที่ 16',
          english: 'Developed in Spain in the 16th century'
        },
        usage: {
          thai: 'ใช้ในดนตรีเกือบทุกแนว',
          english: 'Used in almost all music genres'
        }
      },
      metadata: {
        difficulty: 'intermediate',
        popularity: 100,
        dateAdded: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        tags: ['international', 'guitar', 'plucked', 'strings', 'popular']
      }
    },

    {
      id: 'harp',
      name: {
        thai: 'พิณพิณ',
        english: 'Harp'
      },
      nationality: 'international',
      playingMethod: 'plucked',
      model3D: {
        modelId: 'harp-model',
        filePath: 'models/harp.glb',
        format: 'glb',
        lodLevels: [
          { distance: 10, polygonCount: 8000, filePath: 'models/harp-low.glb' },
          { distance: 5, polygonCount: 24000, filePath: 'models/harp-medium.glb' },
          { distance: 0, polygonCount: 72000, filePath: 'models/harp-high.glb' }
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 0.8, y: 1.8, z: 0.6 }
        }
      },
      audioSamples: {
        samples: [
          {
            id: 'harp-c3',
            noteId: 'C3',
            filePath: 'audio/harp/c3.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 4.0,
            loopable: false,
            velocity: 0.7
          }
        ],
        polyphony: 12,
        noteRange: { lowest: 'C1', highest: 'G7' }
      },
      interactionZones: [
        {
          id: 'harp-string-1',
          type: 'pluck',
          bounds: { x: 140, y: 180, width: 70, height: 140 },
          noteId: 'C3',
          visualFeedback: {
            type: 'animate',
            animation: 'string-vibrate',
            duration: 300,
            intensity: 0.7
          },
          touchSensitivity: 0.7
        }
      ],
      culturalInfo: {
        description: {
          thai: 'พิณพิณเป็นเครื่องดนตรีสายที่มีเสียงไพเราะและสง่างาม',
          english: 'Harp is a stringed instrument with melodious and elegant tones'
        },
        origin: {
          thai: 'มีต้นกำเนิดในอียิปต์โบราณและเมโสโปเตเมีย',
          english: 'Originated in ancient Egypt and Mesopotamia'
        },
        usage: {
          thai: 'ใช้ในวงออเคสตราและดนตรีคลาสสิก',
          english: 'Used in orchestras and classical music'
        }
      },
      metadata: {
        difficulty: 'advanced',
        popularity: 65,
        dateAdded: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        tags: ['international', 'harp', 'plucked', 'strings', 'classical']
      }
    },

    {
      id: 'ukulele',
      name: {
        thai: 'อูคูเลเล่',
        english: 'Ukulele'
      },
      nationality: 'international',
      playingMethod: 'plucked',
      model3D: {
        modelId: 'ukulele-model',
        filePath: 'models/ukulele.glb',
        format: 'glb',
        lodLevels: [
          { distance: 10, polygonCount: 4000, filePath: 'models/ukulele-low.glb' },
          { distance: 5, polygonCount: 12000, filePath: 'models/ukulele-medium.glb' },
          { distance: 0, polygonCount: 36000, filePath: 'models/ukulele-high.glb' }
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 0.3, y: 0.6, z: 0.1 }
        }
      },
      audioSamples: {
        samples: [
          {
            id: 'ukulele-g4',
            noteId: 'G4',
            filePath: 'audio/ukulele/g4.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 2.0,
            loopable: false,
            velocity: 0.75
          }
        ],
        polyphony: 4,
        noteRange: { lowest: 'G4', highest: 'A6' }
      },
      interactionZones: [
        {
          id: 'ukulele-string-1',
          type: 'pluck',
          bounds: { x: 170, y: 220, width: 50, height: 100 },
          noteId: 'G4',
          visualFeedback: {
            type: 'animate',
            animation: 'string-vibrate',
            duration: 200,
            intensity: 0.75
          },
          touchSensitivity: 0.75
        }
      ],
      culturalInfo: {
        description: {
          thai: 'อูคูเลเล่เป็นเครื่องดนตรีสายขนาดเล็กที่มีเสียงสดใส',
          english: 'Ukulele is a small stringed instrument with bright, cheerful tones'
        },
        origin: {
          thai: 'พัฒนาขึ้นในฮาวายในศตวรรษที่ 19',
          english: 'Developed in Hawaii in the 19th century'
        },
        usage: {
          thai: 'ใช้ในดนตรีฮาวายและเพลงป๊อป',
          english: 'Used in Hawaiian music and pop songs'
        }
      },
      metadata: {
        difficulty: 'beginner',
        popularity: 85,
        dateAdded: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        tags: ['international', 'ukulele', 'plucked', 'strings', 'hawaiian']
      }
    },

    // International Instruments - Pressed
    {
      id: 'piano',
      name: {
        thai: 'เปียโน',
        english: 'Piano'
      },
      nationality: 'international',
      playingMethod: 'pressed',
      model3D: {
        modelId: 'piano-model',
        filePath: 'models/piano.glb',
        format: 'glb',
        lodLevels: [
          { distance: 10, polygonCount: 10000, filePath: 'models/piano-low.glb' },
          { distance: 5, polygonCount: 30000, filePath: 'models/piano-medium.glb' },
          { distance: 0, polygonCount: 90000, filePath: 'models/piano-high.glb' }
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 1.5, y: 1.0, z: 0.6 }
        }
      },
      audioSamples: {
        samples: [
          {
            id: 'piano-c4',
            noteId: 'C4',
            filePath: 'audio/piano/c4.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 24,
            channels: 'stereo',
            duration: 5.0,
            loopable: false,
            velocity: 0.8
          }
        ],
        polyphony: 16,
        noteRange: { lowest: 'A0', highest: 'C8' }
      },
      interactionZones: [
        {
          id: 'piano-key-c4',
          type: 'press',
          bounds: { x: 120, y: 250, width: 40, height: 70 },
          noteId: 'C4',
          visualFeedback: {
            type: 'highlight',
            color: '#FFFFFF',
            duration: 150,
            intensity: 0.8
          },
          touchSensitivity: 0.8
        }
      ],
      culturalInfo: {
        description: {
          thai: 'เปียโนเป็นเครื่องดนตรีคีย์บอร์ดที่มีช่วงเสียงกว้างและหลากหลาย',
          english: 'Piano is a keyboard instrument with a wide and versatile range'
        },
        origin: {
          thai: 'คิดค้นโดย Bartolomeo Cristofori ในอิตาลีประมาณปี 1700',
          english: 'Invented by Bartolomeo Cristofori in Italy around 1700'
        },
        usage: {
          thai: 'ใช้ในดนตรีคลาสสิก แจ๊ส และดนตรีร่วมสมัย',
          english: 'Used in classical, jazz, and contemporary music'
        }
      },
      metadata: {
        difficulty: 'advanced',
        popularity: 100,
        dateAdded: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        tags: ['international', 'piano', 'pressed', 'keyboard', 'classical']
      }
    },

    {
      id: 'accordion',
      name: {
        thai: 'หีบเพลง',
        english: 'Accordion'
      },
      nationality: 'international',
      playingMethod: 'pressed',
      model3D: {
        modelId: 'accordion-model',
        filePath: 'models/accordion.glb',
        format: 'glb',
        lodLevels: [
          { distance: 10, polygonCount: 6000, filePath: 'models/accordion-low.glb' },
          { distance: 5, polygonCount: 18000, filePath: 'models/accordion-medium.glb' },
          { distance: 0, polygonCount: 54000, filePath: 'models/accordion-high.glb' }
        ],
        defaultScale: { x: 1, y: 1, z: 1 },
        defaultRotation: { x: 0, y: 0, z: 0 },
        boundingBox: {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 0.5, y: 0.4, z: 0.3 }
        }
      },
      audioSamples: {
        samples: [
          {
            id: 'accordion-c4',
            noteId: 'C4',
            filePath: 'audio/accordion/c4.wav',
            format: 'wav',
            sampleRate: 44100,
            bitDepth: 16,
            channels: 'stereo',
            duration: 3.0,
            loopable: true,
            velocity: 0.75
          }
        ],
        polyphony: 10,
        noteRange: { lowest: 'F2', highest: 'A6' }
      },
      interactionZones: [
        {
          id: 'accordion-key-1',
          type: 'press',
          bounds: { x: 140, y: 230, width: 45, height: 60 },
          noteId: 'C4',
          visualFeedback: {
            type: 'glow',
            color: '#FF6347',
            duration: 180,
            intensity: 0.75
          },
          touchSensitivity: 0.75
        }
      ],
      culturalInfo: {
        description: {
          thai: 'หีบเพลงเป็นเครื่องดนตรีที่ใช้ลมและปุ่มกด',
          english: 'Accordion is a wind instrument played with buttons or keys'
        },
        origin: {
          thai: 'คิดค้นในยุโรปในต้นศตวรรษที่ 19',
          english: 'Invented in Europe in the early 19th century'
        },
        usage: {
          thai: 'ใช้ในดนตรีพื้นบ้านยุโรปและดนตรีแทงโก้',
          english: 'Used in European folk music and tango'
        }
      },
      metadata: {
        difficulty: 'intermediate',
        popularity: 60,
        dateAdded: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        tags: ['international', 'accordion', 'pressed', 'wind', 'folk']
      }
    }
  ];
}
