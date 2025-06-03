'use client'

import { useState, useEffect } from 'react'

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
          <h1 className="text-2xl font-bold">Loading Student Profiles...</h1>
          <p className="text-gray-600">Please wait while we fetch the data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold mb-2">Student Profiles</h1>
          <p className="text-gray-600 mb-6">Manage and review all student profiles and applications</p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">🚧 Admin Profiles Feature</h2>
            <p className="text-blue-700">
              This admin feature is currently being rebuilt with improved functionality.
              The student profiles management system will be available soon with enhanced features for:
            </p>
            <ul className="list-disc list-inside mt-2 text-blue-700 space-y-1">
              <li>Viewing all student profiles and completion status</li>
              <li>Searching and filtering profiles by various criteria</li>
              <li>Exporting profile data for analysis</li>
              <li>Managing profile verification status</li>
              <li>Tracking application readiness scores</li>
            </ul>
            <div className="mt-4">
              <button
                onClick={() => window.location.href = '/admin/enhanced'}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Return to Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
