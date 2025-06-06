# 🏗️ Apply4Me Technical Architecture

## 📋 System Overview

Apply4Me is a full-stack web application built with modern technologies, designed for scalability, maintainability, and performance. The system follows a microservices-like architecture within a monolithic Next.js application.

## 🎯 Architecture Principles

### **Separation of Concerns**
- **Frontend**: React components with clear responsibilities
- **Backend**: API routes organized by domain
- **Database**: Normalized schema with proper relationships
- **Authentication**: Centralized auth management
- **Payments**: Isolated payment processing logic

### **Code Organization**
```
├── app/                    # Next.js App Router (Frontend + API)
├── components/             # Reusable UI Components
├── lib/                   # Business Logic & Utilities
├── hooks/                 # Custom React Hooks
├── types/                 # TypeScript Type Definitions
└── mobile/                # React Native Mobile App
```

## 🔧 Technology Stack

### **Frontend Technologies**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Context + Custom Hooks
- **Forms**: React Hook Form + Zod validation

### **Backend Technologies**
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Email**: SMTP (configurable providers)

### **Mobile Technologies**
- **Framework**: React Native (Expo)
- **Navigation**: Expo Router
- **State**: React Context
- **API**: Shared with web application

### **DevOps & Deployment**
- **Hosting**: Vercel
- **Database**: Supabase Cloud
- **CI/CD**: GitHub Actions + Vercel
- **Monitoring**: Built-in health checks
- **Version Control**: Git (GitHub)

## 🗄️ Database Architecture

### **Database Design Principles**
- **Normalization**: Proper table relationships
- **Row Level Security (RLS)**: Supabase security policies
- **Indexing**: Optimized for common queries
- **Constraints**: Data integrity enforcement

### **Core Tables Structure**

```sql
-- Users (Supabase Auth)
auth.users
├── id (uuid, primary key)
├── email (text, unique)
├── created_at (timestamp)
└── user_metadata (jsonb)

-- Student Profiles
student_profiles
├── id (uuid, primary key)
├── user_id (uuid, foreign key → auth.users.id)
├── first_name (text)
├── last_name (text)
├── id_number (text, unique)
├── phone (text)
├── address (text)
├── profile_completeness (integer)
└── created_at (timestamp)

-- Institutions
institutions
├── id (uuid, primary key)
├── name (text)
├── type (text) -- university, tvet, college
├── province (text)
├── application_deadline (date)
├── application_fee (integer)
├── required_documents (text[])
└── is_featured (boolean)

-- Programs
programs
├── id (uuid, primary key)
├── institution_id (uuid, foreign key → institutions.id)
├── name (text)
├── qualification_type (text)
├── minimum_aps (integer)
├── required_subjects (text[])
└── available_spaces (integer)

-- Applications
applications
├── id (uuid, primary key)
├── user_id (uuid, foreign key → auth.users.id)
├── institution_id (uuid, foreign key → institutions.id)
├── program_id (uuid, foreign key → programs.id)
├── status (text) -- draft, submitted, processing, accepted, rejected
├── payment_status (text) -- pending, paid, failed
├── submitted_at (timestamp)
└── created_at (timestamp)

-- Notifications
in_app_notifications
├── id (uuid, primary key)
├── user_id (uuid, foreign key → auth.users.id)
├── type (text)
├── title (text)
├── message (text)
├── read (boolean)
├── read_at (timestamp)
└── created_at (timestamp)
```

### **Database Security**
- **Row Level Security**: Users can only access their own data
- **API Keys**: Separate anon and service role keys
- **Environment Variables**: Secure key management
- **Backup Strategy**: Automated daily backups

## 🔐 Authentication & Authorization

### **Authentication Flow**
1. **User Registration**: Email/password via Supabase Auth
2. **Email Verification**: Required for account activation
3. **Session Management**: JWT tokens with automatic refresh
4. **Password Reset**: Secure reset flow via email

### **Authorization Levels**
- **Public**: Institution browsing, general information
- **Authenticated Users**: Application submission, profile management
- **Admin Users**: User management, system administration
- **Super Admin**: Full system access, configuration changes

### **Admin Access Control**
```typescript
// Admin email whitelist
const adminEmails = [
  'bhntshwcjc025@student.wethinkcode.co.za',
  'admin@apply4me.co.za',
  'bhekumusa@apply4me.co.za'
]

// Role-based access in components
const isAdmin = adminEmails.includes(user?.email || '')
```

## 🔄 API Architecture

### **API Route Organization**
```
app/api/
├── auth/                  # Authentication endpoints
├── admin/                 # Admin-only endpoints
│   ├── manage-users/      # User management
│   ├── applications/      # Application management
│   └── notifications/     # Admin notifications
├── institutions/          # Institution data
├── programs/              # Program information
├── applications/          # Application submission
├── payments/              # Payment processing
├── notifications/         # User notifications
└── health/                # System health checks
```

### **API Design Patterns**
- **RESTful**: Standard HTTP methods and status codes
- **Error Handling**: Consistent error response format
- **Validation**: Input validation with Zod schemas
- **Rate Limiting**: Built-in Vercel rate limiting
- **CORS**: Configured for cross-origin requests

### **Response Format**
```typescript
// Success Response
{
  success: true,
  data: any,
  message?: string,
  timestamp: string
}

// Error Response
{
  success: false,
  error: string,
  details?: any,
  timestamp: string
}
```

## 💳 Payment Architecture

### **Payment Flow Design**
1. **Fee Calculation**: Dynamic based on institution/program
2. **Payment Method Selection**: Multiple gateway support
3. **Payment Processing**: Secure gateway integration
4. **Verification**: Webhook and polling verification
5. **Status Update**: Application status synchronization

### **Payment Gateways**
```typescript
// PayFast Integration
class PayFastService {
  generatePaymentUrl(amount: number, reference: string): string
  verifyPayment(paymentId: string): Promise<PaymentStatus>
}

// Capitec QR Integration
class CapitecQRService {
  generateQRCode(amount: number, reference: string): Promise<string>
  checkPaymentStatus(reference: string): Promise<PaymentStatus>
}
```

### **Payment Security**
- **PCI Compliance**: No card data stored locally
- **Webhook Verification**: Signature validation
- **Reference Generation**: Unique payment references
- **Status Tracking**: Comprehensive payment logging

## 📱 Mobile Architecture

### **React Native Structure**
```
mobile/
├── src/
│   ├── screens/           # Screen components
│   ├── components/        # Reusable components
│   ├── context/          # State management
│   ├── services/         # API services
│   ├── utils/            # Helper functions
│   └── types/            # TypeScript types
├── assets/               # Images, fonts, icons
└── app.json             # Expo configuration
```

### **Mobile-Web API Sharing**
- **Shared Endpoints**: Same API routes for web and mobile
- **Authentication**: Shared Supabase auth system
- **Data Sync**: Real-time updates via Supabase
- **Offline Support**: Local storage for critical data

## 🔔 Notification System

### **Notification Architecture**
```typescript
// Real-time Notification Service
class NotificationService {
  // Send to specific user
  sendToUser(userId: string, notification: Notification): Promise<void>
  
  // Broadcast to all users
  broadcastToAll(notification: Notification): Promise<void>
  
  // Send via multiple channels
  sendMultiChannel(notification: Notification, channels: Channel[]): Promise<void>
}
```

### **Notification Channels**
- **In-App**: Database-stored notifications
- **Email**: SMTP-based email notifications
- **Push**: Mobile push notifications (planned)
- **SMS**: WhatsApp integration (optional)

## 🤖 Automation System

### **Web Scraping Architecture**
```typescript
// Institution Data Scraper
class InstitutionScraper {
  scrapeInstitutions(): Promise<Institution[]>
  updateDeadlines(): Promise<void>
  validateData(data: any): boolean
}

// Automation Scheduler
class AutomationScheduler {
  scheduleDaily(): void
  runInstitutionDiscovery(): Promise<void>
  sendDeadlineReminders(): Promise<void>
}
```

### **Data Sources**
- **University Websites**: Direct scraping
- **Government Portals**: Official education data
- **Third-party APIs**: Where available
- **Manual Entry**: Admin-managed data

## 🔍 Monitoring & Observability

### **Health Check System**
```typescript
// System Health Monitoring
interface HealthCheck {
  database: 'healthy' | 'unhealthy'
  environment: 'healthy' | 'unhealthy'
  services: 'healthy' | 'unhealthy'
  adminSystem: 'healthy' | 'degraded' | 'unhealthy'
}
```

### **Monitoring Endpoints**
- `/api/health` - Overall system health
- `/api/test/database-setup` - Database connectivity
- `/api/test/env-check` - Environment validation
- `/api/admin/analytics` - Usage analytics

## 🚀 Performance Optimization

### **Frontend Optimization**
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Caching**: Static generation where possible
- **Bundle Analysis**: Regular bundle size monitoring

### **Backend Optimization**
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Supabase connection management
- **Caching**: API response caching
- **Rate Limiting**: Request throttling

### **Mobile Optimization**
- **Bundle Splitting**: Expo optimization
- **Image Compression**: Optimized assets
- **Lazy Loading**: Component-level lazy loading
- **Offline Caching**: Critical data caching

## 🔒 Security Considerations

### **Application Security**
- **Input Validation**: Zod schema validation
- **SQL Injection**: Parameterized queries via Supabase
- **XSS Protection**: React's built-in protection
- **CSRF Protection**: SameSite cookies
- **Content Security Policy**: Configured headers

### **Data Protection**
- **Encryption**: Data encrypted at rest and in transit
- **Personal Data**: GDPR-compliant data handling
- **Access Logs**: Comprehensive audit trails
- **Backup Security**: Encrypted backups

## 📈 Scalability Design

### **Horizontal Scaling**
- **Stateless API**: No server-side sessions
- **Database Scaling**: Supabase auto-scaling
- **CDN**: Vercel Edge Network
- **Caching**: Multiple caching layers

### **Vertical Scaling**
- **Resource Optimization**: Efficient algorithms
- **Database Optimization**: Query optimization
- **Memory Management**: Proper cleanup
- **Connection Management**: Efficient pooling

---

**Architecture Version**: 1.0  
**Last Updated**: December 2024  
**Maintained By**: Development Team
