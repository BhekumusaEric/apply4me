'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Heart, DollarSign, Bell } from 'lucide-react'
import { StudentPreferences, StudentProfile } from '@/lib/types/student-profile'

interface PreferencesStepProps {
  profile: Partial<StudentProfile>
  onComplete: (data: { preferences: StudentPreferences }) => void
  onBack?: () => void
}

const STUDY_FIELDS = [
  'Engineering', 'Computer Science', 'Information Technology', 'Business', 'Medicine',
  'Law', 'Education', 'Arts', 'Science', 'Agriculture', 'Social Sciences'
]

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
]

export default function PreferencesStep({ profile, onComplete, onBack }: PreferencesStepProps) {
  // Create default preferences structure
  const defaultPreferences: StudentPreferences = {
    preferredFields: [],
    preferredQualificationLevels: [],
    preferredInstitutionTypes: [],
    preferredProvinces: [],
    needsFinancialAid: false,
    interestedInBursaries: false,
    interestedInLoans: false,
    needsAccommodation: false,
    notificationPreferences: {
      applicationUpdates: true,
      newOpportunities: true,
      deadlineReminders: true,
      bursaryAlerts: true,
      weeklyDigest: false,
      smsNotifications: false,
      whatsappNotifications: false
    }
  }

  const [preferences, setPreferences] = useState<StudentPreferences>(() => {
    if (!profile.preferences) return defaultPreferences

    // Merge with defaults to ensure all nested objects exist
    return {
      ...defaultPreferences,
      ...profile.preferences,
      preferredFields: profile.preferences.preferredFields || [],
      preferredQualificationLevels: profile.preferences.preferredQualificationLevels || [],
      preferredInstitutionTypes: profile.preferences.preferredInstitutionTypes || [],
      preferredProvinces: profile.preferences.preferredProvinces || [],
      notificationPreferences: {
        ...defaultPreferences.notificationPreferences,
        ...(profile.preferences.notificationPreferences || {})
      }
    }
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleFieldToggle = (field: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredFields: (prev.preferredFields || []).includes(field)
        ? (prev.preferredFields || []).filter(f => f !== field)
        : [...(prev.preferredFields || []), field]
    }))
  }

  const handleProvinceToggle = (province: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredProvinces: (prev.preferredProvinces || []).includes(province)
        ? (prev.preferredProvinces || []).filter(p => p !== province)
        : [...(prev.preferredProvinces || []), province]
    }))
  }

  const handleSubmit = () => {
    setIsLoading(true)
    setTimeout(() => {
      onComplete({ preferences })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Study Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Study Preferences
          </CardTitle>
          <CardDescription>
            What would you like to study?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Preferred Fields of Study</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {STUDY_FIELDS.map(field => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={(preferences.preferredFields || []).includes(field)}
                    onCheckedChange={() => handleFieldToggle(field)}
                  />
                  <Label htmlFor={field} className="text-sm">{field}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Preferred Provinces</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {SA_PROVINCES.map(province => (
                <div key={province} className="flex items-center space-x-2">
                  <Checkbox
                    id={province}
                    checked={(preferences.preferredProvinces || []).includes(province)}
                    onCheckedChange={() => handleProvinceToggle(province)}
                  />
                  <Label htmlFor={province} className="text-sm">{province}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="maxTuition">Maximum Tuition Fee (per year)</Label>
            <Input
              id="maxTuition"
              type="number"
              value={preferences.maxTuitionFee || ''}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                maxTuitionFee: parseInt(e.target.value) || undefined
              }))}
              placeholder="80000"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="needsFinancialAid"
                checked={preferences.needsFinancialAid}
                onCheckedChange={(checked) => setPreferences(prev => ({
                  ...prev,
                  needsFinancialAid: !!checked
                }))}
              />
              <Label htmlFor="needsFinancialAid">I need financial aid</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="interestedInBursaries"
                checked={preferences.interestedInBursaries}
                onCheckedChange={(checked) => setPreferences(prev => ({
                  ...prev,
                  interestedInBursaries: !!checked
                }))}
              />
              <Label htmlFor="interestedInBursaries">Interested in bursaries</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="needsAccommodation"
                checked={preferences.needsAccommodation}
                onCheckedChange={(checked) => setPreferences(prev => ({
                  ...prev,
                  needsAccommodation: !!checked
                }))}
              />
              <Label htmlFor="needsAccommodation">I need accommodation</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            How would you like to receive updates?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="applicationUpdates"
              checked={preferences.notificationPreferences?.applicationUpdates || false}
              onCheckedChange={(checked) => setPreferences(prev => ({
                ...prev,
                notificationPreferences: {
                  ...prev.notificationPreferences,
                  applicationUpdates: !!checked
                }
              }))}
            />
            <Label htmlFor="applicationUpdates">Application status updates</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="newOpportunities"
              checked={preferences.notificationPreferences?.newOpportunities || false}
              onCheckedChange={(checked) => setPreferences(prev => ({
                ...prev,
                notificationPreferences: {
                  ...prev.notificationPreferences,
                  newOpportunities: !!checked
                }
              }))}
            />
            <Label htmlFor="newOpportunities">New opportunities</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="deadlineReminders"
              checked={preferences.notificationPreferences?.deadlineReminders || false}
              onCheckedChange={(checked) => setPreferences(prev => ({
                ...prev,
                notificationPreferences: {
                  ...prev.notificationPreferences,
                  deadlineReminders: !!checked
                }
              }))}
            />
            <Label htmlFor="deadlineReminders">Deadline reminders</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="bursaryAlerts"
              checked={preferences.notificationPreferences?.bursaryAlerts || false}
              onCheckedChange={(checked) => setPreferences(prev => ({
                ...prev,
                notificationPreferences: {
                  ...prev.notificationPreferences,
                  bursaryAlerts: !!checked
                }
              }))}
            />
            <Label htmlFor="bursaryAlerts">Bursary alerts</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="whatsappNotifications"
              checked={preferences.notificationPreferences?.whatsappNotifications || false}
              onCheckedChange={(checked) => setPreferences(prev => ({
                ...prev,
                notificationPreferences: {
                  ...prev.notificationPreferences,
                  whatsappNotifications: !!checked
                }
              }))}
            />
            <Label htmlFor="whatsappNotifications">WhatsApp notifications</Label>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
