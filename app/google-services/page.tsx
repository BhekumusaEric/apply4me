'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Chrome, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Cloud, 
  FileText, 
  Calendar,
  Settings,
  TestTube,
  AlertTriangle,
  Info
} from 'lucide-react'
import { GoogleSignInButton, GoogleServicesStatus } from '@/components/auth/google-signin-button'
import { useToast } from '@/hooks/use-toast'

interface TestResult {
  success: boolean
  message?: string
  error?: string
  details?: any
  tests?: any
  environment?: any
  recommendations?: string[]
}

export default function GoogleServicesPage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const runGoogleServicesTest = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/google/test')
      const result = await response.json()
      setTestResult(result)
      
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'All Google services are working correctly.',
          variant: 'default'
        })
      } else {
        toast({
          title: 'Test Failed',
          description: result.error || 'Some Google services have issues.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Test error:', error)
      setTestResult({
        success: false,
        error: 'Failed to run Google services test',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
      toast({
        title: 'Test Error',
        description: 'Failed to run Google services test.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createTestTrackingSheet = async () => {
    try {
      const response = await fetch('/api/google/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_tracking_sheet',
          data: {
            studentName: 'Test Student',
            studentEmail: 'test@example.com'
          }
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: 'Success!',
          description: 'Test tracking spreadsheet created successfully.',
          variant: 'default'
        })
      } else {
        toast({
          title: 'Failed',
          description: result.error || 'Failed to create tracking sheet.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create test tracking sheet.',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <Chrome className="h-12 w-12 text-blue-500 mr-4" />
          <div>
            <h1 className="text-3xl font-bold">Google Services Integration</h1>
            <p className="text-muted-foreground">
              Connect and test Google services for Apply4Me
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Google Drive */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cloud className="mr-2 h-5 w-5 text-blue-500" />
                  Google Drive
                </CardTitle>
                <CardDescription>
                  Secure document storage and sharing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>• Store student documents securely</li>
                  <li>• Share files with institutions</li>
                  <li>• Automatic backup and sync</li>
                  <li>• Access from anywhere</li>
                </ul>
              </CardContent>
            </Card>

            {/* Google Sheets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-green-500" />
                  Google Sheets
                </CardTitle>
                <CardDescription>
                  Application tracking and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>• Track application progress</li>
                  <li>• Monitor payment status</li>
                  <li>• Document submission timeline</li>
                  <li>• Generate reports</li>
                </ul>
              </CardContent>
            </Card>

            {/* Google Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-purple-500" />
                  Google Calendar
                </CardTitle>
                <CardDescription>
                  Deadline reminders and scheduling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>• Application deadline alerts</li>
                  <li>• Interview scheduling</li>
                  <li>• Important date reminders</li>
                  <li>• Calendar integration</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <GoogleServicesStatus />
        </TabsContent>

        {/* Sign In Tab */}
        <TabsContent value="signin" className="space-y-6">
          <div className="flex justify-center">
            <GoogleSignInButton showFeatures={true} />
          </div>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TestTube className="mr-2 h-5 w-5" />
                Google Services Testing
              </CardTitle>
              <CardDescription>
                Test the integration and functionality of Google services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Button 
                  onClick={runGoogleServicesTest}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="mr-2 h-4 w-4" />
                      Run Full Test
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={createTestTrackingSheet}
                  variant="outline"
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Test Sheets
                </Button>
              </div>

              {testResult && (
                <div className="space-y-4">
                  <Separator />
                  
                  <Alert variant={testResult.success ? 'default' : 'destructive'}>
                    <div className="flex items-center">
                      {testResult.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertDescription className="ml-2">
                        {testResult.message || testResult.error}
                      </AlertDescription>
                    </div>
                  </Alert>

                  {testResult.tests && (
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Credentials</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge variant={testResult.tests.credentials?.success ? 'default' : 'destructive'}>
                            {testResult.tests.credentials?.success ? 'Pass' : 'Fail'}
                          </Badge>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Google Drive</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge variant={testResult.tests.drive?.success ? 'default' : 'destructive'}>
                            {testResult.tests.drive?.success ? 'Pass' : 'Fail'}
                          </Badge>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Google Sheets</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge variant={testResult.tests.sheets?.success ? 'default' : 'destructive'}>
                            {testResult.tests.sheets?.success ? 'Pass' : 'Fail'}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {testResult.recommendations && (
                    <div>
                      <h4 className="font-medium mb-2">Recommendations:</h4>
                      <ul className="text-sm space-y-1">
                        {testResult.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Setup Instructions
              </CardTitle>
              <CardDescription>
                Configure Google services for Apply4Me
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> You need to configure Google Cloud credentials and OAuth settings for full functionality.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Required Environment Variables:</h4>
                  <div className="bg-muted p-4 rounded-lg text-sm font-mono space-y-1">
                    <div>GOOGLE_CLOUD_PROJECT_ID=apply4me</div>
                    <div>GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json</div>
                    <div>GOOGLE_CLIENT_ID=your-oauth-client-id</div>
                    <div>GOOGLE_CLIENT_SECRET=your-oauth-client-secret</div>
                    <div>NEXTAUTH_SECRET=your-nextauth-secret</div>
                    <div>NEXTAUTH_URL=http://localhost:3000</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Setup Steps:</h4>
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    <li>Create a Google Cloud Project</li>
                    <li>Enable Google Drive, Sheets, and Calendar APIs</li>
                    <li>Create a service account and download credentials</li>
                    <li>Set up OAuth 2.0 credentials for web application</li>
                    <li>Configure environment variables</li>
                    <li>Test the integration using the testing tab</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
