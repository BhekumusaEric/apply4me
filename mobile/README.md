# Apply4Me Mobile App 📱

**Empowering South African students to access higher education opportunities on mobile**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS  
npm run ios

# Build for production
npm run build:android
npm run build:ios
```

## 📱 Features

### ✅ **Core Features**
- 🏫 **Institution Browser** - Explore universities, colleges, TVET
- 💰 **Bursary Finder** - Discover funding opportunities
- 📝 **Application Management** - Submit and track applications
- 💳 **Mobile Payments** - Secure payment processing
- 👤 **User Profile** - Manage personal information

### ✅ **Mobile-Specific Features**
- 📷 **Document Camera** - Capture documents with phone camera
- 📱 **Push Notifications** - Deadline reminders and updates
- 🔒 **Biometric Auth** - Fingerprint/Face ID login
- 📴 **Offline Mode** - Access saved data without internet
- 🌙 **Dark Mode** - Automatic theme switching

### ✅ **South African Optimizations**
- 🇿🇦 **Local Content** - SA universities and institutions
- 💰 **Rand Currency** - All prices in South African Rand
- 📞 **Local Support** - SA phone numbers and addresses
- 🌍 **Data Efficiency** - Optimized for mobile data

## 🛠 Tech Stack

- **Framework:** React Native with Expo
- **Navigation:** React Navigation 6
- **UI Library:** React Native Paper (Material Design)
- **State Management:** React Context + Hooks
- **Backend:** Shared with web app (Next.js API)
- **Database:** Supabase (shared with web)
- **Notifications:** Expo Notifications
- **Camera:** Expo Camera + Image Picker

## 📁 Project Structure

```
mobile/
├── App.tsx                 # Main app entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── src/
│   ├── screens/           # App screens
│   ├── components/        # Reusable components
│   ├── context/          # React context providers
│   ├── services/         # API and external services
│   ├── utils/            # Helper functions
│   └── types/            # TypeScript types
└── assets/               # Images, fonts, icons
```

## 🎯 Development Roadmap

### **Phase 1: Core App** ✅
- [x] Basic navigation structure
- [x] Authentication screens
- [x] Institution browsing
- [x] User profile management

### **Phase 2: Applications** 🚧
- [ ] Application form screens
- [ ] Document upload with camera
- [ ] Payment integration
- [ ] Application tracking

### **Phase 3: Enhanced Features** 📋
- [ ] Push notifications
- [ ] Offline capabilities
- [ ] Biometric authentication
- [ ] Advanced search and filters

### **Phase 4: Store Deployment** 📋
- [ ] Google Play Store optimization
- [ ] App Store preparation
- [ ] Beta testing program
- [ ] Production release

## 🔧 Development Setup

1. **Install Expo CLI:**
   ```bash
   npm install -g @expo/cli
   ```

2. **Install dependencies:**
   ```bash
   cd mobile && npm install
   ```

3. **Start development:**
   ```bash
   npm start
   ```

4. **Test on device:**
   - Install Expo Go app on your phone
   - Scan QR code from terminal
   - App will load on your device

## 📱 Platform Support

- **Android:** API level 21+ (Android 5.0+)
- **iOS:** iOS 11.0+
- **Web:** Progressive Web App support

## 🚀 Deployment

### **Android (Google Play Store)**
```bash
# Build APK for testing
npm run build:android

# Submit to Play Store
npm run submit:android
```

### **iOS (App Store)**
```bash
# Build for iOS
npm run build:ios

# Submit to App Store
npm run submit:ios
```

## 📞 Support

- **Email:** support@apply4me.co.za
- **Phone:** +27 (0) 11 123 4567
- **Website:** https://apply4me-eta.vercel.app

---

**Built with ❤️ for South African students**
