'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, FileSpreadsheet, Plus, ExternalLink, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Application {
  institutionName: string
  program: string
  deadline: string
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Accepted' | 'Rejected' | 'Waitlisted'
  applicationFee: string
  requirements: string[]
  notes?: string
}

export default function ApplicationTrackerPage() {
  const { data: session, status } = useSession()
  const [spreadsheetId, setSpreadsheetId] = useState<string>('')
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>('')
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [calendarId, setCalendarId] = useState<string>('')

  // Form state for new application
  const [newApplication, setNewApplication] = useState<Application>({
    institutionName: '',
    program: '',
    deadline: '',
    status: 'Not Started',
    applicationFee: '',
    requirements: [],
    notes: ''
  })

  const createTracker = async () => {
    if (!session?.user?.name) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/applications/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_tracker',
          studentName: session.user.name,
          academicYear: new Date().getFullYear().toString()
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setSpreadsheetId(result.spreadsheetId)
        setSpreadsheetUrl(result.spreadsheetUrl)
        
        // Also create calendar
        await createCalendar()
      } else {
        alert('Failed to create tracker: ' + result.message)
      }
    } catch (error) {
      console.error('Error creating tracker:', error)
      alert('Error creating tracker')
    } finally {
      setIsLoading(false)
    }
  }

  const createCalendar = async () => {
    if (!session?.user?.name) return

    try {
      const response = await fetch('/api/applications/deadlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_calendar',
          studentName: session.user.name
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setCalendarId(result.calendarId)
      }
    } catch (error) {
      console.error('Error creating calendar:', error)
    }
  }

  const addApplication = async () => {
    if (!spreadsheetId || !newApplication.institutionName || !newApplication.program) return

    setIsLoading(true)
    try {
      // Add to spreadsheet
      const response = await fetch('/api/applications/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_application',
          spreadsheetId,
          application: newApplication
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Add deadline to calendar if we have one
        if (calendarId && newApplication.deadline) {
          await fetch('/api/applications/deadlines', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'create_application_deadlines',
              calendarId,
              institutionName: newApplication.institutionName,
              program: newApplication.program,
              applicationDeadline: newApplication.deadline
            })
          })
        }

        // Reset form and refresh applications
        setNewApplication({
          institutionName: '',
          program: '',
          deadline: '',
          status: 'Not Started',
          applicationFee: '',
          requirements: [],
          notes: ''
        })
        setShowAddForm(false)
        loadApplications()
      } else {
        alert('Failed to add application: ' + result.message)
      }
    } catch (error) {
      console.error('Error adding application:', error)
      alert('Error adding application')
    } finally {
      setIsLoading(false)
    }
  }

  const loadApplications = async () => {
    if (!spreadsheetId) return

    try {
      const response = await fetch(`/api/applications/tracker?spreadsheetId=${spreadsheetId}`)
      const result = await response.json()
      
      if (result.success) {
        setApplications(result.applications)
      }
    } catch (error) {
      console.error('Error loading applications:', error)
    }
  }

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-800'
      case 'Submitted': return 'bg-blue-100 text-blue-800'
      case 'In Progress': return 'bg-yellow-100 text-yellow-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      case 'Waitlisted': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    if (spreadsheetId) {
      loadApplications()
    }
  }, [spreadsheetId])

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access the application tracker</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/signin">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // For now, allow any authenticated user to use the tracker
  // TODO: Add proper Google OAuth provider check when needed

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Tracker</h1>
          <p className="text-gray-600">
            Track your university applications with Google Sheets and Calendar integration
          </p>
        </div>

        {!spreadsheetId ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Create Your Application Tracker
              </CardTitle>
              <CardDescription>
                Create a Google Spreadsheet to track your university applications and a Google Calendar for deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={createTracker} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Creating...' : 'Create Application Tracker'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Tracker Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    Your Application Tracker
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <a href={spreadsheetUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in Google Sheets
                    </a>
                  </Button>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Add Application Form */}
            {showAddForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Application</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="institution">Institution Name</Label>
                      <Input
                        id="institution"
                        value={newApplication.institutionName}
                        onChange={(e) => setNewApplication({
                          ...newApplication,
                          institutionName: e.target.value
                        })}
                        placeholder="e.g., University of Cape Town"
                      />
                    </div>
                    <div>
                      <Label htmlFor="program">Program</Label>
                      <Input
                        id="program"
                        value={newApplication.program}
                        onChange={(e) => setNewApplication({
                          ...newApplication,
                          program: e.target.value
                        })}
                        placeholder="e.g., Bachelor of Science in Computer Science"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deadline">Application Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newApplication.deadline}
                        onChange={(e) => setNewApplication({
                          ...newApplication,
                          deadline: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fee">Application Fee</Label>
                      <Input
                        id="fee"
                        value={newApplication.applicationFee}
                        onChange={(e) => setNewApplication({
                          ...newApplication,
                          applicationFee: e.target.value
                        })}
                        placeholder="e.g., R500"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newApplication.notes}
                      onChange={(e) => setNewApplication({
                        ...newApplication,
                        notes: e.target.value
                      })}
                      placeholder="Additional notes about this application..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addApplication} disabled={isLoading}>
                      {isLoading ? 'Adding...' : 'Add Application'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button onClick={() => setShowAddForm(true)} className="mb-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Application
              </Button>
            )}

            {/* Applications List */}
            <div className="grid gap-4">
              {applications.map((app, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{app.institutionName}</h3>
                        <p className="text-gray-600">{app.program}</p>
                      </div>
                      <Badge className={getStatusColor(app.status)}>
                        {app.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Deadline:</span>
                        <p>{app.deadline || 'Not set'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Application Fee:</span>
                        <p>{app.applicationFee || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Requirements:</span>
                        <p>{app.requirements.length > 0 ? app.requirements.join(', ') : 'None specified'}</p>
                      </div>
                    </div>
                    {app.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <span className="font-medium text-sm">Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{app.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {applications.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-500">No applications added yet. Click "Add Application" to get started!</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
