'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Phone, MapPin, AlertCircle, User } from 'lucide-react'
import { ContactInformation, StudentProfile } from '@/lib/types/student-profile'

interface ContactInfoStepProps {
  profile: Partial<StudentProfile>
  onComplete: (data: { contactInfo: ContactInformation }) => void
  onBack?: () => void
}

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
]

export default function ContactInfoStep({ profile, onComplete, onBack }: ContactInfoStepProps) {
  const [contactInfo, setContactInfo] = useState<ContactInformation>(
    profile.contactInfo || {
      email: '',
      phone: '',
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
        phone: ''
      },
      preferredContactMethod: 'Email',
      communicationLanguage: 'English'
    } as ContactInformation
  )

  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sameAsCurrent, setSameAsCurrent] = useState(false)

  // Handle same as current address
  const handleSameAsCurrent = (checked: boolean) => {
    setSameAsCurrent(checked)
    if (checked) {
      setContactInfo(prev => ({
        ...prev,
        permanentAddress: { ...prev.currentAddress }
      }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = []

    if (!contactInfo.email) newErrors.push('Email is required')
    if (!contactInfo.phone) newErrors.push('Phone number is required')
    if (!contactInfo.currentAddress.streetAddress) newErrors.push('Current street address is required')
    if (!contactInfo.currentAddress.city) newErrors.push('Current city is required')
    if (!contactInfo.currentAddress.province) newErrors.push('Current province is required')
    if (!contactInfo.currentAddress.postalCode) newErrors.push('Current postal code is required')
    if (!contactInfo.emergencyContact.name) newErrors.push('Emergency contact name is required')
    if (!contactInfo.emergencyContact.phone) newErrors.push('Emergency contact phone is required')
    if (!contactInfo.emergencyContact.relationship) newErrors.push('Emergency contact relationship is required')

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
      {/* Contact Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Details
          </CardTitle>
          <CardDescription>
            Your primary contact information
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
                placeholder="0812345678"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="alternativePhone">Alternative Phone</Label>
              <Input
                id="alternativePhone"
                value={contactInfo.alternativePhone || ''}
                onChange={(e) => setContactInfo(prev => ({ ...prev, alternativePhone: e.target.value }))}
                placeholder="0112345678"
              />
            </div>
            
            <div>
              <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
              <Select 
                value={contactInfo.preferredContactMethod} 
                onValueChange={(value: any) => setContactInfo(prev => ({ ...prev, preferredContactMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Phone">Phone Call</SelectItem>
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
              value={contactInfo.currentAddress.streetAddress}
              onChange={(e) => setContactInfo(prev => ({
                ...prev,
                currentAddress: { ...prev.currentAddress, streetAddress: e.target.value }
              }))}
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentSuburb">Suburb</Label>
              <Input
                id="currentSuburb"
                value={contactInfo.currentAddress.suburb}
                onChange={(e) => setContactInfo(prev => ({
                  ...prev,
                  currentAddress: { ...prev.currentAddress, suburb: e.target.value }
                }))}
                placeholder="Sandton"
              />
            </div>
            
            <div>
              <Label htmlFor="currentCity">City *</Label>
              <Input
                id="currentCity"
                value={contactInfo.currentAddress.city}
                onChange={(e) => setContactInfo(prev => ({
                  ...prev,
                  currentAddress: { ...prev.currentAddress, city: e.target.value }
                }))}
                placeholder="Johannesburg"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentProvince">Province *</Label>
              <Select 
                value={contactInfo.currentAddress.province} 
                onValueChange={(value) => setContactInfo(prev => ({
                  ...prev,
                  currentAddress: { ...prev.currentAddress, province: value }
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
              <Label htmlFor="currentPostalCode">Postal Code *</Label>
              <Input
                id="currentPostalCode"
                value={contactInfo.currentAddress.postalCode}
                onChange={(e) => setContactInfo(prev => ({
                  ...prev,
                  currentAddress: { ...prev.currentAddress, postalCode: e.target.value }
                }))}
                placeholder="2196"
              />
            </div>
          </div>
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
                value={contactInfo.emergencyContact.name}
                onChange={(e) => setContactInfo(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                }))}
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <Label htmlFor="emergencyRelationship">Relationship *</Label>
              <Select 
                value={contactInfo.emergencyContact.relationship} 
                onValueChange={(value) => setContactInfo(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, relationship: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Guardian">Guardian</SelectItem>
                  <SelectItem value="Sibling">Sibling</SelectItem>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Friend">Friend</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyPhone">Phone Number *</Label>
              <Input
                id="emergencyPhone"
                value={contactInfo.emergencyContact.phone}
                onChange={(e) => setContactInfo(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                }))}
                placeholder="0823456789"
              />
            </div>
            
            <div>
              <Label htmlFor="emergencyEmail">Email Address</Label>
              <Input
                id="emergencyEmail"
                type="email"
                value={contactInfo.emergencyContact.email || ''}
                onChange={(e) => setContactInfo(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, email: e.target.value }
                }))}
                placeholder="emergency@example.com"
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
