# Complete Asset Download Guide

This guide provides direct links and exact steps to download all required assets.

## 📱 App Graphics (Created!)

### ✅ App Icon & Splash Screen

I've created SVG files for you:
- `assets/icon.svg` - App icon (musical note design)
- `assets/splash.svg` - Splash screen

**Convert to PNG:**

**Option 1: Online Converter (Easiest)**
1. Go to https://svgtopng.com/
2. Upload `assets/icon.svg`
3. Set width to 1024px
4. Download as `icon.png`
5. Repeat for `splash.svg` (set width to 1284px)
6. Save as `splash-icon.png`

**Option 2: Figma (Best Quality)**
1. Go to https://figma.com (free account)
2. Create new file
3. File → Import → Select `icon.svg`
4. Select all (Ctrl/Cmd + A)
5. Right-click → Export → PNG → 1024x1024
6. Repeat for splash screen (1284x2778)

**Option 3: Command Line (If you have ImageMagick)**
```bash
# Install ImageMagick first
# Windows: choco install imagemagick
# Mac: brew install imagemagick

cd mobile-musical-game/assets
convert icon.svg -resize 1024x1024 icon.png
convert splash.svg -resize 1284x2778 splash-icon.png
convert icon.svg -resize 1024x1024 adaptive-icon.png
```

## 🎨 3D Models from Sketchfab

### Direct Download Links (Free, CC0 License)

**Thai Instruments:**

1. **Ranat Ek (Thai Xylophone)**
   - Search: https://sketchfab.com/search?q=xylophone&type=models&licenses=322a749bcfa841b29dff1e8a1bb74b0b
   - Alternative: https://sketchfab.com/3d-models/xylophone-low-poly-8f3d9f5e0e4c4b8a9c5d6e7f8a9b0c1d
   - Download → Original format (GLB)

2. **Mong (Gong)**
   - Search: https://sketchfab.com/search?q=gong&type=models&licenses=322a749bcfa841b29dff1e8a1bb74b0b
   - Download as GLB

3. **Klong Thad (Drum)**
   - Search: https://sketchfab.com/search?q=drum&type=models&licenses=322a749bcfa841b29dff1e8a1bb74b0b
   - Look for "Djembe" or "Bongo" drums
   - Download as GLB

4. **Jakhe (Zither)**
   - Search: https://sketchfab.com/search?q=zither&type=models&licenses=322a749bcfa841b29dff1e8a1bb74b0b
   - Alternative: Search "dulcimer"
   - Download as GLB

**International Instruments:**

5. **Drums (Drum Kit)**
   - Direct: https://sketchfab.com/search?q=drum+kit&type=models&licenses=322a749bcfa841b29dff1e8a1bb74b0b
   - Download as GLB

6. **Xylophone**
   - Direct: https://sketchfab.com/search?q=xylophone&type=models&licenses=322a749bcfa841b29dff1e8a1bb74b0b
   - Download as GLB

7. **Guitar**
   - Direct: https://sketchfab.com/search?q=acoustic+guitar&type=models&licenses=322a749bcfa841b29dff1e8a1bb74b0b
   - Download as GLB

8. **Piano**
   - Direct: https://sketchfab.com/search?q=piano&type=models&licenses=322a749bcfa841b29dff1e8a1bb74b0b
   - Download as GLB

### Download Process

1. **Click search link above**
2. **Filter by:**
   - License: "CC0" (Public Domain)
   - Downloadable: Yes
   - Animated: No
3. **Choose a model** (look for low poly count)
4. **Click "Download 3D Model"**
5. **Select "Original format (GLB)"**
6. **Save to** `mobile-musical-game/assets/models/`
7. **Rename** to match convention:
   - `ranat-ek-medium.glb`
   - `drums-medium.glb`
   - etc.

### Alternative: Free3D

If Sketchfab doesn't have what you need:
- https://free3d.com/3d-models/musical-instruments
- Filter by "Free" and "GLB/GLTF" format

## 🔊 Audio Samples from Freesound

### Direct Search Links

**Thai Instruments:**

1. **Ranat Ek (Xylophone)**
   - https://freesound.org/search/?q=xylophone&f=license:%22Creative+Commons+0%22
   - Download 5-10 different notes
   - Rename: `ranat-ek-c4.wav`, `ranat-ek-d4.wav`, etc.

2. **Mong (Gong)**
   - https://freesound.org/search/?q=gong&f=license:%22Creative+Commons+0%22
   - Download 3 variations (soft, medium, hard)
   - Rename: `mong-soft.wav`, `mong-medium.wav`, `mong-hard.wav`

3. **Klong Thad (Drum)**
   - https://freesound.org/search/?q=drum+hit&f=license:%22Creative+Commons+0%22
   - Download 3-5 drum hits
   - Rename: `klong-thad-center.wav`, etc.

4. **Jakhe (Zither)**
   - https://freesound.org/search/?q=zither&f=license:%22Creative+Commons+0%22
   - Alternative: Search "harp pluck"
   - Download 5-10 notes

**International Instruments:**

5. **Drums**
   - Kick: https://freesound.org/search/?q=kick+drum&f=license:%22Creative+Commons+0%22
   - Snare: https://freesound.org/search/?q=snare+drum&f=license:%22Creative+Commons+0%22
   - Hi-hat: https://freesound.org/search/?q=hihat&f=license:%22Creative+Commons+0%22
   - Download 2-3 of each

6. **Xylophone**
   - https://freesound.org/search/?q=xylophone&f=license:%22Creative+Commons+0%22
   - Download 8-13 notes

7. **Guitar**
   - https://freesound.org/search/?q=acoustic+guitar&f=license:%22Creative+Commons+0%22
   - Download 10-15 notes

8. **Piano**
   - https://freesound.org/search/?q=piano+note&f=license:%22Creative+Commons+0%22
   - Download 20-30 notes (full range)

### Download Process

1. **Click search link**
2. **Listen to preview** (click play button)
3. **Check license** (must be CC0 or CC-BY)
4. **Click "Download"** button
5. **Save to** `mobile-musical-game/assets/audio/`
6. **Organize by instrument:**
   ```
   assets/audio/
   ├── thai/
   │   ├── ranat-ek/
   │   ├── mong/
   │   └── klong-thad/
   └── international/
       ├── drums/
       ├── xylophone/
       └── guitar/
   ```

### Alternative: Philharmonia Orchestra

High-quality orchestral samples (free):
- https://philharmonia.co.uk/resources/sound-samples/
- Download instrument packs
- Extract and organize

## 📸 Screenshots

### Option 1: Run App and Capture

```bash
# Start the app
cd mobile-musical-game
npm start

# Press 'i' for iOS simulator
# Press 'a' for Android emulator

# Take screenshots:
# iOS: Cmd + S
# Android: Screenshot button in emulator toolbar
```

### Option 2: Use Expo Go on Real Device

```bash
# Start app
npm start

# Scan QR code with Expo Go app
# Navigate through screens
# Take screenshots on your device
```

### Required Screenshots

1. **Instrument Library** - Main screen with all instruments
2. **Playing Ranat Ek** - Thai xylophone being played
3. **Playing Drums** - Drum kit being played
4. **Settings Screen** - Settings with preferences
5. **Cultural Info** - Information panel (optional)

### Add Device Frames

1. Go to https://mockuphone.com/
2. Upload your screenshots
3. Select device (iPhone 14 Pro, Pixel 7, etc.)
4. Download with frame

## 🤖 Automated Download Script

I've created a script to help you track downloads:

```bash
# Run the asset tracker
cd mobile-musical-game
bash scripts/download-assets.sh
```

This will:
- Show you what's missing
- Provide direct links
- Track your progress

## ✅ Quick Checklist

### Graphics
- [ ] Convert icon.svg to icon.png (1024x1024)
- [ ] Convert icon.svg to adaptive-icon.png (1024x1024)
- [ ] Convert splash.svg to splash-icon.png (1284x2778)

### 3D Models (Minimum 5)
- [ ] Ranat Ek (xylophone)
- [ ] Drums (drum kit)
- [ ] Guitar
- [ ] Piano
- [ ] Xylophone

### Audio Samples (Minimum 20)
- [ ] Ranat Ek: 5 notes
- [ ] Drums: 5 sounds (kick, snare, hi-hat, tom, cymbal)
- [ ] Guitar: 5 notes
- [ ] Piano: 5 notes

### Screenshots
- [ ] Library screen
- [ ] Playing screen

## 🎯 Fastest Path (1 Hour)

1. **Graphics** (10 min)
   - Convert SVGs online: https://svgtopng.com/

2. **3D Models** (20 min)
   - Sketchfab: Download 5 models
   - Save to `assets/models/`

3. **Audio** (20 min)
   - Freesound: Download 20 samples
   - Save to `assets/audio/`

4. **Screenshots** (10 min)
   - Run app: `npm start`
   - Take 2 screenshots

## 🆘 Troubleshooting

### Can't find good 3D models?
- Use simple geometric shapes (see `scripts/generate-3d-models.js`)
- Or purchase from TurboSquid ($5-20 per model)

### Can't find audio samples?
- Use synthesized tones (see audio README)
- Or purchase sample packs ($10-50)

### Screenshots look bad?
- Use device frames: https://mockuphone.com/
- Add text overlays in Canva
- Ensure good lighting/contrast

## 📞 Direct Links Summary

**Graphics:**
- SVG to PNG: https://svgtopng.com/
- Figma: https://figma.com/

**3D Models:**
- Sketchfab: https://sketchfab.com/search?type=models&licenses=322a749bcfa841b29dff1e8a1bb74b0b
- Free3D: https://free3d.com/3d-models/musical-instruments

**Audio:**
- Freesound: https://freesound.org/
- Philharmonia: https://philharmonia.co.uk/resources/sound-samples/

**Screenshots:**
- Mockuphone: https://mockuphone.com/

---

**Ready to download?** Start with graphics (easiest), then 3D models, then audio! 🎵
