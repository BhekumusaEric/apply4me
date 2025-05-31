# 📧 Email Service Setup Guide

## 🎯 **Quick Setup Options**

### **🚀 OPTION 1: SendGrid (Recommended)**

**Why SendGrid?**
- ✅ **Free tier**: 100 emails/day forever
- ✅ **Reliable delivery**: Industry-leading deliverability
- ✅ **Easy setup**: Simple API integration
- ✅ **Analytics**: Email tracking and analytics

**Setup Steps:**

1. **Create SendGrid Account**
   - Go to [sendgrid.com](https://sendgrid.com)
   - Sign up for free account
   - Verify your email

2. **Create API Key**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Choose "Restricted Access"
   - Give permissions: Mail Send (Full Access)
   - Copy the API key

3. **Add to Environment**
   ```bash
   # Add to your .env.local file
   SENDGRID_API_KEY=SG.your_actual_api_key_here
   FROM_EMAIL=notifications@apply4me.co.za
   FROM_NAME=Apply4Me
   ```

4. **Verify Sender**
   - Go to Settings → Sender Authentication
   - Add "notifications@apply4me.co.za" as verified sender
   - Or set up domain authentication for apply4me.co.za

---

### **🚀 OPTION 2: Resend (Developer-Friendly)**

**Why Resend?**
- ✅ **Free tier**: 3,000 emails/month
- ✅ **Developer-focused**: Great API and docs
- ✅ **Modern**: Built for modern applications

**Setup Steps:**

1. **Create Resend Account**
   - Go to [resend.com](https://resend.com)
   - Sign up with GitHub/Google
   - Verify your email

2. **Create API Key**
   - Go to API Keys
   - Click "Create API Key"
   - Copy the API key

3. **Add to Environment**
   ```bash
   # Add to your .env.local file
   RESEND_API_KEY=re_your_actual_api_key_here
   FROM_EMAIL=notifications@apply4me.co.za
   FROM_NAME=Apply4Me
   ```

---

### **🚀 OPTION 3: Mailgun (High Volume)**

**Why Mailgun?**
- ✅ **Free tier**: 5,000 emails/month for 3 months
- ✅ **Scalable**: Great for high volume
- ✅ **Powerful**: Advanced features

**Setup Steps:**

1. **Create Mailgun Account**
   - Go to [mailgun.com](https://mailgun.com)
   - Sign up for free account

2. **Get API Key and Domain**
   - Go to Settings → API Keys
   - Copy your API key
   - Note your sandbox domain (or add your own)

3. **Add to Environment**
   ```bash
   # Add to your .env.local file
   MAILGUN_API_KEY=your_actual_api_key_here
   MAILGUN_DOMAIN=sandbox123.mailgun.org
   FROM_EMAIL=notifications@apply4me.co.za
   FROM_NAME=Apply4Me
   ```

---

## 🧪 **Testing Email Setup**

### **Test Email Sending**

Create a test file to verify your email setup:

```bash
# Create test file
curl -X POST http://localhost:3001/api/test/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email from Apply4Me",
    "message": "This is a test email to verify the email service is working!"
  }'
```

### **Test Notification Email**

```bash
# Test notification with email
curl -X POST http://localhost:3001/api/notifications/real-time \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_notification",
    "userId": "test-user-123",
    "title": "Test Notification with Email",
    "message": "This notification should be sent via email too!",
    "channels": ["database", "email"]
  }'
```

---

## 🔧 **Environment Variables Reference**

### **Required Variables (Choose ONE email service)**

```bash
# SendGrid
SENDGRID_API_KEY=SG.your_api_key

# OR Resend
RESEND_API_KEY=re_your_api_key

# OR Mailgun
MAILGUN_API_KEY=your_api_key
MAILGUN_DOMAIN=your_domain

# Email Settings (for all services)
FROM_EMAIL=notifications@apply4me.co.za
FROM_NAME=Apply4Me
```

### **Optional Variables**

```bash
# Push Notifications
FIREBASE_SERVER_KEY=your_firebase_key
ONESIGNAL_APP_ID=your_onesignal_id
ONESIGNAL_API_KEY=your_onesignal_key
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"No email service configured"**
   - Check your API key is set correctly
   - Restart your development server
   - Verify the environment variable name

2. **"Email sending failed"**
   - Check API key permissions
   - Verify sender email is authenticated
   - Check API rate limits

3. **"Emails not received"**
   - Check spam folder
   - Verify recipient email address
   - Check email service logs

### **Debug Email Sending**

Add this to your `.env.local` for debugging:

```bash
# Enable email debugging
DEBUG_EMAIL=true
```

---

## 📊 **Production Recommendations**

### **For Production Use:**

1. **Domain Authentication**
   - Set up SPF, DKIM, and DMARC records
   - Use your own domain for sending
   - Verify domain ownership

2. **Email Templates**
   - Create branded email templates
   - Include unsubscribe links
   - Add company footer

3. **Monitoring**
   - Set up email delivery monitoring
   - Track bounce rates and spam complaints
   - Monitor API usage and limits

4. **Compliance**
   - Follow CAN-SPAM Act guidelines
   - Include physical address in emails
   - Provide easy unsubscribe option

---

## 🎯 **Next Steps**

1. **Choose an email service** (SendGrid recommended)
2. **Create account and get API key**
3. **Add to .env.local file**
4. **Test email sending**
5. **Verify notifications work with email**

**Once configured, your notification system will:**
- ✅ Send real-time notifications in the app
- ✅ Send backup email notifications
- ✅ Track delivery and engagement
- ✅ Scale to thousands of users

**Ready to set up email? Choose one of the options above and follow the setup steps!** 📧✨
