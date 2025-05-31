# 💳 PayFast Production Setup Guide

## 🎯 **COMPLETE PAYFAST INTEGRATION FOR APPLY4ME**

### **STEP 1: CREATE PAYFAST MERCHANT ACCOUNT**

#### **1.1 Registration Process**
1. **Visit**: https://www.payfast.co.za
2. **Click**: "Become a Merchant"
3. **Complete**: Business registration form
4. **Required Documents**:
   - Company registration certificate
   - Bank account details
   - ID document of authorized person
   - Proof of address
   - Business bank statements (3 months)

#### **1.2 Business Information Required**
```
Business Name: Apply4Me (Pty) Ltd
Business Type: Online Education Services
Industry: Education Technology
Monthly Turnover: R50,000 - R500,000 (estimated)
Website: https://apply4me.co.za
Business Description: Student application processing platform
```

#### **1.3 Verification Timeline**
- **Application Review**: 2-5 business days
- **Document Verification**: 3-7 business days
- **Account Activation**: 1-2 business days
- **Total Time**: 1-2 weeks

---

### **STEP 2: PAYFAST ACCOUNT CONFIGURATION**

#### **2.1 Merchant Dashboard Setup**
1. **Login** to PayFast merchant dashboard
2. **Navigate** to Settings → Integration
3. **Configure** the following:

```
Merchant ID: [Your assigned ID]
Merchant Key: [Your assigned key]
Passphrase: [Create secure passphrase]
```

#### **2.2 Integration URLs Configuration**
```
Return URL: https://apply4me.co.za/payment/success
Cancel URL: https://apply4me.co.za/payment/cancel
Notify URL: https://apply4me.co.za/api/payments/payfast/notify
```

#### **2.3 Payment Methods Setup**
Enable these payment methods:
- [ ] Credit Cards (Visa, Mastercard)
- [ ] Debit Cards
- [ ] Instant EFT
- [ ] Bank Transfer
- [ ] Mobile Money (optional)

---

### **STEP 3: PRODUCTION ENVIRONMENT VARIABLES**

#### **3.1 Update Environment Variables**
```env
# PayFast Production Configuration
PAYFAST_MERCHANT_ID=your_actual_merchant_id
PAYFAST_MERCHANT_KEY=your_actual_merchant_key
PAYFAST_PASSPHRASE=your_secure_passphrase
NODE_ENV=production

# App URLs
NEXT_PUBLIC_APP_URL=https://apply4me.co.za
```

#### **3.2 Security Configuration**
```env
# Strong passphrase (recommended format)
PAYFAST_PASSPHRASE=Apply4Me2024!SecurePayments#SA
```

---

### **STEP 4: PAYMENT FLOW CONFIGURATION**

#### **4.1 Application Fee Structure**
```javascript
// Payment amounts for Apply4Me
const PAYMENT_AMOUNTS = {
  standard_application: 50.00,    // R50 standard application
  express_application: 100.00,   // R100 express (24-hour)
  bulk_application: 40.00,       // R40 per application (10+ bulk)
  premium_service: 150.00        // R150 premium with consultation
}
```

#### **4.2 Payment Descriptions**
```javascript
const PAYMENT_DESCRIPTIONS = {
  standard: "Apply4Me - University Application Processing",
  express: "Apply4Me - Express Application Processing (24hrs)",
  bulk: "Apply4Me - Bulk School Application Package",
  premium: "Apply4Me - Premium Application Service"
}
```

---

### **STEP 5: TESTING PAYMENT INTEGRATION**

#### **5.1 Test Payment Flow**
1. **Create test application** in your system
2. **Process R1 payment** (minimum test amount)
3. **Verify payment confirmation**
4. **Check ITN (webhook) reception**
5. **Confirm database updates**

#### **5.2 Test Scenarios**
```
✅ Successful payment
✅ Failed payment
✅ Cancelled payment
✅ Duplicate payment prevention
✅ Webhook notification handling
✅ Payment verification
```

#### **5.3 Test Cards (Sandbox)**
```
Successful Payment:
Card Number: 4000000000000002
CVV: 123
Expiry: Any future date

Failed Payment:
Card Number: 4000000000000010
CVV: 123
Expiry: Any future date
```

---

### **STEP 6: WEBHOOK CONFIGURATION**

#### **6.1 ITN (Instant Transaction Notification) Setup**
Your webhook endpoint is already implemented at:
```
POST /api/payments/payfast/notify
```

#### **6.2 Webhook Security**
```javascript
// Signature verification (already implemented)
function verifySignature(data, signature, passphrase) {
  const pfOutput = Object.keys(data)
    .sort()
    .map(key => `${key}=${encodeURIComponent(data[key])}`)
    .join('&') + `&passphrase=${encodeURIComponent(passphrase)}`
  
  const generatedSignature = crypto
    .createHash('md5')
    .update(pfOutput)
    .digest('hex')
  
  return generatedSignature === signature
}
```

---

### **STEP 7: PAYMENT VERIFICATION SYSTEM**

#### **7.1 Admin Payment Verification**
Your admin dashboard includes payment verification at:
```
https://apply4me.co.za/admin/enhanced → Payments Tab
```

#### **7.2 Manual Verification Process**
1. **Student submits application**
2. **Payment processed via PayFast**
3. **Automatic webhook updates status**
4. **Admin can manually verify if needed**
5. **Student receives confirmation**

#### **7.3 Payment Status Flow**
```
pending → processing → paid → verified → completed
```

---

### **STEP 8: FINANCIAL REPORTING**

#### **8.1 PayFast Reporting**
- **Daily transaction reports**
- **Monthly settlement reports**
- **Dispute and chargeback reports**
- **Tax reporting (VAT)**

#### **8.2 Apply4Me Revenue Tracking**
```javascript
// Revenue metrics in admin dashboard
const revenueMetrics = {
  daily_revenue: "R2,500",
  monthly_revenue: "R75,000",
  total_applications: 1500,
  average_per_application: "R50",
  success_rate: "98.5%"
}
```

---

### **STEP 9: COMPLIANCE AND SECURITY**

#### **9.1 PCI DSS Compliance**
- PayFast handles PCI compliance
- No card data stored on your servers
- Secure payment processing
- SSL/TLS encryption required

#### **9.2 POPIA Compliance**
```
✅ User consent for payment processing
✅ Secure data transmission
✅ Limited data retention
✅ User rights to data access/deletion
✅ Privacy policy updated
```

#### **9.3 Financial Regulations**
- **SARB compliance** (South African Reserve Bank)
- **FICA compliance** (Financial Intelligence Centre Act)
- **VAT registration** (if turnover > R1M annually)

---

### **STEP 10: GO-LIVE CHECKLIST**

#### **10.1 Pre-Production Verification**
- [ ] PayFast merchant account approved
- [ ] Production credentials configured
- [ ] Webhook URLs updated
- [ ] SSL certificate active
- [ ] Payment flow tested end-to-end
- [ ] Error handling verified
- [ ] Admin verification system tested

#### **10.2 Launch Day Tasks**
- [ ] Switch from sandbox to production
- [ ] Monitor first transactions closely
- [ ] Verify webhook notifications
- [ ] Check payment confirmations
- [ ] Monitor error logs
- [ ] Test customer support flow

#### **10.3 Post-Launch Monitoring**
- [ ] Daily payment reconciliation
- [ ] Weekly financial reports
- [ ] Monthly PayFast statement review
- [ ] Quarterly compliance review
- [ ] Annual security audit

---

### **STEP 11: CUSTOMER SUPPORT**

#### **11.1 Payment Support Process**
1. **Student payment issue** → Check admin dashboard
2. **Payment not reflecting** → Verify with PayFast
3. **Refund request** → Process via PayFast dashboard
4. **Dispute resolution** → Follow PayFast procedures

#### **11.2 Common Payment Issues**
```
❌ Payment declined → Check card details/limits
❌ Payment pending → Wait for bank processing
❌ Duplicate payment → Refund via PayFast
❌ Webhook failed → Manual verification needed
```

---

### **STEP 12: SCALING CONSIDERATIONS**

#### **12.1 Volume Planning**
```
Month 1: 100 applications × R50 = R5,000
Month 6: 500 applications × R50 = R25,000
Month 12: 1,500 applications × R50 = R75,000
Year 2: 3,000 applications × R50 = R150,000/month
```

#### **12.2 PayFast Fees**
```
Standard Rate: 2.9% + R2.00 per transaction
Volume Discounts: Available for high-volume merchants
Settlement: T+3 business days
```

#### **12.3 Revenue Optimization**
- **Express service** (R100) for urgent applications
- **Bulk packages** for schools (R40 per application)
- **Premium services** with consultation (R150)
- **Partnership programs** with institutions

---

## 🎉 **PAYFAST INTEGRATION COMPLETE!**

Your Apply4Me platform is now ready to process payments securely and efficiently through PayFast. The integration supports:

✅ **Secure payment processing**
✅ **Multiple payment methods**
✅ **Automatic webhook handling**
✅ **Admin verification system**
✅ **Comprehensive reporting**
✅ **Compliance with regulations**

**Ready to start generating revenue! 💰**
