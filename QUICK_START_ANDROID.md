# 🚀 Quick Start: Build Evoworks AAB

## ⚡ 5-Minute Guide to Your First AAB

---

## ✅ Prerequisites Check

```bash
# Do you have Android Studio installed?
# If NO → Download: https://developer.android.com/studio
# If YES → Continue below!
```

---

## 🎯 Build Your AAB in 5 Steps

### Step 1: Open Android Studio
```bash
cd "/Users/zachreynolds/Desktop/Echos Marketplace"
npx cap open android
```

**Wait for:** Gradle sync to complete (5-10 mins first time)

---

### Step 2: Generate Signed Bundle
1. Click **Build** menu
2. Click **Generate Signed Bundle / APK**
3. Select **Android App Bundle**
4. Click **Next**

---

### Step 3: Create Keystore
1. Click **Create new...**
2. Fill in:
   - **Key store path:** Choose a safe location
   - **Password:** Create strong password (SAVE THIS!)
   - **Alias:** evoworks
   - **Validity:** 25 years
   - **First/Last Name:** Your name
   - **Organization:** Evoworks
3. Click **OK**

---

### Step 4: Build
1. Click **Next**
2. Select **release** variant
3. Click **Finish**
4. Wait 2-5 minutes

---

### Step 5: Find Your AAB
```
Location: android/app/release/app-release.aab

Size: ~15-20 MB
```

---

## 🎉 Done!

You now have an **Android App Bundle** ready for Google Play!

### Next Steps:
1. Go to [Google Play Console](https://play.google.com/console)
2. Create app
3. Upload AAB
4. Fill in store listing
5. Publish!

---

## 🆘 Troubleshooting

### "Android Studio not found"
```bash
# Install from:
https://developer.android.com/studio
```

### "Gradle sync failed"
```bash
# In Android Studio:
# File → Invalidate Caches → Invalidate and Restart
```

### "Build failed"
```bash
# Clean and rebuild:
cd android
./gradlew clean
cd ..
npx cap sync android
npx cap open android
```

---

## 📱 Test Before Publishing

### Quick Test APK:
```bash
cd android
./gradlew assembleDebug

# APK at: app/build/outputs/apk/debug/app-debug.apk
# Install: adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 🦇 That's It!

Your Evoworks app is ready for the world! 🚀

**Questions?** Check `AAB_READY.md` for full details.

