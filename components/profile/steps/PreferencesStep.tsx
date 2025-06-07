'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  DollarSign,
  Home,
  Bell,
  Settings,
  AlertCircle,
  Plus,
  X
} from 'lucide-react'
import { StudentPreferences, NotificationPreferences, StudentProfile, QualificationLevel, InstitutionType } from '@/lib/types/student-profile'

interface PreferencesStepProps {
  profile: Partial<StudentProfile>
  onComplete: (data: { preferences: StudentPreferences }) => void
  onBack?: () => void
}

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
]

const STUDY_FIELDS = [
  'Engineering', 'Medicine', 'Law', 'Business', 'Education', 'Arts', 'Science',
  'Information Technology', 'Agriculture', 'Architecture', 'Psychology',
  'Social Work', 'Nursing', 'Pharmacy', 'Veterinary Science', 'Journalism',
  'Fine Arts', 'Music', 'Drama', 'Sports Science', 'Environmental Science',
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History',
  'Languages', 'Philosophy', 'Theology', 'Hospitality', 'Tourism'
]

const QUALIFICATION_LEVELS: QualificationLevel[] = [
  'Certificate', 'Diploma', 'Advanced Diploma', 'Bachelor\'s Degree',
  'Honours Degree', 'Master\'s Degree', 'Doctoral Degree'
]

const INSTITUTION_TYPES: InstitutionType[] = [
  'University', 'University of Technology', 'TVET College', 'Private College', 'Distance Learning'
]

const ACCOMMODATION_TYPES = ['Residence', 'Private', 'Home']

export default function PreferencesStep({ profile, onComplete, onBack }: PreferencesStepProps) {
  const [preferences, setPreferences] = useState<StudentPreferences>(() => {
    const defaultPreferences: StudentPreferences = {
      preferredFields: [],
      preferredQualificationLevels: [],
      preferredInstitutionTypes: [],
      preferredProvinces: [],
      maxTuitionFee: undefined,
      needsFinancialAid: false,
      interestedInBursaries: false,
      interestedInLoans: false,
      needsAccommodation: false,
      accommodationType: undefined,
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

    // Merge with existing preferences, ensuring all arrays are initialized
    if (profile.preferences) {
      return {
        ...defaultPreferences,
        ...profile.preferences,
        preferredFields: profile.preferences.preferredFields || [],
        preferredQualificationLevels: profile.preferences.preferredQualificationLevels || [],
        preferredInstitutionTypes: profile.preferences.preferredInstitutionTypes || [],
        preferredProvinces: profile.preferences.preferredProvinces || [],
        notificationPreferences: {
          ...defaultPreferences.notificationPreferences,
          ...profile.preferences.notificationPreferences
        }
      }
    }

    return defaultPreferences
  })

  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Add item to array field
  const addToArray = (field: keyof StudentPreferences, value: string) => {
    if (!value) return

    setPreferences(prev => {
      const currentArray = (prev[field] as string[]) || []
      if (currentArray.includes(value)) return prev

      return {
        ...prev,
        [field]: [...currentArray, value]
      }
    })
  }

  // Remove item from array field
  const removeFromArray = (field: keyof StudentPreferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: ((prev[field] as string[]) || []).filter(item => item !== value)
    }))
  }

  // Update notification preferences
  const updateNotificationPreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: value
      }
    }))
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = []

    if ((preferences.preferredFields || []).length === 0) {
      newErrors.push('Please select at least one field of study')
    }

    if ((preferences.preferredQualificationLevels || []).length === 0) {
      newErrors.push('Please select at least one qualification level')
    }

    if ((preferences.preferredInstitutionTypes || []).length === 0) {
      newErrors.push('Please select at least one institution type')
    }

    if ((preferences.preferredProvinces || []).length === 0) {
      newErrors.push('Please select at least one preferred province')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      setIsLoading(true)
      setTimeout(() => {
        onComplete({ preferences })
        setIsLoading(false)
      }, 1000)
    }
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
            Tell us about your academic interests and goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preferred Fields */}
          <div>
            <Label>Preferred Fields of Study *</Label>
            <div className="mt-2 space-y-2">
              <Select onValueChange={(value) => addToArray('preferredFields', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fields of study" />
                </SelectTrigger>
                <SelectContent>
                  {STUDY_FIELDS.filter(field => !(preferences.preferredFields || []).includes(field)).map(field => (
                    <SelectItem key={field} value={field}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex flex-wrap gap-2">
                {(preferences.preferredFields || []).map(field => (
                  <Badge key={field} variant="default" className="flex items-center gap-1">
                    {field}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFromArray('preferredFields', field)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Qualification Levels */}
          <div>
            <Label>Preferred Qualification Levels *</Label>
            <div className="mt-2 space-y-2">
              <Select onValueChange={(value) => addToArray('preferredQualificationLevels', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select qualification levels" />
                </SelectTrigger>
                <SelectContent>
                  {QUALIFICATION_LEVELS.filter(level => !(preferences.preferredQualificationLevels || []).includes(level)).map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex flex-wrap gap-2">
                {(preferences.preferredQualificationLevels || []).map(level => (
                  <Badge key={level} variant="default" className="flex items-center gap-1">
                    {level}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFromArray('preferredQualificationLevels', level)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Institution Types */}
          <div>
            <Label>Preferred Institution Types *</Label>
            <div className="mt-2 space-y-2">
              <Select onValueChange={(value) => addToArray('preferredInstitutionTypes', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select institution types" />
                </SelectTrigger>
                <SelectContent>
                  {INSTITUTION_TYPES.filter(type => !(preferences.preferredInstitutionTypes || []).includes(type)).map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex flex-wrap gap-2">
                {(preferences.preferredInstitutionTypes || []).map(type => (
                  <Badge key={type} variant="default" className="flex items-center gap-1">
                    {type}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFromArray('preferredInstitutionTypes', type)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Preferred Provinces */}
          <div>
            <Label>Preferred Provinces *</Label>
            <div className="mt-2 space-y-2">
              <Select onValueChange={(value) => addToArray('preferredProvinces', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred provinces" />
                </SelectTrigger>
                <SelectContent>
                  {SA_PROVINCES.filter(province => !(preferences.preferredProvinces || []).includes(province)).map(province => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex flex-wrap gap-2">
                {(preferences.preferredProvinces || []).map(province => (
                  <Badge key={province} variant="default" className="flex items-center gap-1">
                    {province}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFromArray('preferredProvinces', province)}
                    />
                  </Badge>
                ))}
              </div>
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
          <CardDescription>
            Help us understand your financial situation and needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="maxTuition">Maximum Tuition Fee (per year)</Label>
            <Input
              id="maxTuition"
              type="number"
              placeholder="e.g., 50000"
              value={preferences.maxTuitionFee || ''}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                maxTuitionFee: e.target.value ? parseInt(e.target.value) : undefined
              }))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave blank if no specific limit
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="needsFinancialAid"
                checked={preferences.needsFinancialAid}
                onCheckedChange={(checked) => setPreferences(prev => ({
                  ...prev,
                  needsFinancialAid: checked as boolean
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
                  interestedInBursaries: checked as boolean
                }))}
              />
              <Label htmlFor="interestedInBursaries">I'm interested in bursaries</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="interestedInLoans"
                checked={preferences.interestedInLoans}
                onCheckedChange={(checked) => setPreferences(prev => ({
                  ...prev,
                  interestedInLoans: checked as boolean
                }))}
              />
              <Label htmlFor="interestedInLoans">I'm interested in student loans</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accommodation Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Accommodation Preferences
          </CardTitle>
          <CardDescription>
            Let us know about your accommodation needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="needsAccommodation"
              checked={preferences.needsAccommodation}
              onCheckedChange={(checked) => setPreferences(prev => ({
                ...prev,
                needsAccommodation: checked as boolean
              }))}
            />
            <Label htmlFor="needsAccommodation">I need accommodation</Label>
          </div>

          {preferences.needsAccommodation && (
            <div>
              <Label htmlFor="accommodationType">Preferred Accommodation Type</Label>
              <Select 
                value={preferences.accommodationType || ''} 
                onValueChange={(value: any) => setPreferences(prev => ({
                  ...prev,
                  accommodationType: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select accommodation type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOMMODATION_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
            Choose how you'd like to receive updates and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="applicationUpdates"
                  checked={preferences.notificationPreferences.applicationUpdates}
                  onCheckedChange={(checked) => updateNotificationPreference('applicationUpdates', checked as boolean)}
                />
                <Label htmlFor="applicationUpdates">Application updates</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="newOpportunities"
                  checked={preferences.notificationPreferences.newOpportunities}
                  onCheckedChange={(checked) => updateNotificationPreference('newOpportunities', checked as boolean)}
                />
                <Label htmlFor="newOpportunities">New opportunities</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="deadlineReminders"
                  checked={preferences.notificationPreferences.deadlineReminders}
                  onCheckedChange={(checked) => updateNotificationPreference('deadlineReminders', checked as boolean)}
                />
                <Label htmlFor="deadlineReminders">Deadline reminders</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bursaryAlerts"
                  checked={preferences.notificationPreferences.bursaryAlerts}
                  onCheckedChange={(checked) => updateNotificationPreference('bursaryAlerts', checked as boolean)}
                />
                <Label htmlFor="bursaryAlerts">Bursary alerts</Label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="weeklyDigest"
                  checked={preferences.notificationPreferences.weeklyDigest}
                  onCheckedChange={(checked) => updateNotificationPreference('weeklyDigest', checked as boolean)}
                />
                <Label htmlFor="weeklyDigest">Weekly digest</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smsNotifications"
                  checked={preferences.notificationPreferences.smsNotifications}
                  onCheckedChange={(checked) => updateNotificationPreference('smsNotifications', checked as boolean)}
                />
                <Label htmlFor="smsNotifications">SMS notifications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsappNotifications"
                  checked={preferences.notificationPreferences.whatsappNotifications}
                  onCheckedChange={(checked) => updateNotificationPreference('whatsappNotifications', checked as boolean)}
                />
                <Label htmlFor="whatsappNotifications">WhatsApp notifications</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={!onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
