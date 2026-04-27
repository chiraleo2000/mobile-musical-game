# 3D Models Directory

This directory contains 3D models for all musical instruments in GLB format.

## Required Models

### Thai Traditional Instruments
1. **ranat-ek** - Thai xylophone with wooden bars
2. **mong** - Thai gong with circular brass disc
3. **klong-thad** - Thai drum with cylindrical body
4. **jakhe** - Thai zither (crocodile-shaped)
5. **saw-duang** - Thai fiddle (2-string bowed instrument)
6. **pin** - Thai lute (3-string plucked instrument)
7. **khim** - Thai hammered dulcimer
8. **khaen** - Thai mouth organ (bamboo pipes)

### International Instruments
1. **drums** - Drum kit with bass, snare, toms, cymbals
2. **xylophone** - Colorful xylophone with metal bars
3. **marimba** - Large wooden xylophone
4. **guitar** - Acoustic guitar with 6 strings
5. **harp** - Classical harp with strings
6. **ukulele** - Small 4-string guitar
7. **piano** - Grand piano with keyboard
8. **accordion** - Accordion with bellows and keys

## File Naming Convention

Each instrument has 3 quality levels:
- `{instrument-name}-low.glb` - 5,000 polygons (for low-end devices)
- `{instrument-name}-medium.glb` - 15,000 polygons (default)
- `{instrument-name}-high.glb` - 50,000 polygons (for high-end devices)

## Model Requirements

### Technical Specifications
- **Format**: GLB (binary glTF)
- **Coordinate System**: Y-up, right-handed
- **Units**: Meters
- **Scale**: Normalized to fit in 2x2x2 unit cube
- **Origin**: Center of model at (0, 0, 0)
- **Textures**: Embedded in GLB file
- **Materials**: PBR (Physically Based Rendering)

### Polygon Counts
- **Low**: ~5,000 triangles
- **Medium**: ~15,000 triangles
- **High**: ~50,000 triangles

### Optimization
- Use LOD (Level of Detail) system
- Minimize draw calls
- Compress textures
- Remove hidden faces
- Merge similar materials

## Creating Models

### Option 1: Use 3D Modeling Software
1. **Blender** (Free, Open Source)
   - Model the instrument
   - Apply materials and textures
   - Export as GLB: File → Export → glTF 2.0 (.glb)

2. **Maya/3ds Max** (Professional)
   - Model the instrument
   - Use Babylon.js exporter for GLB

### Option 2: Use Online Tools
1. **Sketchfab** - Download free 3D models
2. **TurboSquid** - Purchase professional models
3. **CGTrader** - Marketplace for 3D models

### Option 3: Procedural Generation
Run the generator script:
```bash
cd mobile-musical-game
npm install three
node scripts/generate-3d-models.js
```

## Model Structure

Each model should include:
- **Geometry**: Mesh data (vertices, faces, normals, UVs)
- **Materials**: PBR materials with:
  - Base color
  - Metallic/roughness values
  - Normal maps (optional)
  - Ambient occlusion (optional)
- **Hierarchy**: Organized node structure
- **Animations**: None required (static models)

## Interaction Zones

Models should be designed with interaction zones in mind:
- **Striking instruments**: Flat surfaces for hitting
- **Plucked instruments**: String positions
- **Pressed instruments**: Key/button positions

## Testing Models

1. **Visual Check**: Load in Blender or online GLB viewer
2. **Size Check**: Ensure proper scale
3. **Performance Check**: Verify polygon count
4. **Material Check**: Ensure PBR materials render correctly
5. **Mobile Check**: Test on actual device

## Placeholder Models

Until real models are created, the app uses:
- Simple geometric shapes (boxes, cylinders, spheres)
- Basic colors to distinguish instruments
- Minimal polygon counts for performance

## Resources

- **glTF Validator**: https://github.khronos.org/glTF-Validator/
- **Blender**: https://www.blender.org/
- **Three.js GLB Viewer**: https://gltf-viewer.donmccurdy.com/
- **Sketchfab**: https://sketchfab.com/
- **glTF Tutorial**: https://www.khronos.org/gltf/

## License

Ensure all 3D models have appropriate licenses for commercial use.
