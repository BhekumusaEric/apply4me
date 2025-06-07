'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Chrome, CheckCircle, AlertCircle, Loader2, Shield, Cloud, FileText, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface GoogleSignInButtonProps {
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showFeatures?: boolean
  redirectTo?: string
}

export function GoogleSignInButton({ 
  variant = 'default', 
  size = 'default', 
  className = '',
  showFeatures = false,
  redirectTo = '/dashboard'
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      
      const result = await signIn('google', {
        callbackUrl: redirectTo,
        redirect: false
      })

      if (result?.error) {
        toast({
          title: 'Sign-in Failed',
          description: 'There was an error signing in with Google. Please try again.',
          variant: 'destructive'
        })
      } else if (result?.ok) {
        toast({
          title: 'Success!',
          description: 'Successfully signed in with Google.',
          variant: 'default'
        })
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
      toast({
        title: 'Sign-in Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If user is already signed in
  if (status === 'authenticated' && session) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-lg">Signed In</CardTitle>
          <CardDescription>
            Welcome back, {session.user?.name}!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <img 
              src={session.user?.image || '/default-avatar.png'} 
              alt="Profile" 
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium">{session.user?.name}</p>
              <p className="text-sm text-muted-foreground">{session.user?.email}</p>
            </div>
          </div>
          <Badge variant="secondary" className="w-full justify-center">
            <Chrome className="w-4 h-4 mr-2" />
            Connected with Google
          </Badge>
        </CardContent>
      </Card>
    )
  }

  // Loading state
  if (status === 'loading') {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  // Sign-in button with features
  if (showFeatures) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Chrome className="h-8 w-8 text-blue-500" />
          </div>
          <CardTitle className="text-xl">Sign in with Google</CardTitle>
          <CardDescription>
            Connect your Google account to unlock powerful features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Features List */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-sm">Secure Authentication</p>
                <p className="text-xs text-muted-foreground">Google's trusted security</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Cloud className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium text-sm">Cloud Storage</p>
                <p className="text-xs text-muted-foreground">Store documents in Google Drive</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-sm">Application Tracking</p>
                <p className="text-xs text-muted-foreground">Automatic Google Sheets integration</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium text-sm">Deadline Reminders</p>
                <p className="text-xs text-muted-foreground">Calendar integration for deadlines</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Sign-in Button */}
          <Button 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Chrome className="mr-2 h-4 w-4" />
                Continue with Google
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    )
  }

  // Simple button
  return (
    <Button 
      variant={variant}
      size={size}
      className={className}
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <Chrome className="mr-2 h-4 w-4" />
          Sign in with Google
        </>
      )}
    </Button>
  )
}

// Google Services Status Component
export function GoogleServicesStatus() {
  const { data: session } = useSession()
  
  if (!session) return null

  const services = [
    { name: 'Google Drive', icon: Cloud, status: 'connected', description: 'Document storage' },
    { name: 'Google Sheets', icon: FileText, status: 'connected', description: 'Application tracking' },
    { name: 'Google Calendar', icon: Calendar, status: 'available', description: 'Deadline reminders' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Chrome className="mr-2 h-5 w-5" />
          Google Services
        </CardTitle>
        <CardDescription>
          Connected services for enhanced functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <service.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </div>
              </div>
              <Badge 
                variant={service.status === 'connected' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {service.status === 'connected' ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Available
                  </>
                )}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
