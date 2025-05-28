# GitHub Secrets Configuration for Apply4Me CI/CD Pipeline

This document outlines all the GitHub secrets required for the Apply4Me CI/CD pipeline to function properly.

## 🔐 Required GitHub Secrets

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL
Description: Your Supabase project URL
Example: https://your-project.supabase.co
Required: Yes
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
Description: Supabase anonymous/public key
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Required: Yes
```

```
SUPABASE_SERVICE_ROLE_KEY
Description: Supabase service role key (for server-side operations)
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Required: Yes
```

### Application Configuration
```
NEXT_PUBLIC_APP_URL
Description: Production URL of your application
Example: https://apply4me-eta.vercel.app
Required: Yes
```

### Payment Configuration (Yoco)
```
NEXT_PUBLIC_YOCO_PUBLIC_KEY
Description: Yoco public key for client-side payment processing
Example: pk_live_your_yoco_public_key
Required: Yes
```

```
YOCO_SECRET_KEY
Description: Yoco secret key for server-side payment processing
Example: sk_live_your_yoco_secret_key
Required: Yes
```

### Vercel Deployment
```
VERCEL_TOKEN
Description: Vercel authentication token for deployments
How to get: https://vercel.com/account/tokens
Required: Yes
```

```
VERCEL_ORG_ID
Description: Your Vercel organization ID
How to get: Run `vercel link` in your project
Required: Yes
```

```
VERCEL_PROJECT_ID
Description: Your Vercel project ID
How to get: Run `vercel link` in your project
Required: Yes
```

### Mobile App (Expo/EAS)
```
EXPO_TOKEN
Description: Expo authentication token for mobile builds
How to get: https://expo.dev/accounts/[account]/settings/access-tokens
Required: Yes (for mobile builds)
```

## 🛠️ How to Add Secrets to GitHub

1. **Navigate to your GitHub repository**
2. **Go to Settings > Secrets and variables > Actions**
3. **Click "New repository secret"**
4. **Add each secret with the exact name and value**

## 🔍 Verification Steps

### 1. Test Supabase Connection
```bash
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     "YOUR_SUPABASE_URL/rest/v1/institutions?select=count"
```

### 2. Test Vercel CLI
```bash
vercel whoami --token YOUR_VERCEL_TOKEN
```

### 3. Test Expo CLI
```bash
expo whoami --token YOUR_EXPO_TOKEN
```

## 🚨 Security Best Practices

### ✅ Do's
- Use separate keys for staging and production
- Rotate secrets regularly
- Use least-privilege access
- Monitor secret usage in logs
- Use environment-specific secrets

### ❌ Don'ts
- Never commit secrets to code
- Don't share secrets in plain text
- Don't use production secrets in development
- Don't log secret values
- Don't reuse secrets across projects

## 🔄 Environment-Specific Configuration

### Production (main branch)
- Use live/production API keys
- Point to production Supabase instance
- Use production Vercel project
- Enable all security features

### Staging (develop branch)
- Use test/sandbox API keys
- Point to staging Supabase instance
- Use preview Vercel deployments
- Enable debug logging

## 📋 Secret Validation Checklist

Before deploying, ensure:

- [ ] All required secrets are added to GitHub
- [ ] Secrets are correctly named (case-sensitive)
- [ ] Production secrets are different from development
- [ ] Vercel project is linked correctly
- [ ] Supabase permissions are configured
- [ ] Payment keys are for correct environment
- [ ] Expo account has necessary permissions

## 🔧 Troubleshooting

### Common Issues

**Build fails with "Missing environment variables"**
- Check secret names match exactly
- Verify secrets are added to repository
- Ensure secrets have correct values

**Vercel deployment fails**
- Verify VERCEL_TOKEN is valid
- Check VERCEL_ORG_ID and VERCEL_PROJECT_ID
- Ensure Vercel project exists

**Mobile build fails**
- Verify EXPO_TOKEN is valid
- Check Expo account permissions
- Ensure EAS CLI is properly configured

**Database connection fails**
- Verify Supabase URL and keys
- Check database permissions
- Ensure RLS policies allow access

## 📞 Support

If you encounter issues:

1. **Check GitHub Actions logs** for specific error messages
2. **Verify secret values** in GitHub repository settings
3. **Test secrets locally** using the verification steps above
4. **Review Vercel/Expo dashboards** for additional error details

## 🔄 Secret Rotation Schedule

Recommended rotation schedule:
- **API Keys**: Every 90 days
- **Database Keys**: Every 180 days
- **Deployment Tokens**: Every 365 days
- **Payment Keys**: As required by provider

---

**Last Updated**: [Current Date]
**Version**: 1.0
