'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, GraduationCap, Calendar } from 'lucide-react'
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
}

interface Program {
  id: string
  institution_id: string
  name: string
  qualification_level: string
  duration_years: number
  field_of_study: string
  application_deadline: string
  application_fee: number
  description: string
  entry_requirements: string
  is_available: boolean
  application_status: string
  institutions?: {
    name: string
  }
}

interface ProgramManagementProps {
  institutions: Institution[]
  onRefresh: () => void
}

export function ProgramManagement({ institutions, onRefresh }: ProgramManagementProps) {
  const { toast } = useToast()
  const [programs, setPrograms] = useState<Program[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPrograms, setLoadingPrograms] = useState(true)
  const [formData, setFormData] = useState({
    institution_id: '',
    name: '',
    qualification_level: '',
    duration_years: 3,
    field_of_study: '',
    application_deadline: '',
    application_fee: 0,
    entry_requirements: '',
    career_outcomes: '',
    is_available: true,
    application_status: 'open',
    available_spots: 50
  })

  const qualificationLevels = [
    'Certificate', 'Diploma', 'Advanced Diploma', 'Bachelor\'s Degree',
    'Honours Degree', 'Master\'s Degree', 'Doctoral Degree'
  ]

  const fieldsOfStudy = [
    'Engineering', 'Medicine', 'Law', 'Business', 'Computer Science',
    'Education', 'Arts', 'Science', 'Agriculture', 'Architecture',
    'Social Sciences', 'Psychology', 'Nursing', 'Pharmacy', 'Dentistry'
  ]

  const applicationStatuses = [
    'open', 'closed', 'coming_soon', 'suspended'
  ]

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      setLoadingPrograms(true)
      const response = await fetch('/api/programs')
      const result = await response.json()
      
      if (result.success) {
        setPrograms(result.programs || [])
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
      toast({
        title: "Error",
        description: "Failed to load programs",
        variant: "destructive",
      })
    } finally {
      setLoadingPrograms(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          duration_years: Number(formData.duration_years),
          application_fee: Number(formData.application_fee),
          available_spots: Number(formData.available_spots)
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create program')
      }

      toast({
        title: "Success",
        description: "Program created successfully!",
      })

      // Reset form
      setFormData({
        institution_id: '',
        name: '',
        qualification_level: '',
        duration_years: 3,
        field_of_study: '',
        application_deadline: '',
        application_fee: 0,
        entry_requirements: '',
        career_outcomes: '',
        is_available: true,
        application_status: 'open',
        available_spots: 50
      })

      setIsAddDialogOpen(false)
      fetchPrograms()
      onRefresh()

    } catch (error) {
      console.error('Error creating program:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create program",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (programId: string, programName: string) => {
    if (!confirm(`Are you sure you want to delete "${programName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/programs?id=${programId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete program')
      }

      toast({
        title: "Success",
        description: "Program deleted successfully!",
      })

      fetchPrograms()
      onRefresh()

    } catch (error) {
      console.error('Error deleting program:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete program",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-red-100 text-red-800'
      case 'coming_soon': return 'bg-blue-100 text-blue-800'
      case 'suspended': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Program Management
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Program</DialogTitle>
              <DialogDescription>
                Create a new academic program for an institution.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="institution_id">Institution *</Label>
                  <Select value={formData.institution_id} onValueChange={(value) => setFormData({...formData, institution_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={institutions.length === 0 ? "No institutions available" : "Select institution"} />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.length === 0 ? (
                        <SelectItem value="" disabled>
                          No institutions found. Please add an institution first.
                        </SelectItem>
                      ) : (
                        institutions.map((institution) => (
                          <SelectItem key={institution.id} value={institution.id}>
                            {institution.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {institutions.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Please add an institution first before creating programs.
                    </p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="name">Program Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Bachelor of Science in Computer Science"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="qualification_level">Qualification Level *</Label>
                  <Select value={formData.qualification_level} onValueChange={(value) => setFormData({...formData, qualification_level: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {qualificationLevels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="field_of_study">Field of Study *</Label>
                  <Select value={formData.field_of_study} onValueChange={(value) => setFormData({...formData, field_of_study: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldsOfStudy.map((field) => (
                        <SelectItem key={field} value={field}>{field}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration_years">Duration (Years)</Label>
                  <Input
                    id="duration_years"
                    type="number"
                    value={formData.duration_years}
                    onChange={(e) => setFormData({...formData, duration_years: Number(e.target.value)})}
                    min="1"
                    max="10"
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
                  <Label htmlFor="application_deadline">Application Deadline</Label>
                  <Input
                    id="application_deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => setFormData({...formData, application_deadline: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="application_status">Application Status</Label>
                  <Select value={formData.application_status} onValueChange={(value) => setFormData({...formData, application_status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {applicationStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="available_spots">Available Spots</Label>
                  <Input
                    id="available_spots"
                    type="number"
                    value={formData.available_spots}
                    onChange={(e) => setFormData({...formData, available_spots: Number(e.target.value)})}
                    placeholder="50"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="career_outcomes">Career Outcomes (one per line)</Label>
                <Textarea
                  id="career_outcomes"
                  value={formData.career_outcomes}
                  onChange={(e) => setFormData({...formData, career_outcomes: e.target.value})}
                  placeholder="Software Developer&#10;Data Scientist&#10;Systems Analyst"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="entry_requirements">Entry Requirements (one per line)</Label>
                <Textarea
                  id="entry_requirements"
                  value={formData.entry_requirements}
                  onChange={(e) => setFormData({...formData, entry_requirements: e.target.value})}
                  placeholder="Matric Certificate&#10;Mathematics (Level 6)&#10;English (Level 4)"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="is_available">Program Available for Applications</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !formData.institution_id}>
                  {isLoading ? 'Creating...' : 'Create Program'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Programs ({programs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPrograms ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading programs...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {programs.map((program) => (
                <div key={program.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">{program.name}</p>
                      <Badge className={getStatusColor(program.application_status)}>
                        {program.application_status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {!program.is_available && (
                        <Badge variant="secondary">Unavailable</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {program.institutions?.name} • {program.qualification_level} • {program.field_of_study}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Duration: {program.duration_years} years • Fee: R{program.application_fee?.toLocaleString() || 0}
                    </p>
                    {program.application_deadline && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Deadline: {new Date(program.application_deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(program.id, program.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {programs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No programs found. Add your first program to get started.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
