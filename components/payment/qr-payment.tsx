'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Smartphone, QrCode, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface QRPaymentProps {
  amount: number
  applicationId: string
  onPaymentComplete: (reference: string) => void
  programFee?: number
  serviceFee?: number
  programName?: string
}

export function QRPayment({ amount, applicationId, onPaymentComplete, programFee, serviceFee, programName }: QRPaymentProps) {
  const [paymentReference, setPaymentReference] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a JPG, PNG, or PDF file.',
          variant: 'destructive'
        })
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload a file smaller than 5MB.',
          variant: 'destructive'
        })
        return
      }

      setProofFile(file)
    }
  }

  const handleSubmitProof = async () => {
    if (!paymentReference.trim()) {
      toast({
        title: 'Reference Required',
        description: 'Please enter your payment reference number.',
        variant: 'destructive'
      })
      return
    }

    if (!proofFile) {
      toast({
        title: 'Proof Required',
        description: 'Please upload proof of payment.',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('applicationId', applicationId)
      formData.append('paymentReference', paymentReference)
      formData.append('amount', amount.toString())
      formData.append('paymentMethod', 'qr_code')
      formData.append('proofOfPayment', proofFile)
      formData.append('notes', notes)

      const response = await fetch('/api/payments/manual-verification', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: '✅ Payment Proof Submitted',
          description: 'Your payment proof has been submitted for verification. You will be notified once verified.',
        })
        onPaymentComplete(paymentReference)
      } else {
        throw new Error(result.error || 'Failed to submit payment proof')
      }
    } catch (error) {
      console.error('Payment proof submission error:', error)
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit payment proof. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* QR Code Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            Scan to Pay - R{amount}
          </CardTitle>
          <CardDescription>
            Scan the QR code below with your banking app or payment app
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {/* QR Code Image */}
          <div className="mx-auto mb-6 p-4 bg-white rounded-lg shadow-sm border max-w-sm">
            <div className="w-full flex items-center justify-center mb-4">
              {/* Real Capitec QR Code */}
              <img
                src="/capitecqr.jpg"
                alt="Capitec Scan to Pay QR Code"
                className="w-64 h-64 object-contain rounded-lg"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">CAPITEC SCAN TO PAY</h3>
            <p className="text-2xl font-bold text-blue-600">R{amount}</p>
            {programFee && serviceFee && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between max-w-xs mx-auto">
                  <span>{programName ? `${programName} Fee` : 'Program Fee'}:</span>
                  <span>R{programFee}</span>
                </div>
                <div className="flex justify-between max-w-xs mx-auto">
                  <span>Apply4Me Service Fee:</span>
                  <span>R{serviceFee}</span>
                </div>
                <div className="border-t pt-1 flex justify-between max-w-xs mx-auto font-semibold">
                  <span>Total:</span>
                  <span>R{amount}</span>
                </div>
              </div>
            )}

            {/* Important Payment Amount Notice */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-orange-800 dark:text-orange-200">
                  <p className="font-medium mb-1">⚠️ Important: Payment Amount</p>
                  <p>The QR code shows a default amount. When scanning, please manually enter <strong>R{amount}</strong> as the payment amount in your banking app.</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Scan with Capitec app, other banking apps, or SnapScan/Zapper
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            How to Pay with QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">🏦 Banking Apps</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Capitec:</strong> Pay → Scan to Pay</li>
                <li>• <strong>FNB:</strong> Pay → QR Code</li>
                <li>• <strong>Standard Bank:</strong> Pay → Scan QR</li>
                <li>• <strong>ABSA:</strong> Pay → QR Payment</li>
                <li>• <strong>Nedbank:</strong> Pay → Scan to Pay</li>
                <li className="text-orange-700 dark:text-orange-300 font-medium">• <strong>⚠️ IMPORTANT:</strong> Enter amount R{amount}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">📱 Payment Apps</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>SnapScan:</strong> Scan to Pay</li>
                <li>• <strong>Zapper:</strong> Scan QR Code</li>
                <li>• <strong>PayShap:</strong> QR Payment</li>
                <li>• Scan the QR code above</li>
                <li className="text-orange-700 dark:text-orange-300 font-medium">• <strong>Amount: R{amount}</strong> (enter manually)</li>
                <li>• Complete payment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proof of Payment Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-orange-600" />
            Upload Proof of Payment
          </CardTitle>
          <CardDescription>
            After making payment, upload your proof of payment for verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="reference">Payment Reference Number *</Label>
            <Input
              id="reference"
              placeholder="Enter your payment reference/transaction ID"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="proof">Proof of Payment *</Label>
            <Input
              id="proof"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileUpload}
            />
            {proofFile && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                {proofFile.name} selected
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about your payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleSubmitProof}
            disabled={isSubmitting || !paymentReference.trim() || !proofFile}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting Proof...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit Proof of Payment
              </>
            )}
          </Button>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">Verification Process</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Your payment will be verified within 2-4 hours during business hours.
                  You'll receive a notification once verified and your application will be submitted.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
