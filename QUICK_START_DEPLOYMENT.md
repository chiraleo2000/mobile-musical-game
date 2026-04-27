# Quick Start: Deploy to App Stores

Follow these steps to deploy your app to Google Play Store and Apple App Store.

## Prerequisites Setup (15 minutes)

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Create Expo Account
- Go to https://expo.dev/signup
- Sign up for free account

### 3. Login to EAS
```bash
cd mobile-musical-game
eas login
```

### 4. Initialize EAS Project
```bash
eas build:configure
```

This will:
- Create `eas.json` (already created)
- Link your project to Expo
- Generate a project ID

## Android Deployment (Google Play Store)

### Step 1: Create Google Play Developer Account
- Go to https://play.google.com/console
- Pay $25 one-time registration fee
- Complete account setup

### Step 2: Build Android App
```bash
# For testing (APK)
eas build --platform android --profile preview

# For production (AAB - App Bundle)
eas build --platform android --profile production
```

**Build time**: 10-20 minutes

### Step 3: Download Build
After build completes:
```bash
# Download from CLI
eas build:list

# Or download from: https://expo.dev/accounts/[your-account]/projects/mobile-musical-game/builds
```

### Step 4: Upload to Google Play Console

1. **Create App**
   - Go to Play Console → "Create app"
   - App name: "Musical Instruments"
   - Default language: English
   - App type: Game
   - Free/Paid: Free

2. **Store Listing**
   - Short description (80 chars max)
   - Full description (4000 chars max)
   - Upload 2-8 screenshots
   - Upload app icon (512x512)
   - Upload feature graphic (1024x500)

3. **Release**
   - Go to "Release" → "Production"
   - Upload the `.aab` file
   - Release name: "1.0.0"
   - Release notes

4. **Content Rating**
   - Complete questionnaire
   - Submit for rating

5. **Pricing & Distribution**
   - Select countries
   - Confirm free app

6. **Submit for Review**
   - Review time: 1-7 days

## iOS Deployment (Apple App Store)

### Step 1: Create Apple Developer Account
- Go to https://developer.apple.com/programs/
- Pay $99/year
- Complete enrollment (can take 24-48 hours)

### Step 2: Build iOS App
```bash
eas build --platform ios --profile production
```

**Build time**: 15-30 minutes

You'll be prompted for:
- Apple ID
- App-specific password (create at appleid.apple.com)

### Step 3: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - Platform: iOS
   - Name: "Musical Instruments"
   - Primary Language: English
   - Bundle ID: com.yourcompany.musicalinstruments
   - SKU: mobile-musical-game-001

### Step 4: Submit Build

**Option A: Automatic (Recommended)**
```bash
eas submit --platform ios
```

**Option B: Manual**
- Download `.ipa` file
- Use Transporter app to upload

### Step 5: Complete App Store Listing

1. **App Information**
   - Category: Games > Music
   - Content rights
   - Age rating

2. **Pricing**
   - Price: Free
   - Availability: All countries

3. **App Privacy**
   - Complete privacy questionnaire
   - Add privacy policy URL

4. **Screenshots** (Required)
   - iPhone 6.7": 1290 x 2796 (2-10 images)
   - iPhone 6.5": 1284 x 2778 (2-10 images)
   - iPad Pro 12.9": 2048 x 2732 (2-10 images)

5. **Description**
   - Promotional text (170 chars)
   - Description (4000 chars)
   - Keywords (100 chars)
   - Support URL
   - Marketing URL (optional)

6. **Submit for Review**
   - Review time: 24-48 hours typically

## Build Both Platforms at Once

```bash
# Build for both platforms
eas build --platform all

# Submit to both stores
eas submit --platform all
```

## Testing Before Production

### Internal Testing (Recommended)

```bash
# Build preview versions
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

**Android**: Share APK directly with testers
**iOS**: Automatically available in TestFlight

### Add Testers

**TestFlight (iOS)**:
1. Go to App Store Connect
2. Select your app → TestFlight
3. Add internal testers (up to 100)
4. Add external testers (up to 10,000)

**Google Play Internal Testing**:
1. Go to Play Console
2. Release → Testing → Internal testing
3. Create email list
4. Share testing link

## Required Assets Checklist

Before building, ensure you have:

- [ ] App icon (1024x1024 PNG) at `assets/icon.png`
- [ ] Adaptive icon (1024x1024 PNG) at `assets/adaptive-icon.png`
- [ ] Splash screen (1284x2778 PNG) at `assets/splash-icon.png`
- [ ] Privacy policy URL
- [ ] Support email
- [ ] App screenshots (2-8 per platform)
- [ ] App description (short and full)

## Update Bundle Identifiers

Before building, update in `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.musicalinstruments"
    },
    "android": {
      "package": "com.yourcompany.musicalinstruments"
    }
  }
}
```

Replace `yourcompany` with your actual company/developer name.

## Common Commands Reference

```bash
# Login to Expo
eas login

# Check build status
eas build:list

# View build logs
eas build:view [build-id]

# Configure credentials
eas credentials

# Update app (OTA - no rebuild needed)
eas update --branch production --message "Bug fixes"

# Check project status
eas project:info

# Build specific profile
eas build --profile preview
eas build --profile production
```

## Costs Summary

### Required
- **Google Play**: $25 one-time
- **Apple Developer**: $99/year

### Optional (Expo EAS)
- **Free tier**: Limited builds per month
- **Production**: $29/month (unlimited builds)
- **Enterprise**: $99/month (priority + features)

## Troubleshooting

### Build Failed
```bash
# View detailed logs
eas build:view [build-id]

# Clear cache and retry
eas build --platform android --clear-cache
```

### Credentials Issues
```bash
# Reset credentials
eas credentials

# Remove and re-add
eas credentials --platform ios
```

### App Rejected
- Check rejection reason in store console
- Fix issues
- Increment version/build number
- Rebuild and resubmit

## Next Steps After Approval

1. **Monitor**: Check crash reports and reviews daily
2. **Update**: Push OTA updates for bug fixes
3. **Iterate**: Add new features based on feedback
4. **Market**: Share on social media, get reviews
5. **Analyze**: Track downloads and user engagement

## Support

- **Expo Docs**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Forums**: https://forums.expo.dev
- **Discord**: https://chat.expo.dev

---

**Ready to start?** Run `eas login` and follow the steps above! 🚀
