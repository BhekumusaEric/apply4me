'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  User,
  FileText,
  Target,
  TestTube,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import ProfileBuilder from '@/components/profile/ProfileBuilder'
import ApplicationReadinessDashboard from '@/components/profile/ApplicationReadinessDashboard'
import { StudentProfile } from '@/lib/types/student-profile'

export default function ProfileTestPage() {
  const [currentView, setCurrentView] = useState<'builder' | 'dashboard'>('builder')
  const [studentProfile, setStudentProfile] = useState<Partial<StudentProfile>>({})
  const [isProfileComplete, setIsProfileComplete] = useState(false)

  // No sample profile - use real data only
  const sampleProfile: StudentProfile | null = null

  const handleProfileComplete = (profile: StudentProfile) => {
    setStudentProfile(profile)
    setIsProfileComplete(true)
    setCurrentView('dashboard')
  }

  const handleProfileSave = (profile: Partial<StudentProfile>) => {
    setStudentProfile(profile)
  }

  const handleUpdateProfile = () => {
    setCurrentView('builder')
  }

  const handleStartApplication = (institutionId: string) => {
    alert('🎉 Application process would start here! Integration with institution APIs coming next.')
  }

  const loadSampleProfile = () => {
    // No sample profile available - use real data only
    alert('No sample profile available. Please use the Profile Builder to create a real profile.')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TestTube className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold">Student Profile System Test</h1>
            <Sparkles className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Test the comprehensive student profile and document management system designed for
            South African higher education applications.
          </p>
        </div>

        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Test Controls
            </CardTitle>
            <CardDescription>
              Choose how you want to test the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => setCurrentView('builder')}
                variant={currentView === 'builder' ? 'default' : 'outline'}
              >
                <User className="h-4 w-4 mr-2" />
                Profile Builder
              </Button>

              <Button
                onClick={loadSampleProfile}
                variant="outline"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Load Sample Profile
              </Button>

              <Button
                onClick={() => setCurrentView('dashboard')}
                variant={currentView === 'dashboard' ? 'default' : 'outline'}
                disabled={!isProfileComplete}
              >
                <FileText className="h-4 w-4 mr-2" />
                Readiness Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Features Overview */}
        <Alert className="mb-8">
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            <strong>🎯 What you're testing:</strong> Complete student profile system with SA ID validation,
            document upload, academic history tracking, application readiness assessment, and automated
            eligibility checking for universities, TVET colleges, and bursaries.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        {currentView === 'builder' && (
          <ProfileBuilder
            initialProfile={studentProfile}
            onComplete={handleProfileComplete}
            onSave={handleProfileSave}
          />
        )}

        {currentView === 'dashboard' && isProfileComplete && (
          <ApplicationReadinessDashboard
            profile={studentProfile as StudentProfile}
            onUpdateProfile={handleUpdateProfile}
            onStartApplication={handleStartApplication}
          />
        )}

        {/* Features Showcase */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🚀 System Features Being Tested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">🆔 SA ID Validation</h3>
                <p className="text-sm text-muted-foreground">
                  Validates South African ID numbers with Luhn algorithm and auto-extracts date of birth
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">📄 Document Management</h3>
                <p className="text-sm text-muted-foreground">
                  Secure upload, validation, and verification of all required SA education documents
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">🎓 Academic Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Complete matric results, APS calculation, and eligibility assessment
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">📊 Readiness Scoring</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time assessment of application readiness with personalized recommendations
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">🎯 Smart Matching</h3>
                <p className="text-sm text-muted-foreground">
                  Eligibility checking for universities, TVET colleges, and bursary programs
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">🔒 Security & Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  Encrypted storage, secure uploads, and privacy-compliant data handling
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
