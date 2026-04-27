# Audio Samples Directory

This directory contains audio samples for all musical instruments.

## Required Audio Files

### Thai Traditional Instruments

#### 1. Ranat Ek (Thai Xylophone)
- **Files**: `ranat-ek-c4.wav`, `ranat-ek-d4.wav`, `ranat-ek-e4.wav`, etc.
- **Notes**: 21 notes (chromatic scale)
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Duration**: 2-3 seconds per note

#### 2. Mong (Thai Gong)
- **Files**: `mong-strike-soft.wav`, `mong-strike-medium.wav`, `mong-strike-hard.wav`
- **Variations**: 3 velocity levels
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Duration**: 5-8 seconds (with decay)

#### 3. Klong Thad (Thai Drum)
- **Files**: `klong-thad-center.wav`, `klong-thad-edge.wav`, `klong-thad-rim.wav`
- **Zones**: 3 hit zones
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Duration**: 1-2 seconds

#### 4. Jakhe (Thai Zither)
- **Files**: `jakhe-string1-c3.wav`, `jakhe-string2-g3.wav`, `jakhe-string3-c4.wav`
- **Notes**: 12 notes per string (3 strings)
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Duration**: 2-3 seconds

#### 5. Saw Duang (Thai Fiddle)
- **Files**: `saw-duang-c4.wav`, `saw-duang-d4.wav`, etc.
- **Notes**: 24 notes (2 octaves)
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Duration**: 2-3 seconds

#### 6. Pin (Thai Lute)
- **Files**: `pin-string1-c3.wav`, `pin-string2-g3.wav`, `pin-string3-c4.wav`
- **Notes**: 12 notes per string (3 strings)
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Duration**: 2-3 seconds

#### 7. Khim (Thai Hammered Dulcimer)
- **Files**: `khim-c4.wav`, `khim-d4.wav`, etc.
- **Notes**: 36 notes (3 octaves)
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Duration**: 2-3 seconds

#### 8. Khaen (Thai Mouth Organ)
- **Files**: `khaen-c4.wav`, `khaen-d4.wav`, etc.
- **Notes**: 16 notes (2 octaves)
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Duration**: 2-3 seconds (sustained)

### International Instruments

#### 1. Drums
- **Files**: 
  - `drums-kick.wav` (bass drum)
  - `drums-snare.wav` (snare drum)
  - `drums-tom-high.wav`, `drums-tom-mid.wav`, `drums-tom-low.wav`
  - `drums-hihat-closed.wav`, `drums-hihat-open.wav`
  - `drums-crash.wav`, `drums-ride.wav`
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Duration**: 0.5-2 seconds

#### 2. Xylophone
- **Files**: `xylophone-c4.wav`, `xylophone-d4.wav`, etc.
- **Notes**: 13 notes (chromatic scale)
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Duration**: 1-2 seconds

#### 3. Marimba
- **Files**: `marimba-c3.wav`, `marimba-d3.wav`, etc.
- **Notes**: 25 notes (2 octaves)
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Duration**: 2-3 seconds

#### 4. Guitar
- **Files**: `guitar-string1-e2.wav`, `guitar-string2-a2.wav`, etc.
- **Notes**: 20 notes per string (6 strings)
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Duration**: 2-3 seconds

#### 5. Harp
- **Files**: `harp-c2.wav`, `harp-d2.wav`, etc.
- **Notes**: 47 notes (pedal harp range)
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Duration**: 3-4 seconds

#### 6. Ukulele
- **Files**: `ukulele-string1-a4.wav`, `ukulele-string2-e4.wav`, etc.
- **Notes**: 12 notes per string (4 strings)
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Duration**: 2-3 seconds

#### 7. Piano
- **Files**: `piano-a0.wav`, `piano-a#0.wav`, etc.
- **Notes**: 88 notes (full piano range)
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Duration**: 3-5 seconds

#### 8. Accordion
- **Files**: `accordion-c3.wav`, `accordion-d3.wav`, etc.
- **Notes**: 41 notes (treble keyboard)
- **Format**: WAV, 44.1kHz, 16-bit, mono
- **Duration**: 2-3 seconds (sustained)

## Audio Specifications

### Format Requirements
- **Container**: WAV (uncompressed) or M4A (compressed)
- **Sample Rate**: 44.1kHz minimum (48kHz recommended)
- **Bit Depth**: 16-bit minimum (24-bit for source)
- **Channels**: Mono (stereo acceptable but will be converted)
- **Normalization**: Peak at -3dB to prevent clipping

### File Naming Convention
```
{instrument-name}-{note/zone}-{variation}.wav
```

Examples:
- `ranat-ek-c4.wav`
- `drums-snare-soft.wav`
- `guitar-string1-e2.wav`

### Quality Levels
1. **High Quality** (Original)
   - 48kHz, 24-bit
   - Uncompressed WAV
   - For production/editing

2. **Production Quality** (App)
   - 44.1kHz, 16-bit
   - Compressed M4A (AAC, 128kbps)
   - For app distribution

3. **Low Quality** (Optional)
   - 22.05kHz, 16-bit
   - Compressed M4A (AAC, 64kbps)
   - For low-bandwidth scenarios

## Recording Guidelines

### Equipment
- **Microphone**: Condenser mic (recommended)
- **Interface**: Audio interface with 24-bit/48kHz support
- **Environment**: Quiet room with minimal reverb
- **Monitoring**: Studio headphones

### Recording Process
1. **Setup**: Position mic 6-12 inches from instrument
2. **Levels**: Record at -12dB to -6dB peak
3. **Takes**: Record multiple takes per note
4. **Consistency**: Maintain consistent mic position

### Post-Processing
1. **Trim**: Remove silence at start/end (leave 50ms)
2. **Normalize**: Peak normalize to -3dB
3. **EQ**: Remove unwanted frequencies
4. **Noise Reduction**: Remove background noise
5. **Fade**: Add short fade-out (100-200ms)
6. **Export**: Save as WAV 44.1kHz 16-bit

## Sourcing Audio Samples

### Option 1: Record Yourself
- Rent or borrow instruments
- Use a decent microphone
- Record in a quiet space
- Follow recording guidelines above

### Option 2: Sample Libraries
- **Freesound**: https://freesound.org/ (CC licenses)
- **Splice**: https://splice.com/sounds (subscription)
- **Native Instruments**: Professional sample libraries
- **Kontakt Libraries**: High-quality sampled instruments

### Option 3: Synthesize
- Use software synthesizers
- Generate procedural sounds
- Export as audio files

### Option 4: Purchase
- **AudioJungle**: https://audiojungle.net/
- **Loopmasters**: https://www.loopmasters.com/
- **Sample Magic**: https://www.samplemagic.com/

## Licensing

### Requirements
- **Commercial Use**: Must allow commercial use
- **Attribution**: Check if attribution required
- **Modifications**: Must allow modifications
- **Distribution**: Must allow redistribution

### Recommended Licenses
- **CC0** (Public Domain)
- **CC BY** (Attribution)
- **CC BY-SA** (Attribution-ShareAlike)
- **Royalty-Free** (Purchased)

### Avoid
- **CC BY-NC** (Non-Commercial)
- **CC BY-ND** (No Derivatives)
- **Copyrighted** (Without permission)

## Audio Processing Tools

### Free Tools
- **Audacity**: Audio editor (Windows/Mac/Linux)
- **Ocenaudio**: Simple audio editor
- **WavePad**: Audio editor

### Professional Tools
- **Adobe Audition**: Professional audio editor
- **Logic Pro**: Mac DAW with audio editing
- **Pro Tools**: Industry standard DAW
- **Reaper**: Affordable DAW

## Testing Audio

### Quality Checks
1. **Playback**: Listen on different devices
2. **Latency**: Test with app (<100ms target)
3. **Volume**: Ensure consistent levels
4. **Clipping**: Check for distortion
5. **Noise**: Listen for background noise

### Performance Checks
1. **File Size**: Keep under 500KB per sample
2. **Load Time**: Test loading speed
3. **Memory**: Monitor memory usage
4. **Polyphony**: Test multiple simultaneous notes

## Placeholder Audio

Until real samples are available, use:
- **Synthesized tones**: Simple sine/square waves
- **MIDI playback**: Software synthesizer
- **Sample packs**: Free sample libraries
- **Text-to-speech**: For testing only

## Compression

### For App Distribution
```bash
# Convert WAV to M4A (AAC)
ffmpeg -i input.wav -c:a aac -b:a 128k output.m4a

# Batch convert all WAV files
for file in *.wav; do
  ffmpeg -i "$file" -c:a aac -b:a 128k "${file%.wav}.m4a"
done
```

### Optimization
- Use M4A (AAC) for smaller file sizes
- Target 128kbps for good quality
- Use 64kbps for low-quality version
- Keep WAV originals for future use

## File Organization

```
assets/audio/
├── thai/
│   ├── ranat-ek/
│   │   ├── ranat-ek-c4.wav
│   │   ├── ranat-ek-d4.wav
│   │   └── ...
│   ├── mong/
│   ├── klong-thad/
│   └── ...
└── international/
    ├── drums/
    ├── xylophone/
    ├── guitar/
    └── ...
```

## Resources

- **Freesound**: https://freesound.org/
- **Audacity**: https://www.audacityteam.org/
- **FFmpeg**: https://ffmpeg.org/
- **Audio Engineering Society**: https://www.aes.org/

## Next Steps

1. **Source or record** audio samples
2. **Process** samples (trim, normalize, export)
3. **Organize** files by instrument
4. **Test** in app for quality and latency
5. **Optimize** file sizes for distribution
6. **Document** licenses and attributions

---

**Note**: Audio quality directly impacts user experience. Invest time in getting good samples!
