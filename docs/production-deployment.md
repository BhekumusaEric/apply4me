# Apply4Me Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### ✅ Step 1: Database Setup
- [ ] **Open Supabase Dashboard**: https://supabase.com/dashboard
- [ ] **Navigate to SQL Editor** (left sidebar)
- [ ] **Copy SQL Script**: From `/database/setup-admin-system.sql`
- [ ] **Execute Script**: Paste and run in SQL Editor
- [ ] **Verify Setup**: Run test at `/api/test/database-setup`

### ✅ Step 2: Environment Configuration

#### Development (.env.local)
```bash
# Current development settings
REQUIRE_AUTH=false
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

#### Production Environment Variables
```bash
# Production settings (set in Vercel/deployment platform)
REQUIRE_AUTH=true
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Supabase (same as development)
NEXT_PUBLIC_SUPABASE_URL=https://kioqgrvnolerzffqdwmt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Configuration
ADMIN_EMAILS=bhntshwcjc025@student.wethinkcode.co.za,admin@apply4me.co.za,bhekumusa@apply4me.co.za
```

### ✅ Step 3: Testing Before Deployment

#### Local Testing
1. **Test Admin System**: `/api/test/admin-system`
2. **Test Database Setup**: `/api/test/database-setup`
3. **Test Admin Interface**: `/admin/test-users`

#### Expected Results
- ✅ All API endpoints return 200 status
- ✅ Database tables exist and are accessible
- ✅ Admin users can be added/removed
- ✅ Authentication bypass works in development

### ✅ Step 4: Deployment Configuration

#### Vercel Deployment
1. **Environment Variables**: Set in Vercel dashboard
2. **Build Settings**: 
   ```bash
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

#### GitHub Actions (if using)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
env:
  REQUIRE_AUTH: true
  NODE_ENV: production
```

## 🔧 Post-Deployment Verification

### 1. Database Verification
```bash
# Test database setup
curl https://your-domain.com/api/test/database-setup
```

### 2. Admin System Verification
```bash
# Test admin system
curl https://your-domain.com/api/test/admin-system
```

### 3. Authentication Verification
- [ ] **Admin API requires authentication** (should return 401 without auth)
- [ ] **Admin interface redirects** to login when not authenticated
- [ ] **Authorized users can access** admin features

## 🛡️ Security Checklist

### Environment Security
- [ ] **No sensitive data** in client-side code
- [ ] **API keys secured** in environment variables
- [ ] **HTTPS enabled** for production domain
- [ ] **CORS configured** properly

### Admin Security
- [ ] **Row Level Security** enabled on all tables
- [ ] **Admin permissions** properly configured
- [ ] **Authentication required** in production
- [ ] **Admin emails verified** and up-to-date

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- `/api/test/admin-system` - Admin system functionality
- `/api/test/database-setup` - Database connectivity
- `/api/admin/users` - Admin user management (requires auth)

### Expected Responses
```json
// Healthy admin system
{
  "success": true,
  "results": {
    "summary": {
      "status": "ALL TESTS PASSED",
      "passed": 4,
      "failed": 0
    }
  }
}

// Healthy database
{
  "success": true,
  "results": {
    "summary": {
      "status": "ALL_TABLES_EXIST",
      "exists": 3,
      "missing": 0
    }
  }
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Tables Missing
**Symptoms**: 
- API returns "relation does not exist" errors
- Admin interface shows fallback data

**Solution**:
1. Run SQL script in Supabase SQL Editor
2. Verify tables created with `/api/test/database-setup`

#### 2. Authentication Not Working
**Symptoms**:
- Admin API accessible without authentication
- No login redirects

**Solution**:
1. Verify `REQUIRE_AUTH=true` in production
2. Check `NODE_ENV=production`
3. Test with `/api/admin/users` (should return 401)

#### 3. Admin Users Not Found
**Symptoms**:
- Admin interface shows "no admin users"
- Cannot add admin users

**Solution**:
1. Check admin_users table has data
2. Verify admin emails in environment variables
3. Run database setup script again

## 📞 Support Contacts

### Technical Issues
- **Database**: Check Supabase dashboard logs
- **Deployment**: Check Vercel/platform logs
- **Authentication**: Verify environment variables

### Admin Access Issues
- **Primary Admin**: bhntshwcjc025@student.wethinkcode.co.za
- **Secondary Admin**: admin@apply4me.co.za
- **Backup Admin**: bhekumusa@apply4me.co.za

## 🎯 Success Criteria

Deployment is successful when:
- ✅ All health checks pass
- ✅ Database tables exist and are accessible
- ✅ Admin authentication works in production
- ✅ Admin users can manage the system
- ✅ No fallback mechanisms are being used
- ✅ All API endpoints return expected responses

## 🔄 Rollback Plan

If deployment fails:
1. **Revert to previous version** in deployment platform
2. **Check environment variables** are correctly set
3. **Verify database connectivity** 
4. **Test with development settings** first
5. **Re-run setup scripts** if needed

---

**Status**: Ready for Production Deployment 🚀
