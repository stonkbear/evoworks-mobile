# 📱 Evoworks - Download Your Apps!

## 🎉 Both Android & iOS Are Building Now!

---

## 📍 Download Links

### 🤖 Android AAB (Play Store)

**Your AAB is building right now!**

**Get it here:**
```
https://github.com/stonkbear/evoworks-mobile/actions
```

**Steps:**
1. Click on the **"Build Android AAB"** workflow
2. Wait ~10 minutes for it to finish ✅
3. Scroll down to **"Artifacts"**
4. Click **"app-release"** to download
5. Unzip to get `app-release.aab`

**Direct link after build completes:**
`https://github.com/stonkbear/evoworks-mobile/actions/runs/XXXXX`

---

### 🍎 iOS IPA (App Store)

**Your iOS app is also building!**

**Get it here:**
```
https://github.com/stonkbear/evoworks-mobile/actions
```

**Steps:**
1. Click on the **"Build iOS App"** workflow
2. Wait ~15 minutes for it to finish ✅
3. Scroll down to **"Artifacts"**
4. Click **"app-ios"** to download
5. Get your `.ipa` file!

---

## ⏱️ Build Status

Check current builds:
```
https://github.com/stonkbear/evoworks-mobile/actions
```

**Build times:**
- Android: ~10 minutes ⏳
- iOS: ~15 minutes ⏳

---

## 📦 What You Get

### Android AAB:
- **File:** `app-release.aab`
- **Size:** ~15-20 MB
- **Use:** Upload to Google Play Console

### iOS IPA:
- **File:** `Evoworks.ipa`
- **Size:** ~20-25 MB
- **Use:** Upload to App Store Connect (or TestFlight)

---

## 🚀 Submit to Stores

### Google Play Store:
1. Go to: https://play.google.com/console
2. Create app
3. Upload your AAB
4. Fill in store listing
5. Submit!

### Apple App Store:
1. Go to: https://appstoreconnect.apple.com
2. Create app
3. Upload IPA (via Xcode or Transporter)
4. Fill in app details
5. Submit for review

---

## 🔄 Update Your Apps

When you make changes:

```bash
cd "/Users/zachreynolds/Desktop/Echos Marketplace"

# Make your changes...
npm run build

# Push to trigger new builds
git add .
git commit -m "Update app"
git push

# New AAB & IPA will build automatically!
# Download from Actions tab
```

---

## 📊 Quick Reference

| Platform | Build Time | Download | Submit To |
|----------|-----------|----------|-----------|
| **Android** | ~10 min | [Actions](https://github.com/stonkbear/evoworks-mobile/actions) | Play Store |
| **iOS** | ~15 min | [Actions](https://github.com/stonkbear/evoworks-mobile/actions) | App Store |

---

## ✅ Checklist

### For Play Store:
- [ ] Wait for AAB to build
- [ ] Download from GitHub Actions
- [ ] Create Google Play developer account ($25)
- [ ] Upload AAB
- [ ] Add screenshots & description
- [ ] Submit

### For App Store:
- [ ] Wait for IPA to build
- [ ] Download from GitHub Actions
- [ ] Get Apple Developer account ($99/year)
- [ ] Upload IPA
- [ ] Add screenshots & description
- [ ] Submit for review

---

## 🎯 Current Status

✅ **Android project:** Ready  
✅ **iOS project:** Ready  
⏳ **Builds:** In progress  
📍 **Check:** https://github.com/stonkbear/evoworks-mobile/actions

---

## 🆘 Troubleshooting

### "Build failed"
- Check Actions logs for errors
- Most common: Need to add secrets for signing

### "Can't download"
- Build must complete first (green checkmark ✅)
- Look in Artifacts section at bottom

### "Want to build locally instead"
**Android:** `npx cap open android`  
**iOS:** `npx cap open ios` (Mac only)

---

## 🦇 You're All Set!

**Your apps are building in the cloud!**

**Check status:**
👉 https://github.com/stonkbear/evoworks-mobile/actions

**Download when ready:**
- Android AAB (10 mins)
- iOS IPA (15 mins)

Then submit to stores! 🚀

