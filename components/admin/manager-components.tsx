'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  UserCheck,
  BookOpen,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  RefreshCw,
  BarChart3,
  GraduationCap,
  Award
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

// Types
interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  id_number?: string
  province?: string
  role: 'student' | 'admin'
  created_at: string
  updated_at: string
}

interface Program {
  id: string
  institution_id: string
  name: string
  field_of_study: string
  qualification_level: string
  duration_years: number
  requirements: string[]
  career_outcomes: string[]
  is_available: boolean
  created_at: string
  updated_at: string
}

interface Application {
  id: string
  user_id: string
  institution_id: string
  program_id?: string
  status: 'draft' | 'submitted' | 'processing' | 'completed'
  personal_details: any
  academic_records: any
  documents: any
  payment_status: 'pending' | 'paid' | 'failed'
  payment_reference?: string
  service_type: 'standard' | 'express'
  created_at: string
  updated_at: string
}

interface Institution {
  id: string
  name: string
  type: 'university' | 'college' | 'tvet'
  province: string
  logo_url?: string
  description: string
  application_deadline?: string
  application_fee?: number
  required_documents: string[]
  contact_email?: string
  contact_phone?: string
  website_url?: string
  is_featured: boolean
  created_at: string
  updated_at: string
}

interface Bursary {
  id: string
  name: string
  provider: string
  type: 'national' | 'provincial' | 'sector' | 'institutional'
  field_of_study: string[]
  eligibility_criteria: string[]
  amount?: number
  application_deadline?: string
  application_url?: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Institutions Manager Component
export function InstitutionsManager({
  institutions,
  onRefresh,
  searchTerm,
  setSearchTerm
}: {
  institutions: Institution[]
  onRefresh: () => void
  searchTerm: string
  setSearchTerm: (term: string) => void
}) {
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null)
  const [newInstitution, setNewInstitution] = useState({
    name: '',
    type: 'university' as 'university' | 'college' | 'tvet',
    province: '',
    description: '',
    application_deadline: '',
    application_fee: 0,
    required_documents: [] as string[],
    contact_email: '',
    contact_phone: '',
    website_url: '',
    is_featured: false
  })

  const filteredInstitutions = institutions.filter(inst =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('institutions')
        .insert([{
          ...newInstitution,
          id: crypto.randomUUID()
        }])

      if (error) throw error

      toast({
        title: "Success",
        description: "Institution added successfully.",
      })

      setNewInstitution({
        name: '',
        type: 'university',
        province: '',
        description: '',
        application_deadline: '',
        application_fee: 0,
        required_documents: [],
        contact_email: '',
        contact_phone: '',
        website_url: '',
        is_featured: false
      })
      setIsAddDialogOpen(false)
      onRefresh()
    } catch (error) {
      console.error('Error adding institution:', error)
      toast({
        title: "Error",
        description: "Failed to add institution. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async (institution: Institution) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('institutions')
        .update({
          name: institution.name,
          type: institution.type,
          province: institution.province,
          description: institution.description,
          application_deadline: institution.application_deadline,
          application_fee: institution.application_fee,
          required_documents: institution.required_documents,
          contact_email: institution.contact_email,
          contact_phone: institution.contact_phone,
          website_url: institution.website_url,
          is_featured: institution.is_featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', institution.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Institution updated successfully.",
      })

      setEditingInstitution(null)
      onRefresh()
    } catch (error) {
      console.error('Error updating institution:', error)
      toast({
        title: "Error",
        description: "Failed to update institution. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('institutions')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Institution deleted successfully.",
      })

      onRefresh()
    } catch (error) {
      console.error('Error deleting institution:', error)
      toast({
        title: "Error",
        description: "Failed to delete institution. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search institutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Institution
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Institution</DialogTitle>
              <DialogDescription>
                Create a new educational institution in the database.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Institution Name</Label>
                <Input
                  id="name"
                  value={newInstitution.name}
                  onChange={(e) => setNewInstitution({...newInstitution, name: e.target.value})}
                  placeholder="University of Cape Town"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newInstitution.type} onValueChange={(value: any) => setNewInstitution({...newInstitution, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="tvet">TVET College</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  value={newInstitution.province}
                  onChange={(e) => setNewInstitution({...newInstitution, province: e.target.value})}
                  placeholder="Western Cape"
                />
              </div>
              <div>
                <Label htmlFor="fee">Application Fee (R)</Label>
                <Input
                  id="fee"
                  type="number"
                  value={newInstitution.application_fee}
                  onChange={(e) => setNewInstitution({...newInstitution, application_fee: parseInt(e.target.value) || 0})}
                  placeholder="200"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newInstitution.description}
                  onChange={(e) => setNewInstitution({...newInstitution, description: e.target.value})}
                  placeholder="Brief description of the institution..."
                />
              </div>
              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newInstitution.contact_email}
                  onChange={(e) => setNewInstitution({...newInstitution, contact_email: e.target.value})}
                  placeholder="info@institution.ac.za"
                />
              </div>
              <div>
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  value={newInstitution.contact_phone}
                  onChange={(e) => setNewInstitution({...newInstitution, contact_phone: e.target.value})}
                  placeholder="+27 21 123 4567"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  value={newInstitution.website_url}
                  onChange={(e) => setNewInstitution({...newInstitution, website_url: e.target.value})}
                  placeholder="https://www.institution.ac.za"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={newInstitution.is_featured}
                  onCheckedChange={(checked) => setNewInstitution({...newInstitution, is_featured: !!checked})}
                />
                <Label htmlFor="featured">Featured Institution</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>
                Add Institution
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Institutions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Institutions ({filteredInstitutions.length})</CardTitle>
          <CardDescription>
            Manage all educational institutions in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Province</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstitutions.map((institution) => (
                <TableRow key={institution.id}>
                  <TableCell className="font-medium">{institution.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {institution.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{institution.province}</TableCell>
                  <TableCell>R{institution.application_fee?.toLocaleString() || 0}</TableCell>
                  <TableCell>
                    {institution.is_featured ? (
                      <Badge variant="default">Featured</Badge>
                    ) : (
                      <Badge variant="secondary">Regular</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingInstitution(institution)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{institution.name}" and all associated data.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(institution.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingInstitution && (
        <Dialog open={!!editingInstitution} onOpenChange={() => setEditingInstitution(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Institution</DialogTitle>
              <DialogDescription>
                Update the institution information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Institution Name</Label>
                <Input
                  id="edit-name"
                  value={editingInstitution.name}
                  onChange={(e) => setEditingInstitution({...editingInstitution, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select value={editingInstitution.type} onValueChange={(value: any) => setEditingInstitution({...editingInstitution, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="tvet">TVET College</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-province">Province</Label>
                <Input
                  id="edit-province"
                  value={editingInstitution.province}
                  onChange={(e) => setEditingInstitution({...editingInstitution, province: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-fee">Application Fee (R)</Label>
                <Input
                  id="edit-fee"
                  type="number"
                  value={editingInstitution.application_fee || 0}
                  onChange={(e) => setEditingInstitution({...editingInstitution, application_fee: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingInstitution.description}
                  onChange={(e) => setEditingInstitution({...editingInstitution, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Contact Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingInstitution.contact_email || ''}
                  onChange={(e) => setEditingInstitution({...editingInstitution, contact_email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Contact Phone</Label>
                <Input
                  id="edit-phone"
                  value={editingInstitution.contact_phone || ''}
                  onChange={(e) => setEditingInstitution({...editingInstitution, contact_phone: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-website">Website URL</Label>
                <Input
                  id="edit-website"
                  value={editingInstitution.website_url || ''}
                  onChange={(e) => setEditingInstitution({...editingInstitution, website_url: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-featured"
                  checked={editingInstitution.is_featured}
                  onCheckedChange={(checked) => setEditingInstitution({...editingInstitution, is_featured: !!checked})}
                />
                <Label htmlFor="edit-featured">Featured Institution</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingInstitution(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleEdit(editingInstitution)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Bursaries Manager Component
export function BursariesManager({
  bursaries,
  onRefresh,
  searchTerm,
  setSearchTerm
}: {
  bursaries: Bursary[]
  onRefresh: () => void
  searchTerm: string
  setSearchTerm: (term: string) => void
}) {
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingBursary, setEditingBursary] = useState<Bursary | null>(null)
  const [newBursary, setNewBursary] = useState({
    name: '',
    provider: '',
    type: 'national' as 'national' | 'provincial' | 'sector' | 'institutional',
    field_of_study: [] as string[],
    eligibility_criteria: [] as string[],
    amount: 0,
    application_deadline: '',
    application_url: '',
    description: '',
    is_active: true
  })

  const filteredBursaries = bursaries.filter(bursary =>
    bursary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bursary.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bursary.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('bursaries')
        .insert([{
          ...newBursary,
          id: crypto.randomUUID()
        }])

      if (error) throw error

      toast({
        title: "Success",
        description: "Bursary added successfully.",
      })

      setNewBursary({
        name: '',
        provider: '',
        type: 'national',
        field_of_study: [],
        eligibility_criteria: [],
        amount: 0,
        application_deadline: '',
        application_url: '',
        description: '',
        is_active: true
      })
      setIsAddDialogOpen(false)
      onRefresh()
    } catch (error) {
      console.error('Error adding bursary:', error)
      toast({
        title: "Error",
        description: "Failed to add bursary. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async (bursary: Bursary) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('bursaries')
        .update({
          name: bursary.name,
          provider: bursary.provider,
          type: bursary.type,
          field_of_study: bursary.field_of_study,
          eligibility_criteria: bursary.eligibility_criteria,
          amount: bursary.amount,
          application_deadline: bursary.application_deadline,
          application_url: bursary.application_url,
          description: bursary.description,
          is_active: bursary.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', bursary.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Bursary updated successfully.",
      })

      setEditingBursary(null)
      onRefresh()
    } catch (error) {
      console.error('Error updating bursary:', error)
      toast({
        title: "Error",
        description: "Failed to update bursary. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('bursaries')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Bursary deleted successfully.",
      })

      onRefresh()
    } catch (error) {
      console.error('Error deleting bursary:', error)
      toast({
        title: "Error",
        description: "Failed to delete bursary. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search bursaries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Bursary
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Bursary</DialogTitle>
              <DialogDescription>
                Create a new bursary opportunity in the database.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bursary-name">Bursary Name</Label>
                <Input
                  id="bursary-name"
                  value={newBursary.name}
                  onChange={(e) => setNewBursary({...newBursary, name: e.target.value})}
                  placeholder="National Student Financial Aid Scheme"
                />
              </div>
              <div>
                <Label htmlFor="bursary-provider">Provider</Label>
                <Input
                  id="bursary-provider"
                  value={newBursary.provider}
                  onChange={(e) => setNewBursary({...newBursary, provider: e.target.value})}
                  placeholder="NSFAS"
                />
              </div>
              <div>
                <Label htmlFor="bursary-type">Type</Label>
                <Select value={newBursary.type} onValueChange={(value: any) => setNewBursary({...newBursary, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="provincial">Provincial</SelectItem>
                    <SelectItem value="sector">Sector</SelectItem>
                    <SelectItem value="institutional">Institutional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bursary-amount">Amount (R)</Label>
                <Input
                  id="bursary-amount"
                  type="number"
                  value={newBursary.amount}
                  onChange={(e) => setNewBursary({...newBursary, amount: parseInt(e.target.value) || 0})}
                  placeholder="50000"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bursary-description">Description</Label>
                <Textarea
                  id="bursary-description"
                  value={newBursary.description}
                  onChange={(e) => setNewBursary({...newBursary, description: e.target.value})}
                  placeholder="Brief description of the bursary..."
                />
              </div>
              <div>
                <Label htmlFor="bursary-deadline">Application Deadline</Label>
                <Input
                  id="bursary-deadline"
                  type="date"
                  value={newBursary.application_deadline}
                  onChange={(e) => setNewBursary({...newBursary, application_deadline: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="bursary-url">Application URL</Label>
                <Input
                  id="bursary-url"
                  value={newBursary.application_url}
                  onChange={(e) => setNewBursary({...newBursary, application_url: e.target.value})}
                  placeholder="https://www.nsfas.org.za/apply"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bursary-active"
                  checked={newBursary.is_active}
                  onCheckedChange={(checked) => setNewBursary({...newBursary, is_active: !!checked})}
                />
                <Label htmlFor="bursary-active">Active Bursary</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>
                Add Bursary
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bursaries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bursaries ({filteredBursaries.length})</CardTitle>
          <CardDescription>
            Manage all bursary opportunities in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBursaries.map((bursary) => (
                <TableRow key={bursary.id}>
                  <TableCell className="font-medium">{bursary.name}</TableCell>
                  <TableCell>{bursary.provider}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {bursary.type}
                    </Badge>
                  </TableCell>
                  <TableCell>R{bursary.amount?.toLocaleString() || 'N/A'}</TableCell>
                  <TableCell>
                    {bursary.is_active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingBursary(bursary)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{bursary.name}" and all associated data.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(bursary.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingBursary && (
        <Dialog open={!!editingBursary} onOpenChange={() => setEditingBursary(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Bursary</DialogTitle>
              <DialogDescription>
                Update the bursary information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-bursary-name">Bursary Name</Label>
                <Input
                  id="edit-bursary-name"
                  value={editingBursary.name}
                  onChange={(e) => setEditingBursary({...editingBursary, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-bursary-provider">Provider</Label>
                <Input
                  id="edit-bursary-provider"
                  value={editingBursary.provider}
                  onChange={(e) => setEditingBursary({...editingBursary, provider: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-bursary-type">Type</Label>
                <Select value={editingBursary.type} onValueChange={(value: any) => setEditingBursary({...editingBursary, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="provincial">Provincial</SelectItem>
                    <SelectItem value="sector">Sector</SelectItem>
                    <SelectItem value="institutional">Institutional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-bursary-amount">Amount (R)</Label>
                <Input
                  id="edit-bursary-amount"
                  type="number"
                  value={editingBursary.amount || 0}
                  onChange={(e) => setEditingBursary({...editingBursary, amount: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-bursary-description">Description</Label>
                <Textarea
                  id="edit-bursary-description"
                  value={editingBursary.description}
                  onChange={(e) => setEditingBursary({...editingBursary, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-bursary-deadline">Application Deadline</Label>
                <Input
                  id="edit-bursary-deadline"
                  type="date"
                  value={editingBursary.application_deadline || ''}
                  onChange={(e) => setEditingBursary({...editingBursary, application_deadline: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-bursary-url">Application URL</Label>
                <Input
                  id="edit-bursary-url"
                  value={editingBursary.application_url || ''}
                  onChange={(e) => setEditingBursary({...editingBursary, application_url: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-bursary-active"
                  checked={editingBursary.is_active}
                  onCheckedChange={(checked) => setEditingBursary({...editingBursary, is_active: !!checked})}
                />
                <Label htmlFor="edit-bursary-active">Active Bursary</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingBursary(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleEdit(editingBursary)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Users Manager Component
export function UsersManager({
  users,
  onRefresh,
  searchTerm,
  setSearchTerm
}: {
  users: User[]
  onRefresh: () => void
  searchTerm: string
  setSearchTerm: (term: string) => void
}) {
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    phone: '',
    id_number: '',
    province: '',
    role: 'student' as 'student' | 'admin'
  })

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('users')
        .insert([{
          ...newUser,
          id: crypto.randomUUID()
        }])

      if (error) throw error

      toast({
        title: "Success",
        description: "User added successfully.",
      })

      setNewUser({
        email: '',
        full_name: '',
        phone: '',
        id_number: '',
        province: '',
        role: 'student'
      })
      setIsAddDialogOpen(false)
      onRefresh()
    } catch (error) {
      console.error('Error adding user:', error)
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async (user: User) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('users')
        .update({
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          id_number: user.id_number,
          province: user.province,
          role: user.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "User updated successfully.",
      })

      setEditingUser(null)
      onRefresh()
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: "User deleted successfully.",
      })

      onRefresh()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account in the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="student@example.com"
                />
              </div>
              <div>
                <Label htmlFor="user-name">Full Name</Label>
                <Input
                  id="user-name"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="user-phone">Phone</Label>
                <Input
                  id="user-phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  placeholder="+27 12 345 6789"
                />
              </div>
              <div>
                <Label htmlFor="user-id">ID Number</Label>
                <Input
                  id="user-id"
                  value={newUser.id_number}
                  onChange={(e) => setNewUser({...newUser, id_number: e.target.value})}
                  placeholder="0001010000000"
                />
              </div>
              <div>
                <Label htmlFor="user-province">Province</Label>
                <Input
                  id="user-province"
                  value={newUser.province}
                  onChange={(e) => setNewUser({...newUser, province: e.target.value})}
                  placeholder="Gauteng"
                />
              </div>
              <div>
                <Label htmlFor="user-role">Role</Label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage all user accounts in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Province</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  <TableCell>{user.province || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{user.email}" and all associated data.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(user.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update the user information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-user-email">Email</Label>
                <Input
                  id="edit-user-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-user-name">Full Name</Label>
                <Input
                  id="edit-user-name"
                  value={editingUser.full_name || ''}
                  onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-user-phone">Phone</Label>
                <Input
                  id="edit-user-phone"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-user-id">ID Number</Label>
                <Input
                  id="edit-user-id"
                  value={editingUser.id_number || ''}
                  onChange={(e) => setEditingUser({...editingUser, id_number: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-user-province">Province</Label>
                <Input
                  id="edit-user-province"
                  value={editingUser.province || ''}
                  onChange={(e) => setEditingUser({...editingUser, province: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-user-role">Role</Label>
                <Select value={editingUser.role} onValueChange={(value: any) => setEditingUser({...editingUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleEdit(editingUser)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Programs Manager Component
export function ProgramsManager({
  programs,
  institutions,
  onRefresh,
  searchTerm,
  setSearchTerm
}: {
  programs: Program[]
  institutions: Institution[]
  onRefresh: () => void
  searchTerm: string
  setSearchTerm: (term: string) => void
}) {
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [newProgram, setNewProgram] = useState({
    institution_id: '',
    name: '',
    field_of_study: '',
    qualification_level: '',
    duration_years: 1,
    requirements: [] as string[],
    career_outcomes: [] as string[],
    is_available: true
  })

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.field_of_study.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.qualification_level.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInstitutionName = (institutionId: string) => {
    const institution = institutions.find(inst => inst.id === institutionId)
    return institution?.name || 'Unknown Institution'
  }

  const handleAdd = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('programs')
        .insert([{
          ...newProgram,
          id: crypto.randomUUID()
        }])

      if (error) throw error

      toast({
        title: "Success",
        description: "Program added successfully.",
      })

      setNewProgram({
        institution_id: '',
        name: '',
        field_of_study: '',
        qualification_level: '',
        duration_years: 1,
        requirements: [],
        career_outcomes: [],
        is_available: true
      })
      setIsAddDialogOpen(false)
      onRefresh()
    } catch (error) {
      console.error('Error adding program:', error)
      toast({
        title: "Error",
        description: "Failed to add program. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async (program: Program) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('programs')
        .update({
          institution_id: program.institution_id,
          name: program.name,
          field_of_study: program.field_of_study,
          qualification_level: program.qualification_level,
          duration_years: program.duration_years,
          requirements: program.requirements,
          career_outcomes: program.career_outcomes,
          is_available: program.is_available,
          updated_at: new Date().toISOString()
        })
        .eq('id', program.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Program updated successfully.",
      })

      setEditingProgram(null)
      onRefresh()
    } catch (error) {
      console.error('Error updating program:', error)
      toast({
        title: "Error",
        description: "Failed to update program. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Program deleted successfully.",
      })

      onRefresh()
    } catch (error) {
      console.error('Error deleting program:', error)
      toast({
        title: "Error",
        description: "Failed to delete program. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Program</DialogTitle>
              <DialogDescription>
                Create a new academic program in the database.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="program-institution">Institution</Label>
                <Select value={newProgram.institution_id} onValueChange={(value) => setNewProgram({...newProgram, institution_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map((institution) => (
                      <SelectItem key={institution.id} value={institution.id}>
                        {institution.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="program-name">Program Name</Label>
                <Input
                  id="program-name"
                  value={newProgram.name}
                  onChange={(e) => setNewProgram({...newProgram, name: e.target.value})}
                  placeholder="Bachelor of Science in Computer Science"
                />
              </div>
              <div>
                <Label htmlFor="field-of-study">Field of Study</Label>
                <Input
                  id="field-of-study"
                  value={newProgram.field_of_study}
                  onChange={(e) => setNewProgram({...newProgram, field_of_study: e.target.value})}
                  placeholder="Computer Science"
                />
              </div>
              <div>
                <Label htmlFor="qualification-level">Qualification Level</Label>
                <Input
                  id="qualification-level"
                  value={newProgram.qualification_level}
                  onChange={(e) => setNewProgram({...newProgram, qualification_level: e.target.value})}
                  placeholder="Bachelor's Degree"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (Years)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newProgram.duration_years}
                  onChange={(e) => setNewProgram({...newProgram, duration_years: parseInt(e.target.value) || 1})}
                  placeholder="3"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available"
                  checked={newProgram.is_available}
                  onCheckedChange={(checked) => setNewProgram({...newProgram, is_available: !!checked})}
                />
                <Label htmlFor="available">Available for Applications</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>
                Add Program
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Programs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Programs ({filteredPrograms.length})</CardTitle>
          <CardDescription>
            Manage all academic programs in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program Name</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Field of Study</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrograms.map((program) => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell>{getInstitutionName(program.institution_id)}</TableCell>
                  <TableCell>{program.field_of_study}</TableCell>
                  <TableCell>{program.qualification_level}</TableCell>
                  <TableCell>{program.duration_years} years</TableCell>
                  <TableCell>
                    {program.is_available ? (
                      <Badge variant="default">Available</Badge>
                    ) : (
                      <Badge variant="secondary">Unavailable</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProgram(program)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{program.name}" and all associated data.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(program.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingProgram && (
        <Dialog open={!!editingProgram} onOpenChange={() => setEditingProgram(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Program</DialogTitle>
              <DialogDescription>
                Update the program information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-program-institution">Institution</Label>
                <Select value={editingProgram.institution_id} onValueChange={(value) => setEditingProgram({...editingProgram, institution_id: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map((institution) => (
                      <SelectItem key={institution.id} value={institution.id}>
                        {institution.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-program-name">Program Name</Label>
                <Input
                  id="edit-program-name"
                  value={editingProgram.name}
                  onChange={(e) => setEditingProgram({...editingProgram, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-field-of-study">Field of Study</Label>
                <Input
                  id="edit-field-of-study"
                  value={editingProgram.field_of_study}
                  onChange={(e) => setEditingProgram({...editingProgram, field_of_study: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-qualification-level">Qualification Level</Label>
                <Input
                  id="edit-qualification-level"
                  value={editingProgram.qualification_level}
                  onChange={(e) => setEditingProgram({...editingProgram, qualification_level: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration (Years)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={editingProgram.duration_years}
                  onChange={(e) => setEditingProgram({...editingProgram, duration_years: parseInt(e.target.value) || 1})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-available"
                  checked={editingProgram.is_available}
                  onCheckedChange={(checked) => setEditingProgram({...editingProgram, is_available: !!checked})}
                />
                <Label htmlFor="edit-available">Available for Applications</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingProgram(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleEdit(editingProgram)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Applications Manager Component
export function ApplicationsManager({
  applications,
  onRefresh,
  searchTerm,
  setSearchTerm
}: {
  applications: Application[]
  onRefresh: () => void
  searchTerm: string
  setSearchTerm: (term: string) => void
}) {
  const { toast } = useToast()
  const [viewingApplication, setViewingApplication] = useState<Application | null>(null)

  const filteredApplications = applications.filter(app =>
    app.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.payment_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.service_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('applications')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Application status updated successfully.",
      })

      onRefresh()
    } catch (error) {
      console.error('Error updating application status:', error)
      toast({
        title: "Error",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePaymentStatusUpdate = async (applicationId: string, newPaymentStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('applications')
        .update({
          payment_status: newPaymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Payment status updated successfully.",
      })

      onRefresh()
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast({
        title: "Error",
        description: "Failed to update payment status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Application deleted successfully.",
      })

      onRefresh()
    } catch (error) {
      console.error('Error deleting application:', error)
      toast({
        title: "Error",
        description: "Failed to delete application. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'submitted':
        return <Badge variant="outline">Submitted</Badge>
      case 'processing':
        return <Badge variant="default">Processing</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'paid':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          <CardDescription>
            Manage all student applications in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Institution ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">{application.id.substring(0, 8)}...</TableCell>
                  <TableCell>{application.user_id.substring(0, 8)}...</TableCell>
                  <TableCell>{application.institution_id.substring(0, 8)}...</TableCell>
                  <TableCell>{getStatusBadge(application.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(application.payment_status)}</TableCell>
                  <TableCell>
                    <Badge variant={application.service_type === 'express' ? 'default' : 'outline'}>
                      {application.service_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingApplication(application)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select
                        value={application.status}
                        onValueChange={(value) => handleStatusUpdate(application.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={application.payment_status}
                        onValueChange={(value) => handlePaymentStatusUpdate(application.id, value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this application and all associated data.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(application.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      {viewingApplication && (
        <Dialog open={!!viewingApplication} onOpenChange={() => setViewingApplication(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Complete information for application {viewingApplication.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Application ID</Label>
                  <p className="text-sm text-muted-foreground">{viewingApplication.id}</p>
                </div>
                <div>
                  <Label>User ID</Label>
                  <p className="text-sm text-muted-foreground">{viewingApplication.user_id}</p>
                </div>
                <div>
                  <Label>Institution ID</Label>
                  <p className="text-sm text-muted-foreground">{viewingApplication.institution_id}</p>
                </div>
                <div>
                  <Label>Program ID</Label>
                  <p className="text-sm text-muted-foreground">{viewingApplication.program_id || 'N/A'}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(viewingApplication.status)}</div>
                </div>
                <div>
                  <Label>Payment Status</Label>
                  <div className="mt-1">{getPaymentStatusBadge(viewingApplication.payment_status)}</div>
                </div>
                <div>
                  <Label>Service Type</Label>
                  <div className="mt-1">
                    <Badge variant={viewingApplication.service_type === 'express' ? 'default' : 'outline'}>
                      {viewingApplication.service_type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Payment Reference</Label>
                  <p className="text-sm text-muted-foreground">{viewingApplication.payment_reference || 'N/A'}</p>
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <Label className="text-base font-semibold">Personal Details</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(viewingApplication.personal_details, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Academic Records */}
              <div>
                <Label className="text-base font-semibold">Academic Records</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(viewingApplication.academic_records, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Documents */}
              <div>
                <Label className="text-base font-semibold">Documents</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(viewingApplication.documents, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Created At</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(viewingApplication.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Updated At</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(viewingApplication.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingApplication(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Automation Manager Component
export function AutomationManager({
  onRefresh
}: {
  onRefresh: () => void
}) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Database management functions
  const triggerDatabaseAction = async (action: 'populate' | 'test' | 'stats') => {
    try {
      setIsLoading(true)
      console.log(`🚀 Triggering database ${action}...`)
      const response = await fetch('/api/database/populate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      const result = await response.json()
      if (result.success) {
        console.log(`✅ Database ${action} completed:`, result.result)
        toast({
          title: "Success",
          description: `Database ${action} completed successfully.`,
        })
        onRefresh() // Refresh data
        return result.result
      } else {
        console.error(`❌ Database ${action} failed:`, result.error)
        toast({
          title: "Error",
          description: `Database ${action} failed: ${result.error}`,
          variant: "destructive",
        })
        return null
      }
    } catch (error) {
      console.error(`❌ Error triggering database ${action}:`, error)
      toast({
        title: "Error",
        description: `Error triggering database ${action}`,
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Automation trigger functions
  const triggerScraping = async (type: 'institutions' | 'bursaries' | 'both') => {
    try {
      setIsLoading(true)
      console.log(`🚀 Triggering ${type} scraping...`)
      const response = await fetch('/api/automation/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      const result = await response.json()
      if (result.success) {
        console.log(`✅ ${type} scraping completed:`, result.results)
        toast({
          title: "Success",
          description: `${type} scraping completed successfully.`,
        })
        onRefresh() // Refresh data
      } else {
        toast({
          title: "Error",
          description: `${type} scraping failed`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`❌ Error triggering ${type} scraping:`, error)
      toast({
        title: "Error",
        description: `Error triggering ${type} scraping`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const triggerNotifications = async (type: 'deadlines' | 'digest') => {
    try {
      setIsLoading(true)
      console.log(`📧 Triggering ${type} notifications...`)
      const response = await fetch('/api/automation/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })

      const result = await response.json()
      if (result.success) {
        console.log(`✅ ${type} notifications sent: ${result.emailsSent} emails`)
        toast({
          title: "Success",
          description: `${type} notifications sent: ${result.emailsSent} emails`,
        })
      } else {
        toast({
          title: "Error",
          description: `${type} notifications failed`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`❌ Error triggering ${type} notifications:`, error)
      toast({
        title: "Error",
        description: `Error triggering ${type} notifications`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check what data is actually in the database
  const checkDatabaseData = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Checking database data...')
      const response = await fetch('/api/test-data')
      const result = await response.json()

      if (result.success) {
        console.log('📊 Database data:', result.data)

        // Show detailed data check results
        const institutionCount = result.data.institutions.length
        const bursaryCount = result.data.bursaries.length

        toast({
          title: "🔍 Database Data Check Results",
          description: `📊 Found: ${institutionCount} institutions, ${bursaryCount} bursaries in database`,
        })

        // Log detailed information
        console.log(`📊 Database Contents:`)
        console.log(`🏫 Institutions (${institutionCount}):`, result.data.institutions.map(i => i.name))
        console.log(`💰 Bursaries (${bursaryCount}):`, result.data.bursaries.map(b => b.name))

        // Wait a moment before refreshing to let user see the data check results
        setTimeout(() => {
          onRefresh()
        }, 2000)
      } else {
        toast({
          title: "Error",
          description: "Failed to check database data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('❌ Error checking database data:', error)
      toast({
        title: "Error",
        description: "Error checking database data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Database Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            🗄️ Database Management
          </CardTitle>
          <CardDescription>
            Test database connectivity and populate with fresh data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Button
              onClick={() => triggerDatabaseAction('test')}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4" />
              Test Database
            </Button>
            <Button
              onClick={() => triggerDatabaseAction('stats')}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <BarChart3 className="h-4 w-4" />
              Get Statistics
            </Button>
            <Button
              onClick={() => triggerDatabaseAction('populate')}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Populate Database
            </Button>
            <Button
              onClick={checkDatabaseData}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <Eye className="h-4 w-4" />
              Check Data
            </Button>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">🔧 Database Actions:</h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• <strong>Test:</strong> Check database connectivity and table structure</li>
              <li>• <strong>Statistics:</strong> Get comprehensive data counts and metrics</li>
              <li>• <strong>Populate:</strong> Scrape and save fresh institutions and bursaries</li>
              <li>• <strong>Check Data:</strong> View actual database contents and force UI refresh</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Automation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            🤖 Data Automation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Manual Data Discovery</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => triggerScraping('institutions')}
                  className="w-full justify-start"
                  variant="outline"
                  disabled={isLoading}
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Discover New Institutions
                </Button>
                <Button
                  onClick={() => triggerScraping('bursaries')}
                  className="w-full justify-start"
                  variant="outline"
                  disabled={isLoading}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Find New Bursaries
                </Button>
                <Button
                  onClick={() => triggerScraping('both')}
                  className="w-full justify-start"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Full Data Refresh
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Manual Notifications</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => triggerNotifications('deadlines')}
                  className="w-full justify-start"
                  variant="outline"
                  disabled={isLoading}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Send Deadline Reminders
                </Button>
                <Button
                  onClick={() => triggerNotifications('digest')}
                  className="w-full justify-start"
                  variant="outline"
                  disabled={isLoading}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Send Weekly Digest
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              🤖 Automation Status
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-blue-600 dark:text-blue-300">Daily Scraping</p>
                <p className="font-semibold">✅ Active</p>
              </div>
              <div>
                <p className="text-blue-600 dark:text-blue-300">Email Alerts</p>
                <p className="font-semibold">✅ Active</p>
              </div>
              <div>
                <p className="text-blue-600 dark:text-blue-300">Last Update</p>
                <p className="font-semibold">2 hours ago</p>
              </div>
              <div>
                <p className="text-blue-600 dark:text-blue-300">Success Rate</p>
                <p className="font-semibold">95%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Analytics Manager Component
export function AnalyticsManager({
  stats
}: {
  stats: {
    totalInstitutions: number
    totalBursaries: number
    totalUsers: number
    totalApplications: number
    totalRevenue: number
    successRate: number
  }
}) {
  return (
    <div className="space-y-6">
      {/* Platform Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            📊 Platform Analytics
          </CardTitle>
          <CardDescription>
            Comprehensive insights into platform performance and user engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">2,847</div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Total Students Helped</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">+12% this month</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">R2.4M</div>
              <p className="text-sm text-green-700 dark:text-green-300">Bursaries Secured</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">+8% this month</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.successRate}%</div>
              <p className="text-sm text-purple-700 dark:text-purple-300">Application Success Rate</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">+3% this month</p>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Active Users</span>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-green-600">+5.2% from last week</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">R{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-green-600">+12.3% from last month</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Avg. Processing Time</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">2.3 days</div>
              <p className="text-xs text-green-600">-0.5 days improvement</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Customer Satisfaction</span>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">4.8/5</div>
              <p className="text-xs text-green-600">+0.2 from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Growth Metrics</CardTitle>
          <CardDescription>
            Track platform growth and user engagement over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Monthly Growth</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">New Registrations</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <span className="text-sm font-medium">+75%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Applications Submitted</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                    <span className="text-sm font-medium">+60%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Revenue Growth</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <span className="text-sm font-medium">+85%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Performance Indicators</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">System Uptime</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '99%'}}></div>
                    </div>
                    <span className="text-sm font-medium">99.9%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Data Accuracy</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '95%'}}></div>
                    </div>
                    <span className="text-sm font-medium">95.2%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">User Retention</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '88%'}}></div>
                    </div>
                    <span className="text-sm font-medium">88.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>🔄 Recent Activity Summary</CardTitle>
          <CardDescription>
            Latest platform activities and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Database populated with 11 new institutions</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
              <Badge variant="default" className="bg-green-500">Success</Badge>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">51 bursaries updated with latest information</p>
                <p className="text-xs text-muted-foreground">4 hours ago</p>
              </div>
              <Badge variant="outline">Automated</Badge>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Weekly digest sent to {stats.totalUsers} users</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
              <Badge variant="secondary">Notification</Badge>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">System backup completed successfully</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
              <Badge variant="outline">System</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}