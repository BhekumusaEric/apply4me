'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Home,
  User,
  Shield,
  GraduationCap,
  Target
} from 'lucide-react'
import ProfileBuilder from '@/components/profile/ProfileBuilder'
import ApplicationReadinessDashboard from '@/components/profile/ApplicationReadinessDashboard'
import { StudentProfile } from '@/lib/types/student-profile'

function ProfileSetupContent() {
  const [currentView, setCurrentView] = useState<'welcome' | 'builder' | 'dashboard'>('welcome')
  const [studentProfile, setStudentProfile] = useState<Partial<StudentProfile>>({})
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === 'true'
  const supabase = createClient()

  useEffect(() => {
    checkUserAndProfile()
  }, [])

  const checkUserAndProfile = async () => {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/auth/signin')
        return
      }

      setUser(user)

      // Check if profile already exists
      const response = await fetch('/api/profile')
      if (response.ok) {
        const { profile } = await response.json()

        if (profile) {
          setStudentProfile(profile)
          setIsProfileComplete(profile.profileCompleteness >= 90)

          // If profile is complete, show dashboard
          if (profile.profileCompleteness >= 90) {
            setCurrentView('dashboard')
          } else {
            setCurrentView('builder')
          }
        } else {
          // No profile exists, start with welcome or builder
          setCurrentView(isWelcome ? 'welcome' : 'builder')
        }
      }
    } catch (error) {
      console.error('Error checking profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileComplete = async (profile: StudentProfile) => {
    try {
      // Save profile to database
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      })

      if (response.ok) {
        setStudentProfile(profile)
        setIsProfileComplete(true)
        setCurrentView('dashboard')
      } else {
        console.error('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleProfileSave = async (profile: Partial<StudentProfile>) => {
    try {
      // Auto-save profile progress
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      })

      if (response.ok) {
        setStudentProfile(profile)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleUpdateProfile = () => {
    setCurrentView('builder')
  }

  const handleStartApplication = (institutionId: string) => {
    // Redirect to institutions page or specific institution
    if (institutionId) {
      router.push(`/institutions/${institutionId}`)
    } else {
      router.push('/institutions')
    }
  }

  const startProfileSetup = () => {
    setCurrentView('builder')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
              {currentView !== 'welcome' && (
                <Button variant="outline" size="sm" onClick={() => setCurrentView('welcome')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Profile Setup</span>
              {currentView === 'welcome' && <Badge variant="outline">Welcome</Badge>}
              {currentView === 'builder' && <Badge variant="outline">Building</Badge>}
              {currentView === 'dashboard' && <Badge variant="default">Complete</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Welcome View */}
      {currentView === 'welcome' && (
        <div className="py-12">
          <div className="max-w-4xl mx-auto px-4">
            {/* Welcome Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="h-12 w-12 text-yellow-500" />
                <h1 className="text-4xl font-bold">Welcome to Apply4Me!</h1>
                <Sparkles className="h-12 w-12 text-yellow-500" />
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                You're about to experience the most comprehensive student application platform in South Africa.
                Let's set up your profile so we can apply to institutions on your behalf.
              </p>
            </div>

            {/* Welcome Message for New Users */}
            {isWelcome && (
              <Alert className="mb-8 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>🎉 Account Created Successfully!</strong> Welcome {user?.user_metadata?.full_name || user?.email}!
                  Your Apply4Me journey starts here.
                </AlertDescription>
              </Alert>
            )}

            {/* Benefits Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>One-Time Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Complete your profile once and never fill application forms again.
                    We handle all the paperwork for you.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Secure & Verified</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your documents are encrypted and verified. We ensure all applications
                    meet institution requirements.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Smart Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get matched with programs that fit your academic background,
                    interests, and financial needs.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* What We'll Collect */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  What We'll Set Up Together
                </CardTitle>
                <CardDescription>
                  This comprehensive profile covers everything South African institutions require
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">📋 Profile Information</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Personal details (ID, demographics)</li>
                      <li>• Contact information & addresses</li>
                      <li>• Emergency contacts</li>
                      <li>• Study preferences & goals</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">🎓 Academic Records</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Matric certificate & results</li>
                      <li>• Subject-by-subject marks</li>
                      <li>• APS score calculation</li>
                      <li>• Previous qualifications</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">📄 Required Documents</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• ID document & passport photo</li>
                      <li>• Academic certificates</li>
                      <li>• Financial documents</li>
                      <li>• Supporting documentation</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">✅ Verification & Readiness</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Document authenticity check</li>
                      <li>• Academic record verification</li>
                      <li>• Application readiness assessment</li>
                      <li>• Eligibility confirmation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Estimate */}
            <Alert className="mb-8">
              <Target className="h-4 w-4" />
              <AlertDescription>
                <strong>⏱️ Time Required:</strong> Approximately 15-20 minutes to complete.
                You can save your progress and continue later at any time.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Button onClick={startProfileSetup} size="lg" className="px-8">
                  Start Profile Setup
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/institutions">
                    Skip for Now - Browse Institutions
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Ready to unlock automatic applications to South African institutions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Builder View */}
      {currentView === 'builder' && (
        <div className="py-8">
          <ProfileBuilder
            initialProfile={studentProfile}
            onComplete={handleProfileComplete}
            onSave={handleProfileSave}
          />
        </div>
      )}

      {/* Dashboard View */}
      {currentView === 'dashboard' && isProfileComplete && (
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">🎉 Profile Complete!</h1>
              <p className="text-muted-foreground">
                Your comprehensive student profile is ready. You can now apply to institutions automatically.
              </p>
            </div>

            <ApplicationReadinessDashboard
              profile={studentProfile as StudentProfile}
              onUpdateProfile={handleUpdateProfile}
              onStartApplication={handleStartApplication}
            />

            {/* Quick Actions */}
            <div className="mt-8 text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/institutions">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Browse Institutions
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/dashboard">
                    <Target className="h-5 w-5 mr-2" />
                    Go to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" size="lg" onClick={handleUpdateProfile}>
                  <User className="h-5 w-5 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile setup...</p>
        </div>
      </div>
    }>
      <ProfileSetupContent />
    </Suspense>
  )
}
