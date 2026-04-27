#!/bin/bash

# Create Placeholder Assets Script
# Generates simple placeholder files for testing deployment

echo "🎨 Creating placeholder assets for deployment testing..."

# Create directories
mkdir -p assets/models
mkdir -p assets/audio/thai
mkdir -p assets/audio/international
mkdir -p assets/data
mkdir -p screenshots/ios
mkdir -p screenshots/android

# Create placeholder text files (will be replaced with real assets)
echo "Placeholder for 3D model" > assets/models/placeholder.txt
echo "Placeholder for audio samples" > assets/audio/placeholder.txt

# Create instruments metadata JSON
cat > assets/data/instruments.json << 'EOF'
{
  "instruments": [
    {
      "id": "ranat-ek",
      "name": { "english": "Ranat Ek", "thai": "ระนาดเอก" },
      "nationality": "thai",
      "playingMethod": "striking",
      "category": "percussion",
      "model3D": {
        "low": "assets/models/ranat-ek-low.glb",
        "medium": "assets/models/ranat-ek-medium.glb",
        "high": "assets/models/ranat-ek-high.glb"
      },
      "audioSamples": {
        "samples": [
          { "note": "C4", "file": "assets/audio/thai/ranat-ek/c4.wav" }
        ]
      },
      "interactionZones": [
        {
          "id": "bar-1",
          "type": "strike",
          "bounds": { "x": -1.4, "y": 0.1, "width": 0.12, "height": 0.6 }
        }
      ],
      "culturalInfo": {
        "description": {
          "english": "A Thai xylophone with 21 wooden bars arranged over a boat-shaped resonator.",
          "thai": "ระนาดไม้ไทยที่มี 21 แป้นไม้เรียงอยู่เหนือตัวก้องรูปเรือ"
        },
        "origin": "Thailand",
        "usage": "Used in traditional Thai classical music ensembles (Piphat)",
        "funFacts": [
          "The bars are made from rosewood or bamboo",
          "Each bar is tuned by shaving the underside"
        ]
      }
    },
    {
      "id": "mong",
      "name": { "english": "Mong", "thai": "ฆ้อง" },
      "nationality": "thai",
      "playingMethod": "striking",
      "category": "percussion",
      "model3D": {
        "low": "assets/models/mong-low.glb",
        "medium": "assets/models/mong-medium.glb",
        "high": "assets/models/mong-high.glb"
      },
      "audioSamples": {
        "samples": [
          { "note": "strike", "file": "assets/audio/thai/mong/strike.wav" }
        ]
      },
      "interactionZones": [
        {
          "id": "gong-center",
          "type": "strike",
          "bounds": { "x": 0, "y": 0, "width": 0.5, "height": 0.5 }
        }
      ],
      "culturalInfo": {
        "description": {
          "english": "A Thai gong made of bronze, producing a deep resonant sound.",
          "thai": "ฆ้องทองเหลืองไทยที่ให้เสียงก้องลึก"
        },
        "origin": "Thailand",
        "usage": "Used in Thai classical music and temple ceremonies"
      }
    },
    {
      "id": "drums",
      "name": { "english": "Drums", "thai": "กลอง" },
      "nationality": "international",
      "playingMethod": "striking",
      "category": "percussion",
      "model3D": {
        "low": "assets/models/drums-low.glb",
        "medium": "assets/models/drums-medium.glb",
        "high": "assets/models/drums-high.glb"
      },
      "audioSamples": {
        "samples": [
          { "note": "kick", "file": "assets/audio/international/drums/kick.wav" },
          { "note": "snare", "file": "assets/audio/international/drums/snare.wav" }
        ]
      },
      "interactionZones": [
        {
          "id": "kick",
          "type": "strike",
          "bounds": { "x": 0, "y": 0, "width": 0.5, "height": 0.4 }
        },
        {
          "id": "snare",
          "type": "strike",
          "bounds": { "x": -0.5, "y": 0.5, "width": 0.25, "height": 0.25 }
        }
      ],
      "culturalInfo": {
        "description": {
          "english": "A drum kit consisting of bass drum, snare, toms, and cymbals.",
          "thai": "ชุดกลองประกอบด้วยกลองเบส สแนร์ ทอม และฉาบ"
        },
        "origin": "International",
        "usage": "Used in rock, jazz, pop, and many other music genres"
      }
    },
    {
      "id": "guitar",
      "name": { "english": "Guitar", "thai": "กีตาร์" },
      "nationality": "international",
      "playingMethod": "plucked",
      "category": "string",
      "model3D": {
        "low": "assets/models/guitar-low.glb",
        "medium": "assets/models/guitar-medium.glb",
        "high": "assets/models/guitar-high.glb"
      },
      "audioSamples": {
        "samples": [
          { "note": "E2", "file": "assets/audio/international/guitar/e2.wav" },
          { "note": "A2", "file": "assets/audio/international/guitar/a2.wav" }
        ]
      },
      "interactionZones": [
        {
          "id": "string-1",
          "type": "pluck",
          "bounds": { "x": 0.4, "y": 0, "width": 0.02, "height": 1.5 }
        }
      ],
      "culturalInfo": {
        "description": {
          "english": "A stringed instrument with 6 strings, played by plucking or strumming.",
          "thai": "เครื่องดนตรีสาย 6 สาย เล่นโดยการดีดหรือสี"
        },
        "origin": "Spain",
        "usage": "Used in classical, flamenco, rock, pop, and folk music"
      }
    },
    {
      "id": "piano",
      "name": { "english": "Piano", "thai": "เปียโน" },
      "nationality": "international",
      "playingMethod": "pressed",
      "category": "keyboard",
      "model3D": {
        "low": "assets/models/piano-low.glb",
        "medium": "assets/models/piano-medium.glb",
        "high": "assets/models/piano-high.glb"
      },
      "audioSamples": {
        "samples": [
          { "note": "C4", "file": "assets/audio/international/piano/c4.wav" },
          { "note": "D4", "file": "assets/audio/international/piano/d4.wav" }
        ]
      },
      "interactionZones": [
        {
          "id": "key-c4",
          "type": "press",
          "bounds": { "x": -0.9, "y": 0.42, "width": 0.035, "height": 0.2 }
        }
      ],
      "culturalInfo": {
        "description": {
          "english": "A keyboard instrument with 88 keys, producing sound via hammers striking strings.",
          "thai": "เครื่องดนตรีคีย์บอร์ด 88 คีย์ ให้เสียงโดยค้อนตีสาย"
        },
        "origin": "Italy",
        "usage": "Used in classical, jazz, pop, and many other music genres"
      }
    }
  ]
}
EOF

echo "✓ Created instruments.json"

# Create README for assets
cat > assets/README.md << 'EOF'
# Assets Directory

This directory contains all game assets.

## Current Status

⚠️ **Placeholder assets only** - Real assets need to be created before deployment.

## Required Assets

1. **3D Models** (48 files)
   - See `models/README.md` for specifications
   - Download from Sketchfab or create in Blender

2. **Audio Samples** (~500 files)
   - See `audio/README.md` for specifications
   - Download from Freesound.org or record

3. **App Graphics**
   - icon.png (1024x1024)
   - adaptive-icon.png (1024x1024)
   - splash-icon.png (1284x2778)

## Next Steps

1. Read `ASSET_CREATION_GUIDE.md` in project root
2. Create or download required assets
3. Place files in appropriate directories
4. Test in app before deployment

## Quick Start

For fastest deployment:
1. Download 5 free 3D models from Sketchfab
2. Download 20 audio samples from Freesound.org
3. Create app icon using Canva
4. Take 2 screenshots of running app

Total time: 2-4 hours
EOF

echo "✓ Created assets README"

# Create deployment checklist
cat > DEPLOYMENT_CHECKLIST.txt << 'EOF'
# Deployment Checklist

## Before Building

### Assets
[ ] App icon (1024x1024) created
[ ] Adaptive icon (1024x1024) created
[ ] Splash screen (1284x2778) created
[ ] At least 2 screenshots captured
[ ] At least 5 3D models added
[ ] At least 20 audio samples added
[ ] instruments.json updated

### Configuration
[ ] Bundle identifiers updated in app.json
[ ] Company name updated in app.json
[ ] Version numbers set
[ ] Privacy policy URL added
[ ] Support email set

### Accounts
[ ] Expo account created
[ ] Google Play Console account ($25)
[ ] Apple Developer account ($99/year)

## Building

[ ] EAS CLI installed: npm install -g eas-cli
[ ] Logged in: eas login
[ ] Project configured: eas build:configure
[ ] Android build: eas build --platform android --profile production
[ ] iOS build: eas build --platform ios --profile production

## Store Submission

### Google Play
[ ] App created in Play Console
[ ] Store listing completed
[ ] Screenshots uploaded
[ ] Content rating completed
[ ] Pricing set (Free)
[ ] Countries selected
[ ] AAB file uploaded
[ ] Submitted for review

### Apple App Store
[ ] App created in App Store Connect
[ ] App information completed
[ ] Screenshots uploaded (all sizes)
[ ] Description written
[ ] Keywords added
[ ] Privacy policy URL added
[ ] IPA file uploaded
[ ] Submitted for review

## Post-Submission

[ ] Monitor review status
[ ] Respond to any rejection feedback
[ ] Prepare marketing materials
[ ] Plan launch announcement
[ ] Set up analytics
[ ] Prepare support channels

## After Approval

[ ] Announce launch on social media
[ ] Monitor crash reports
[ ] Respond to user reviews
[ ] Plan first update
[ ] Gather user feedback

---

Current Status: Assets need to be created
Next Step: Follow ASSET_CREATION_GUIDE.md
EOF

echo "✓ Created deployment checklist"

echo ""
echo "✅ Placeholder assets created!"
echo ""
echo "📁 Created:"
echo "  - assets/data/instruments.json"
echo "  - assets/README.md"
echo "  - DEPLOYMENT_CHECKLIST.txt"
echo ""
echo "⚠️  Next Steps:"
echo "  1. Read ASSET_CREATION_GUIDE.md"
echo "  2. Create real assets (2-4 hours)"
echo "  3. Follow QUICK_START_DEPLOYMENT.md"
echo ""
echo "🚀 You're ready to start creating assets!"
