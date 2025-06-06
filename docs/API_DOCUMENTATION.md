# 🔌 Apply4Me API Documentation

## 📋 API Overview

The Apply4Me API provides comprehensive endpoints for student application management, admin operations, and system monitoring. All APIs follow RESTful conventions with consistent response formats.

**Base URL**: `https://apply4me-eta.vercel.app/api`

## 🔐 Authentication

### **Authentication Methods**
- **Public Endpoints**: No authentication required
- **User Endpoints**: Supabase JWT token required
- **Admin Endpoints**: Admin email verification required

### **Headers**
```http
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

## 📊 Response Format

### **Success Response**
```json
{
  "success": true,
  "data": {},
  "message": "Optional success message",
  "timestamp": "2024-12-06T22:00:00.000Z"
}
```

### **Error Response**
```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error details",
  "timestamp": "2024-12-06T22:00:00.000Z"
}
```

## 🏫 Institution Endpoints

### **GET /api/institutions**
Retrieve all institutions with filtering options.

**Query Parameters:**
- `type` (optional): `university`, `tvet`, `college`
- `province` (optional): Province name
- `featured` (optional): `true`, `false`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "University of Cape Town",
      "type": "university",
      "province": "Western Cape",
      "logo_url": "/logos/uct.svg",
      "description": "Premier research university...",
      "application_deadline": "2024-09-30",
      "application_fee": 100,
      "required_documents": ["ID Document", "Matric Certificate"],
      "contact_email": "admissions@uct.ac.za",
      "contact_phone": "+27 21 650 9111",
      "website_url": "https://www.uct.ac.za",
      "is_featured": true
    }
  ],
  "count": 15,
  "timestamp": "2024-12-06T22:00:00.000Z"
}
```

### **GET /api/institutions/[id]**
Get detailed information about a specific institution.

**Response:**
```json
{
  "success": true,
  "institution": {
    "id": "uuid",
    "name": "University of Cape Town",
    "programs_count": 45,
    "available_programs_count": 32
  },
  "programs": [
    {
      "id": "uuid",
      "name": "Computer Science",
      "qualification_type": "Bachelor's Degree",
      "minimum_aps": 35,
      "required_subjects": ["Mathematics", "English"],
      "available_spaces": 120
    }
  ]
}
```

## 📚 Program Endpoints

### **GET /api/programs**
Retrieve programs with filtering options.

**Query Parameters:**
- `institution_id` (optional): Filter by institution
- `qualification_type` (optional): Degree type
- `minimum_aps` (optional): Minimum APS score

## 📝 Application Endpoints

### **POST /api/applications**
Submit a new application.

**Request Body:**
```json
{
  "institution_id": "uuid",
  "program_id": "uuid",
  "service_type": "standard",
  "documents": ["file1.pdf", "file2.pdf"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "application_id": "app_uuid",
    "status": "submitted",
    "payment_required": true,
    "amount": 150,
    "payment_reference": "PAY_123456"
  }
}
```

### **GET /api/applications/[id]**
Get application status and details.

### **PUT /api/applications/[id]**
Update application status (admin only).

## 💳 Payment Endpoints

### **POST /api/payments/payfast**
Process PayFast payment.

**Request Body:**
```json
{
  "application_id": "app_uuid",
  "amount": 150,
  "return_url": "https://apply4me.co.za/payment/success",
  "cancel_url": "https://apply4me.co.za/payment/cancel"
}
```

### **POST /api/payments/capitec**
Generate Capitec QR code payment.

**Request Body:**
```json
{
  "application_id": "app_uuid",
  "amount": 150,
  "reference": "PAY_123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "payment_reference": "PAY_123456",
    "expires_at": "2024-12-06T23:00:00.000Z"
  }
}
```

### **GET /api/payments/verify**
Verify payment status.

**Query Parameters:**
- `reference`: Payment reference
- `gateway`: `payfast`, `capitec`, `yoco`

## 👥 Admin Endpoints

### **GET /api/admin/manage-users**
Get all users with pagination and filtering.

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 50): Items per page
- `search` (optional): Search term
- `status` (optional): `active`, `inactive`, `all`

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "created_at": "2024-12-01T10:00:00.000Z",
        "last_sign_in_at": "2024-12-06T20:00:00.000Z",
        "email_confirmed_at": "2024-12-01T10:05:00.000Z",
        "profile": {
          "first_name": "John",
          "last_name": "Doe",
          "profile_completeness": 85
        },
        "applications": {
          "total": 2,
          "pending": 1,
          "completed": 1
        },
        "notifications": {
          "total": 5,
          "unread": 2
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "hasMore": true
    },
    "summary": {
      "totalUsers": 150,
      "activeUsers": 145,
      "usersWithProfiles": 120
    }
  }
}
```

### **POST /api/admin/manage-users**
Create a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "user_metadata": {
    "first_name": "Jane",
    "last_name": "Smith"
  }
}
```

### **PUT /api/admin/manage-users**
Update user account or perform actions.

**Request Body:**
```json
{
  "user_id": "uuid",
  "action": "ban_user",
  "ban_duration": "24h"
}
```

**Available Actions:**
- `confirm_email`: Confirm user email
- `ban_user`: Ban user account
- `unban_user`: Unban user account
- `reset_password`: Send password reset

### **DELETE /api/admin/manage-users**
Delete user account.

**Query Parameters:**
- `user_id`: User ID to delete

### **GET /api/admin/applications**
Get all applications with filtering.

**Query Parameters:**
- `status` (optional): Application status
- `institution` (optional): Institution filter
- `search` (optional): Search term

### **POST /api/admin/notifications**
Send notifications to users.

**Request Body:**
```json
{
  "type": "general",
  "title": "Important Update",
  "message": "Please update your profile information.",
  "recipients": "all_users",
  "channels": ["email", "database"],
  "scheduledFor": null
}
```

**Recipients Options:**
- `"all_users"`: Send to all registered users
- `["user_id1", "user_id2"]`: Send to specific users
- `"incomplete_profiles"`: Users with incomplete profiles

### **GET /api/admin/user-notifications**
Get all user notifications for admin review.

## 🔔 Notification Endpoints

### **GET /api/notifications**
Get user's notifications.

**Query Parameters:**
- `read` (optional): `true`, `false`
- `type` (optional): Notification type
- `limit` (default: 20): Number of notifications

### **PUT /api/notifications/[id]/read**
Mark notification as read.

### **POST /api/notifications/mark-all-read**
Mark all user notifications as read.

## 🔍 System Endpoints

### **GET /api/health**
System health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-06T22:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": "150ms"
    },
    "environment": {
      "status": "healthy",
      "variables": {
        "supabaseUrl": true,
        "supabaseKey": true,
        "serviceKey": true
      }
    },
    "adminSystem": {
      "status": "healthy",
      "tablesExist": true
    }
  },
  "uptime": 3600.5,
  "memory": {
    "used": 45,
    "total": 128
  }
}
```

### **GET /api/test/database-setup**
Test database connectivity and table structure.

### **GET /api/test/env-check**
Verify environment variable configuration.

## 🤖 Automation Endpoints

### **POST /api/automation/scrape**
Trigger manual data scraping.

**Request Body:**
```json
{
  "type": "institutions"
}
```

**Types:**
- `"institutions"`: Scrape institution data
- `"bursaries"`: Scrape bursary information
- `"both"`: Scrape all data types

### **GET /api/automation/scrape**
Get automation statistics.

### **POST /api/automation/notifications**
Trigger automated notifications.

**Request Body:**
```json
{
  "type": "deadlines"
}
```

**Types:**
- `"deadlines"`: Send deadline reminders
- `"digest"`: Send weekly digest

## 📊 Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad Request - Invalid parameters |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error |

## 🔧 Rate Limiting

- **Public Endpoints**: 100 requests per minute
- **Authenticated Endpoints**: 200 requests per minute
- **Admin Endpoints**: 500 requests per minute

## 📝 API Testing

### **Health Check Test**
```bash
curl -X GET https://apply4me-eta.vercel.app/api/health
```

### **Get Institutions**
```bash
curl -X GET "https://apply4me-eta.vercel.app/api/institutions?type=university"
```

### **Admin Authentication Test**
```bash
curl -X GET https://apply4me-eta.vercel.app/api/admin/manage-users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

**API Version**: 1.0  
**Last Updated**: December 2024  
**Base URL**: https://apply4me-eta.vercel.app/api
