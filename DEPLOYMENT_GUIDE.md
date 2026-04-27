# Deployment Guide: Mobile Musical Instrument Game

This guide covers deploying the app to Google Play Store and Apple App Store using Expo.

## Prerequisites

### Required Accounts
1. **Expo Account** - Sign up at https://expo.dev
2. **Google Play Console Account** - $25 one-time fee at https://play.google.com/console
3. **Apple Developer Account** - $99/year at https://developer.apple.com

### Required Tools
```bash
# Install EAS CLI (Expo Application Services)
npm install -g eas-cli

# Login to Expo
eas login
```

## Step 1: Configure App for Production

### 1.1 Update app.json with Production Settings

The app.json file needs production configuration. Key settings:
- App name and slug
- Version numbers
- Bundle identifiers
- Icons and splash screens
- Permissions
- Store listings

### 1.2 Add Missing Assets

Before building, you need:
- **App Icon** (1024x1024 PNG) → `assets/icon.png`
- **Adaptive Icon** (1024x1024 PNG) → `assets/adaptive-icon.png`
- **Splash Screen** (1284x2778 PNG) → `assets/splash-icon.png`
- **Instrument 3D Models** → `assets/models/`
- **Audio Samples** → `assets/audio/`

## Step 2: Initialize EAS Build

```bash
cd mobile-musical-game

# Initialize EAS in your project
eas build:configure
```

This creates `eas.json` with build profiles.

## Step 3: Build for Android (Google Play Store)

### 3.1 Create Android Build

```bash
# Build APK for testing
eas build --platform android --profile preview

# Build AAB (Android App Bundle) for Play Store
eas build --platform android --profile production
```

### 3.2 Download the Build

After the build completes (10-20 minutes), download the `.aab` file from the Expo dashboard or CLI.

### 3.3 Upload to Google Play Console

1. Go to https://play.google.com/console
2. Create a new app
3. Fill in store listing details:
   - App name: "Mobile Musical Instrument Game"
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (at least 2)
   - Feature graphic (1024x500)
   - App icon (512x512)
4. Go to "Release" → "Production" → "Create new release"
5. Upload the `.aab` file
6. Complete content rating questionnaire
7. Set pricing (Free)
8. Select countries
9. Submit for review

**Review time**: 1-7 days

## Step 4: Build for iOS (Apple App Store)

### 4.1 Create iOS Build

```bash
# Build for App Store
eas build --platform ios --profile production
```

**Note**: You'll need to provide:
- Apple Developer credentials
- App Store Connect API key (recommended)

### 4.2 Download the Build

After the build completes (15-30 minutes), download the `.ipa` file.

### 4.3 Upload to App Store Connect

**Option A: Using EAS Submit (Recommended)**
```bash
eas submit --platform ios
```

**Option B: Manual Upload**
1. Go to https://appstoreconnect.apple.com
2. Create a new app
3. Fill in app information:
   - App name
   - Primary language
   - Bundle ID
   - SKU
4. Use Transporter app to upload `.ipa`
5. Complete App Store listing:
   - Screenshots (required for all device sizes)
   - Description
   - Keywords
   - Support URL
   - Privacy policy URL
6. Submit for review

**Review time**: 1-3 days (typically 24-48 hours)

## Step 5: Automated Submission (Optional)

### 5.1 Submit to Both Stores

```bash
# Submit to Google Play
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios

# Submit to both
eas submit --platform all
```

## Step 6: Over-The-Air (OTA) Updates

After initial release, you can push updates without rebuilding:

```bash
# Publish update
eas update --branch production --message "Bug fixes and improvements"
```

**Note**: OTA updates work for JavaScript/React code changes only. Native code changes require new builds.

## Important Configuration Files

### app.json - Key Settings

```json
{
  "expo": {
    "name": "Musical Instruments",
    "slug": "mobile-musical-game",
    "version": "1.0.0",
    "orientation": "default",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#4A90E2"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.musicalinstruments",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSMicrophoneUsageDescription": "This app uses the microphone for audio playback."
      }
    },
    "android": {
      "package": "com.yourcompany.musicalinstruments",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4A90E2"
      },
      "permissions": [
        "RECORD_AUDIO",
        "MODIFY_AUDIO_SETTINGS"
      ]
    }
  }
}
```

### eas.json - Build Profiles

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      }
    }
  }
}
```

## Pre-Launch Checklist

### Required Before Submission

- [ ] All 696 tests passing
- [ ] App icon (1024x1024)
- [ ] Splash screen
- [ ] Privacy policy URL
- [ ] Support email/URL
- [ ] App screenshots (2-8 per platform)
- [ ] App description (short and full)
- [ ] Content rating completed
- [ ] Pricing set
- [ ] Target countries selected

### Assets Needed

- [ ] 3D instrument models (GLB format)
- [ ] Audio samples (WAV/M4A, 44.1kHz)
- [ ] Instrument metadata JSON
- [ ] App store screenshots:
  - Android: 1080x1920 (portrait), 1920x1080 (landscape)
  - iOS: Multiple sizes for different devices
- [ ] Feature graphic (Android): 1024x500
- [ ] Promotional video (optional)

### Legal Requirements

- [ ] Privacy policy (required for both stores)
- [ ] Terms of service (recommended)
- [ ] Content rating questionnaire
- [ ] Age rating appropriate
- [ ] Copyright clearance for audio samples
- [ ] Trademark clearance for instrument names

## Testing Before Release

### 1. Internal Testing

```bash
# Build for internal testing
eas build --platform android --profile preview
eas build --platform ios --profile preview

# Share with testers
```

### 2. Beta Testing

**Android (Google Play)**
- Use "Internal testing" track (up to 100 testers)
- Or "Closed testing" track (unlimited testers)

**iOS (TestFlight)**
- Automatically available after App Store Connect upload
- Add testers via email
- Up to 10,000 external testers

### 3. Test Checklist

- [ ] App launches successfully
- [ ] All instruments load correctly
- [ ] Audio playback works
- [ ] 3D rendering performs well
- [ ] Touch interactions responsive
- [ ] Settings save correctly
- [ ] App handles background/foreground
- [ ] No crashes or errors
- [ ] Works on different screen sizes
- [ ] Works on both phones and tablets

## Post-Launch

### Monitor Performance

1. **Google Play Console**
   - Crashes & ANRs
   - User reviews
   - Install metrics

2. **App Store Connect**
   - Crashes
   - User reviews
   - Download metrics

### Update Strategy

1. **Patch Updates** (1.0.1, 1.0.2)
   - Bug fixes
   - Minor improvements
   - Use OTA updates when possible

2. **Minor Updates** (1.1.0, 1.2.0)
   - New features
   - New instruments
   - Requires new build

3. **Major Updates** (2.0.0)
   - Major redesigns
   - Breaking changes
   - Requires new build

## Troubleshooting

### Common Build Errors

**Error: Missing credentials**
```bash
# Configure credentials
eas credentials
```

**Error: Build failed - Out of memory**
- Increase resource class in eas.json
- Optimize asset sizes

**Error: Invalid bundle identifier**
- Check app.json ios.bundleIdentifier
- Must match Apple Developer account

### Common Submission Errors

**Android: Missing privacy policy**
- Add privacy policy URL to Play Console

**iOS: Missing screenshots**
- Provide screenshots for all required device sizes

**iOS: Binary rejected - Performance**
- Optimize app size
- Reduce asset sizes
- Enable Hermes engine

## Cost Breakdown

### One-Time Costs
- Google Play Developer: $25
- Apple Developer: $99/year

### Build Costs (Expo EAS)
- Free tier: Limited builds/month
- Production tier: $29/month (unlimited builds)
- Enterprise tier: $99/month (priority builds)

### Optional Costs
- App store optimization (ASO) tools
- Analytics services
- Push notification services
- Backend hosting (if needed)

## Next Steps

1. **Immediate**: Create Expo account and install EAS CLI
2. **Day 1**: Configure app.json and create required assets
3. **Day 2**: Run first test build for Android
4. **Day 3**: Run first test build for iOS
5. **Week 1**: Internal testing with team
6. **Week 2**: Beta testing with external users
7. **Week 3**: Submit to both stores
8. **Week 4**: Launch! 🚀

## Support Resources

- **Expo Documentation**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **EAS Submit**: https://docs.expo.dev/submit/introduction/
- **Google Play Console Help**: https://support.google.com/googleplay/android-developer
- **App Store Connect Help**: https://developer.apple.com/help/app-store-connect/

## Questions?

For deployment assistance:
1. Check Expo documentation
2. Visit Expo forums: https://forums.expo.dev
3. Join Expo Discord: https://chat.expo.dev
4. Review Google/Apple developer guidelines

---

**Ready to deploy?** Start with Step 1 and work through each section carefully. Good luck with your launch! 🎵🎮
