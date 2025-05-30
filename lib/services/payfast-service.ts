// PayFast Payment Service for Apply4Me
import crypto from 'crypto'

export interface PayFastPaymentData {
  applicationId: string
  amount: number
  description: string
  userEmail: string
  userName: string
  metadata?: {
    applicationId: string
    userId: string
    institutionName: string
    programName?: string
  }
}

export interface PayFastResult {
  success: boolean
  paymentUrl?: string
  paymentId?: string
  error?: string
}

export class PayFastService {
  private static instance: PayFastService
  private merchantId: string
  private merchantKey: string
  private passphrase: string
  private isProduction: boolean
  private baseUrl: string

  constructor() {
    this.merchantId = process.env.PAYFAST_MERCHANT_ID || '10000100'
    this.merchantKey = process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a'
    this.passphrase = process.env.PAYFAST_PASSPHRASE || 'jt7NOE43FZPn'
    this.isProduction = process.env.NODE_ENV === 'production'
    this.baseUrl = this.isProduction 
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process'
  }

  static getInstance(): PayFastService {
    if (!PayFastService.instance) {
      PayFastService.instance = new PayFastService()
    }
    return PayFastService.instance
  }

  // Generate PayFast payment URL
  async createPayment(paymentData: PayFastPaymentData): Promise<PayFastResult> {
    try {
      const paymentId = `APY${Date.now()}`
      const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/success/${paymentData.applicationId}`
      const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel/${paymentData.applicationId}`
      const notifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/payfast/notify`

      // PayFast payment parameters
      const paymentParams = {
        // Merchant details
        merchant_id: this.merchantId,
        merchant_key: this.merchantKey,
        
        // Transaction details
        amount: paymentData.amount.toFixed(2),
        item_name: paymentData.description,
        item_description: `Apply4Me Application Payment - ${paymentData.metadata?.institutionName || 'Institution'}`,
        
        // Custom fields
        custom_str1: paymentData.applicationId,
        custom_str2: paymentData.metadata?.userId || '',
        custom_str3: paymentData.metadata?.institutionName || '',
        custom_str4: paymentData.metadata?.programName || '',
        custom_str5: paymentId,
        
        // URLs
        return_url: returnUrl,
        cancel_url: cancelUrl,
        notify_url: notifyUrl,
        
        // Buyer details
        name_first: paymentData.userName.split(' ')[0] || 'Student',
        name_last: paymentData.userName.split(' ').slice(1).join(' ') || 'User',
        email_address: paymentData.userEmail,
        
        // Additional settings
        payment_method: 'cc,dc,eft,mt,mc,pc,vc,ae,mp', // All payment methods
        subscription_type: '1', // One-time payment
        billing_date: new Date().toISOString().split('T')[0],
        recurring_amount: paymentData.amount.toFixed(2),
        frequency: '3', // Monthly (not used for one-time)
        cycles: '0' // Indefinite (not used for one-time)
      }

      // Generate signature
      const signature = this.generateSignature(paymentParams)
      const finalParams = { ...paymentParams, signature }

      // Create payment URL
      const paymentUrl = this.createPaymentUrl(finalParams)

      console.log('✅ PayFast payment created:', {
        paymentId,
        applicationId: paymentData.applicationId,
        amount: paymentData.amount,
        paymentUrl: paymentUrl.substring(0, 100) + '...'
      })

      return {
        success: true,
        paymentUrl,
        paymentId
      }

    } catch (error) {
      console.error('❌ PayFast payment creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed'
      }
    }
  }

  // Generate PayFast signature
  private generateSignature(params: Record<string, string>): string {
    // Remove signature if it exists
    const { signature, ...cleanParams } = params

    // Sort parameters alphabetically
    const sortedKeys = Object.keys(cleanParams).sort()
    
    // Create parameter string
    const paramString = sortedKeys
      .map(key => `${key}=${encodeURIComponent(cleanParams[key])}`)
      .join('&')

    // Add passphrase if configured
    const stringToSign = this.passphrase 
      ? `${paramString}&passphrase=${encodeURIComponent(this.passphrase)}`
      : paramString

    // Generate MD5 hash
    return crypto.createHash('md5').update(stringToSign).digest('hex')
  }

  // Create payment URL with parameters
  private createPaymentUrl(params: Record<string, string>): string {
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')

    return `${this.baseUrl}?${queryString}`
  }

  // Verify PayFast notification
  verifyNotification(params: Record<string, string>): boolean {
    try {
      const receivedSignature = params.signature
      if (!receivedSignature) return false

      const calculatedSignature = this.generateSignature(params)
      return receivedSignature === calculatedSignature

    } catch (error) {
      console.error('PayFast signature verification failed:', error)
      return false
    }
  }

  // Validate PayFast server IP (for webhook security)
  isValidPayFastIP(ip: string): boolean {
    const payFastIPs = [
      '197.97.145.144',
      '197.97.145.145',
      '197.97.145.146',
      '197.97.145.147',
      '197.97.145.148'
    ]
    return payFastIPs.includes(ip)
  }

  // Get payment status from PayFast
  async getPaymentStatus(paymentId: string): Promise<{
    status?: string
    amount?: number
    reference?: string
    error?: string
  }> {
    try {
      // PayFast doesn't have a direct API for checking status
      // Status is typically handled via webhooks
      // This is a placeholder for future implementation
      return {
        status: 'pending',
        reference: paymentId
      }
    } catch (error) {
      console.error('PayFast status check failed:', error)
      return {
        error: 'Failed to check payment status'
      }
    }
  }

  // Format amount for PayFast (2 decimal places)
  formatAmount(amount: number): string {
    return amount.toFixed(2)
  }

  // Validate amount
  validateAmount(amount: number): boolean {
    return amount > 0 && amount <= 1000000 // PayFast limits
  }

  // Get configuration status
  getConfigStatus(): {
    configured: boolean
    environment: string
    merchantId: string
    issues: string[]
  } {
    const issues: string[] = []

    if (!this.merchantId || this.merchantId === '10000100') {
      issues.push('Merchant ID not configured (using sandbox default)')
    }

    if (!this.merchantKey || this.merchantKey === '46f0cd694581a') {
      issues.push('Merchant Key not configured (using sandbox default)')
    }

    if (!this.passphrase) {
      issues.push('Passphrase not configured')
    }

    return {
      configured: issues.length === 0,
      environment: this.isProduction ? 'production' : 'sandbox',
      merchantId: this.merchantId,
      issues
    }
  }
}

// Export singleton instance
export const payFastService = PayFastService.getInstance()
