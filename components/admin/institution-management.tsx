'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Building, GraduationCap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Institution {
  id: string
  name: string
  type: string
  province: string
  city?: string
  website_url?: string
  logo_url?: string
  description?: string
  application_fee: number
  is_featured: boolean
  contact_email?: string
  contact_phone?: string
  address?: string
  created_at: string
}

interface InstitutionManagementProps {
  institutions: Institution[]
  onRefresh: () => void
}

export function InstitutionManagement({ institutions, onRefresh }: InstitutionManagementProps) {
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    province: '',
    city: '',
    website_url: '',
    logo_url: '',
    description: '',
    application_fee: 0,
    is_featured: false,
    contact_email: '',
    contact_phone: '',
    application_deadline: '',
    required_documents: ''
  })

  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
    'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ]

  const institutionTypes = [
    { value: 'university', label: 'University' },
    { value: 'tvet', label: 'TVET College' },
    { value: 'private', label: 'Private College' },
    { value: 'distance', label: 'Distance Learning Institution' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/institutions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          application_fee: Number(formData.application_fee),
          required_documents: formData.required_documents ? formData.required_documents.split('\n').filter(doc => doc.trim()) : []
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create institution')
      }

      toast({
        title: "Success",
        description: "Institution created successfully!",
      })

      // Reset form
      setFormData({
        name: '',
        type: '',
        province: '',
        city: '',
        website_url: '',
        logo_url: '',
        description: '',
        application_fee: 0,
        is_featured: false,
        contact_email: '',
        contact_phone: '',
        application_deadline: '',
        required_documents: ''
      })

      setIsAddDialogOpen(false)
      onRefresh()

    } catch (error) {
      console.error('Error creating institution:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create institution",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (institutionId: string, institutionName: string) => {
    if (!confirm(`Are you sure you want to delete "${institutionName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/institutions?id=${institutionId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete institution')
      }

      toast({
        title: "Success",
        description: "Institution deleted successfully!",
      })

      onRefresh()

    } catch (error) {
      console.error('Error deleting institution:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete institution",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Building className="h-5 w-5" />
          Institution Management
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Institution
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Institution</DialogTitle>
              <DialogDescription>
                Create a new educational institution in the system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Institution Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., University of Cape Town"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select institution type" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="province">Province *</Label>
                  <Select value={formData.province} onValueChange={(value) => setFormData({...formData, province: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province} value={province}>{province}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="e.g., Cape Town"
                  />
                </div>
                <div>
                  <Label htmlFor="application_fee">Application Fee (R)</Label>
                  <Input
                    id="application_fee"
                    type="number"
                    value={formData.application_fee}
                    onChange={(e) => setFormData({...formData, application_fee: Number(e.target.value)})}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    placeholder="admissions@university.ac.za"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    placeholder="+27 21 123 4567"
                  />
                </div>
                <div>
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                    placeholder="https://www.university.ac.za"
                  />
                </div>
                <div>
                  <Label htmlFor="application_deadline">Application Deadline</Label>
                  <Input
                    id="application_deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => setFormData({...formData, application_deadline: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <Label htmlFor="required_documents">Required Documents (one per line)</Label>
                <Textarea
                  id="required_documents"
                  value={formData.required_documents}
                  onChange={(e) => setFormData({...formData, required_documents: e.target.value})}
                  placeholder="Grade 12 Certificate&#10;ID Document&#10;Proof of Address"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the institution"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="is_featured">Featured Institution</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Institution'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Institutions ({institutions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {institutions.map((institution) => (
              <div key={institution.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-medium">{institution.name}</p>
                    {institution.is_featured && (
                      <Badge variant="default">Featured</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {institution.type} • {institution.province}
                    {institution.city && ` • ${institution.city}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Application Fee: R{institution.application_fee.toLocaleString()}
                  </p>
                  {institution.contact_email && (
                    <p className="text-xs text-muted-foreground">
                      Contact: {institution.contact_email}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    Programs
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(institution.id, institution.name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {institutions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No institutions found. Add your first institution to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
