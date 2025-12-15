# 🌐 Deploy Evoworks to the Web

## ⚡ Get Your Live Website in 5 Minutes!

---

## Option 1: Vercel (Easiest)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd "/Users/zachreynolds/Desktop/Echos Marketplace"
vercel
```

### Step 3: Answer Questions
- Set up and deploy? **Y**
- Which scope? **Your account**
- Link to existing project? **N**
- Project name? **evoworks**
- Directory? **Press Enter** (current directory)
- Want to override settings? **N**

### Result:
```
✅ Deployed to: https://evoworks-xyz.vercel.app
```

---

## Option 2: Netlify

### Via Web Interface:
1. Go to https://app.netlify.com
2. Drag and drop the `out` folder
3. Done! Get your link

### Via CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=out
```

---

## Option 3: GitHub Pages

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/evoworks.git
git push -u origin main
```

### 2. Enable GitHub Pages
- Go to repo → Settings → Pages
- Source: GitHub Actions
- Deploy `out` folder

---

## 🎯 Your Live Website Will Include:

✅ All 10 pages  
✅ 3D animations  
✅ Retro animations  
✅ Dark/orange theme  
✅ PWA installable  
✅ Fast & responsive  

---

## 📱 Custom Domain (Optional)

### On Vercel:
```bash
vercel domains add evoworks.com
```

### On Netlify:
- Site settings → Domain management → Add custom domain

---

## 🚀 Deploy Now!

**Fastest way:**
```bash
npm install -g vercel
vercel
```

Get your live link in 2 minutes! 🌐

