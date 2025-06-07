# Google Services Integration Setup Guide

This guide will help you set up Google services integration for the Apply4Me platform, including Google Sign-In, Google Drive, Google Sheets, and Google Calendar.

## 🎯 Overview

The Apply4Me platform integrates with Google services to provide:

- **Google Sign-In**: Secure authentication using Google accounts
- **Google Drive**: Document storage and sharing for student applications
- **Google Sheets**: Application tracking and analytics
- **Google Calendar**: Deadline reminders and scheduling

## 📋 Prerequisites

1. Google account with access to Google Cloud Console
2. Apply4Me project already set up locally
3. Basic understanding of environment variables

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" or select existing project "apply4me"
3. Note your Project ID (e.g., `apply4me`)

### Step 2: Enable Required APIs

In Google Cloud Console, enable these APIs:
1. **Google Drive API**
2. **Google Sheets API** 
3. **Google Calendar API**
4. **Google+ API** (for authentication)

Navigate to: APIs & Services → Library → Search and enable each API

### Step 3: Create Service Account

1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → "Service Account"
3. Fill in details:
   - Name: `apply4me-service-account`
   - Description: `Service account for Apply4Me platform`
4. Grant roles:
   - `Editor` (for Drive and Sheets access)
   - `Service Account User`
5. Create and download the JSON key file
6. Save as `service-account-key.json` in a secure location

### Step 4: Create OAuth 2.0 Credentials

1. In Google Cloud Console → APIs & Services → Credentials
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Configure OAuth consent screen first if prompted:
   - User Type: External (for testing) or Internal (for organization)
   - App name: `Apply4Me`
   - User support email: Your email
   - Developer contact: Your email
4. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: `Apply4Me Web Client`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
5. Save Client ID and Client Secret

### Step 5: Configure Environment Variables

Create or update your `.env.local` file:

```bash
# Google Services Configuration
GOOGLE_CLOUD_PROJECT_ID=apply4me
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account-key.json
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# Google Services Features
ENABLE_GOOGLE_DRIVE=true
ENABLE_GOOGLE_SHEETS=true
ENABLE_GOOGLE_CALENDAR=true
```

### Step 6: Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Use the output as your `NEXTAUTH_SECRET`.

## 🧪 Testing the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/google-services`

3. Run the integration tests:
   - Click "Run Full Test" to test all services
   - Check that all tests pass
   - Verify Google Sign-In works

## 🔧 Service Account Permissions

Ensure your service account has these permissions:

### Google Drive API Scopes:
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/drive.readonly`

### Google Sheets API Scopes:
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/spreadsheets.readonly`

### Google Calendar API Scopes:
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/calendar.events`

## 🎨 Features Enabled

Once configured, users can:

### Google Sign-In
- Secure authentication with Google accounts
- Automatic profile creation in Supabase
- Access to Google services with user consent

### Google Drive Integration
- Upload student documents securely
- Share documents with institutions
- Organize files in folders per student
- Access documents from anywhere

### Google Sheets Integration
- Automatic application tracking spreadsheets
- Real-time progress monitoring
- Payment status tracking
- Document submission timeline

### Google Calendar Integration
- Application deadline reminders
- Interview scheduling
- Important date notifications
- Calendar sync across devices

## 🚨 Security Considerations

1. **Service Account Key**: Store securely, never commit to version control
2. **OAuth Credentials**: Keep Client Secret secure
3. **Environment Variables**: Use `.env.local` for sensitive data
4. **Permissions**: Grant minimal required permissions
5. **HTTPS**: Use HTTPS in production for OAuth callbacks

## 🐛 Troubleshooting

### Common Issues:

1. **"Credentials not found"**
   - Check `GOOGLE_APPLICATION_CREDENTIALS` path
   - Ensure service account JSON file exists
   - Verify file permissions

2. **"API not enabled"**
   - Enable required APIs in Google Cloud Console
   - Wait a few minutes for propagation

3. **"OAuth error"**
   - Check redirect URIs match exactly
   - Verify OAuth consent screen is configured
   - Ensure Client ID/Secret are correct

4. **"Permission denied"**
   - Check service account roles
   - Verify API scopes in code
   - Ensure user has granted permissions

### Testing Commands:

```bash
# Test Google Cloud CLI (if installed)
gcloud auth application-default login
gcloud projects list

# Test environment variables
echo $GOOGLE_CLOUD_PROJECT_ID
echo $GOOGLE_APPLICATION_CREDENTIALS
```

## 📚 Additional Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google APIs Documentation](https://developers.google.com/apis-explorer)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)

## 🎉 Next Steps

After successful setup:

1. Test all features in the Google Services page
2. Configure production environment variables
3. Set up proper OAuth consent screen for production
4. Enable additional Google services as needed
5. Monitor usage in Google Cloud Console

Your Apply4Me platform is now ready with full Google services integration! 🚀
