'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h1 className="text-2xl font-bold">Loading Profile Details...</h1>
          <p className="text-gray-600">Please wait while we fetch the profile data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.back()}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
            >
              ← Back to Profiles
            </button>
            <div>
              <h1 className="text-3xl font-bold">Profile Details</h1>
              <p className="text-gray-600">Student ID: {userId}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">🚧 Individual Profile View</h2>
            <p className="text-blue-700">
              This detailed profile view is currently being rebuilt with enhanced functionality.
              The individual student profile system will be available soon with features for:
            </p>
            <ul className="list-disc list-inside mt-2 text-blue-700 space-y-1">
              <li>Viewing complete student profile information</li>
              <li>Reviewing uploaded documents and verification status</li>
              <li>Tracking academic history and achievements</li>
              <li>Managing study preferences and application readiness</li>
              <li>Exporting detailed profile data</li>
            </ul>
            <div className="mt-4">
              <button
                onClick={() => window.location.href = '/admin/profiles'}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
              >
                Back to All Profiles
              </button>
              <button
                onClick={() => window.location.href = '/admin/enhanced'}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
