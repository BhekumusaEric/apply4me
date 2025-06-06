# 🔧 Apply4Me Troubleshooting Guide

## 📋 Overview

This guide provides step-by-step solutions for common issues in the Apply4Me platform. Use this guide to quickly diagnose and resolve problems without breaking the system.

## 🚨 Emergency Quick Checks

### **System Health Check**
```bash
# 1. Overall system health
curl -s https://apply4me-eta.vercel.app/api/health

# 2. Database connectivity
curl -s https://apply4me-eta.vercel.app/api/institutions | head -5

# 3. Admin panel access
# Visit: https://apply4me-eta.vercel.app/admin-panel

# 4. Environment variables
curl -s https://apply4me-eta.vercel.app/api/test/env-check
```

### **Quick Status Indicators**
- ✅ **Healthy**: All systems operational
- ⚠️ **Degraded**: Some features affected
- ❌ **Unhealthy**: Immediate attention required

## 🗄️ Database Issues

### **Problem: Database Connection Failed**
**Symptoms:**
- Health check shows "database: unhealthy"
- API endpoints return "Invalid API key" errors
- Admin panel shows connection errors

**Diagnosis:**
```bash
# Check environment variables
curl -s https://apply4me-eta.vercel.app/api/test/env-check

# Test direct database connection
curl -s "https://kioqgrvnolerzffqdwmt.supabase.co/rest/v1/institutions?select=count&limit=1" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Solutions:**
1. **Check Supabase Project Status**
   - Visit Supabase dashboard
   - Verify project is active (not paused)
   - Check for service outages

2. **Verify Environment Variables**
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is not corrupted
   - Check for trailing spaces or duplicated keys

3. **Fix Corrupted Service Key**
   ```bash
   # Correct service key format:
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpb3FncnZub2xlcnpmZnFkd210Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE4MzgwNywiZXhwIjoyMDYzNzU5ODA3fQ.TwVDEZ1uQo8_yOYsHvZNOklGZFhY3-vvV7pr56nqPOs
   ```

4. **Redeploy After Changes**
   ```bash
   git add .
   git commit -m "Fix database connection"
   git push origin main
   ```

### **Problem: Database Tables Missing**
**Symptoms:**
- "Table doesn't exist" errors
- Admin panel shows empty data
- Health check shows missing tables

**Solutions:**
1. **Check Table Existence**
   ```sql
   -- In Supabase SQL Editor
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **Run Database Setup**
   ```bash
   # Test database setup
   curl -s https://apply4me-eta.vercel.app/api/test/database-setup
   ```

3. **Create Missing Tables**
   - Use `DATABASE_SETUP_SQL.sql` file
   - Run in Supabase SQL Editor
   - Verify table creation

## 🔐 Authentication Issues

### **Problem: Admin Panel Access Denied**
**Symptoms:**
- Redirected to signin page
- "Unauthorized" errors
- Admin features not visible

**Solutions:**
1. **Verify Admin Email**
   ```typescript
   // Check if email is in admin list
   const adminEmails = [
     'bhntshwcjc025@student.wethinkcode.co.za',
     'admin@apply4me.co.za',
     'bhekumusa@apply4me.co.za'
   ]
   ```

2. **Check Authentication Status**
   - Ensure user is logged in
   - Verify email is confirmed
   - Check session validity

3. **Development Mode Access**
   ```bash
   # For local development
   NODE_ENV=development npm run dev
   # Admin access allowed without strict email check
   ```

### **Problem: User Login Issues**
**Symptoms:**
- Cannot sign in with valid credentials
- Email confirmation not working
- Password reset not working

**Solutions:**
1. **Check Supabase Auth Settings**
   - Verify email templates are configured
   - Check SMTP settings
   - Ensure auth is enabled

2. **Manual Email Confirmation**
   ```sql
   -- In Supabase SQL Editor
   UPDATE auth.users 
   SET email_confirmed_at = NOW() 
   WHERE email = 'user@example.com';
   ```

## 💳 Payment Issues

### **Problem: Payment Processing Failed**
**Symptoms:**
- Payment buttons not working
- QR codes not generating
- Payment verification failing

**Diagnosis:**
```bash
# Test payment endpoints
curl -s https://apply4me-eta.vercel.app/api/payments/verify?reference=TEST

# Check payment gateway status
# PayFast: Check dashboard
# Capitec: Test QR generation
```

**Solutions:**
1. **PayFast Issues**
   - Verify merchant credentials
   - Check PayFast dashboard for errors
   - Ensure return URLs are correct

2. **Capitec QR Issues**
   - Verify QR code generation endpoint
   - Check image encoding
   - Test with small amounts first

3. **Payment Verification Issues**
   - Check webhook configurations
   - Verify payment reference format
   - Test manual verification

## 🔔 Notification Issues

### **Problem: Notifications Not Sending**
**Symptoms:**
- Admin notifications not reaching users
- Email notifications not working
- In-app notifications missing

**Solutions:**
1. **Check Notification Service**
   ```bash
   # Test notification endpoint
   curl -X POST https://apply4me-eta.vercel.app/api/admin/notifications \
     -H "Content-Type: application/json" \
     -d '{"type":"test","title":"Test","message":"Test message","recipients":"all_users"}'
   ```

2. **Verify Email Configuration**
   - Check SMTP settings
   - Test email service connectivity
   - Verify sender email authentication

3. **Database Notification Issues**
   - Check `in_app_notifications` table
   - Verify user IDs are correct
   - Test notification creation

## 📱 Mobile App Issues

### **Problem: Mobile App Not Connecting**
**Symptoms:**
- API calls failing from mobile
- Authentication not working
- Data not loading

**Solutions:**
1. **Check API Compatibility**
   ```bash
   # Test API from mobile network
   curl -s https://apply4me-eta.vercel.app/api/health
   ```

2. **Verify Mobile Configuration**
   - Check `app.json` configuration
   - Verify API base URL
   - Test on different networks

3. **Update Mobile App**
   ```bash
   cd mobile
   npm update
   npm run build:android
   ```

## 🚀 Deployment Issues

### **Problem: Deployment Failed**
**Symptoms:**
- Build errors in Vercel
- Functions not deploying
- Environment variables not updating

**Solutions:**
1. **Check Build Logs**
   - Review Vercel deployment logs
   - Look for compilation errors
   - Check dependency issues

2. **Fix Common Build Issues**
   ```bash
   # Clear cache and rebuild
   rm -rf .next
   npm run build

   # Fix TypeScript errors
   npm run type-check

   # Fix linting errors
   npm run lint --fix
   ```

3. **Environment Variable Issues**
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure values are properly formatted

### **Problem: Functions Timing Out**
**Symptoms:**
- API endpoints returning 504 errors
- Long response times
- Function execution limits exceeded

**Solutions:**
1. **Optimize Database Queries**
   ```sql
   -- Add indexes for slow queries
   CREATE INDEX idx_applications_user_id ON applications(user_id);
   CREATE INDEX idx_notifications_user_id ON in_app_notifications(user_id);
   ```

2. **Reduce Function Complexity**
   - Break large functions into smaller ones
   - Implement pagination for large datasets
   - Use database-level filtering

## 🔍 Performance Issues

### **Problem: Slow Page Loading**
**Symptoms:**
- High page load times
- Poor Core Web Vitals scores
- Slow API responses

**Solutions:**
1. **Optimize Images**
   ```jsx
   // Use Next.js Image component
   import Image from 'next/image'
   
   <Image
     src="/logo.png"
     alt="Logo"
     width={200}
     height={100}
     priority
   />
   ```

2. **Implement Caching**
   ```typescript
   // Add caching to API routes
   export async function GET() {
     const data = await fetchData()
     
     return NextResponse.json(data, {
       headers: {
         'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
       }
     })
   }
   ```

3. **Database Optimization**
   ```sql
   -- Analyze query performance
   EXPLAIN ANALYZE SELECT * FROM institutions WHERE type = 'university';
   
   -- Add missing indexes
   CREATE INDEX idx_institutions_type ON institutions(type);
   ```

## 🛠️ Development Issues

### **Problem: Local Development Not Working**
**Symptoms:**
- `npm run dev` fails
- Environment variables not loading
- Database connection issues locally

**Solutions:**
1. **Check Node.js Version**
   ```bash
   node --version  # Should be 18+
   npm --version
   ```

2. **Install Dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with correct values
   ```

4. **Database Connection**
   ```bash
   # Test local database connection
   node scripts/test-db-connection.js
   ```

## 📊 Monitoring & Alerts

### **Setting Up Monitoring**
1. **Health Check Monitoring**
   ```bash
   # Create monitoring script
   #!/bin/bash
   HEALTH=$(curl -s https://apply4me-eta.vercel.app/api/health | jq -r '.status')
   if [ "$HEALTH" != "healthy" ]; then
     echo "ALERT: System unhealthy"
     # Send notification
   fi
   ```

2. **Database Monitoring**
   ```sql
   -- Monitor database size
   SELECT pg_size_pretty(pg_database_size('postgres'));
   
   -- Monitor active connections
   SELECT count(*) FROM pg_stat_activity;
   ```

## 📞 Getting Help

### **When to Escalate**
- Database corruption or data loss
- Security breaches or unauthorized access
- Payment processing completely down
- Multiple system failures

### **Contact Information**
- **Primary**: +27693434126 (Phone/WhatsApp)
- **Email**: bhntshwcjc025@student.wethinkcode.co.za
- **GitHub Issues**: Create issue in repository

### **Information to Provide**
- Error messages (exact text)
- Steps to reproduce
- Time when issue started
- Affected users/features
- Screenshots if applicable

---

**Troubleshooting Guide Version**: 1.0  
**Last Updated**: December 2024  
**Emergency Contact**: +27693434126
