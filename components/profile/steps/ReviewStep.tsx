'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  User, 
  Phone, 
  GraduationCap, 
  FileText, 
  Settings,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { StudentProfile } from '@/lib/types/student-profile'

interface ReviewStepProps {
  profile: Partial<StudentProfile>
  onComplete: (profile: StudentProfile) => void
  onBack?: () => void
}

export default function ReviewStep({ profile, onComplete, onBack }: ReviewStepProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = () => {
    setIsLoading(true)
    
    // Finalize profile
    const finalProfile: StudentProfile = {
      ...profile,
      profileCompleteness: 100,
      lastUpdated: new Date().toISOString(),
      isVerified: true,
      applicationReadiness: {
        profileComplete: true,
        documentsComplete: true,
        academicInfoComplete: true,
        contactInfoComplete: true,
        identityVerified: true,
        academicRecordsVerified: true,
        documentsVerified: true,
        eligibleForUniversity: profile.academicHistory?.matricInfo?.overallResult === 'Bachelor Pass',
        eligibleForTVET: true,
        eligibleForBursaries: true,
        missingDocuments: [],
        missingInformation: [],
        readinessScore: 100,
        lastAssessment: new Date().toISOString()
      }
    } as StudentProfile

    setTimeout(() => {
      onComplete(finalProfile)
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          <strong>🎉 Profile Complete!</strong> Review your information below and submit to activate 
          automatic applications. You can edit any section later if needed.
        </AlertDescription>
      </Alert>

      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Profile Summary
          </CardTitle>
          <CardDescription>
            Your complete student profile for Apply4Me
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4" />
              <h3 className="font-medium">Personal Information</h3>
              <Badge variant="default">Complete</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span> {profile.personalInfo?.firstName} {profile.personalInfo?.lastName}
              </div>
              <div>
                <span className="text-muted-foreground">ID Number:</span> {profile.personalInfo?.idNumber}
              </div>
              <div>
                <span className="text-muted-foreground">Date of Birth:</span> {profile.personalInfo?.dateOfBirth}
              </div>
              <div>
                <span className="text-muted-foreground">Province:</span> {profile.personalInfo?.currentProvince}
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Phone className="h-4 w-4" />
              <h3 className="font-medium">Contact Information</h3>
              <Badge variant="default">Complete</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span> {profile.contactInfo?.email}
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span> {profile.contactInfo?.phone}
              </div>
              <div>
                <span className="text-muted-foreground">City:</span> {profile.contactInfo?.currentAddress?.city}
              </div>
              <div>
                <span className="text-muted-foreground">Emergency Contact:</span> {profile.contactInfo?.emergencyContact?.name}
              </div>
            </div>
          </div>

          <Separator />

          {/* Academic History */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-4 w-4" />
              <h3 className="font-medium">Academic History</h3>
              <Badge variant="default">Complete</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">School:</span> {profile.academicHistory?.matricInfo?.school}
              </div>
              <div>
                <span className="text-muted-foreground">Matric Year:</span> {profile.academicHistory?.matricInfo?.year}
              </div>
              <div>
                <span className="text-muted-foreground">Overall Result:</span> {profile.academicHistory?.matricInfo?.overallResult}
              </div>
              <div>
                <span className="text-muted-foreground">APS Score:</span> {profile.academicHistory?.matricInfo?.apsScore}
              </div>
            </div>
          </div>

          <Separator />

          {/* Documents */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4" />
              <h3 className="font-medium">Documents</h3>
              <Badge variant="default">Complete</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                ID Document
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Passport Photo
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Matric Certificate
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Matric Results
              </div>
            </div>
          </div>

          <Separator />

          {/* Preferences */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4" />
              <h3 className="font-medium">Study Preferences</h3>
              <Badge variant="default">Complete</Badge>
            </div>
            <div className="text-sm">
              <div className="mb-2">
                <span className="text-muted-foreground">Preferred Fields:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.preferences?.preferredFields?.map(field => (
                    <Badge key={field} variant="outline" className="text-xs">{field}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Preferred Provinces:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.preferences?.preferredProvinces?.map(province => (
                    <Badge key={province} variant="outline" className="text-xs">{province}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What Happens Next */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">🚀 What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <h4 className="font-medium">Profile Activation</h4>
                <p className="text-sm">Your profile will be activated and ready for applications</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <h4 className="font-medium">Smart Matching</h4>
                <p className="text-sm">We'll match you with suitable institutions and programs</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <h4 className="font-medium">Automatic Applications</h4>
                <p className="text-sm">Apply4Me will submit applications on your behalf</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <div>
                <h4 className="font-medium">Progress Tracking</h4>
                <p className="text-sm">Track all your applications in one dashboard</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Activating Profile...
            </>
          ) : (
            <>
              Complete Profile
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
