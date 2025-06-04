'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FileText,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  CreditCard,
  AlertTriangle,
  Send,
  FileCheck,
  UserCheck,
  Building
} from 'lucide-react'

interface Application {
  id: string
  user_id: string
  institution_name?: string
  institution_id?: string
  service_type: string
  status: string
  payment_status: string
  payment_method?: string
  payment_date?: string
  total_amount?: number
  created_at: string
  updated_at?: string
  submitted_at?: string
  personal_info?: any
  academic_info?: any
  program_choices?: any
}

interface ApplicationManagementProps {
  applications: Application[]
  onRefresh: () => void
}

interface ApplicationDetails {
  application: Application
  user: any
  profile: any
  institution: any
  paymentHistory: any[]
}

export function ApplicationManagement({ applications, onRefresh }: ApplicationManagementProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [applicationDetails, setApplicationDetails] = useState<ApplicationDetails | null>(null)
  const [showApplicationDetails, setShowApplicationDetails] = useState(false)
  const [loading, setLoading] = useState(false)

  const filteredApplications = applications.filter(app => {
    // Handle search term matching with proper null checks
    const matchesSearch = !searchTerm ||
                         app.institution_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesPayment = paymentFilter === 'all' || app.payment_status === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  const fetchApplicationDetails = async (application: Application) => {
    setLoading(true)
    try {
      console.log('🔍 Fetching details for application:', application.id)

      // Fetch user details from admin API
      const userRes = await fetch('/api/admin/manage-users')
      const userData = await userRes.json()

      // Find the specific user
      const user = userData.success ?
        userData.data.users.find((u: any) => u.id === application.user_id) : null

      // Fetch profile details
      let profile = null
      if (user && user.profile) {
        profile = user.profile
      }

      // Fetch institution details if we have institution_id
      let institution = null
      if (application.institution_id) {
        try {
          const institutionRes = await fetch(`/api/institutions`)
          const institutionData = await institutionRes.json()
          institution = institutionData.data?.find((inst: any) =>
            inst.id === application.institution_id ||
            inst.name === application.institution_name
          )
        } catch (instError) {
          console.log('Institution fetch failed:', instError)
        }
      }

      console.log('📊 Application details loaded:', {
        application: application.id,
        hasUser: !!user,
        hasProfile: !!profile,
        hasInstitution: !!institution
      })

      setApplicationDetails({
        application,
        user,
        profile,
        institution,
        paymentHistory: [] // TODO: Implement payment history
      })

    } catch (error) {
      console.error('Error fetching application details:', error)
      toast({
        title: "Error",
        description: "Failed to load application details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationAction = async (applicationId: string, action: string, data?: any) => {
    try {
      const response = await fetch('/api/admin/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: applicationId,
          action,
          ...data
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Action failed')
      }

      toast({
        title: "Success",
        description: result.message,
      })

      onRefresh()

    } catch (error) {
      console.error('Error performing application action:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Action failed. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'processing': return 'secondary'
      case 'submitted': return 'outline'
      case 'draft': return 'outline'
      default: return 'outline'
    }
  }

  const getPaymentColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid': return 'default'
      case 'pending': return 'destructive'
      case 'failed': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      case 'submitted': return <FileCheck className="h-4 w-4" />
      case 'draft': return <Edit className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getPaymentIcon = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      default: return <CreditCard className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Application Management</h2>
          <p className="text-muted-foreground">Manage student applications, verify payments, and track progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paid Applications</p>
                <p className="text-2xl font-bold">
                  {applications.filter(app => app.payment_status === 'paid').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold">
                  {applications.filter(app => app.payment_status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  R{applications
                    .filter(app => app.payment_status === 'paid')
                    .reduce((sum, app) => sum + (app.total_amount || 250), 0)
                    .toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>All Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(application.status)}
                      <p className="font-medium">{application.institution_name || 'Unknown Institution'}</p>
                    </div>
                    <Badge variant={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                    <Badge variant={getPaymentColor(application.payment_status)} className="flex items-center gap-1">
                      {getPaymentIcon(application.payment_status)}
                      {application.payment_status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>User: {application.user_id?.slice(0, 8) || 'Unknown'}...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>{application.service_type || 'Unknown'} service</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Applied: {application.created_at ? new Date(application.created_at).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>

                  {application.total_amount && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">R{application.total_amount}</span>
                      {application.payment_date && (
                        <span className="text-muted-foreground">
                          • Paid: {new Date(application.payment_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('🔍 Opening details for application:', application.id)
                      console.log('📋 Application data:', application)
                      setSelectedApplication(application)
                      fetchApplicationDetails(application)
                      setShowApplicationDetails(true)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleApplicationAction(application.id, 'approve')}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Application
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleApplicationAction(application.id, 'verify_payment')}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Verify Payment
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleApplicationAction(application.id, 'mark_processing')}>
                        <Clock className="h-4 w-4 mr-2" />
                        Mark as Processing
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleApplicationAction(application.id, 'send_update')}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Update to Student
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleApplicationAction(application.id, 'reject')}
                        className="text-destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Application
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {filteredApplications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No applications found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Details Modal */}
      <Dialog open={showApplicationDetails} onOpenChange={setShowApplicationDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected application and applicant.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p>Loading application details...</p>
              </div>
            </div>
          ) : applicationDetails ? (
            <div className="space-y-6">
              {/* Application Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Application Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <Badge variant={getStatusColor(applicationDetails.application.status)}>
                        {applicationDetails.application.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Payment:</span>
                      <Badge variant={getPaymentColor(applicationDetails.application.payment_status)}>
                        {applicationDetails.application.payment_status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Service Type:</span>
                      <span className="font-medium">{applicationDetails.application.service_type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Amount:</span>
                      <span className="font-medium text-green-600">
                        R{applicationDetails.application.total_amount || 250}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Created:</span>
                      <span>{new Date(applicationDetails.application.created_at).toLocaleString()}</span>
                    </div>
                    {applicationDetails.application.submitted_at && (
                      <div className="flex items-center justify-between">
                        <span>Submitted:</span>
                        <span>{new Date(applicationDetails.application.submitted_at).toLocaleString()}</span>
                      </div>
                    )}
                    {applicationDetails.application.payment_date && (
                      <div className="flex items-center justify-between">
                        <span>Payment Date:</span>
                        <span>{new Date(applicationDetails.application.payment_date).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Last Updated:</span>
                      <span>{new Date(applicationDetails.application.updated_at || applicationDetails.application.created_at).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Student Information */}
              {applicationDetails.user && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Student Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm">{applicationDetails.user.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">User ID</Label>
                        <p className="text-sm font-mono">{applicationDetails.user.id}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Account Created</Label>
                        <p className="text-sm">{new Date(applicationDetails.user.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Last Sign In</Label>
                        <p className="text-sm">
                          {applicationDetails.user.last_sign_in_at
                            ? new Date(applicationDetails.user.last_sign_in_at).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Profile Information */}
              {applicationDetails.profile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Full Name</Label>
                        <p className="text-sm">
                          {applicationDetails.profile.first_name} {applicationDetails.profile.last_name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Profile Completeness</Label>
                        <p className="text-sm">{applicationDetails.profile.profile_completeness}%</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Verified</Label>
                        <p className="text-sm">{applicationDetails.profile.is_verified ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Institution Information */}
              {applicationDetails.institution && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Institution Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Institution Name</Label>
                        <p className="text-sm">{applicationDetails.institution.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Type</Label>
                        <p className="text-sm">{applicationDetails.institution.type}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Province</Label>
                        <p className="text-sm">{applicationDetails.institution.province}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Application Fee</Label>
                        <p className="text-sm">R{applicationDetails.institution.application_fee}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button onClick={() => {
                  handleApplicationAction(applicationDetails.application.id, 'approve')
                  setShowApplicationDetails(false)
                }}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Application
                </Button>
                <Button variant="outline" onClick={() => {
                  handleApplicationAction(applicationDetails.application.id, 'verify_payment')
                  setShowApplicationDetails(false)
                }}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Verify Payment
                </Button>
                <Button variant="outline" onClick={() => {
                  handleApplicationAction(applicationDetails.application.id, 'send_update')
                  setShowApplicationDetails(false)
                }}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Update
                </Button>
                <Button variant="destructive" onClick={() => {
                  handleApplicationAction(applicationDetails.application.id, 'reject')
                  setShowApplicationDetails(false)
                }}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Failed to load application details.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
