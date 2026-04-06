# Block Smash Puzzle — Deployment Guide

Complete step-by-step guide to deploy on **Google Play Store**, **Apple App Store**, and the **Web**.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [AdMob Setup](#2-admob-setup)
3. [Generate App Icons (PNG)](#3-generate-app-icons-png)
4. [Google Play Store Deployment](#4-google-play-store-deployment)
5. [Apple App Store Deployment](#5-apple-app-store-deployment)
6. [Web Deployment (Docker)](#6-web-deployment-docker)
7. [Post-Launch Checklist](#7-post-launch-checklist)

---

## 1. Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | https://nodejs.org |
| Android Studio | Latest | https://developer.android.com/studio |
| Xcode | 15+ | Mac App Store |
| CocoaPods | Latest | `sudo gem install cocoapods` |
| Java JDK | 17 | `brew install openjdk@17` |

```bash
# Verify installations
node -v && npm -v
java -version
xcodebuild -version
pod --version
```

---

## 2. AdMob Setup

### 2.1 Create AdMob Account
1. Go to https://admob.google.com
2. Sign in with your Google account
3. Accept terms & create account

### 2.2 Register Your App
1. **Apps → Add App → Android** → Enter app name "Block Smash Puzzle"
2. Repeat for **iOS**
3. Note both **App IDs** (format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)

### 2.3 Create Ad Units (for each platform)
| Ad Type | Where Used | Format |
|---------|-----------|--------|
| Banner | Bottom of game screen | Adaptive Banner |
| Interstitial | Between games (every 3rd game) | Full Screen |
| Rewarded | "Continue" after game over | Rewarded Video |

### 2.4 Replace Placeholder IDs

**File: `public/game.js`** — Find and replace:
```
ca-app-pub-XXXXXXXXXXXXX/XXXXXXXXXX  →  Your real ad unit IDs
```

**File: `capacitor.config.json`** — Update:
```json
"AdMob": {
  "appIdAndroid": "ca-app-pub-XXXXX~XXXXX",  // Your Android App ID
  "appIdIos": "ca-app-pub-XXXXX~XXXXX",      // Your iOS App ID
  "initializeForTesting": false               // ← Change to false for production!
}
```

---

## 3. Generate App Icons (PNG)

The stores require PNG icons. Install `sharp` and convert:

```bash
cd /Users/vaibhavsinha/block-smash-puzzle

# Option A: Use @capacitor/assets (recommended)
npm install -g @capacitor/assets
# Place a 1024x1024 PNG at assets/icon.png, then:
npx capacitor-assets generate --iconBackgroundColor '#0a0a2e'

# Option B: Manual with sharp
npm install sharp --save-dev
node -e "
const sharp = require('sharp');
const sizes = [48, 72, 96, 144, 192, 512, 1024];
const svg = '<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1024 1024\"><rect width=\"1024\" height=\"1024\" rx=\"200\" fill=\"#0a0a2e\"/><rect x=\"180\" y=\"180\" width=\"180\" height=\"180\" rx=\"20\" fill=\"#4ecdc4\"/><rect x=\"400\" y=\"180\" width=\"180\" height=\"180\" rx=\"20\" fill=\"#ff6b6b\"/><rect x=\"180\" y=\"400\" width=\"180\" height=\"180\" rx=\"20\" fill=\"#ffd93d\"/><rect x=\"400\" y=\"400\" width=\"180\" height=\"180\" rx=\"20\" fill=\"#6c5ce7\"/><rect x=\"620\" y=\"400\" width=\"180\" height=\"180\" rx=\"20\" fill=\"#4ecdc4\"/><rect x=\"400\" y=\"620\" width=\"180\" height=\"180\" rx=\"20\" fill=\"#ff6b6b\"/><rect x=\"620\" y=\"620\" width=\"180\" height=\"180\" rx=\"20\" fill=\"#ffd93d\"/></svg>';
sizes.forEach(s => sharp(Buffer.from(svg)).resize(s,s).png().toFile('assets/icon-'+s+'.png'));
console.log('Icons generated');
"

# Copy to Android res folders
cp assets/icon-48.png android/app/src/main/res/mipmap-mdpi/ic_launcher.png
cp assets/icon-72.png android/app/src/main/res/mipmap-hdpi/ic_launcher.png
cp assets/icon-96.png android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
cp assets/icon-144.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
cp assets/icon-192.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
```

---

## 4. Google Play Store Deployment

### 4.1 Create Signing Keystore

```bash
cd /Users/vaibhavsinha/block-smash-puzzle

keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore block-smash-release.keystore \
  -alias block-smash \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=Your Name, OU=Dev, O=Your Company, L=City, ST=State, C=US"
```

> ⚠️ **CRITICAL:** Back up this keystore file! You cannot update your app without it.

### 4.2 Configure Gradle Signing

Create `android/app/signing.properties`:
```properties
storeFile=../../block-smash-release.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=block-smash
keyPassword=YOUR_KEY_PASSWORD
```

Add to `android/app/build.gradle` inside `android { }`:
```groovy
signingConfigs {
    release {
        def props = new Properties()
        props.load(new FileInputStream(file("signing.properties")))
        storeFile file(props['storeFile'])
        storePassword props['storePassword']
        keyAlias props['keyAlias']
        keyPassword props['keyPassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 4.3 Build Release AAB

```bash
cd /Users/vaibhavsinha/block-smash-puzzle

# Sync latest web code
npx cap sync android

# Build Android App Bundle (required by Play Store)
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### 4.4 Submit to Google Play

1. Go to https://play.google.com/console
2. **Create Developer Account** ($25 one-time fee)
3. **Create App** → Fill in details from `store-listing/google-play.md`
4. **Upload Screenshots** (phone + 7" tablet + 10" tablet)
   - Phone: 1080×1920 or 1440×2560
   - Tablet 7": 1200×1920
   - Tablet 10": 1600×2560
5. **App Content** → Set content rating (Everyone), target audience, privacy policy
6. **Release → Production → Create Release → Upload AAB**
7. **Review & Roll Out** → Submit for review (typically 1-7 days)

---

## 5. Apple App Store Deployment

### 5.1 Apple Developer Account
1. Go to https://developer.apple.com/programs/
2. Enroll ($99/year)
3. Wait for approval (up to 48 hours)

### 5.2 Configure Xcode Project

```bash
cd /Users/vaibhavsinha/block-smash-puzzle

# Sync latest web code
npx cap sync ios

# Open in Xcode
npx cap open ios
```

In Xcode:
1. **Select the "App" target** in the project navigator
2. **Signing & Capabilities tab:**
   - Team: Select your Apple Developer Team
   - Bundle Identifier: `com.blocksmash.puzzle`
   - Check "Automatically manage signing"
3. **General tab:**
   - Display Name: Block Smash Puzzle
   - Version: 1.0.0
   - Build: 1
   - Deployment Target: iOS 16.0
   - Device Orientation: Portrait only
4. **Info.plist — Add:**
   - `GADApplicationIdentifier` → Your AdMob iOS App ID
   - `SKAdNetworkItems` → Google's SKAdNetwork IDs
   - `NSUserTrackingUsageDescription` → "This helps us show relevant ads"

### 5.3 Add App Icons in Xcode
1. Open `Assets.xcassets` → `AppIcon`
2. Drag your 1024×1024 PNG icon
3. Xcode auto-generates all required sizes

### 5.4 Build & Archive

1. In Xcode: **Product → Scheme → Edit Scheme → Archive → Release**
2. Select **"Any iOS Device"** as build target
3. **Product → Archive**
4. In the Organizer window: **Distribute App → App Store Connect → Upload**

### 5.5 Submit to App Store Connect

1. Go to https://appstoreconnect.apple.com
2. **My Apps → + → New App**
3. Fill in details from `store-listing/apple-app-store.md`
4. **Upload Screenshots** (required sizes):
   - iPhone 6.7" (1290×2796) — iPhone 15 Pro Max
   - iPhone 6.5" (1284×2778) — iPhone 14 Plus
   - iPad Pro 12.9" (2048×2732)
5. **App Review Information:**
   - Notes: "This is a single-player puzzle game. Tap 'Play' on the splash screen to begin."
6. **Submit for Review** (typically 24-48 hours)

---

## 6. Web Deployment (Docker)

### Option A: Railway (Easiest)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login & deploy
railway login
railway init
railway up
```

### Option B: Render

1. Push code to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo
4. Build Command: `npm install --production`
5. Start Command: `node server.js`
6. Done!

### Option C: Docker (Any VPS)

```bash
cd /Users/vaibhavsinha/block-smash-puzzle

# Build image
docker build -t block-smash-puzzle .

# Run container
docker run -d -p 3000:3000 --name block-smash block-smash-puzzle

# With environment variables
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  --restart unless-stopped \
  --name block-smash \
  block-smash-puzzle
```

### Option D: AWS (Your Expertise)

```bash
# ECR Push
aws ecr create-repository --repository-name block-smash-puzzle
docker tag block-smash-puzzle:latest <aws-account-id>.dkr.ecr.<region>.amazonaws.com/block-smash-puzzle
docker push <aws-account-id>.dkr.ecr.<region>.amazonaws.com/block-smash-puzzle

# Deploy via ECS/Fargate or Elastic Beanstalk
# Or simply: EC2 with Docker installed
```

---

## 7. Post-Launch Checklist

### Week 1
- [ ] Monitor crash reports (Firebase Crashlytics / Xcode Organizer)
- [ ] Check AdMob dashboard for ad fill rates
- [ ] Respond to any app review rejections
- [ ] Set up Firebase Analytics for user tracking

### Week 2-4
- [ ] Analyze retention metrics (Day 1, Day 7)
- [ ] A/B test ad frequency (every 3rd vs 5th game over)
- [ ] Add "Rate Us" prompt after 5 games
- [ ] Implement "Remove Ads" IAP ($2.99)

### Month 2+
- [ ] Add new block shapes / game modes
- [ ] Seasonal themes (holiday colors)
- [ ] Daily challenges
- [ ] Cloud leaderboard (AWS API Gateway + DynamoDB)
- [ ] Localize to top markets (Spanish, Portuguese, Hindi, Japanese)

---

## Revenue Projections (Based on Industry Averages)

| Metric | Conservative | Moderate | Optimistic |
|--------|-------------|----------|------------|
| Daily Downloads | 50 | 500 | 5,000 |
| DAU (30d) | 200 | 2,000 | 20,000 |
| Ad Revenue/DAU | $0.02 | $0.04 | $0.06 |
| Monthly Ad Revenue | $120 | $2,400 | $36,000 |
| IAP Revenue | $50 | $500 | $5,000 |

> Block Blast reached 303M downloads in 2024. Even capturing 0.01% of that market = 30,000 downloads.

---

## Quick Commands Reference

```bash
# Development
cd /Users/vaibhavsinha/block-smash-puzzle
node server.js                    # Start dev server at localhost:3000

# Sync & Build
npx cap sync                      # Sync web → native
npx cap open android              # Open in Android Studio
npx cap open ios                  # Open in Xcode

# Android Release
cd android && ./gradlew bundleRelease

# Run on device
npx cap run android               # Deploy to connected Android device
npx cap run ios                   # Deploy to connected iPhone
```

---

**Built with ❤️ — Good luck on the stores!**
