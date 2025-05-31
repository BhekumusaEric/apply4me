'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

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
  personalInfo: any
  contactInfo: any
  academicHistory: any
  studyPreferences: any
}

interface Document {
  id: string
  name: string
  type: string
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  isVerified: boolean
  verificationDate: string | null
  status: string
}

interface ProfileData {
  userProfile: UserProfile
  documents: {
    all: Document[]
    byType: {
      identity: Document[]
      passport_photos: Document[]
      academic: Document[]
      financial: Document[]
      other: Document[]
    }
    summary: {
      total: number
      verified: number
      pending: number
      completeness: number
      requiredDocuments: string[]
      uploadedRequired: string[]
      missingRequired: string[]
    }
  }
}

export default function ProfileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchProfileData()
    }
  }, [userId])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/profiles/${userId}/documents`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch profile data')
      }
    } catch (err) {
      setError('Error fetching profile data')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportProfileData = () => {
    if (!data) return

    const exportData = {
      profile: data.userProfile,
      documents: data.documents.all,
      summary: data.documents.summary
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `profile-${data.userProfile.fullName.replace(/\s+/g, '-')}-${data.userProfile.idNumber}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
              <p className="text-gray-600">{error || 'The requested profile could not be found.'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const profile = data.userProfile

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profiles
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{profile.fullName}</h1>
            <p className="text-gray-600">Student Profile Details</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={exportProfileData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          {profile.isVerified ? (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              Pending Verification
            </Badge>
          )}
        </div>
      </div>

      {/* Profile Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Profile Completeness</p>
                <p className="text-2xl font-bold">{profile.profileCompleteness}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Readiness Score</p>
                <p className="text-2xl font-bold">{profile.readinessScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Documents</p>
                <p className="text-2xl font-bold">{data.documents.summary.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Verified Docs</p>
                <p className="text-2xl font-bold">{data.documents.summary.verified}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="academic">Academic History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="preferences">Study Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-lg">{profile.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">ID Number</label>
                  <p className="font-mono">{profile.idNumber}</p>
                </div>
                {profile.personalInfo?.dateOfBirth && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                    <p>{new Date(profile.personalInfo.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                )}
                {profile.personalInfo?.gender && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gender</label>
                    <p>{profile.personalInfo.gender}</p>
                  </div>
                )}
                {profile.personalInfo?.nationality && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nationality</label>
                    <p>{profile.personalInfo.nationality}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p>{profile.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p>{profile.phone || 'Not provided'}</p>
                </div>
                {profile.contactInfo?.currentAddress && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Current Address</label>
                    <p className="text-sm">
                      {profile.contactInfo.currentAddress.streetAddress}<br />
                      {profile.contactInfo.currentAddress.suburb && `${profile.contactInfo.currentAddress.suburb}, `}
                      {profile.contactInfo.currentAddress.city}<br />
                      {profile.contactInfo.currentAddress.province}, {profile.contactInfo.currentAddress.postalCode}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Academic History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.academicHistory?.matricInfo ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Matric Year</label>
                      <p className="text-lg font-semibold">{profile.academicHistory.matricInfo.year}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">APS Score</label>
                      <p className="text-lg font-semibold">{profile.academicHistory.matricInfo.apsScore}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Overall Result</label>
                      <p className="text-lg font-semibold">{profile.academicHistory.matricInfo.overallResult}</p>
                    </div>
                  </div>

                  {profile.academicHistory.matricInfo.subjects && (
                    <div>
                      <h4 className="font-medium mb-3">Subject Results</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 p-2 text-left">Subject</th>
                              <th className="border border-gray-300 p-2 text-left">Mark</th>
                              <th className="border border-gray-300 p-2 text-left">Symbol</th>
                              <th className="border border-gray-300 p-2 text-left">Level</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profile.academicHistory.matricInfo.subjects.map((subject: any, index: number) => (
                              <tr key={index}>
                                <td className="border border-gray-300 p-2">{subject.name}</td>
                                <td className="border border-gray-300 p-2 font-semibold">{subject.mark}%</td>
                                <td className="border border-gray-300 p-2">
                                  <Badge variant={subject.symbol === 'A' ? 'default' : 'secondary'}>
                                    {subject.symbol}
                                  </Badge>
                                </td>
                                <td className="border border-gray-300 p-2">{subject.level}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No academic information provided yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Documents ({data.documents.summary.total})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Always show document summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                <div>
                  <p className="text-sm text-gray-600">Total Documents</p>
                  <p className="text-xl font-bold">{data.documents.summary.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-xl font-bold text-green-600">{data.documents.summary.verified}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-orange-600">{data.documents.summary.pending}</p>
                </div>
              </div>

              {/* Required Documents Status */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Required Documents Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.documents.summary.requiredDocuments.map((docType, index) => {
                    const isUploaded = data.documents.summary.uploadedRequired.includes(docType)
                    return (
                      <div key={index} className={`p-3 rounded-lg border ${isUploaded ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{docType.replace('_', ' ')}</span>
                          {isUploaded ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Uploaded
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Missing
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {data.documents.summary.total > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium mb-3">Uploaded Documents</h4>
                  {data.documents.all.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <p className="text-sm text-gray-600">{doc.type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={doc.isVerified ? 'default' : 'secondary'}>
                          {doc.status}
                        </Badge>
                        {doc.fileUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Study Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.studyPreferences && Object.keys(profile.studyPreferences).length > 0 ? (
                <div className="space-y-6">
                  {/* Notification Preferences */}
                  {profile.studyPreferences.notificationPreferences && (
                    <div>
                      <h4 className="font-medium mb-3">Notification Preferences</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(profile.studyPreferences.notificationPreferences).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                            <Badge variant={value ? 'default' : 'secondary'}>
                              {value ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Financial Aid Preferences */}
                  <div>
                    <h4 className="font-medium mb-3">Financial Aid</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Needs Financial Aid</span>
                        <p className="font-semibold">{profile.studyPreferences.needsFinancialAid ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Interested in Bursaries</span>
                        <p className="font-semibold">{profile.studyPreferences.interestedInBursaries ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Interested in Loans</span>
                        <p className="font-semibold">{profile.studyPreferences.interestedInLoans ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Accommodation */}
                  <div>
                    <h4 className="font-medium mb-3">Accommodation</h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Needs Accommodation</span>
                      <p className="font-semibold">{profile.studyPreferences.needsAccommodation ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  {/* Preferred Fields */}
                  {profile.studyPreferences.preferredFields && profile.studyPreferences.preferredFields.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Preferred Fields of Study</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.studyPreferences.preferredFields.map((field: string, index: number) => (
                          <Badge key={index} variant="outline">{field}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preferred Provinces */}
                  {profile.studyPreferences.preferredProvinces && profile.studyPreferences.preferredProvinces.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Preferred Provinces</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.studyPreferences.preferredProvinces.map((province: string, index: number) => (
                          <Badge key={index} variant="outline">{province}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preferred Institution Types */}
                  {profile.studyPreferences.preferredInstitutionTypes && profile.studyPreferences.preferredInstitutionTypes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Preferred Institution Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.studyPreferences.preferredInstitutionTypes.map((type: string, index: number) => (
                          <Badge key={index} variant="outline">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preferred Qualification Levels */}
                  {profile.studyPreferences.preferredQualificationLevels && profile.studyPreferences.preferredQualificationLevels.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Preferred Qualification Levels</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.studyPreferences.preferredQualificationLevels.map((level: string, index: number) => (
                          <Badge key={index} variant="outline">{level}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw Data (for debugging) */}
                  <details className="mt-6">
                    <summary className="cursor-pointer text-sm font-medium text-gray-600">View Raw Data</summary>
                    <pre className="mt-2 bg-gray-50 p-4 rounded-lg text-xs overflow-auto">
                      {JSON.stringify(profile.studyPreferences, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Study Preferences Set</h3>
                  <p className="text-gray-500">The student hasn't configured their study preferences yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
