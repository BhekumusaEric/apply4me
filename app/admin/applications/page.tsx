'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Filter,
  Download,
  Eye,
  Send,
  FileText,
  CreditCard,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/admin-nav'

interface Application {
  id: string
  userId: string
  studentName: string
  studentEmail: string
  studentPhone: string
  studentIdNumber: string
  institution: string
  course: string
  applicationStatus: string
  submittedAt: string | null
  deadline: string
  applicationFee: number
  paymentStatus: string
  paymentReference: string | null
  paymentDate: string | null
  documentsSubmitted: boolean
  profileCompleteness: number
  readinessScore: number
  createdAt: string
  updatedAt: string
  notes: string
}

interface ApplicationsData {
  applications: Application[]
  pagination: any
  summary: {
    totalApplications: number
    draftApplications: number
    submittedApplications: number
    paidApplications: number
    processingApplications: number
    acceptedApplications: number
    rejectedApplications: number
    pendingPayments: number
    totalRevenue: number
  }
}

export default function AdminApplicationsPage() {
  const router = useRouter()
  const [data, setData] = useState<ApplicationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search,
        status: statusFilter
      })

      const response = await fetch(`/api/admin/applications?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        console.error('Failed to fetch applications:', result.error)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [page, statusFilter])

  const handleSearch = () => {
    setPage(1)
    fetchApplications()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-emerald-100 text-emerald-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'not_required': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading applications...</div>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout
      title="Applications & Payments Dashboard"
      description="Manage student applications, track payments, and monitor progress"
      breadcrumb={[{ name: 'Applications' }]}
    >
      <div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold">{data.summary.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold">{data.summary.acceptedApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Paid Applications</p>
                  <p className="text-2xl font-bold">{data.summary.paidApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">R{data.summary.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Overview */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Draft</p>
              <p className="text-lg font-bold text-gray-700">{data.summary.draftApplications}</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Submitted</p>
              <p className="text-lg font-bold text-blue-700">{data.summary.submittedApplications}</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Paid</p>
              <p className="text-lg font-bold text-green-700">{data.summary.paidApplications}</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Processing</p>
              <p className="text-lg font-bold text-yellow-700">{data.summary.processingApplications}</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Accepted</p>
              <p className="text-lg font-bold text-emerald-700">{data.summary.acceptedApplications}</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Rejected</p>
              <p className="text-lg font-bold text-red-700">{data.summary.rejectedApplications}</p>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Pending Payment</p>
              <p className="text-lg font-bold text-orange-700">{data.summary.pendingPayments}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="flex space-x-2">
            <Input
              placeholder="Search by student name, email, institution, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Applications</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Applications Table */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Applications ({data.pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Student</th>
                    <th className="text-left p-2">Institution & Course</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Payment</th>
                    <th className="text-left p-2">Deadline</th>
                    <th className="text-left p-2">Progress</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.applications.map((application) => (
                    <tr key={application.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{application.studentName}</div>
                          <div className="text-sm text-gray-500">{application.studentEmail}</div>
                          <div className="text-xs text-gray-400">{application.studentIdNumber}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{application.institution}</div>
                          <div className="text-sm text-gray-600">{application.course}</div>
                          <div className="text-xs text-gray-500">Fee: R{application.applicationFee}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge className={getStatusColor(application.applicationStatus)}>
                          {application.applicationStatus.charAt(0).toUpperCase() + application.applicationStatus.slice(1)}
                        </Badge>
                        {application.submittedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Submitted: {new Date(application.submittedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <Badge className={getPaymentStatusColor(application.paymentStatus)}>
                          {application.paymentStatus.replace('_', ' ').charAt(0).toUpperCase() +
                           application.paymentStatus.replace('_', ' ').slice(1)}
                        </Badge>
                        {application.paymentDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Paid: {new Date(application.paymentDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          {new Date(application.deadline).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.ceil((new Date(application.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${application.profileCompleteness}%` }}
                              />
                            </div>
                            <span className="text-xs">{application.profileCompleteness}%</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {application.documentsSubmitted ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span className="text-xs">Docs</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/admin/profiles/${application.userId}`, '_blank')}
                            title="View Profile"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push('/admin/notifications')}
                            title="Send Notification"
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                {data.pagination.total} applications
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  disabled={!data.pagination.hasPrev}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={!data.pagination.hasNext}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </AdminLayout>
  )
}
