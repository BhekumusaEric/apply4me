'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Users,
  Heart,
  DollarSign,
  MapPin,
  AlertCircle,
  Info,
  Plus,
  Trash2
} from 'lucide-react'
import { PersonalInformation, ParentGuardianInfo, StudentProfile } from '@/lib/types/student-profile'

interface PersonalInfoStepProps {
  profile: Partial<StudentProfile>
  onComplete: (data: { personalInfo: PersonalInformation }) => void
  onBack?: () => void
}

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
]

const SA_LANGUAGES = [
  'Afrikaans', 'English', 'isiNdebele', 'isiXhosa', 'isiZulu', 'Sepedi',
  'Sesotho', 'Setswana', 'siSwati', 'Tshivenda', 'Xitsonga'
]

const HOUSEHOLD_INCOME_RANGES = [
  'R0 - R50,000', 'R50,001 - R100,000', 'R100,001 - R200,000',
  'R200,001 - R350,000', 'R350,001 - R500,000', 'R500,001+', 'Prefer not to say'
]

const EDUCATION_LEVELS = [
  'No Formal Education', 'Primary School', 'Grade 8-11', 'Matric/Grade 12',
  'Certificate', 'Diploma', 'Degree', 'Honours', 'Masters', 'Doctorate'
]

export default function PersonalInfoStep({ profile, onComplete, onBack }: PersonalInfoStepProps) {
  const [personalInfo, setPersonalInfo] = useState<PersonalInformation>(
    profile.personalInfo || {
      idNumber: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Prefer not to say',
      race: 'Prefer not to say',
      nationality: 'South African',
      homeLanguage: '',
      additionalLanguages: [],
      hasDisability: false,
      parentGuardianInfo: [],
      householdIncome: 'Prefer not to say',
      dependents: 0,
      isFirstGeneration: false,
      citizenship: 'South African',
      currentProvince: '',
      ruralUrban: 'Urban',
      requiresAccommodation: false
    } as PersonalInformation
  )

  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Validate SA ID Number
  const validateIdNumber = (idNumber: string): boolean => {
    if (idNumber.length !== 13) return false
    if (!/^\d{13}$/.test(idNumber)) return false

    // Basic checksum validation for SA ID
    const digits = idNumber.split('').map(Number)
    let sum = 0
    for (let i = 0; i < 12; i++) {
      if (i % 2 === 0) {
        sum += digits[i]
      } else {
        const doubled = digits[i] * 2
        sum += doubled > 9 ? doubled - 9 : doubled
      }
    }
    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit === digits[12]
  }

  // Extract date of birth from ID number
  const extractDateFromId = (idNumber: string): string => {
    if (idNumber.length >= 6) {
      const year = parseInt(idNumber.substring(0, 2))
      const month = idNumber.substring(2, 4)
      const day = idNumber.substring(4, 6)

      // Determine century (assume 00-30 is 2000s, 31-99 is 1900s)
      const fullYear = year <= 30 ? 2000 + year : 1900 + year

      return `${fullYear}-${month}-${day}`
    }
    return ''
  }

  // Handle ID number change
  const handleIdNumberChange = (value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      idNumber: value,
      dateOfBirth: value.length === 13 ? extractDateFromId(value) : prev.dateOfBirth
    }))
  }

  // Parent/Guardian management is handled in ContactInfoStep

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = []

    if (!personalInfo.idNumber) {
      newErrors.push('ID Number is required')
    } else if (!validateIdNumber(personalInfo.idNumber)) {
      newErrors.push('Please enter a valid South African ID Number')
    }

    if (!personalInfo.firstName) newErrors.push('First Name is required')
    if (!personalInfo.lastName) newErrors.push('Last Name is required')
    if (!personalInfo.homeLanguage) newErrors.push('Home Language is required')
    if (!personalInfo.currentProvince) newErrors.push('Current Province is required')

    // Parent/Guardian validation is handled in ContactInfoStep, not here

    setErrors(newErrors)
    return newErrors.length === 0
  }

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      setIsLoading(true)
      setTimeout(() => {
        onComplete({ personalInfo })
        setIsLoading(false)
      }, 1000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Your personal details as they appear on your ID document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="idNumber">South African ID Number *</Label>
              <Input
                id="idNumber"
                value={personalInfo.idNumber}
                onChange={(e) => handleIdNumberChange(e.target.value)}
                placeholder="0000000000000"
                maxLength={13}
              />
              {personalInfo.idNumber && !validateIdNumber(personalInfo.idNumber) && (
                <p className="text-sm text-red-600 mt-1">Invalid ID number format</p>
              )}
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={personalInfo.dateOfBirth}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Auto-filled from ID number
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={personalInfo.firstName}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={personalInfo.lastName}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                value={personalInfo.middleName || ''}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, middleName: e.target.value }))}
                placeholder="Enter your middle name (optional)"
              />
            </div>

            <div>
              <Label htmlFor="preferredName">Preferred Name</Label>
              <Input
                id="preferredName"
                value={personalInfo.preferredName || ''}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, preferredName: e.target.value }))}
                placeholder="What should we call you?"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Demographics
          </CardTitle>
          <CardDescription>
            Required for BBBEE compliance and funding applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={personalInfo.gender} onValueChange={(value: any) => setPersonalInfo(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="race">Race</Label>
              <Select value={personalInfo.race} onValueChange={(value: any) => setPersonalInfo(prev => ({ ...prev, race: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="African">African</SelectItem>
                  <SelectItem value="Coloured">Coloured</SelectItem>
                  <SelectItem value="Indian">Indian</SelectItem>
                  <SelectItem value="White">White</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="citizenship">Citizenship</Label>
              <Select value={personalInfo.citizenship} onValueChange={(value: any) => setPersonalInfo(prev => ({ ...prev, citizenship: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="South African">South African</SelectItem>
                  <SelectItem value="Permanent Resident">Permanent Resident</SelectItem>
                  <SelectItem value="International">International</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="homeLanguage">Home Language *</Label>
              <Select value={personalInfo.homeLanguage} onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, homeLanguage: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your home language" />
                </SelectTrigger>
                <SelectContent>
                  {SA_LANGUAGES.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currentProvince">Current Province *</Label>
              <Select value={personalInfo.currentProvince} onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, currentProvince: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your province" />
                </SelectTrigger>
                <SelectContent>
                  {SA_PROVINCES.map(province => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
