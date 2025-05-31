'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Download, Eye, FileText, Users, CheckCircle, Clock } from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-nav'

interface UserProfile {
  id: string
  userId: string
  fullName: string
  email: string
  phone: string
  idNumber: string
  profileCompleteness: number
  readinessScore: number
  isVerified: boolean
  verificationDate: string | null
  createdAt: string
  updatedAt: string
  status: string
  applicationReadiness: string
  personalInfo: any
  contactInfo: any
  academicHistory: any
  studyPreferences: any
}

interface AdminProfilesData {
  profiles: UserProfile[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  summary: {
    totalProfiles: number
    completeProfiles: number
    verifiedProfiles: number
    readyForApplication: number
  }
}

export default function AdminProfilesPage() {
  const [data, setData] = useState<AdminProfilesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search,
        status
      })

      const response = await fetch(`/api/admin/profiles?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        console.error('Failed to fetch profiles:', result.error)
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [page, status])

  const handleSearch = () => {
    setPage(1)
    fetchProfiles()
  }

  const viewProfile = (userId: string) => {
    // Navigate to the individual profile page
    window.open(`/admin/profiles/${userId}`, '_blank')
  }

  const exportProfile = (profile: UserProfile) => {
    const exportData = {
      personalInfo: profile.personalInfo,
      contactInfo: profile.contactInfo,
      academicHistory: profile.academicHistory,
      studyPreferences: profile.studyPreferences,
      profileCompleteness: profile.profileCompleteness,
      readinessScore: profile.readinessScore,
      isVerified: profile.isVerified,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `profile-${profile.fullName.replace(/\s+/g, '-')}-${profile.idNumber}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading profiles...</div>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout
      title="Student Profiles"
      description="Manage and review all student profiles and applications"
      breadcrumb={[{ name: 'Student Profiles' }]}
    >
      <div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Profiles</p>
                  <p className="text-2xl font-bold">{data.summary.totalProfiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Complete Profiles</p>
                  <p className="text-2xl font-bold">{data.summary.completeProfiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Verified Profiles</p>
                  <p className="text-2xl font-bold">{data.summary.verifiedProfiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Ready for Application</p>
                  <p className="text-2xl font-bold">{data.summary.readyForApplication}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="flex space-x-2">
            <Input
              placeholder="Search by name, email, or ID number..."
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
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Profiles</option>
          <option value="complete">Complete Profiles</option>
          <option value="incomplete">Incomplete Profiles</option>
          <option value="verified">Verified Profiles</option>
        </select>
      </div>

      {/* Profiles Table */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Student Profiles ({data.pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Student</th>
                    <th className="text-left p-2">Contact</th>
                    <th className="text-left p-2">ID Number</th>
                    <th className="text-left p-2">Completeness</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Created</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.profiles.map((profile) => (
                    <tr key={profile.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{profile.fullName}</div>
                          <div className="text-sm text-gray-500">ID: {profile.userId.slice(0, 8)}...</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="text-sm">{profile.email}</div>
                          <div className="text-sm text-gray-500">{profile.phone}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {profile.idNumber}
                        </code>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${profile.profileCompleteness}%` }}
                            />
                          </div>
                          <span className="text-sm">{profile.profileCompleteness}%</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <Badge variant={profile.status === 'Complete' ? 'default' : 'secondary'}>
                            {profile.status}
                          </Badge>
                          {profile.isVerified && (
                            <Badge variant="outline" className="text-green-600">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          {new Date(profile.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => viewProfile(profile.userId)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exportProfile(profile)}
                            title="Export Profile Data"
                          >
                            <Download className="h-4 w-4" />
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
                {data.pagination.total} profiles
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
