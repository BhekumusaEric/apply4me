# Google Credentials Setup - Apply4Me

## 🔑 Your Generated NextAuth Secret
```
NEXTAUTH_SECRET=l8QxN1rSk/fvXCNOQl3Lud+7sVwdKl/lOGxDE7pNCOg=
```

## 📋 Credentials Checklist

### ✅ What You Need to Get from Google Cloud Console:

1. **Service Account JSON File**
   - Download from: APIs & Services → Credentials → Service Account → Keys
   - Save as: `service-account-key.json`
   - Store securely (never commit to Git)

2. **OAuth 2.0 Client Credentials**
   - Client ID: `your_client_id.apps.googleusercontent.com`
   - Client Secret: `your_client_secret`

3. **Project ID**
   - Should be: `apply4me`

## 🔧 Your .env.local File Template

Copy this and replace the placeholder values:

```bash
# Google Services Configuration
GOOGLE_CLOUD_PROJECT_ID=apply4me
GOOGLE_APPLICATION_CREDENTIALS=/Users/craftsman/apply4me/credentials/service-account-key.json
GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_client_secret

# NextAuth Configuration (already generated for you)
NEXTAUTH_SECRET=l8QxN1rSk/fvXCNOQl3Lud+7sVwdKl/lOGxDE7pNCOg=
NEXTAUTH_URL=http://localhost:3000

# Google Services Features
ENABLE_GOOGLE_DRIVE=true
ENABLE_GOOGLE_SHEETS=true
ENABLE_GOOGLE_CALENDAR=true

# Your existing Supabase configuration (keep these)
NEXT_PUBLIC_SUPABASE_URL=your_existing_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_existing_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_existing_supabase_service_role_key

# Other existing variables...
```

## 📁 File Organization

Create this folder structure:
```
apply4me/
├── credentials/
│   └── service-account-key.json  (download from Google Cloud)
├── .env.local                    (create with above template)
└── .gitignore                    (make sure it includes credentials/)
```

## 🔒 Security Notes

1. **Never commit credentials to Git**
2. **Add to .gitignore:**
   ```
   credentials/
   .env.local
   service-account-key.json
   ```

3. **Store service account file securely**
4. **Use environment variables in production**

## 🧪 Testing Steps

After setting up credentials:

1. Start development server: `npm run dev`
2. Go to: `http://localhost:3000/google-services`
3. Click "Run Full Test"
4. Test Google Sign-In

## 📞 Need Help?

If you get stuck on any step, let me know:
- Which step you're on
- Any error messages you see
- Screenshots of the Google Cloud Console if needed
