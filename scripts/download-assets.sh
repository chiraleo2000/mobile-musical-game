#!/bin/bash

# Asset Download Tracker and Helper Script
# Helps you track which assets you've downloaded and provides direct links

echo "🎵 Mobile Musical Instrument Game - Asset Download Helper"
echo "=========================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if assets exist
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ] && [ "$(ls -A $1 2>/dev/null)" ]; then
        count=$(ls -1 $1 2>/dev/null | wc -l)
        echo -e "${GREEN}✓${NC} $2 ($count files)"
        return 0
    else
        echo -e "${RED}✗${NC} $2 (empty or missing)"
        return 1
    fi
}

# Count totals
total=0
completed=0

echo -e "${BLUE}📱 App Graphics${NC}"
echo "-------------------"
((total+=3))
check_file "assets/icon.png" "App Icon (1024x1024)" && ((completed++))
check_file "assets/adaptive-icon.png" "Adaptive Icon (1024x1024)" && ((completed++))
check_file "assets/splash-icon.png" "Splash Screen (1284x2778)" && ((completed++))

if [ ! -f "assets/icon.png" ]; then
    echo -e "${YELLOW}  → Convert assets/icon.svg to PNG:${NC}"
    echo "     https://svgtopng.com/"
fi

echo ""
echo -e "${BLUE}🎨 3D Models${NC}"
echo "-------------------"
((total+=5))
check_file "assets/models/ranat-ek-medium.glb" "Ranat Ek (Thai Xylophone)" && ((completed++))
check_file "assets/models/drums-medium.glb" "Drums (Drum Kit)" && ((completed++))
check_file "assets/models/guitar-medium.glb" "Guitar" && ((completed++))
check_file "assets/models/piano-medium.glb" "Piano" && ((completed++))
check_file "assets/models/xylophone-medium.glb" "Xylophone" && ((completed++))

if [ ! -f "assets/models/ranat-ek-medium.glb" ]; then
    echo -e "${YELLOW}  → Download from Sketchfab:${NC}"
    echo "     https://sketchfab.com/search?q=xylophone&type=models&licenses=322a749bcfa841b29dff1e8a1bb74b0b"
fi

echo ""
echo -e "${BLUE}🔊 Audio Samples${NC}"
echo "-------------------"
((total+=4))
check_dir "assets/audio/thai/ranat-ek" "Ranat Ek samples" && ((completed++))
check_dir "assets/audio/international/drums" "Drum samples" && ((completed++))
check_dir "assets/audio/international/guitar" "Guitar samples" && ((completed++))
check_dir "assets/audio/international/piano" "Piano samples" && ((completed++))

if [ ! -d "assets/audio/thai/ranat-ek" ] || [ -z "$(ls -A assets/audio/thai/ranat-ek 2>/dev/null)" ]; then
    echo -e "${YELLOW}  → Download from Freesound:${NC}"
    echo "     https://freesound.org/search/?q=xylophone&f=license:%22Creative+Commons+0%22"
fi

echo ""
echo -e "${BLUE}📸 Screenshots${NC}"
echo "-------------------"
((total+=2))
check_file "screenshots/library.png" "Library Screen" && ((completed++))
check_file "screenshots/playing.png" "Playing Screen" && ((completed++))

if [ ! -f "screenshots/library.png" ]; then
    echo -e "${YELLOW}  → Take screenshots:${NC}"
    echo "     1. Run: npm start"
    echo "     2. Press 'i' for iOS or 'a' for Android"
    echo "     3. Take screenshots (Cmd+S or Screenshot button)"
fi

echo ""
echo "=========================================================="
echo -e "${BLUE}Progress: $completed/$total assets complete${NC}"

percentage=$((completed * 100 / total))
if [ $percentage -eq 100 ]; then
    echo -e "${GREEN}🎉 All assets complete! Ready to deploy!${NC}"
elif [ $percentage -ge 50 ]; then
    echo -e "${YELLOW}⚠️  More than halfway there! Keep going!${NC}"
else
    echo -e "${RED}⚠️  Still need more assets. Follow the guide below.${NC}"
fi

echo ""
echo "=========================================================="
echo -e "${BLUE}📖 Quick Links${NC}"
echo ""
echo "Graphics:"
echo "  • SVG to PNG: https://svgtopng.com/"
echo "  • Figma: https://figma.com/"
echo ""
echo "3D Models:"
echo "  • Sketchfab: https://sketchfab.com/search?type=models&licenses=322a749bcfa841b29dff1e8a1bb74b0b"
echo "  • Free3D: https://free3d.com/3d-models/musical-instruments"
echo ""
echo "Audio Samples:"
echo "  • Freesound: https://freesound.org/"
echo "  • Philharmonia: https://philharmonia.co.uk/resources/sound-samples/"
echo ""
echo "Screenshots:"
echo "  • Run app: npm start"
echo "  • Add frames: https://mockuphone.com/"
echo ""
echo "=========================================================="
echo -e "${BLUE}📚 Documentation${NC}"
echo ""
echo "  • Complete guide: ASSET_DOWNLOAD_GUIDE.md"
echo "  • Asset creation: ASSET_CREATION_GUIDE.md"
echo "  • Deployment: QUICK_START_DEPLOYMENT.md"
echo ""
echo "=========================================================="

# Create missing directories
echo ""
echo -e "${BLUE}🔧 Creating missing directories...${NC}"
mkdir -p assets/models
mkdir -p assets/audio/thai/ranat-ek
mkdir -p assets/audio/thai/mong
mkdir -p assets/audio/thai/klong-thad
mkdir -p assets/audio/international/drums
mkdir -p assets/audio/international/guitar
mkdir -p assets/audio/international/piano
mkdir -p assets/audio/international/xylophone
mkdir -p screenshots
echo -e "${GREEN}✓${NC} Directories created"

echo ""
echo -e "${GREEN}Ready to download assets!${NC}"
echo "Follow ASSET_DOWNLOAD_GUIDE.md for step-by-step instructions."
