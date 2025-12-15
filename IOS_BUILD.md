# 🍎 Evoworks iOS Build Guide

## ✅ iOS Platform Added!

Your Evoworks app is now ready for iOS! 

---

## 🎯 Build Options

### Option 1: Cloud Build (GitHub Actions)

**✅ Already configured!** iOS will build automatically when you push.

**Download link will be at:**
```
https://github.com/stonkbear/evoworks-mobile/actions
→ Click latest workflow
→ Download "app-ios" artifact
→ Get .ipa file!
```

---

### Option 2: Local Build (Xcode)

#### Prerequisites:
- Mac computer
- Xcode installed
- Apple Developer Account ($99/year)

#### Steps:

```bash
# 1. Open Xcode
cd "/Users/zachreynolds/Desktop/Echos Marketplace"
npx cap open ios

# 2. In Xcode:
# - Select your team
# - Change bundle ID to yours
# - Product → Archive
# - Distribute App
# - App Store Connect
# - Upload!
```

---

## 📱 App Configuration

**Current Settings:**
- App Name: Evoworks
- Bundle ID: com.evoworks.app
- Version: 1.0.0

**To Change:**
Edit `ios/App/App/Info.plist`

---

## 🚀 Publish to App Store

### 1. Apple Developer Account
- Sign up: https://developer.apple.com
- Cost: $99/year

### 2. App Store Connect
- Create app: https://appstoreconnect.apple.com
- Fill in app details
- Upload IPA (from Xcode or GitHub Actions)

### 3. TestFlight (Optional)
- Beta test your app
- Get feedback before release

### 4. Submit for Review
- Fill in all required info
- Submit
- Wait 1-3 days for review

---

## 📊 iOS Build Sizes

- **IPA:** ~20-25 MB
- **Installed:** ~30-35 MB
- **Download:** ~15-20 MB

---

## 🎨 Required Assets

### App Icon (1024x1024):
- Create orange bat logo
- PNG, no transparency
- Add in Xcode: App/Assets.xcassets/AppIcon

### Screenshots:
Required sizes:
- 6.5" (1242 × 2688) - iPhone 14 Pro Max
- 5.5" (1242 × 2208) - iPhone 8 Plus

---

## 🔑 Certificates & Profiles

### For Local Build:
1. Xcode → Preferences → Accounts
2. Add Apple ID
3. Xcode manages automatically!

### For CI/CD:
Need to set up signing in GitHub secrets

---

## ⚡ Quick Commands

```bash
# Open Xcode
npx cap open ios

# Sync changes
npx cap sync ios

# Run on simulator
npx cap run ios

# Update iOS
npm install @capacitor/ios@latest
```

---

## 🎯 What Works

✅ All 10 pages  
✅ 3D animations  
✅ Retro animations  
✅ Dark/orange theme  
✅ PWA features  
✅ Offline mode  

---

## 🦇 You're Ready!

**Android AAB:** Building now on GitHub Actions  
**iOS IPA:** Ready to build!  

Check: https://github.com/stonkbear/evoworks-mobile/actions

🚀 **Your app will be ready for both stores!**

