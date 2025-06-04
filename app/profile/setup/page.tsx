'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, User, CheckCircle, AlertCircle } from 'lucide-react'
import ProfileBuilder from '@/components/profile/ProfileBuilder'
import { StudentProfile } from '@/lib/types/student-profile'
import { useAuth } from '@/app/providers'
import { Header } from '@/components/layout/header'

export default function ProfileSetupPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [existingProfile, setExistingProfile] = useState<Partial<StudentProfile> | null>(null)
  const [setupComplete, setSetupComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    
    loadExistingProfile()
  }, [user, router])

  const loadExistingProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile')
      
      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          setExistingProfile(data.profile)
          
          // If profile is already quite complete, show completion message
          if (data.profile.profileCompleteness >= 90) {
            setSetupComplete(true)
          }
        }
      } else if (response.status === 401) {
        router.push('/auth/signin')
        return
      }
      // If no profile exists or error, we'll start fresh
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load existing profile. Starting fresh.')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileComplete = async (profile: StudentProfile) => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile }),
      })

      if (response.ok) {
        setSetupComplete(true)
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save profile')
      }
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = async (profile: Partial<StudentProfile>) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error saving profile:', errorData)
      }
    } catch (err) {
      console.error('Error saving profile:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12 max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your profile...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12 max-w-4xl">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">Profile Setup Complete! 🎉</CardTitle>
              <CardDescription>
                Your comprehensive student profile has been successfully created and saved.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
                <ul className="text-sm text-green-700 space-y-1 text-left">
                  <li>• Browse and apply to South African institutions</li>
                  <li>• Upload required documents for verification</li>
                  <li>• Track your application progress</li>
                  <li>• Receive personalized recommendations</li>
                </ul>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button onClick={() => router.push('/dashboard')}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => router.push('/institutions')}>
                  Browse Institutions
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Complete Your Student Profile</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create your comprehensive student profile to unlock automatic applications, 
              smart matching, and personalized recommendations for South African institutions.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Benefits Banner */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900">Smart Matching</h3>
                <p className="text-sm text-blue-700">Get matched with institutions based on your profile</p>
              </div>
              <div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900">Auto Applications</h3>
                <p className="text-sm text-blue-700">Apply to multiple institutions with one profile</p>
              </div>
              <div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900">Readiness Score</h3>
                <p className="text-sm text-blue-700">Track your application readiness in real-time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Builder */}
        <ProfileBuilder
          initialProfile={existingProfile || {}}
          onComplete={handleProfileComplete}
          onSave={handleProfileSave}
        />
      </main>
    </div>
  )
}
