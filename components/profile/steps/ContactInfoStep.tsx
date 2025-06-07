'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Phone,
  Mail,
  MapPin,
  User,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react'
import { ContactInformation, Address, EmergencyContact, ParentGuardianInfo, StudentProfile } from '@/lib/types/student-profile'

interface ContactInfoStepProps {
  profile: Partial<StudentProfile>
  onComplete: (data: { contactInfo: ContactInformation }) => void
  onBack?: () => void
}

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
]

const CONTACT_METHODS = ['Email', 'SMS', 'WhatsApp', 'Phone']
const RELATIONSHIPS = ['Mother', 'Father', 'Guardian', 'Sibling', 'Grandparent', 'Uncle', 'Aunt', 'Other']

export default function ContactInfoStep({ profile, onComplete, onBack }: ContactInfoStepProps) {
  const [contactInfo, setContactInfo] = useState<ContactInformation>(() => {
    const defaultContactInfo: ContactInformation = {
      email: '',
      phone: '',
      alternativePhone: '',
      currentAddress: {
        streetAddress: '',
        suburb: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'South Africa'
      },
      permanentAddress: {
        streetAddress: '',
        suburb: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'South Africa'
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      },
      preferredContactMethod: 'Email',
      communicationLanguage: 'English'
    }

    // Safely merge with existing profile data
    if (profile.contactInfo) {
      return {
        ...defaultContactInfo,
        ...profile.contactInfo,
        currentAddress: {
          ...defaultContactInfo.currentAddress,
          ...(profile.contactInfo.currentAddress || {})
        },
        permanentAddress: {
          ...defaultContactInfo.permanentAddress,
          ...(profile.contactInfo.permanentAddress || {})
        },
        emergencyContact: {
          ...defaultContactInfo.emergencyContact,
          ...(profile.contactInfo.emergencyContact || {})
        }
      }
    }

    return defaultContactInfo
  })

  const [sameAsCurrent, setSameAsCurrent] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Handle same as current address checkbox
  const handleSameAsCurrentChange = (checked: boolean) => {
    setSameAsCurrent(checked)
    if (checked) {
      setContactInfo(prev => ({
        ...prev,
        permanentAddress: { ...prev.currentAddress }
      }))
    }
  }

  // Update current address and sync permanent if needed
  const updateCurrentAddress = (field: keyof Address, value: string) => {
    setContactInfo(prev => {
      const newContactInfo = {
        ...prev,
        currentAddress: {
          ...prev.currentAddress,
          [field]: value
        }
      }
      
      // If same as current is checked, update permanent address too
      if (sameAsCurrent) {
        newContactInfo.permanentAddress = { ...newContactInfo.currentAddress }
      }
      
      return newContactInfo
    })
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = []

    // Email validation
    if (!contactInfo.email) {
      newErrors.push('Email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
      newErrors.push('Please enter a valid email address')
    }

    // Phone validation
    if (!contactInfo.phone) {
      newErrors.push('Phone number is required')
    } else if (!/^(\+27|0)[0-9]{9}$/.test(contactInfo.phone.replace(/\s/g, ''))) {
      newErrors.push('Please enter a valid South African phone number')
    }

    // Current address validation
    if (!contactInfo.currentAddress.streetAddress) newErrors.push('Current street address is required')
    if (!contactInfo.currentAddress.city) newErrors.push('Current city is required')
    if (!contactInfo.currentAddress.province) newErrors.push('Current province is required')
    if (!contactInfo.currentAddress.postalCode) newErrors.push('Current postal code is required')

    // Emergency contact validation
    if (!contactInfo.emergencyContact.name) newErrors.push('Emergency contact name is required')
    if (!contactInfo.emergencyContact.relationship) newErrors.push('Emergency contact relationship is required')
    if (!contactInfo.emergencyContact.phone) newErrors.push('Emergency contact phone is required')

    setErrors(newErrors)
    return newErrors.length === 0
  }

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      setIsLoading(true)
      setTimeout(() => {
        onComplete({ contactInfo })
        setIsLoading(false)
      }, 1000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Primary Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Primary Contact Information
          </CardTitle>
          <CardDescription>
            Your main contact details for communication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+27 or 0XX XXX XXXX"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="altPhone">Alternative Phone</Label>
              <Input
                id="altPhone"
                value={contactInfo.alternativePhone || ''}
                onChange={(e) => setContactInfo(prev => ({ ...prev, alternativePhone: e.target.value }))}
                placeholder="Alternative contact number"
              />
            </div>

            <div>
              <Label htmlFor="contactMethod">Preferred Contact Method</Label>
              <Select 
                value={contactInfo.preferredContactMethod} 
                onValueChange={(value: any) => setContactInfo(prev => ({ ...prev, preferredContactMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_METHODS.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Current Address
          </CardTitle>
          <CardDescription>
            Where you currently live
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentStreet">Street Address *</Label>
            <Input
              id="currentStreet"
              value={contactInfo.currentAddress?.streetAddress || ''}
              onChange={(e) => updateCurrentAddress('streetAddress', e.target.value)}
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentSuburb">Suburb</Label>
              <Input
                id="currentSuburb"
                value={contactInfo.currentAddress?.suburb || ''}
                onChange={(e) => updateCurrentAddress('suburb', e.target.value)}
                placeholder="Suburb name"
              />
            </div>

            <div>
              <Label htmlFor="currentCity">City *</Label>
              <Input
                id="currentCity"
                value={contactInfo.currentAddress?.city || ''}
                onChange={(e) => updateCurrentAddress('city', e.target.value)}
                placeholder="City name"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentProvince">Province *</Label>
              <Select 
                value={contactInfo.currentAddress?.province || ''}
                onValueChange={(value) => updateCurrentAddress('province', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {SA_PROVINCES.map(province => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currentPostal">Postal Code *</Label>
              <Input
                id="currentPostal"
                value={contactInfo.currentAddress?.postalCode || ''}
                onChange={(e) => updateCurrentAddress('postalCode', e.target.value)}
                placeholder="0000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permanent Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Permanent Address
          </CardTitle>
          <CardDescription>
            Your permanent/home address (if different from current)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sameAsCurrent"
              checked={sameAsCurrent}
              onCheckedChange={handleSameAsCurrentChange}
            />
            <Label htmlFor="sameAsCurrent">Same as current address</Label>
          </div>

          {!sameAsCurrent && (
            <>
              <div>
                <Label htmlFor="permStreet">Street Address</Label>
                <Input
                  id="permStreet"
                  value={contactInfo.permanentAddress?.streetAddress || ''}
                  onChange={(e) => setContactInfo(prev => ({
                    ...prev,
                    permanentAddress: { ...prev.permanentAddress, streetAddress: e.target.value }
                  }))}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="permSuburb">Suburb</Label>
                  <Input
                    id="permSuburb"
                    value={contactInfo.permanentAddress?.suburb || ''}
                    onChange={(e) => setContactInfo(prev => ({
                      ...prev,
                      permanentAddress: { ...prev.permanentAddress, suburb: e.target.value }
                    }))}
                    placeholder="Suburb name"
                  />
                </div>

                <div>
                  <Label htmlFor="permCity">City</Label>
                  <Input
                    id="permCity"
                    value={contactInfo.permanentAddress?.city || ''}
                    onChange={(e) => setContactInfo(prev => ({
                      ...prev,
                      permanentAddress: { ...prev.permanentAddress, city: e.target.value }
                    }))}
                    placeholder="City name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="permProvince">Province</Label>
                  <Select 
                    value={contactInfo.permanentAddress?.province || ''}
                    onValueChange={(value) => setContactInfo(prev => ({
                      ...prev,
                      permanentAddress: { ...prev.permanentAddress, province: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {SA_PROVINCES.map(province => (
                        <SelectItem key={province} value={province}>{province}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="permPostal">Postal Code</Label>
                  <Input
                    id="permPostal"
                    value={contactInfo.permanentAddress?.postalCode || ''}
                    onChange={(e) => setContactInfo(prev => ({
                      ...prev,
                      permanentAddress: { ...prev.permanentAddress, postalCode: e.target.value }
                    }))}
                    placeholder="0000"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Emergency Contact
          </CardTitle>
          <CardDescription>
            Someone we can contact in case of emergency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyName">Full Name *</Label>
              <Input
                id="emergencyName"
                value={contactInfo.emergencyContact?.name || ''}
                onChange={(e) => setContactInfo(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                }))}
                placeholder="Emergency contact name"
              />
            </div>

            <div>
              <Label htmlFor="emergencyRelationship">Relationship *</Label>
              <Select
                value={contactInfo.emergencyContact?.relationship || ''}
                onValueChange={(value) => setContactInfo(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, relationship: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map(relationship => (
                    <SelectItem key={relationship} value={relationship}>{relationship}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyPhone">Phone Number *</Label>
              <Input
                id="emergencyPhone"
                value={contactInfo.emergencyContact?.phone || ''}
                onChange={(e) => setContactInfo(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                }))}
                placeholder="+27 or 0XX XXX XXXX"
              />
            </div>

            <div>
              <Label htmlFor="emergencyEmail">Email Address</Label>
              <Input
                id="emergencyEmail"
                type="email"
                value={contactInfo.emergencyContact?.email || ''}
                onChange={(e) => setContactInfo(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, email: e.target.value }
                }))}
                placeholder="emergency.contact@example.com"
              />
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
