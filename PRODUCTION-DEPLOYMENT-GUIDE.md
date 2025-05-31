# 🚀 Apply4Me Production Deployment Guide

## 1. PRODUCTION DEPLOYMENT SETUP

### **Option A: Vercel (Recommended - Easiest)**

#### **Step 1: Prepare for Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### **Step 2: Configure Environment Variables in Vercel**
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:

```env
# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key

# App Configuration
NEXT_PUBLIC_APP_NAME=Apply4Me
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# PayFast Production (get from PayFast)
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase

# Optional: Email/SMS services
SENDGRID_API_KEY=your_sendgrid_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

#### **Step 3: Custom Domain Setup**
1. In Vercel dashboard → Domains
2. Add your custom domain (e.g., apply4me.co.za)
3. Configure DNS records as shown
4. SSL certificate will be auto-generated

---

### **Option B: Netlify**

#### **Step 1: Build and Deploy**
```bash
# Build the project
npm run build

# Deploy to Netlify (drag & drop .next folder)
# Or connect GitHub repo for auto-deployment
```

#### **Step 2: Environment Variables**
Add the same environment variables in Netlify dashboard under Site Settings → Environment Variables

---

### **Option C: Railway/Render**

#### **Step 1: Connect Repository**
1. Connect your GitHub repository
2. Select the main branch
3. Set build command: `npm run build`
4. Set start command: `npm start`

#### **Step 2: Environment Variables**
Add all production environment variables in the platform dashboard

---

## 2. PAYFAST PRODUCTION CONFIGURATION

### **Step 1: Create PayFast Merchant Account**
1. Visit https://www.payfast.co.za
2. Sign up for a merchant account
3. Complete business verification
4. Get your production credentials

### **Step 2: PayFast Integration Setup**
```bash
# Your production PayFast credentials
PAYFAST_MERCHANT_ID=10000100  # Your actual merchant ID
PAYFAST_MERCHANT_KEY=46f0cd694581a  # Your actual merchant key
PAYFAST_PASSPHRASE=your_secure_passphrase  # Create a secure passphrase
```

### **Step 3: Configure Webhooks**
In your PayFast merchant dashboard:
1. Set ITN (Instant Transaction Notification) URL:
   ```
   https://your-domain.com/api/payments/payfast/notify
   ```
2. Set Return URL:
   ```
   https://your-domain.com/payment/success
   ```
3. Set Cancel URL:
   ```
   https://your-domain.com/payment/cancel
   ```

### **Step 4: Test Payment Flow**
1. Create a test application
2. Process a small payment (R1)
3. Verify payment confirmation
4. Check admin dashboard for payment verification

---

## 3. DOMAIN AND HOSTING SETUP

### **Recommended Domain Options:**
- apply4me.co.za (Primary)
- apply4me.com (International)
- studyapply.co.za (Alternative)

### **Step 1: Domain Registration**
**Option A: Local South African Registrar**
- Register with ZADNA accredited registrar
- Recommended: Afrihost, Hetzner, or Web4Africa

**Option B: International Registrar**
- Namecheap, GoDaddy, or Google Domains

### **Step 2: DNS Configuration**
```dns
# For Vercel
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61

# For Netlify
Type: CNAME
Name: www
Value: your-site.netlify.app

Type: A
Name: @
Value: 75.2.60.5
```

### **Step 3: SSL Certificate**
- Automatic with Vercel/Netlify
- Let's Encrypt for custom hosting
- Cloudflare for additional security

---

## 4. PRODUCTION SUPABASE SETUP

### **Step 1: Create Production Project**
1. Go to https://supabase.com
2. Create new project for production
3. Choose a strong password
4. Select closest region (Europe for SA)

### **Step 2: Database Migration**
```sql
-- Run these in your production Supabase SQL editor
-- (Copy from your development database)

-- Create tables
CREATE TABLE institutions (...);
CREATE TABLE bursaries (...);
CREATE TABLE programs (...);
CREATE TABLE applications (...);
CREATE TABLE users (...);
CREATE TABLE notifications (...);

-- Insert sample data
INSERT INTO institutions VALUES (...);
INSERT INTO bursaries VALUES (...);
-- etc.
```

### **Step 3: Row Level Security**
```sql
-- Enable RLS on all tables
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bursaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access" ON institutions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON bursaries FOR SELECT USING (true);
CREATE POLICY "Public read access" ON programs FOR SELECT USING (true);
-- Add user-specific policies for applications and notifications
```

### **Step 4: API Keys**
1. Get your production API keys from Supabase dashboard
2. Update environment variables
3. Test database connection

---

## 5. MONITORING AND ANALYTICS

### **Step 1: Error Monitoring**
```bash
# Install Sentry for error tracking
npm install @sentry/nextjs

# Configure in next.config.js
```

### **Step 2: Analytics**
```bash
# Google Analytics 4
npm install @next/third-parties

# Or Vercel Analytics (recommended)
npm install @vercel/analytics
```

### **Step 3: Performance Monitoring**
- Vercel Analytics (automatic)
- Google PageSpeed Insights
- Lighthouse CI

---

## 6. BACKUP AND SECURITY

### **Step 1: Database Backups**
- Supabase automatic backups (daily)
- Manual backup scripts for critical data
- Export user data regularly

### **Step 2: Security Headers**
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
]
```

### **Step 3: Rate Limiting**
```javascript
// Implement rate limiting for API endpoints
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

---

## 7. LAUNCH CHECKLIST

### **Pre-Launch Testing:**
- [ ] All pages load correctly
- [ ] Institution search and filtering works
- [ ] Bursary search and filtering works
- [ ] Application form submission works
- [ ] Payment processing works
- [ ] Admin dashboard accessible
- [ ] Mobile responsiveness tested
- [ ] Performance optimized
- [ ] SEO meta tags added
- [ ] Error pages configured

### **Production Verification:**
- [ ] Domain pointing correctly
- [ ] SSL certificate active
- [ ] Database connected
- [ ] PayFast configured
- [ ] Email notifications working
- [ ] Admin access configured
- [ ] Backup systems active
- [ ] Monitoring tools active

### **Legal and Compliance:**
- [ ] Privacy policy updated
- [ ] Terms of service finalized
- [ ] POPIA compliance verified
- [ ] Payment security compliance
- [ ] Data protection measures

---

## 8. POST-LAUNCH MONITORING

### **Daily Checks:**
- System health status
- Payment processing
- User registrations
- Error rates
- Performance metrics

### **Weekly Reviews:**
- User feedback
- Conversion rates
- Revenue tracking
- Feature usage
- Support tickets

### **Monthly Analysis:**
- Growth metrics
- Financial performance
- User satisfaction
- System optimization
- Feature planning

---

**Your Apply4Me platform is ready for production deployment! 🚀**
