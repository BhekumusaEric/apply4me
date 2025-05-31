'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  User,
  Phone,
  GraduationCap,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  Target
} from 'lucide-react'
import { StudentProfile, ProfileStep, ProfileProgress } from '@/lib/types/student-profile'

// Import step components (to be created)
import PersonalInfoStep from './steps/PersonalInfoStep'
import ContactInfoStep from './steps/ContactInfoStep'
import AcademicHistoryStep from './steps/AcademicHistoryStep'
import DocumentUploadStep from './steps/DocumentUploadStep'
import PreferencesStep from './steps/PreferencesStep'
import VerificationStep from './steps/VerificationStep'
import ReviewStep from './steps/ReviewStep'

interface ProfileBuilderProps {
  initialProfile?: Partial<StudentProfile>
  onComplete: (profile: StudentProfile) => void
  onSave: (profile: Partial<StudentProfile>) => void
}

const PROFILE_STEPS: { step: ProfileStep; title: string; description: string; icon: any; estimatedMinutes: number }[] = [
  {
    step: 'PERSONAL_INFO',
    title: 'Personal Information',
    description: 'Basic details, demographics, and family information',
    icon: User,
    estimatedMinutes: 8
  },
  {
    step: 'CONTACT_INFO',
    title: 'Contact Details',
    description: 'Addresses, phone numbers, and emergency contacts',
    icon: Phone,
    estimatedMinutes: 5
  },
  {
    step: 'ACADEMIC_HISTORY',
    title: 'Academic Background',
    description: 'Matric results, previous studies, and achievements',
    icon: GraduationCap,
    estimatedMinutes: 12
  },
  {
    step: 'DOCUMENT_UPLOAD',
    title: 'Document Upload',
    description: 'Upload all required certificates and supporting documents',
    icon: FileText,
    estimatedMinutes: 15
  },
  {
    step: 'PREFERENCES',
    title: 'Study Preferences',
    description: 'Your study goals, financial needs, and notification settings',
    icon: Settings,
    estimatedMinutes: 6
  },
  {
    step: 'VERIFICATION',
    title: 'Verification',
    description: 'Verify your identity and academic records',
    icon: Shield,
    estimatedMinutes: 3
  },
  {
    step: 'REVIEW',
    title: 'Review & Submit',
    description: 'Final review of your complete profile',
    icon: CheckCircle,
    estimatedMinutes: 2
  }
]

export default function ProfileBuilder({ initialProfile, onComplete, onSave }: ProfileBuilderProps) {
  const [currentStep, setCurrentStep] = useState<ProfileStep>('PERSONAL_INFO')
  const [profile, setProfile] = useState<Partial<StudentProfile>>(initialProfile || {})
  const [progress, setProgress] = useState<ProfileProgress>({
    currentStep: 'PERSONAL_INFO',
    completedSteps: [],
    totalSteps: PROFILE_STEPS.length,
    estimatedTimeRemaining: 51 // Total estimated minutes
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Calculate progress percentage
  const progressPercentage = (progress.completedSteps.length / progress.totalSteps) * 100

  // Get current step info
  const currentStepInfo = PROFILE_STEPS.find(step => step.step === currentStep)
  const currentStepIndex = PROFILE_STEPS.findIndex(step => step.step === currentStep)

  // Handle step completion
  const handleStepComplete = (stepData: any) => {
    const updatedProfile = { ...profile, ...stepData }
    setProfile(updatedProfile)

    // Mark step as completed
    if (!progress.completedSteps.includes(currentStep)) {
      const newCompletedSteps = [...progress.completedSteps, currentStep]
      const remainingTime = PROFILE_STEPS
        .filter(step => !newCompletedSteps.includes(step.step))
        .reduce((total, step) => total + step.estimatedMinutes, 0)

      setProgress({
        ...progress,
        completedSteps: newCompletedSteps,
        estimatedTimeRemaining: remainingTime
      })
    }

    // Auto-save progress
    onSave(updatedProfile)

    // Move to next step
    if (currentStepIndex < PROFILE_STEPS.length - 1) {
      const nextStep = PROFILE_STEPS[currentStepIndex + 1].step
      setCurrentStep(nextStep)
      setProgress(prev => ({ ...prev, currentStep: nextStep }))
    } else {
      // Profile complete
      onComplete(updatedProfile as StudentProfile)
    }
  }

  // Handle step navigation
  const goToStep = (step: ProfileStep) => {
    setCurrentStep(step)
    setProgress(prev => ({ ...prev, currentStep: step }))
  }

  // Render current step component
  const renderCurrentStep = () => {
    const stepProps = {
      profile,
      onComplete: handleStepComplete,
      onBack: currentStepIndex > 0 ? () => goToStep(PROFILE_STEPS[currentStepIndex - 1].step) : undefined
    }

    switch (currentStep) {
      case 'PERSONAL_INFO':
        return <PersonalInfoStep {...stepProps} />
      case 'CONTACT_INFO':
        return <ContactInfoStep {...stepProps} />
      case 'ACADEMIC_HISTORY':
        return <AcademicHistoryStep {...stepProps} />
      case 'DOCUMENT_UPLOAD':
        return <DocumentUploadStep {...stepProps} />
      case 'PREFERENCES':
        return <PreferencesStep {...stepProps} />
      case 'VERIFICATION':
        return <VerificationStep {...stepProps} />
      case 'REVIEW':
        return <ReviewStep {...stepProps} />
      default:
        return <div>Unknown step</div>
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Complete Your Student Profile</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create a comprehensive profile to enable Apply4Me to submit applications on your behalf.
          This one-time setup ensures we have all the information needed for South African higher education applications.
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Profile Progress
              </CardTitle>
              <CardDescription>
                Step {currentStepIndex + 1} of {PROFILE_STEPS.length} • {Math.round(progressPercentage)}% Complete
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                ~{progress.estimatedTimeRemaining} min remaining
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="mb-4" />

          {/* Step Navigation */}
          <div className="grid grid-cols-7 gap-2">
            {PROFILE_STEPS.map((step, index) => {
              const isCompleted = progress.completedSteps.includes(step.step)
              const isCurrent = currentStep === step.step
              const isAccessible = index <= currentStepIndex || isCompleted

              return (
                <button
                  key={step.step}
                  onClick={() => isAccessible && goToStep(step.step)}
                  disabled={!isAccessible}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    isCurrent
                      ? 'border-primary bg-primary/10 text-primary'
                      : isCompleted
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : isAccessible
                      ? 'border-gray-200 hover:border-gray-300 text-gray-600'
                      : 'border-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                    <span className="text-xs font-medium">{step.title}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Info */}
      {currentStepInfo && (
        <Alert>
          <currentStepInfo.icon className="h-4 w-4" />
          <AlertDescription>
            <strong>{currentStepInfo.title}:</strong> {currentStepInfo.description}
            <span className="text-muted-foreground ml-2">
              (Est. {currentStepInfo.estimatedMinutes} minutes)
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Step Content */}
      <div className="min-h-[600px]">
        {renderCurrentStep()}
      </div>

      {/* Benefits Reminder */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Why Complete Your Profile?</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• <strong>One-time setup:</strong> Never fill application forms again</li>
                <li>• <strong>Automatic applications:</strong> We apply to institutions on your behalf</li>
                <li>• <strong>Smart matching:</strong> Get matched with relevant opportunities</li>
                <li>• <strong>Document management:</strong> All your certificates in one secure place</li>
                <li>• <strong>Deadline tracking:</strong> Never miss an application deadline</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
