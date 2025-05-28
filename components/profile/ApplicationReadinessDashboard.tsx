'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Shield, 
  GraduationCap,
  FileText,
  User,
  Phone,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  DollarSign,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import { StudentProfile, ApplicationReadiness } from '@/lib/types/student-profile'
import { ProfileValidator } from '@/lib/services/profile-validator'

interface ApplicationReadinessDashboardProps {
  profile: StudentProfile
  onUpdateProfile: () => void
  onStartApplication: (institutionId: string) => void
}

export default function ApplicationReadinessDashboard({ 
  profile, 
  onUpdateProfile, 
  onStartApplication 
}: ApplicationReadinessDashboardProps) {
  const [readiness, setReadiness] = useState<ApplicationReadiness | null>(null)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const validator = new ProfileValidator()

  useEffect(() => {
    assessReadiness()
  }, [profile])

  const assessReadiness = () => {
    setIsLoading(true)
    
    // Simulate assessment delay
    setTimeout(() => {
      const assessment = validator.generateApplicationReadiness(profile)
      const recs = validator.getRecommendations(profile)
      
      setReadiness(assessment)
      setRecommendations(recs)
      setIsLoading(false)
    }, 1000)
  }

  if (isLoading || !readiness) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Assessing your application readiness...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getReadinessColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getReadinessStatus = (score: number) => {
    if (score >= 90) return { label: 'Ready to Apply', color: 'bg-green-100 text-green-800' }
    if (score >= 70) return { label: 'Almost Ready', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Needs Attention', color: 'bg-red-100 text-red-800' }
  }

  const status = getReadinessStatus(readiness.readinessScore)

  return (
    <div className="space-y-6">
      {/* Overall Readiness Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Application Readiness
              </CardTitle>
              <CardDescription>
                Your profile completeness and application eligibility
              </CardDescription>
            </div>
            <Badge className={status.color}>
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {readiness.readinessScore}%
              </span>
              <Button variant="outline" size="sm" onClick={assessReadiness}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <Progress value={readiness.readinessScore} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {readiness.readinessScore >= 90 
                ? "Excellent! You're ready to apply to institutions."
                : readiness.readinessScore >= 70
                ? "Good progress! Complete the remaining items to unlock all features."
                : "Let's get your profile ready for applications."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Readiness Checklist */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Sections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {readiness.profileComplete ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                Personal Information
              </span>
              <Badge variant={readiness.profileComplete ? "default" : "destructive"}>
                {readiness.profileComplete ? "Complete" : "Incomplete"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {readiness.contactInfoComplete ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                Contact Information
              </span>
              <Badge variant={readiness.contactInfoComplete ? "default" : "destructive"}>
                {readiness.contactInfoComplete ? "Complete" : "Incomplete"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {readiness.academicInfoComplete ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                Academic History
              </span>
              <Badge variant={readiness.academicInfoComplete ? "default" : "destructive"}>
                {readiness.academicInfoComplete ? "Complete" : "Incomplete"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {readiness.documentsComplete ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                Documents
              </span>
              <Badge variant={readiness.documentsComplete ? "default" : "destructive"}>
                {readiness.documentsComplete ? "Complete" : "Incomplete"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {readiness.identityVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600" />
                )}
                Identity Verification
              </span>
              <Badge variant={readiness.identityVerified ? "default" : "secondary"}>
                {readiness.identityVerified ? "Verified" : "Pending"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {readiness.academicRecordsVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600" />
                )}
                Academic Records
              </span>
              <Badge variant={readiness.academicRecordsVerified ? "default" : "secondary"}>
                {readiness.academicRecordsVerified ? "Verified" : "Pending"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {readiness.documentsVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600" />
                )}
                Documents
              </span>
              <Badge variant={readiness.documentsVerified ? "default" : "secondary"}>
                {readiness.documentsVerified ? "Verified" : "Pending"}
              </Badge>
            </div>

            {!readiness.identityVerified && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Verification happens automatically once your profile is complete.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Eligibility Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Application Eligibility
          </CardTitle>
          <CardDescription>
            Based on your academic qualifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">Universities</h3>
              <Badge 
                variant={readiness.eligibleForUniversity ? "default" : "secondary"}
                className="mt-2"
              >
                {readiness.eligibleForUniversity ? "Eligible" : "Not Eligible"}
              </Badge>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Award className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium">TVET Colleges</h3>
              <Badge 
                variant={readiness.eligibleForTVET ? "default" : "secondary"}
                className="mt-2"
              >
                {readiness.eligibleForTVET ? "Eligible" : "Not Eligible"}
              </Badge>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <h3 className="font-medium">Bursaries</h3>
              <Badge 
                variant={readiness.eligibleForBursaries ? "default" : "secondary"}
                className="mt-2"
              >
                {readiness.eligibleForBursaries ? "Eligible" : "Not Eligible"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missing Items */}
      {(readiness.missingDocuments.length > 0 || readiness.missingInformation.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Missing Items
            </CardTitle>
            <CardDescription>
              Complete these items to improve your readiness score
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {readiness.missingDocuments.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Missing Documents:</h4>
                <div className="flex flex-wrap gap-2">
                  {readiness.missingDocuments.map((doc, index) => (
                    <Badge key={index} variant="destructive">
                      {doc.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {readiness.missingInformation.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Missing Information:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {readiness.missingInformation.slice(0, 5).map((info, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                      {info}
                    </li>
                  ))}
                  {readiness.missingInformation.length > 5 && (
                    <li className="text-xs">
                      +{readiness.missingInformation.length - 5} more items
                    </li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={onUpdateProfile} variant="outline">
          <User className="h-4 w-4 mr-2" />
          Update Profile
        </Button>
        
        {readiness.readinessScore >= 70 && (
          <Button onClick={() => onStartApplication('')}>
            <GraduationCap className="h-4 w-4 mr-2" />
            Start Application
          </Button>
        )}
      </div>
    </div>
  )
}
