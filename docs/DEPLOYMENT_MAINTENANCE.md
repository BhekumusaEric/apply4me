# 🚀 Apply4Me Deployment & Maintenance Guide

## 📋 Overview

This guide covers deployment procedures, maintenance tasks, and operational procedures for the Apply4Me platform. Follow these procedures to ensure smooth operation and minimal downtime.

## 🌐 Production Environment

### **Current Deployment**
- **Platform**: Vercel
- **URL**: https://apply4me-eta.vercel.app
- **Database**: Supabase (kioqgrvnolerzffqdwmt)
- **Repository**: https://github.com/BhekumusaEric/apply4me.git
- **Branch**: `main` (auto-deploy enabled)

### **Environment Status**
- ✅ **Production**: Fully operational
- ✅ **Database**: Connected and healthy
- ✅ **Admin Panel**: Functional
- ✅ **Payment Systems**: Integrated
- ✅ **Mobile App**: Available

## 🔧 Environment Configuration

### **Vercel Environment Variables**
Access via: Vercel Dashboard → Project Settings → Environment Variables

**Required Variables:**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://kioqgrvnolerzffqdwmt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
NEXT_PUBLIC_APP_URL=https://apply4me-eta.vercel.app
NEXT_PUBLIC_APP_NAME=Apply4Me

# Payment Configuration
NEXT_PUBLIC_YOCO_PUBLIC_KEY=pk_test_...
YOCO_SECRET_KEY=sk_test_...

# Optional Services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
WHATSAPP_API_TOKEN=your_whatsapp_token
```

### **Environment Variable Updates**
1. **Access Vercel Dashboard**
2. **Navigate to Project Settings → Environment Variables**
3. **Update required variables**
4. **Trigger redeploy** (automatic or manual)
5. **Verify changes** via health check

## 🚀 Deployment Procedures

### **Automatic Deployment**
Triggered automatically on push to `main` branch:

```bash
# 1. Make changes locally
git add .
git commit -m "Your commit message"

# 2. Push to main branch
git push origin main

# 3. Vercel automatically deploys
# Monitor at: https://vercel.com/dashboard

# 4. Verify deployment
curl -s https://apply4me-eta.vercel.app/api/health
```

### **Manual Deployment**
For urgent fixes or specific deployments:

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from local
vercel --prod

# 4. Verify deployment
curl -s https://apply4me-eta.vercel.app/api/health
```

### **Pre-Deployment Checklist**
- [ ] **Tests Pass**: Run `npm run test`
- [ ] **Build Succeeds**: Run `npm run build`
- [ ] **Linting Clean**: Run `npm run lint`
- [ ] **Environment Variables**: Verify all required vars
- [ ] **Database Connection**: Test with health check
- [ ] **Admin Access**: Verify admin panel functionality

### **Post-Deployment Verification**
```bash
# 1. Health Check
curl -s https://apply4me-eta.vercel.app/api/health

# 2. Database Connectivity
curl -s https://apply4me-eta.vercel.app/api/institutions

# 3. Admin Panel Access
# Visit: https://apply4me-eta.vercel.app/admin-panel

# 4. Payment System Test
# Test payment flow in admin panel

# 5. Mobile App Compatibility
# Verify mobile app still connects
```

## 🔍 Monitoring & Health Checks

### **System Health Monitoring**
**Primary Health Check**: `GET /api/health`

**Expected Response:**
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "healthy" },
    "environment": { "status": "healthy" },
    "services": { "status": "healthy" },
    "adminSystem": { "status": "healthy" }
  }
}
```

### **Monitoring Schedule**
- **Automated**: Vercel monitors uptime automatically
- **Manual**: Check health endpoint daily
- **Deep Check**: Weekly comprehensive system review

### **Alert Conditions**
- **Database Unhealthy**: Immediate attention required
- **Environment Issues**: Check environment variables
- **Service Degradation**: Investigate specific services
- **Admin System Down**: Check admin table access

## 🛠️ Maintenance Tasks

### **Daily Maintenance**
```bash
# 1. Health Check
curl -s https://apply4me-eta.vercel.app/api/health

# 2. Check Error Logs
# Access via Vercel Dashboard → Functions → View Logs

# 3. Monitor User Activity
# Check admin panel for new registrations/applications

# 4. Payment Verification
# Verify any pending payments in admin panel
```

### **Weekly Maintenance**
```bash
# 1. Database Backup Verification
# Supabase automatically backs up daily
# Verify backup status in Supabase dashboard

# 2. Performance Review
# Check Vercel Analytics for performance metrics

# 3. User Support Review
# Review admin notifications and user feedback

# 4. Security Updates
# Check for dependency updates
npm audit
npm update
```

### **Monthly Maintenance**
```bash
# 1. Dependency Updates
npm audit fix
npm update

# 2. Database Optimization
# Review query performance in Supabase
# Optimize slow queries if needed

# 3. Storage Cleanup
# Clean up old files in Supabase Storage
# Remove expired payment references

# 4. Analytics Review
# Review user growth and application trends
# Generate monthly reports
```

## 🗄️ Database Maintenance

### **Database Access**
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Project**: kioqgrvnolerzffqdwmt
- **Region**: eu-central-1

### **Backup Strategy**
- **Automatic**: Daily backups by Supabase
- **Retention**: 7 days for free tier
- **Manual Backup**: Export via Supabase dashboard when needed

### **Database Health Checks**
```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check recent activity
SELECT COUNT(*) as new_users_today 
FROM auth.users 
WHERE created_at >= CURRENT_DATE;

SELECT COUNT(*) as applications_today 
FROM applications 
WHERE created_at >= CURRENT_DATE;
```

### **Database Optimization**
```sql
-- Analyze table statistics
ANALYZE;

-- Reindex if needed (rarely required)
REINDEX DATABASE postgres;

-- Check for unused indexes
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE schemaname = 'public';
```

## 🔐 Security Maintenance

### **Security Checklist**
- [ ] **Environment Variables**: Secure and up-to-date
- [ ] **API Keys**: Rotated regularly (quarterly)
- [ ] **Database Access**: RLS policies active
- [ ] **Admin Access**: Email whitelist current
- [ ] **SSL Certificates**: Automatically managed by Vercel
- [ ] **Dependencies**: No known vulnerabilities

### **Security Monitoring**
```bash
# 1. Check for vulnerabilities
npm audit

# 2. Review access logs
# Check Supabase dashboard for unusual activity

# 3. Verify admin access
# Ensure only authorized emails can access admin panel

# 4. Check payment security
# Verify payment gateway configurations
```

## 📱 Mobile App Maintenance

### **Mobile App Updates**
```bash
# 1. Navigate to mobile directory
cd mobile

# 2. Update dependencies
npm update

# 3. Test build
npm run build:android
npm run build:ios

# 4. Update app stores (when ready)
# Follow mobile distribution guide
```

### **Mobile-Web Sync**
- **API Compatibility**: Ensure mobile app works with latest API
- **Feature Parity**: Keep mobile features in sync with web
- **Testing**: Test mobile app after web deployments

## 🚨 Incident Response

### **Emergency Contacts**
- **Primary**: +27693434126 (Phone/WhatsApp)
- **Email**: bhntshwcjc025@student.wethinkcode.co.za
- **GitHub**: BhekumusaEric

### **Incident Response Procedure**
1. **Assess Impact**: Determine severity and affected users
2. **Immediate Action**: Implement quick fixes if possible
3. **Communication**: Notify stakeholders if needed
4. **Investigation**: Identify root cause
5. **Resolution**: Implement permanent fix
6. **Documentation**: Document incident and resolution

### **Common Issues & Solutions**

**Database Connection Issues:**
```bash
# 1. Check environment variables
curl -s https://apply4me-eta.vercel.app/api/test/env-check

# 2. Verify Supabase status
# Check Supabase status page

# 3. Test direct connection
curl -s "https://kioqgrvnolerzffqdwmt.supabase.co/rest/v1/institutions?select=count&limit=1" \
  -H "apikey: YOUR_ANON_KEY"
```

**Payment Gateway Issues:**
```bash
# 1. Check gateway status
# PayFast: Check PayFast dashboard
# Capitec: Verify QR code generation

# 2. Test payment endpoints
curl -s https://apply4me-eta.vercel.app/api/payments/verify?reference=TEST

# 3. Review payment logs
# Check Vercel function logs for payment errors
```

**Admin Panel Issues:**
```bash
# 1. Verify admin access
# Check if admin email is in whitelist

# 2. Test admin APIs
curl -s https://apply4me-eta.vercel.app/api/admin/manage-users

# 3. Check admin table access
# Verify admin_users table in Supabase
```

## 📊 Performance Optimization

### **Performance Monitoring**
- **Vercel Analytics**: Built-in performance metrics
- **Core Web Vitals**: Monitor loading performance
- **API Response Times**: Track via health checks
- **Database Performance**: Monitor via Supabase

### **Optimization Tasks**
```bash
# 1. Bundle Analysis
npm run build
npx @next/bundle-analyzer

# 2. Image Optimization
# Ensure all images use Next.js Image component

# 3. Database Query Optimization
# Review slow queries in Supabase dashboard

# 4. Caching Review
# Verify static generation and caching strategies
```

## 📈 Scaling Considerations

### **Current Limits**
- **Vercel**: Hobby plan limits
- **Supabase**: Free tier limits
- **Database**: 500MB storage limit
- **Bandwidth**: 100GB/month

### **Scaling Triggers**
- **Users**: >1000 active users
- **Database**: >400MB usage
- **Bandwidth**: >80GB/month
- **API Calls**: >500K/month

### **Scaling Actions**
1. **Upgrade Vercel Plan**: Pro plan for higher limits
2. **Upgrade Supabase**: Pro plan for more storage/bandwidth
3. **Optimize Queries**: Reduce database load
4. **Implement Caching**: Reduce API calls
5. **CDN Optimization**: Improve global performance

---

**Maintenance Guide Version**: 1.0  
**Last Updated**: December 2024  
**Next Review**: January 2025
