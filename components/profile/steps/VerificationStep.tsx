'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { StudentProfile } from '@/lib/types/student-profile'

interface VerificationStepProps {
  profile: Partial<StudentProfile>
  onComplete: (data: any) => void
  onBack?: () => void
}

export default function VerificationStep({ profile, onComplete, onBack }: VerificationStepProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState({
    identity: 'pending',
    academic: 'pending',
    documents: 'pending'
  })

  const startVerification = () => {
    setIsLoading(true)
    
    // Simulate verification process
    setTimeout(() => {
      setVerificationStatus({
        identity: 'verified',
        academic: 'verified', 
        documents: 'verified'
      })
      setIsLoading(false)
    }, 3000)
  }

  const handleSubmit = () => {
    onComplete({
      verificationComplete: true,
      verificationDate: new Date().toISOString()
    })
  }

  const allVerified = Object.values(verificationStatus).every(status => status === 'verified')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Profile Verification
          </CardTitle>
          <CardDescription>
            We'll verify your information to ensure application accuracy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Verification is automatic and typically takes 2-3 minutes. We check your ID number, 
              academic records, and document authenticity.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {verificationStatus.identity === 'verified' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : verificationStatus.identity === 'pending' ? (
                  <Clock className="h-5 w-5 text-yellow-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <h3 className="font-medium">Identity Verification</h3>
                  <p className="text-sm text-muted-foreground">SA ID number validation</p>
                </div>
              </div>
              <Badge variant={
                verificationStatus.identity === 'verified' ? 'default' : 
                verificationStatus.identity === 'pending' ? 'secondary' : 'destructive'
              }>
                {verificationStatus.identity === 'verified' ? 'Verified' : 
                 verificationStatus.identity === 'pending' ? 'Pending' : 'Failed'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {verificationStatus.academic === 'verified' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : verificationStatus.academic === 'pending' ? (
                  <Clock className="h-5 w-5 text-yellow-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <h3 className="font-medium">Academic Records</h3>
                  <p className="text-sm text-muted-foreground">Matric results verification</p>
                </div>
              </div>
              <Badge variant={
                verificationStatus.academic === 'verified' ? 'default' : 
                verificationStatus.academic === 'pending' ? 'secondary' : 'destructive'
              }>
                {verificationStatus.academic === 'verified' ? 'Verified' : 
                 verificationStatus.academic === 'pending' ? 'Pending' : 'Failed'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {verificationStatus.documents === 'verified' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : verificationStatus.documents === 'pending' ? (
                  <Clock className="h-5 w-5 text-yellow-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <h3 className="font-medium">Document Verification</h3>
                  <p className="text-sm text-muted-foreground">Document authenticity check</p>
                </div>
              </div>
              <Badge variant={
                verificationStatus.documents === 'verified' ? 'default' : 
                verificationStatus.documents === 'pending' ? 'secondary' : 'destructive'
              }>
                {verificationStatus.documents === 'verified' ? 'Verified' : 
                 verificationStatus.documents === 'pending' ? 'Pending' : 'Failed'}
              </Badge>
            </div>
          </div>

          {!isLoading && !allVerified && (
            <Button onClick={startVerification} className="w-full">
              Start Verification Process
            </Button>
          )}

          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Verifying your information...</p>
            </div>
          )}

          {allVerified && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Verification Complete!</strong> Your profile has been successfully verified. 
                You can now proceed to submit applications.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={!allVerified}>
          Continue
        </Button>
      </div>
    </div>
  )
}
