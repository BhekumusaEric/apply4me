// Yoco Payment Service for Apply4Me
export interface PaymentData {
  applicationId: string
  amount: number
  currency?: string
  description: string
  metadata?: {
    applicationId: string
    userId: string
    institutionName: string
    serviceType: string
  }
}

export interface PaymentResult {
  success: boolean
  chargeId?: string
  status?: string
  error?: string
  details?: string
}

export class PaymentService {
  private static instance: PaymentService
  private yocoPublicKey: string
  private isProduction: boolean

  constructor() {
    this.yocoPublicKey = process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY || ''
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService()
    }
    return PaymentService.instance
  }

  // Initialize Yoco SDK
  async initializeYoco(): Promise<boolean> {
    try {
      // Check if Yoco SDK is already loaded
      if (typeof window !== 'undefined' && (window as any).YocoSDK) {
        return true
      }

      // Load Yoco SDK script
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js'
        script.async = true
        script.onload = () => {
          console.log('✅ Yoco SDK loaded successfully')
          resolve(true)
        }
        script.onerror = () => {
          console.error('❌ Failed to load Yoco SDK')
          reject(false)
        }
        document.head.appendChild(script)
      })
    } catch (error) {
      console.error('Yoco SDK initialization error:', error)
      return false
    }
  }

  // Create payment token using Yoco SDK
  async createPaymentToken(cardDetails: {
    number: string
    expiryMonth: string
    expiryYear: string
    cvv: string
  }): Promise<{ token?: string; error?: string }> {
    try {
      if (typeof window === 'undefined' || !(window as any).YocoSDK) {
        throw new Error('Yoco SDK not loaded')
      }

      const yoco = new (window as any).YocoSDK({
        publicKey: this.yocoPublicKey
      })

      return new Promise((resolve) => {
        yoco.card.createToken({
          number: cardDetails.number.replace(/\s/g, ''),
          expiryMonth: cardDetails.expiryMonth,
          expiryYear: cardDetails.expiryYear,
          cvv: cardDetails.cvv
        }, (result: any) => {
          if (result.error) {
            console.error('Yoco tokenization error:', result.error)
            resolve({ error: result.error.message || 'Card tokenization failed' })
          } else {
            console.log('✅ Yoco token created successfully')
            resolve({ token: result.id })
          }
        })
      })
    } catch (error) {
      console.error('Payment token creation error:', error)
      return { error: 'Failed to create payment token' }
    }
  }

  // Process payment
  async processPayment(paymentData: PaymentData, token: string): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentData,
          token
        })
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Payment failed',
          details: result.details
        }
      }

      return {
        success: true,
        chargeId: result.chargeId,
        status: result.status
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      return {
        success: false,
        error: 'Payment processing failed'
      }
    }
  }

  // Get payment status
  async getPaymentStatus(applicationId: string): Promise<{
    status?: string
    method?: string
    reference?: string
    date?: string
    amount?: number
    error?: string
  }> {
    try {
      const response = await fetch(`/api/payments?applicationId=${applicationId}`)
      const result = await response.json()

      if (!response.ok) {
        return { error: result.error || 'Failed to get payment status' }
      }

      return result.payment
    } catch (error) {
      console.error('Payment status error:', error)
      return { error: 'Failed to get payment status' }
    }
  }

  // Validate card number using Luhn algorithm
  validateCardNumber(cardNumber: string): boolean {
    const number = cardNumber.replace(/\s/g, '')
    
    if (!/^\d+$/.test(number)) return false
    if (number.length < 13 || number.length > 19) return false

    let sum = 0
    let isEven = false

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  // Get card type from number
  getCardType(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '')
    
    if (/^4/.test(number)) return 'visa'
    if (/^5[1-5]/.test(number)) return 'mastercard'
    if (/^3[47]/.test(number)) return 'amex'
    if (/^6/.test(number)) return 'discover'
    
    return 'unknown'
  }

  // Format card number with spaces
  formatCardNumber(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '')
    const match = number.match(/\d{1,4}/g)
    return match ? match.join(' ') : ''
  }

  // Validate expiry date
  validateExpiryDate(month: string, year: string): boolean {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    const expMonth = parseInt(month)
    const expYear = parseInt(year)

    if (expMonth < 1 || expMonth > 12) return false
    if (expYear < currentYear) return false
    if (expYear === currentYear && expMonth < currentMonth) return false

    return true
  }

  // Validate CVV
  validateCVV(cvv: string, cardType: string): boolean {
    if (!/^\d+$/.test(cvv)) return false
    
    if (cardType === 'amex') {
      return cvv.length === 4
    } else {
      return cvv.length === 3
    }
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance()
