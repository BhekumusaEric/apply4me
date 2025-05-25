# 🚀 Apply4Me Deployment Guide

## Quick Deployment to Vercel (5 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Production ready - Apply4Me v1.0"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your Apply4Me repository
5. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: https://kioqgrvnolerzffqdwmt.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: [your anon key]
   - `SUPABASE_SERVICE_ROLE_KEY`: [your service role key]
   - `NEXT_PUBLIC_APP_URL`: https://your-domain.vercel.app
6. Click "Deploy"

### 3. Custom Domain (Optional)
- Add your custom domain in Vercel dashboard
- Update `NEXT_PUBLIC_APP_URL` environment variable

## Alternative: Netlify Deployment

### 1. Build Command
```bash
npm run build
```

### 2. Publish Directory
```
.next
```

### 3. Environment Variables
Same as Vercel configuration above.

## Alternative: Railway Deployment

### 1. Connect GitHub Repository
2. Set environment variables
3. Deploy automatically

## Post-Deployment Checklist

### ✅ Test Core Features
- [ ] Homepage loads
- [ ] User registration/login
- [ ] Institution browsing
- [ ] Apply Now functionality
- [ ] Payment flow
- [ ] Dashboard access

### ✅ Update Supabase Settings
- [ ] Add production URL to allowed origins
- [ ] Update email templates with production URLs
- [ ] Configure RLS policies for production

### ✅ Performance Optimization
- [ ] Enable Vercel Analytics
- [ ] Set up monitoring
- [ ] Configure CDN for images

## Environment Variables Reference

```env
# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://kioqgrvnolerzffqdwmt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Apply4Me
```

## Domain Suggestions
- apply4me.co.za
- apply4me.africa
- studyapply.co.za
- applynow.co.za
- myapply4me.com
