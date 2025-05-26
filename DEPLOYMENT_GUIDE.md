# 🚀 Apply4Me Deployment Guide

## 📱 **GOOGLE PLAY STORE DEPLOYMENT**

### **Prerequisites**
1. **Google Play Console Account** ($25 one-time fee)
2. **Expo Account** (free)
3. **EAS CLI** installed globally

### **Step 1: Setup Expo Account**
```bash
# Install EAS CLI
npm install -g @expo/cli eas-cli

# Login to Expo
npx expo login
```

### **Step 2: Initialize Mobile App**
```bash
# Navigate to mobile app directory
cd apply4me-mobile

# Install dependencies
npm install

# Initialize EAS
eas init --id apply4me-sa-mobile
```

### **Step 3: Build Android APK**
```bash
# Build preview APK for testing
eas build --platform android --profile preview

# Build production AAB for Google Play
eas build --platform android --profile production
```

### **Step 4: Submit to Google Play Store**
```bash
# Submit to Google Play Console
eas submit --platform android
```

---

## 🔄 **CI/CD WORKFLOW**

### **Branch Strategy**
- **`main`** - Production branch (auto-deploys to live site)
- **`develop`** - Development branch (auto-deploys to staging)
- **Feature branches** - Create from develop, merge via PR

### **Safe Development Process**
1. **Create feature branch from develop:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request:**
   - Go to GitHub repository
   - Create PR from feature branch to `develop`
   - Automated tests will run
   - Preview deployment will be created
   - Review and merge when ready

4. **Deploy to production:**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

### **Automated Checks**
- ✅ **Build validation** - Ensures code compiles
- ✅ **Lint checks** - Code quality validation
- ✅ **Security audit** - Dependency vulnerability scan
- ✅ **Performance tests** - Lighthouse CI checks
- ✅ **Health checks** - API endpoint validation

---

## 🛡️ **SAFETY FEATURES**

### **Branch Protection**
- **Main branch** is protected
- **Require PR reviews** before merging
- **Require status checks** to pass
- **No direct pushes** to main

### **Preview Deployments**
- Every PR gets a **preview URL**
- Test changes before merging
- Automatic updates with new commits

### **Health Monitoring**
- **API health endpoint:** `/api/health`
- **Automated monitoring** in CI/CD
- **Performance tracking** with Lighthouse

---

## 📱 **MOBILE APP ASSETS NEEDED**

### **Required Assets**
1. **App Icon** (1024x1024 PNG)
2. **Adaptive Icon** (512x512 PNG)
3. **Splash Screen** (1242x2436 PNG)
4. **Feature Graphic** (1024x500 PNG)
5. **Screenshots** (Phone + Tablet)

### **Store Listing Content**
- **App Title:** "Apply4Me - SA Student Applications"
- **Short Description:** "Simplifying higher education applications for South African students"
- **Full Description:** Ready in `mobile/store-metadata/`
- **Keywords:** university, college, applications, bursaries, south africa

---

## 🔧 **ENVIRONMENT SETUP**

### **Required Environment Variables**
```bash
# Vercel (for web deployment)
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# Expo (for mobile deployment)
EXPO_TOKEN=your_expo_token

# Supabase (for database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### **GitHub Secrets Setup**
1. Go to GitHub repository settings
2. Navigate to "Secrets and variables" > "Actions"
3. Add all required environment variables as secrets

---

## 🚀 **DEPLOYMENT COMMANDS**

### **Web Platform**
```bash
# Build and test locally
npm run build
npm start

# Deploy to staging (develop branch)
git push origin develop

# Deploy to production (main branch)
git push origin main
```

### **Mobile App**
```bash
# Test mobile app locally
cd apply4me-mobile
npx expo start

# Build for testing
eas build --platform android --profile preview

# Build for production
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

---

## 📊 **MONITORING & ANALYTICS**

### **Health Checks**
- **Web:** https://apply4me-eta.vercel.app/api/health
- **Database:** Automatic connection testing
- **Performance:** Lighthouse CI reports

### **Error Tracking**
- **Build failures:** GitHub Actions notifications
- **Runtime errors:** Vercel error tracking
- **Performance issues:** Lighthouse alerts

---

## 🎯 **NEXT STEPS**

### **Immediate Actions**
1. **Set up Google Play Console account**
2. **Create Expo account and get tokens**
3. **Add GitHub secrets for CI/CD**
4. **Create app assets (icons, screenshots)**
5. **Test mobile app build process**

### **Future Enhancements**
1. **iOS App Store deployment**
2. **Advanced monitoring setup**
3. **Automated testing expansion**
4. **Performance optimization**
5. **User analytics integration**

---

## 📞 **SUPPORT**

### **Documentation**
- **Expo:** https://docs.expo.dev/
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **Google Play:** https://developer.android.com/distribute/console

### **Troubleshooting**
- **Build issues:** Check EAS build logs
- **Deployment failures:** Review GitHub Actions logs
- **App store rejections:** Follow Google Play policies

---

**🎉 You're ready to deploy Apply4Me to Google Play Store!**
