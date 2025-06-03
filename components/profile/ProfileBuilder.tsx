'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Phone, 
  GraduationCap, 
  FileText, 
  Shield, 
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { StudentProfile } from '@/lib/types/student-profile'
import PersonalInfoStep from './steps/PersonalInfoStep'
import VerificationStep from './steps/VerificationStep'
import ReviewStep from './steps/ReviewStep'

interface ProfileBuilderProps {
  initialProfile?: Partial<StudentProfile>
  onComplete: (profile: StudentProfile) => void
  onSave?: (profile: Partial<StudentProfile>) => void
}

type ProfileStep = 'personal' | 'contact' | 'academic' | 'documents' | 'verification' | 'review'

const STEPS: { key: ProfileStep; title: string; icon: any; description: string }[] = [
  { key: 'personal', title: 'Personal Info', icon: User, description: 'Basic personal information' },
  { key: 'contact', title: 'Contact Info', icon: Phone, description: 'Contact details and addresses' },
  { key: 'academic', title: 'Academic History', icon: GraduationCap, description: 'Educational background' },
  { key: 'documents', title: 'Documents', icon: FileText, description: 'Upload required documents' },
  { key: 'verification', title: 'Verification', icon: Shield, description: 'Verify your information' },
  { key: 'review', title: 'Review', icon: CheckCircle, description: 'Review and submit' }
]

export default function ProfileBuilder({ initialProfile = {}, onComplete, onSave }: ProfileBuilderProps) {
  const [currentStep, setCurrentStep] = useState<ProfileStep>('personal')
  const [profile, setProfile] = useState<Partial<StudentProfile>>(initialProfile)
  const [completedSteps, setCompletedSteps] = useState<ProfileStep[]>([])

  const currentStepIndex = STEPS.findIndex(step => step.key === currentStep)
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  const handleStepComplete = (stepData: any) => {
    const updatedProfile = { ...profile, ...stepData }
    setProfile(updatedProfile)
    
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }

    // Auto-save if handler provided
    if (onSave) {
      onSave(updatedProfile)
    }

    // Move to next step
    const nextStepIndex = currentStepIndex + 1
    if (nextStepIndex < STEPS.length) {
      setCurrentStep(STEPS[nextStepIndex].key)
    }
  }

  const handleBack = () => {
    const prevStepIndex = currentStepIndex - 1
    if (prevStepIndex >= 0) {
      setCurrentStep(STEPS[prevStepIndex].key)
    }
  }

  const handleFinalComplete = (finalProfile: StudentProfile) => {
    onComplete(finalProfile)
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <PersonalInfoStep
            profile={profile}
            onComplete={handleStepComplete}
          />
        )
      case 'verification':
        return (
          <VerificationStep
            profile={profile}
            onComplete={handleStepComplete}
            onBack={handleBack}
          />
        )
      case 'review':
        return (
          <ReviewStep
            profile={profile}
            onComplete={handleFinalComplete}
            onBack={handleBack}
          />
        )
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step Under Development</CardTitle>
              <CardDescription>
                This step is being developed. For now, you can skip to the next step.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {currentStepIndex > 0 && (
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                <Button onClick={() => handleStepComplete({})}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Profile Builder</CardTitle>
              <CardDescription>
                Complete your profile to unlock application opportunities
              </CardDescription>
            </div>
            <Badge variant="outline">
              Step {currentStepIndex + 1} of {STEPS.length}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.key)
              const isCurrent = step.key === currentStep
              const Icon = step.icon

              return (
                <Button
                  key={step.key}
                  variant={isCurrent ? 'default' : isCompleted ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentStep(step.key)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {step.title}
                  {isCompleted && <CheckCircle className="h-3 w-3" />}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      {renderCurrentStep()}

      {/* Help Section */}
      <Alert>
        <AlertDescription>
          💡 <strong>Tip:</strong> Your progress is automatically saved as you complete each step. 
          You can return anytime to continue where you left off.
        </AlertDescription>
      </Alert>
    </div>
  )
}
