'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useAuth } from '@/app/providers'
import { createClient } from '@/lib/supabase'
import { validateSAIdNumber, isValidEmail, isValidPhoneNumber } from '@/lib/utils'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface UserProfile {
  firstName: string
  lastName: string
  idNumber: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  city: string
  province: string
  postalCode: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    idNumber: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    province: '',
    postalCode: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    loadUserProfile()
  }, [user, router])

  const loadUserProfile = async () => {
    try {
      // Try to load from user metadata first
      if (user?.user_metadata) {
        setProfile({
          firstName: user.user_metadata.firstName || '',
          lastName: user.user_metadata.lastName || '',
          idNumber: user.user_metadata.idNumber || '',
          email: user.email || '',
          phone: user.user_metadata.phone || '',
          dateOfBirth: user.user_metadata.dateOfBirth || '',
          gender: user.user_metadata.gender || '',
          address: user.user_metadata.address || '',
          city: user.user_metadata.city || '',
          province: user.user_metadata.province || '',
          postalCode: user.user_metadata.postalCode || ''
        })
      }

      // Try to load from database
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (!error && data) {
        setProfile({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          idNumber: data.id_number || '',
          email: data.email || user?.email || '',
          phone: data.phone || '',
          dateOfBirth: data.date_of_birth || '',
          gender: data.gender || '',
          address: data.address || '',
          city: data.city || '',
          province: data.province || '',
          postalCode: data.postal_code || ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateProfile = (): boolean => {
    const errors: Record<string, string> = {}

    if (!profile.firstName.trim()) {
      errors.firstName = 'First name is required'
    } else if (profile.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters'
    } else if (!/^[a-zA-Z\s]+$/.test(profile.firstName)) {
      errors.firstName = 'First name can only contain letters'
    }

    if (!profile.lastName.trim()) {
      errors.lastName = 'Last name is required'
    } else if (profile.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters'
    } else if (!/^[a-zA-Z\s]+$/.test(profile.lastName)) {
      errors.lastName = 'Last name can only contain letters'
    }

    if (!profile.idNumber.trim()) {
      errors.idNumber = 'ID number is required'
    } else if (!/^\d{13}$/.test(profile.idNumber)) {
      errors.idNumber = 'ID number must be exactly 13 digits'
    } else if (!validateSAIdNumber(profile.idNumber)) {
      errors.idNumber = 'Invalid South African ID number'
    }

    if (!profile.email.trim()) {
      errors.email = 'Email address is required'
    } else if (!isValidEmail(profile.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!profile.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!isValidPhoneNumber(profile.phone)) {
      errors.phone = 'Please enter a valid South African phone number (e.g., 0821234567)'
    }

    if (profile.postalCode && !/^\d{4}$/.test(profile.postalCode)) {
      errors.postalCode = 'Postal code must be 4 digits'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateProfile()) return

    setSaving(true)
    setSaveSuccess(false)

    try {
      const supabase = createClient()

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          idNumber: profile.idNumber,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
          address: profile.address,
          city: profile.city,
          province: profile.province,
          postalCode: profile.postalCode
        }
      })

      if (metadataError) {
        console.warn('Failed to update user metadata:', metadataError)
      }

      // Update or insert profile in database
      const profileData = {
        user_id: user?.id,
        first_name: profile.firstName,
        last_name: profile.lastName,
        id_number: profile.idNumber,
        email: profile.email,
        phone: profile.phone,
        date_of_birth: profile.dateOfBirth || null,
        gender: profile.gender || null,
        address: profile.address || null,
        city: profile.city || null,
        province: profile.province || null,
        postal_code: profile.postalCode || null,
        updated_at: new Date().toISOString()
      }

      const { error: dbError } = await supabase
        .from('user_profiles')
        .upsert(profileData)

      if (dbError) {
        console.warn('Failed to update database profile:', dbError)
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)

    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Profile</h1>
              <p className="text-muted-foreground">
                Update your personal information and contact details
              </p>
            </div>
            <Button
              onClick={() => router.push('/profile/setup')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Complete Profile Setup
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Profile Updated</h4>
                <p className="text-sm text-green-700">Your profile has been saved successfully.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => updateProfile('firstName', e.target.value)}
                      placeholder="Enter your first name"
                      className={validationErrors.firstName ? 'border-red-500' : ''}
                    />
                    {validationErrors.firstName && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => updateProfile('lastName', e.target.value)}
                      placeholder="Enter your last name"
                      className={validationErrors.lastName ? 'border-red-500' : ''}
                    />
                    {validationErrors.lastName && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="idNumber">ID Number *</Label>
                    <Input
                      id="idNumber"
                      value={profile.idNumber}
                      onChange={(e) => updateProfile('idNumber', e.target.value)}
                      placeholder="Enter your 13-digit ID number"
                      className={validationErrors.idNumber ? 'border-red-500' : ''}
                      maxLength={13}
                    />
                    {validationErrors.idNumber && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.idNumber}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Your South African ID number will be validated
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => updateProfile('dateOfBirth', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => updateProfile('email', e.target.value)}
                      placeholder="Enter your email address"
                      className={validationErrors.email ? 'border-red-500' : ''}
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => updateProfile('phone', e.target.value)}
                      placeholder="e.g., 0821234567"
                      className={validationErrors.phone ? 'border-red-500' : ''}
                    />
                    {validationErrors.phone && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profile.gender}
                    onValueChange={(value) => updateProfile('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={profile.address}
                    onChange={(e) => updateProfile('address', e.target.value)}
                    placeholder="Enter your full address"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => updateProfile('city', e.target.value)}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="province">Province</Label>
                    <Select
                      value={profile.province}
                      onValueChange={(value) => updateProfile('province', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                        <SelectItem value="free-state">Free State</SelectItem>
                        <SelectItem value="gauteng">Gauteng</SelectItem>
                        <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                        <SelectItem value="limpopo">Limpopo</SelectItem>
                        <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                        <SelectItem value="northern-cape">Northern Cape</SelectItem>
                        <SelectItem value="north-west">North West</SelectItem>
                        <SelectItem value="western-cape">Western Cape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={profile.postalCode}
                      onChange={(e) => updateProfile('postalCode', e.target.value)}
                      placeholder="e.g., 2000"
                      className={validationErrors.postalCode ? 'border-red-500' : ''}
                      maxLength={4}
                    />
                    {validationErrors.postalCode && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.postalCode}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="min-w-32"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Comprehensive Profile CTA */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">🎓 Complete Your Student Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-blue-800">
                  Unlock automatic applications to South African institutions with our comprehensive profile system.
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Academic history & APS calculation</li>
                  <li>• Document upload & verification</li>
                  <li>• Smart institution matching</li>
                  <li>• Application readiness assessment</li>
                </ul>
                <Button
                  onClick={() => router.push('/profile/setup')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  Start Comprehensive Setup
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Keep it accurate</h4>
                    <p className="text-muted-foreground">Ensure all information matches your official documents.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Email verification</h4>
                    <p className="text-muted-foreground">We'll send important updates to your email address.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">SMS notifications</h4>
                    <p className="text-muted-foreground">Receive application status updates via SMS.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
