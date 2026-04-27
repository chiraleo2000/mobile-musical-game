# Textures Directory

This directory contains texture images for 3D models and UI elements.

## Structure

```
textures/
├── instruments/      # Textures for instrument 3D models
└── ui/              # UI element textures and icons
```

## File Format

- **Preferred**: PNG (for transparency support)
- **Supported**: JPG, JPEG (for photos without transparency)

## Texture Types

### Instrument Textures
- Diffuse/Albedo maps (color)
- Normal maps (surface detail)
- Roughness maps (material properties)
- Metallic maps (metallic surfaces)
- Ambient Occlusion maps (shadows)

### UI Textures
- Icons
- Buttons
- Backgrounds
- Decorative elements

## Texture Sizes

### Low Quality
- 512x512 pixels

### Medium Quality
- 1024x1024 pixels

### High Quality
- 2048x2048 pixels

## Naming Convention

`{instrument-name}-{map-type}-{size}.png`

Examples:
- `ranat-ek-diffuse-1024.png`
- `ranat-ek-normal-1024.png`
- `guitar-roughness-2048.png`
- `piano-metallic-1024.png`

## Optimization Guidelines

1. Use power-of-2 dimensions (512, 1024, 2048)
2. Compress textures appropriately
3. Use PNG for transparency
4. Use JPG for photos without transparency
5. Keep file sizes reasonable (<2MB per texture)
6. Use mipmaps for better performance
7. Optimize for mobile devices

## Color Space

- Use sRGB color space for diffuse/albedo maps
- Use linear color space for normal, roughness, and metallic maps
