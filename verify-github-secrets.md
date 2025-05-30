# 🔐 GitHub Secrets Verification Guide

## 📋 **Required GitHub Secrets for Apply4Me CI/CD**

Before deploying, ensure all these secrets are configured in your GitHub repository:

### **🔧 How to Add GitHub Secrets**
1. Go to your GitHub repository: `https://github.com/BhekumusaEric/apply4me`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below

---

## 🚀 **VERCEL DEPLOYMENT SECRETS**

### **VERCEL_TOKEN**
```
Description: Vercel authentication token
How to get: 
1. Go to https://vercel.com/account/tokens
2. Create new token
3. Copy the token value
```

### **VERCEL_ORG_ID**
```
Description: Your Vercel organization ID
How to get:
1. Run: npx vercel link
2. Check .vercel/project.json for orgId
```

### **VERCEL_PROJECT_ID**
```
Description: Your Vercel project ID  
How to get:
1. Run: npx vercel link
2. Check .vercel/project.json for projectId
```

---

## 🗄️ **SUPABASE DATABASE SECRETS**

### **NEXT_PUBLIC_SUPABASE_URL**
```
Value: https://kioqgrvnolerzffqdwmt.supabase.co
Description: Your Supabase project URL (public)
```

### **NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpb3FncnZub2xlcnpmZnFkd210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxODM4MDcsImV4cCI6MjA2Mzc1OTgwN30.CD2PAbcklmqMf8NlCK_zdttAy5sMfesAaeBmyZCVwGk
Description: Supabase anonymous key (public)
```

### **SUPABASE_SERVICE_ROLE_KEY**
```
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpb3FncnZub2xlcnpmZnFkd210Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE4MzgwNywiZXhwIjoyMDYzNzU5ODA3fQ.TwVDEZ1uQo8_yOYsHvZNOklGZFhY3-vvV7pr56nqPOs
Description: Supabase service role key (PRIVATE - admin access)
```

---

## 🌐 **APPLICATION CONFIGURATION**

### **NEXT_PUBLIC_APP_URL**
```
Value: https://apply4me-eta.vercel.app
Description: Your production app URL
```

---

## 💳 **PAYMENT INTEGRATION (YOCO)**

### **NEXT_PUBLIC_YOCO_PUBLIC_KEY**
```
Value: [Your Yoco public key]
Description: Yoco public key for payment processing
How to get: 
1. Sign up at https://yoco.com
2. Get API keys from dashboard
```

### **YOCO_SECRET_KEY**
```
Value: [Your Yoco secret key]
Description: Yoco secret key (PRIVATE)
How to get: 
1. Sign up at https://yoco.com
2. Get API keys from dashboard
```

---

## 📱 **MOBILE APP (OPTIONAL)**

### **EXPO_TOKEN**
```
Value: [Your Expo token]
Description: Expo authentication token for mobile builds
How to get:
1. Sign up at https://expo.dev
2. Generate access token in account settings
```

---

## ✅ **VERIFICATION CHECKLIST**

### **Before Deployment**
- [ ] All Vercel secrets added (TOKEN, ORG_ID, PROJECT_ID)
- [ ] All Supabase secrets added (URL, ANON_KEY, SERVICE_ROLE_KEY)
- [ ] App URL configured (NEXT_PUBLIC_APP_URL)
- [ ] Payment keys added (if using payments)
- [ ] Expo token added (if building mobile app)

### **Test Secrets Locally**
```bash
# Create .env.local with your secrets
cp .env.example .env.local

# Test build with production environment
npm run build

# Test that environment variables are loaded
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

### **Verify in GitHub**
1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Confirm all required secrets are listed
3. Secrets should show "Updated X time ago"
4. No secrets should show as "Never used" after first deployment

---

## 🚨 **SECURITY NOTES**

### **Public vs Private Secrets**
- **Public** (`NEXT_PUBLIC_*`): Exposed to browser, safe to be public
- **Private**: Server-side only, never exposed to browser

### **Secret Rotation**
- Rotate secrets regularly (every 90 days recommended)
- Update both GitHub secrets AND your service providers
- Test after rotation to ensure everything works

### **Access Control**
- Only repository admins can view/edit secrets
- Secrets are encrypted at rest
- Never log or expose secrets in code

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

#### **"Secret not found" errors**
- Check secret name spelling (case-sensitive)
- Ensure secret exists in repository settings
- Verify you're in the correct repository

#### **"Invalid token" errors**
- Check if token has expired
- Verify token has correct permissions
- Regenerate token if needed

#### **Build failures**
- Check all required secrets are present
- Verify secret values are correct
- Test locally with same environment variables

### **Debug Commands**
```bash
# Check if secrets are being loaded (in GitHub Actions)
echo "Checking environment variables..."
echo "NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:0:20}..."
echo "VERCEL_TOKEN: ${VERCEL_TOKEN:0:10}..."

# Test Vercel authentication
npx vercel whoami --token $VERCEL_TOKEN

# Test Supabase connection
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/"
```

---

## ✅ **READY FOR DEPLOYMENT**

Once all secrets are configured:

1. **Verify secrets** are all added to GitHub
2. **Test locally** with production environment variables
3. **Run deployment script**: `./deploy-production.sh`
4. **Monitor deployment** in GitHub Actions
5. **Verify production** deployment works correctly

Your Apply4Me platform will be **securely deployed** with all necessary credentials! 🚀🔐
