# 🎓 Apply4Me Project Handover Documentation

## 📋 Project Overview

**Apply4Me** is a comprehensive South African student application platform that simplifies higher education applications. Students can apply to universities, colleges, and TVET institutions across all 9 provinces with a single application.

### 🌐 Live Environment
- **Production URL**: https://apply4me-eta.vercel.app
- **Admin Panel**: https://apply4me-eta.vercel.app/admin-panel
- **Repository**: https://github.com/BhekumusaEric/apply4me.git

### 🎯 Project Status
- ✅ **Production Ready**: Fully deployed and operational
- ✅ **Database**: Connected and healthy (Supabase)
- ✅ **Admin System**: Fully functional with user management
- ✅ **Payment Integration**: PayFast and Capitec QR implemented
- ✅ **Mobile App**: React Native app available
- ✅ **CI/CD**: Automated deployment via Vercel

## 🏗️ Architecture Overview

### **Tech Stack**
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: PayFast, Capitec QR Code
- **Mobile**: React Native (Expo)
- **Deployment**: Vercel (Production), GitHub Actions (CI/CD)
- **Monitoring**: Built-in health checks and admin analytics

### **Key Features**
1. **Student Portal**: Application management, profile setup, document upload
2. **Admin Panel**: User management, application tracking, notifications
3. **Institution Management**: 15+ institutions with programs and requirements
4. **Payment Processing**: Multiple payment methods with verification
5. **Notification System**: Real-time notifications and email alerts
6. **Mobile App**: Cross-platform mobile application
7. **Automation**: Web scraping for institution data updates

## 📁 Project Structure

```
apply4me/
├── app/                    # Next.js App Router
│   ├── admin-panel/       # Main Admin Interface
│   ├── api/               # Backend API Routes
│   │   ├── admin/         # Admin-specific APIs
│   │   ├── auth/          # Authentication
│   │   ├── payments/      # Payment processing
│   │   └── institutions/  # Institution data
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Student dashboard
│   └── applications/      # Application management
├── components/            # Reusable UI Components
│   ├── ui/               # Base components (shadcn/ui)
│   ├── admin/            # Admin-specific components
│   └── forms/            # Form components
├── lib/                  # Utility Libraries
│   ├── supabase.ts       # Database client
│   ├── notifications/    # Notification system
│   └── automation/       # Web scraping
├── mobile/               # React Native Mobile App
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

## 🔐 Environment Configuration

### **Required Environment Variables**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://kioqgrvnolerzffqdwmt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
NEXT_PUBLIC_APP_URL=https://apply4me-eta.vercel.app
NEXT_PUBLIC_APP_NAME=Apply4Me

# Payment Configuration
NEXT_PUBLIC_YOCO_PUBLIC_KEY=your_yoco_public_key
YOCO_SECRET_KEY=your_yoco_secret_key

# Optional: Email & WhatsApp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
WHATSAPP_API_TOKEN=your_whatsapp_token
```

### **Vercel Environment Setup**
All environment variables are configured in Vercel production environment. Access via:
1. Vercel Dashboard → Project Settings → Environment Variables
2. Update values as needed
3. Redeploy to apply changes

## 🚀 Getting Started (Development)

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Git
- Supabase account access

### **Local Development Setup**
```bash
# 1. Clone repository
git clone https://github.com/BhekumusaEric/apply4me.git
cd apply4me

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with correct values

# 4. Run development server
npm run dev

# 5. Access application
# Web: http://localhost:3000
# Admin: http://localhost:3000/admin-panel
```

### **Mobile App Development**
```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on device/simulator
npm run android  # Android
npm run ios      # iOS
```

## 📊 Database Schema

### **Core Tables**
- `institutions` - University/college data
- `programs` - Academic programs
- `applications` - Student applications
- `student_profiles` - User profile data
- `notifications` - In-app notifications
- `admin_users` - Admin access control

### **Database Access**
- **Production**: Supabase project `kioqgrvnolerzffqdwmt`
- **Admin Access**: Via Supabase dashboard
- **Backup**: Automated daily backups via Supabase

## 🔧 Admin System

### **Admin Access**
Authorized admin emails:
- `bhntshwcjc025@student.wethinkcode.co.za`
- `admin@apply4me.co.za`
- `bhekumusa@apply4me.co.za`

### **Admin Features**
- User management (view, edit, ban, delete)
- Application tracking and status updates
- Notification broadcasting
- Institution and program management
- Payment verification
- System health monitoring
- Analytics and reporting

### **Admin Panel URL**
https://apply4me-eta.vercel.app/admin-panel

## 💳 Payment Integration

### **Supported Methods**
1. **PayFast** - Primary payment gateway
2. **Capitec QR** - QR code payments
3. **Yoco** - Card payments (configured but disabled)

### **Payment Flow**
1. Student selects institution/program
2. Application fee calculated
3. Payment method selection
4. Payment processing
5. Verification and confirmation
6. Application status update

## 📱 Mobile Application

### **Platform Support**
- **Android**: APK available for distribution
- **iOS**: Development build available
- **Web**: PWA capabilities enabled

### **Mobile Features**
- Institution browsing
- Application submission
- Payment processing
- Profile management
- Notifications
- Offline capabilities

## 🔄 Deployment & CI/CD

### **Production Deployment**
- **Platform**: Vercel
- **Auto-deploy**: Enabled on `main` branch
- **Build Command**: `npm run build`
- **Environment**: Production variables configured

### **Deployment Process**
1. Push to `main` branch
2. Automatic Vercel build
3. Health checks run
4. Production deployment
5. Monitoring alerts

### **Manual Deployment**
```bash
# Build and test locally
npm run build
npm run test

# Push to production
git push origin main

# Monitor deployment
# Check: https://apply4me-eta.vercel.app/api/health
```

## 🔍 Monitoring & Health Checks

### **Health Check Endpoint**
`GET /api/health` - Returns system status:
- Database connectivity
- Environment variables
- Service availability
- Admin system status

### **Key Metrics**
- User registrations
- Application submissions
- Payment success rates
- System uptime
- Error rates

## 📞 Support & Maintenance

### **Contact Information**
- **Primary Contact**: +27693434126 (Phone/WhatsApp)
- **Email**: bhntshwcjc025@student.wethinkcode.co.za
- **GitHub**: BhekumusaEric

### **Common Maintenance Tasks**
1. **Database Backups**: Automated via Supabase
2. **Environment Updates**: Via Vercel dashboard
3. **User Support**: Through admin panel
4. **Institution Updates**: Via automation or manual entry
5. **Payment Issues**: Check payment gateway dashboards

## 🚨 Troubleshooting

### **Common Issues**
1. **Database Connection**: Check environment variables
2. **Payment Failures**: Verify gateway configurations
3. **Admin Access**: Confirm email in authorized list
4. **Mobile App**: Check Expo configuration

### **Emergency Contacts**
- **Database Issues**: Supabase support
- **Payment Issues**: PayFast/Capitec support
- **Hosting Issues**: Vercel support
- **Code Issues**: GitHub repository

## 📚 Additional Documentation

- `ADMIN_PANEL_GUIDE.md` - Detailed admin panel usage
- `DEPLOYMENT_GUIDE.md` - Deployment procedures
- `MOBILE_DISTRIBUTION_GUIDE.md` - Mobile app distribution
- `DATABASE_SETUP_SQL.sql` - Database schema
- `ENVIRONMENT_VARIABLES.txt` - Environment configuration

---

**Last Updated**: December 2024  
**Project Status**: Production Ready  
**Handover Prepared By**: Bhekumusa Eric Ntshwenya
