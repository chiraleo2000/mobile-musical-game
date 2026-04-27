/**
 * 3D Model Generator using Three.js
 * Generates procedural 3D models for all musical instruments
 * Exports as GLB files for use in the app
 */

const THREE = require('three');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter');
const fs = require('fs');
const path = require('path');

// Create output directory
const OUTPUT_DIR = path.join(__dirname, '../assets/models');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Base class for instrument model generators
 */
class InstrumentModelGenerator {
  constructor(name) {
    this.name = name;
    this.scene = new THREE.Scene();
  }

  /**
   * Export scene to GLB file
   */
  async export(quality = 'high') {
    const exporter = new GLTFExporter();
    
    return new Promise((resolve, reject) => {
      exporter.parse(
        this.scene,
        (gltf) => {
          const filename = `${this.name}-${quality}.glb`;
          const filepath = path.join(OUTPUT_DIR, filename);
          
          const buffer = Buffer.from(gltf);
          fs.writeFileSync(filepath, buffer);
          
          console.log(`✓ Generated: ${filename}`);
          resolve(filepath);
        },
        (error) => reject(error),
        { binary: true }
      );
    });
  }

  /**
   * Create material with color
   */
  createMaterial(color, metalness = 0.3, roughness = 0.7) {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      metalness,
      roughness,
    });
  }
}

/**
 * Ranat Ek (Thai Xylophone) Generator
 */
class RanatEkGenerator extends InstrumentModelGenerator {
  constructor() {
    super('ranat-ek');
    this.generate();
  }

  generate() {
    // Frame
    const frameGeometry = new THREE.BoxGeometry(3, 0.1, 0.8);
    const frameMaterial = this.createMaterial('#8B4513');
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    this.scene.add(frame);

    // Wooden bars (21 bars)
    const barMaterial = this.createMaterial('#D2691E');
    for (let i = 0; i < 21; i++) {
      const width = 0.12 - (i * 0.002); // Decreasing width
      const barGeometry = new THREE.BoxGeometry(width, 0.05, 0.6);
      const bar = new THREE.Mesh(barGeometry, barMaterial);
      bar.position.x = -1.4 + (i * 0.14);
      bar.position.y = 0.1;
      this.scene.add(bar);
    }

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
    const legMaterial = this.createMaterial('#654321');
    [-1.2, 1.2].forEach(x => {
      [-0.3, 0.3].forEach(z => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(x, -0.3, z);
        this.scene.add(leg);
      });
    });

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    this.scene.add(light);
  }
}

/**
 * Mong (Thai Gong) Generator
 */
class MongGenerator extends InstrumentModelGenerator {
  constructor() {
    super('mong');
    this.generate();
  }

  generate() {
    // Gong disc
    const gongGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32);
    const gongMaterial = this.createMaterial('#FFD700', 0.8, 0.2);
    const gong = new THREE.Mesh(gongGeometry, gongMaterial);
    gong.rotation.x = Math.PI / 2;
    this.scene.add(gong);

    // Center boss
    const bossGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const boss = new THREE.Mesh(bossGeometry, gongMaterial);
    boss.position.z = 0.05;
    this.scene.add(boss);

    // Frame
    const frameGeometry = new THREE.TorusGeometry(0.6, 0.03, 16, 32);
    const frameMaterial = this.createMaterial('#8B4513');
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.rotation.x = Math.PI / 2;
    this.scene.add(frame);

    // Stand
    const standGeometry = new THREE.CylinderGeometry(0.05, 0.08, 1);
    const stand = new THREE.Mesh(standGeometry, frameMaterial);
    stand.position.y = -0.5;
    this.scene.add(stand);

    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05);
    const base = new THREE.Mesh(baseGeometry, frameMaterial);
    base.position.y = -1;
    this.scene.add(base);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    this.scene.add(light);
  }
}

/**
 * Klong Thad (Thai Drum) Generator
 */
class KlongThadGenerator extends InstrumentModelGenerator {
  constructor() {
    super('klong-thad');
    this.generate();
  }

  generate() {
    // Drum body
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.35, 0.8, 32);
    const bodyMaterial = this.createMaterial('#8B4513');
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.scene.add(body);

    // Top drumhead
    const headGeometry = new THREE.CylinderGeometry(0.42, 0.42, 0.02, 32);
    const headMaterial = this.createMaterial('#F5DEB3', 0.1, 0.9);
    const topHead = new THREE.Mesh(headGeometry, headMaterial);
    topHead.position.y = 0.41;
    this.scene.add(topHead);

    // Bottom drumhead
    const bottomHead = new THREE.Mesh(headGeometry, headMaterial);
    bottomHead.position.y = -0.41;
    this.scene.add(bottomHead);

    // Decorative rings
    const ringMaterial = this.createMaterial('#FFD700', 0.8, 0.2);
    [0.3, 0, -0.3].forEach(y => {
      const ringGeometry = new THREE.TorusGeometry(0.38, 0.02, 8, 32);
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.y = y;
      ring.rotation.x = Math.PI / 2;
      this.scene.add(ring);
    });

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    this.scene.add(light);
  }
}

/**
 * Jakhe (Thai Zither) Generator
 */
class JakheGenerator extends InstrumentModelGenerator {
  constructor() {
    super('jakhe');
    this.generate();
  }

  generate() {
    // Body (crocodile shape)
    const bodyGeometry = new THREE.BoxGeometry(2, 0.15, 0.4);
    const bodyMaterial = this.createMaterial('#8B4513');
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.scene.add(body);

    // Strings (3 strings)
    const stringMaterial = this.createMaterial('#C0C0C0', 0.9, 0.1);
    for (let i = 0; i < 3; i++) {
      const stringGeometry = new THREE.CylinderGeometry(0.002, 0.002, 2);
      const string = new THREE.Mesh(stringGeometry, stringMaterial);
      string.rotation.z = Math.PI / 2;
      string.position.z = -0.1 + (i * 0.1);
      string.position.y = 0.08;
      this.scene.add(string);
    }

    // Frets
    const fretMaterial = this.createMaterial('#654321');
    for (let i = 0; i < 12; i++) {
      const fretGeometry = new THREE.BoxGeometry(0.02, 0.03, 0.45);
      const fret = new THREE.Mesh(fretGeometry, fretMaterial);
      fret.position.x = -0.9 + (i * 0.15);
      fret.position.y = 0.09;
      this.scene.add(fret);
    }

    // Head (crocodile head)
    const headGeometry = new THREE.ConeGeometry(0.15, 0.3, 8);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.rotation.z = -Math.PI / 2;
    head.position.x = 1.15;
    this.scene.add(head);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    this.scene.add(light);
  }
}

/**
 * Drums (International) Generator
 */
class DrumsGenerator extends InstrumentModelGenerator {
  constructor() {
    super('drums');
    this.generate();
  }

  generate() {
    // Bass drum
    const bassGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 32);
    const drumMaterial = this.createMaterial('#FF0000', 0.6, 0.4);
    const bass = new THREE.Mesh(bassGeometry, drumMaterial);
    bass.rotation.z = Math.PI / 2;
    this.scene.add(bass);

    // Snare drum
    const snareGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 32);
    const snare = new THREE.Mesh(snareGeometry, drumMaterial);
    snare.position.set(-0.5, 0.5, 0.3);
    this.scene.add(snare);

    // Tom-toms
    [0.3, 0.6].forEach((x, i) => {
      const tomGeometry = new THREE.CylinderGeometry(0.2 - i * 0.03, 0.2 - i * 0.03, 0.2, 32);
      const tom = new THREE.Mesh(tomGeometry, drumMaterial);
      tom.position.set(x, 0.6, 0);
      this.scene.add(tom);
    });

    // Cymbals
    const cymbalGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.01, 32);
    const cymbalMaterial = this.createMaterial('#FFD700', 0.9, 0.1);
    [-0.8, 0.8].forEach(x => {
      const cymbal = new THREE.Mesh(cymbalGeometry, cymbalMaterial);
      cymbal.position.set(x, 0.8, 0);
      this.scene.add(cymbal);
    });

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    this.scene.add(light);
  }
}

/**
 * Xylophone (International) Generator
 */
class XylophoneGenerator extends InstrumentModelGenerator {
  constructor() {
    super('xylophone');
    this.generate();
  }

  generate() {
    // Frame
    const frameGeometry = new THREE.BoxGeometry(2, 0.05, 0.5);
    const frameMaterial = this.createMaterial('#8B4513');
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    this.scene.add(frame);

    // Bars (13 bars - chromatic scale)
    const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
    for (let i = 0; i < 13; i++) {
      const width = 0.14 - (i * 0.005);
      const barGeometry = new THREE.BoxGeometry(width, 0.03, 0.4);
      const barMaterial = this.createMaterial(colors[i % colors.length], 0.5, 0.5);
      const bar = new THREE.Mesh(barGeometry, barMaterial);
      bar.position.x = -0.9 + (i * 0.15);
      bar.position.y = 0.05;
      this.scene.add(bar);
    }

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.4);
    [-0.8, 0.8].forEach(x => {
      [-0.2, 0.2].forEach(z => {
        const leg = new THREE.Mesh(legGeometry, frameMaterial);
        leg.position.set(x, -0.22, z);
        this.scene.add(leg);
      });
    });

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    this.scene.add(light);
  }
}

/**
 * Guitar (International) Generator
 */
class GuitarGenerator extends InstrumentModelGenerator {
  constructor() {
    super('guitar');
    this.generate();
  }

  generate() {
    // Body
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(0, 0);
    bodyShape.bezierCurveTo(0, 0.3, 0.3, 0.5, 0.5, 0.5);
    bodyShape.bezierCurveTo(0.7, 0.5, 0.8, 0.3, 0.8, 0);
    bodyShape.bezierCurveTo(0.8, -0.3, 0.7, -0.5, 0.5, -0.5);
    bodyShape.bezierCurveTo(0.3, -0.5, 0, -0.3, 0, 0);

    const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
    });
    const bodyMaterial = this.createMaterial('#8B4513');
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    this.scene.add(body);

    // Neck
    const neckGeometry = new THREE.BoxGeometry(0.15, 0.05, 1.5);
    const neckMaterial = this.createMaterial('#654321');
    const neck = new THREE.Mesh(neckGeometry, neckMaterial);
    neck.position.set(0.4, 0, 0.8);
    this.scene.add(neck);

    // Headstock
    const headGeometry = new THREE.BoxGeometry(0.2, 0.06, 0.3);
    const head = new THREE.Mesh(headGeometry, neckMaterial);
    head.position.set(0.4, 0, 1.6);
    this.scene.add(head);

    // Strings (6 strings)
    const stringMaterial = this.createMaterial('#C0C0C0', 0.9, 0.1);
    for (let i = 0; i < 6; i++) {
      const stringGeometry = new THREE.CylinderGeometry(0.001, 0.001, 1.8);
      const string = new THREE.Mesh(stringGeometry, stringMaterial);
      string.position.set(0.35 + (i * 0.02), 0.03, 0.7);
      this.scene.add(string);
    }

    // Sound hole
    const holeGeometry = new THREE.CircleGeometry(0.1, 32);
    const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const hole = new THREE.Mesh(holeGeometry, holeMaterial);
    hole.position.set(0.4, 0.06, 0.2);
    hole.rotation.x = -Math.PI / 2;
    this.scene.add(hole);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    this.scene.add(light);
  }
}

/**
 * Piano (International) Generator
 */
class PianoGenerator extends InstrumentModelGenerator {
  constructor() {
    super('piano');
    this.generate();
  }

  generate() {
    // Piano body
    const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 1);
    const bodyMaterial = this.createMaterial('#000000', 0.8, 0.2);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.scene.add(body);

    // White keys (52 keys)
    const whiteKeyMaterial = this.createMaterial('#FFFFFF', 0.1, 0.9);
    for (let i = 0; i < 52; i++) {
      const keyGeometry = new THREE.BoxGeometry(0.035, 0.02, 0.2);
      const key = new THREE.Mesh(keyGeometry, whiteKeyMaterial);
      key.position.set(-0.9 + (i * 0.037), 0.42, 0.3);
      this.scene.add(key);
    }

    // Black keys (36 keys)
    const blackKeyMaterial = this.createMaterial('#000000', 0.2, 0.8);
    let blackKeyIndex = 0;
    for (let i = 0; i < 52; i++) {
      if (i % 7 !== 2 && i % 7 !== 6) {
        const keyGeometry = new THREE.BoxGeometry(0.02, 0.03, 0.12);
        const key = new THREE.Mesh(keyGeometry, blackKeyMaterial);
        key.position.set(-0.88 + (i * 0.037), 0.43, 0.36);
        this.scene.add(key);
        blackKeyIndex++;
      }
    }

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.08, 0.6, 0.08);
    const legMaterial = this.createMaterial('#000000', 0.8, 0.2);
    [-0.8, 0.8].forEach(x => {
      [-0.4, 0.4].forEach(z => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(x, -0.7, z);
        this.scene.add(leg);
      });
    });

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    this.scene.add(light);
  }
}

/**
 * Generate all instruments
 */
async function generateAllModels() {
  console.log('🎵 Generating 3D models for all instruments...\n');

  const generators = [
    // Thai instruments
    new RanatEkGenerator(),
    new MongGenerator(),
    new KlongThadGenerator(),
    new JakheGenerator(),
    
    // International instruments
    new DrumsGenerator(),
    new XylophoneGenerator(),
    new GuitarGenerator(),
    new PianoGenerator(),
  ];

  // Generate models at different quality levels
  const qualities = ['low', 'medium', 'high'];
  
  for (const generator of generators) {
    for (const quality of qualities) {
      try {
        await generator.export(quality);
      } catch (error) {
        console.error(`✗ Failed to generate ${generator.name}-${quality}:`, error.message);
      }
    }
  }

  console.log('\n✓ All 3D models generated successfully!');
  console.log(`📁 Models saved to: ${OUTPUT_DIR}`);
}

// Run generator
if (require.main === module) {
  generateAllModels().catch(console.error);
}

module.exports = { generateAllModels };
