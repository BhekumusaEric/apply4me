'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  FileText, 
  Target, 
  TestTube,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import ProfileBuilder from '@/components/profile/ProfileBuilder'
import ApplicationReadinessDashboard from '@/components/profile/ApplicationReadinessDashboard'
import { StudentProfile } from '@/lib/types/student-profile'

export default function ProfileTestPage() {
  const [currentView, setCurrentView] = useState<'builder' | 'dashboard'>('builder')
  const [studentProfile, setStudentProfile] = useState<Partial<StudentProfile>>({})
  const [isProfileComplete, setIsProfileComplete] = useState(false)

  // Sample complete profile for testing dashboard
  const sampleProfile: StudentProfile = {
    personalInfo: {
      idNumber: '0001010001088',
      firstName: 'Thabo',
      lastName: 'Mthembu',
      middleName: 'James',
      dateOfBirth: '2000-01-01',
      gender: 'Male',
      race: 'African',
      nationality: 'South African',
      homeLanguage: 'isiZulu',
      additionalLanguages: ['English', 'Afrikaans'],
      hasDisability: false,
      parentGuardianInfo: [{
        type: 'Mother',
        name: 'Nomsa Mthembu',
        idNumber: '7505050050088',
        occupation: 'Teacher',
        employer: 'Department of Education',
        phone: '0823456789',
        email: 'nomsa.mthembu@gmail.com',
        educationLevel: 'Degree',
        isDeceased: false,
        monthlyIncome: 25000
      }],
      householdIncome: 'R200,001 - R350,000',
      dependents: 3,
      isFirstGeneration: false,
      citizenship: 'South African',
      birthProvince: 'KwaZulu-Natal',
      currentProvince: 'Gauteng',
      ruralUrban: 'Urban',
      requiresAccommodation: false
    },
    contactInfo: {
      email: 'thabo.mthembu@gmail.com',
      phone: '0812345678',
      alternativePhone: '0112345678',
      currentAddress: {
        streetAddress: '123 Main Street',
        suburb: 'Sandton',
        city: 'Johannesburg',
        province: 'Gauteng',
        postalCode: '2196',
        country: 'South Africa'
      },
      permanentAddress: {
        streetAddress: '456 Village Road',
        suburb: 'Umlazi',
        city: 'Durban',
        province: 'KwaZulu-Natal',
        postalCode: '4031',
        country: 'South Africa'
      },
      emergencyContact: {
        name: 'Nomsa Mthembu',
        relationship: 'Mother',
        phone: '0823456789',
        email: 'nomsa.mthembu@gmail.com'
      },
      preferredContactMethod: 'WhatsApp',
      communicationLanguage: 'English'
    },
    academicHistory: {
      matricInfo: {
        year: 2018,
        school: 'Umlazi High School',
        schoolType: 'Public',
        province: 'KwaZulu-Natal',
        matricType: 'NSC',
        overallResult: 'Bachelor Pass',
        apsScore: 35,
        subjects: [
          { name: 'English Home Language', level: 'Higher Grade', mark: 75, symbol: 'B', isLanguage: true, isMathematics: false, isScience: false },
          { name: 'isiZulu First Additional Language', level: 'Higher Grade', mark: 85, symbol: 'A', isLanguage: true, isMathematics: false, isScience: false },
          { name: 'Mathematics', level: 'Higher Grade', mark: 70, symbol: 'B', isLanguage: false, isMathematics: true, isScience: false },
          { name: 'Physical Sciences', level: 'Higher Grade', mark: 68, symbol: 'C', isLanguage: false, isMathematics: false, isScience: true },
          { name: 'Life Sciences', level: 'Higher Grade', mark: 72, symbol: 'B', isLanguage: false, isMathematics: false, isScience: true },
          { name: 'Geography', level: 'Higher Grade', mark: 65, symbol: 'C', isLanguage: false, isMathematics: false, isScience: false },
          { name: 'Life Orientation', level: 'Core', mark: 78, symbol: 'B', isLanguage: false, isMathematics: false, isScience: false }
        ],
        additionalCertificates: ['Computer Literacy Certificate']
      },
      previousStudies: [],
      achievements: [
        {
          type: 'Academic',
          title: 'Top 10 in Mathematics',
          description: 'Achieved top 10 position in provincial mathematics competition',
          year: 2018,
          institution: 'KwaZulu-Natal Department of Education',
          level: 'Provincial'
        }
      ],
      careerInterests: [
        {
          field: 'Engineering',
          specificCareer: 'Software Engineering',
          motivationLevel: 5,
          experienceLevel: 'Some',
          relatedActivities: ['Coding bootcamp', 'Mathematics tutoring']
        }
      ]
    },
    documents: {
      identityDocument: {
        id: '1',
        name: 'SA_ID_Document.pdf',
        type: 'ID_DOCUMENT',
        fileUrl: '/sample-documents/id.pdf',
        uploadDate: '2024-01-15T10:00:00Z',
        fileSize: 2048000,
        mimeType: 'application/pdf',
        isVerified: true,
        verificationDate: '2024-01-16T09:00:00Z'
      },
      passportPhoto: {
        id: '2',
        name: 'Passport_Photo.jpg',
        type: 'PASSPORT_PHOTO',
        fileUrl: '/sample-documents/photo.jpg',
        uploadDate: '2024-01-15T10:05:00Z',
        fileSize: 512000,
        mimeType: 'image/jpeg',
        isVerified: true,
        verificationDate: '2024-01-16T09:05:00Z'
      },
      matricCertificate: {
        id: '3',
        name: 'Matric_Certificate.pdf',
        type: 'MATRIC_CERTIFICATE',
        fileUrl: '/sample-documents/matric.pdf',
        uploadDate: '2024-01-15T10:10:00Z',
        fileSize: 1536000,
        mimeType: 'application/pdf',
        isVerified: true,
        verificationDate: '2024-01-16T09:10:00Z'
      },
      matricResults: {
        id: '4',
        name: 'Matric_Results.pdf',
        type: 'MATRIC_RESULTS',
        fileUrl: '/sample-documents/results.pdf',
        uploadDate: '2024-01-15T10:15:00Z',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        isVerified: true,
        verificationDate: '2024-01-16T09:15:00Z'
      },
      academicTranscripts: [],
      parentIncomeStatements: [{
        id: '5',
        name: 'Mother_Income_Statement.pdf',
        type: 'INCOME_STATEMENT',
        fileUrl: '/sample-documents/income.pdf',
        uploadDate: '2024-01-15T10:20:00Z',
        fileSize: 768000,
        mimeType: 'application/pdf',
        isVerified: true,
        verificationDate: '2024-01-16T09:20:00Z'
      }],
      bankStatements: [],
      portfolioDocuments: [],
      affidavits: [],
      certifiedCopies: []
    },
    preferences: {
      preferredFields: ['Engineering', 'Computer Science', 'Information Technology'],
      preferredQualificationLevels: ['Bachelor\'s Degree'],
      preferredInstitutionTypes: ['University', 'University of Technology'],
      preferredProvinces: ['Gauteng', 'Western Cape', 'KwaZulu-Natal'],
      maxTuitionFee: 80000,
      needsFinancialAid: true,
      interestedInBursaries: true,
      interestedInLoans: false,
      needsAccommodation: true,
      accommodationType: 'Residence',
      notificationPreferences: {
        applicationUpdates: true,
        newOpportunities: true,
        deadlineReminders: true,
        bursaryAlerts: true,
        weeklyDigest: true,
        smsNotifications: true,
        whatsappNotifications: true
      }
    },
    applicationReadiness: {
      profileComplete: true,
      documentsComplete: true,
      academicInfoComplete: true,
      contactInfoComplete: true,
      identityVerified: true,
      academicRecordsVerified: true,
      documentsVerified: true,
      eligibleForUniversity: true,
      eligibleForTVET: true,
      eligibleForBursaries: true,
      missingDocuments: [],
      missingInformation: [],
      readinessScore: 95,
      lastAssessment: '2024-01-16T10:00:00Z'
    },
    profileCompleteness: 95,
    lastUpdated: '2024-01-16T10:00:00Z',
    isVerified: true,
    createdAt: '2024-01-15T08:00:00Z'
  }

  const handleProfileComplete = (profile: StudentProfile) => {
    setStudentProfile(profile)
    setIsProfileComplete(true)
    setCurrentView('dashboard')
  }

  const handleProfileSave = (profile: Partial<StudentProfile>) => {
    setStudentProfile(profile)
  }

  const handleUpdateProfile = () => {
    setCurrentView('builder')
  }

  const handleStartApplication = (institutionId: string) => {
    alert('🎉 Application process would start here! Integration with institution APIs coming next.')
  }

  const loadSampleProfile = () => {
    setStudentProfile(sampleProfile)
    setIsProfileComplete(true)
    setCurrentView('dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TestTube className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold">Student Profile System Test</h1>
            <Sparkles className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Test the comprehensive student profile and document management system designed for 
            South African higher education applications.
          </p>
        </div>

        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Test Controls
            </CardTitle>
            <CardDescription>
              Choose how you want to test the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => setCurrentView('builder')}
                variant={currentView === 'builder' ? 'default' : 'outline'}
              >
                <User className="h-4 w-4 mr-2" />
                Profile Builder
              </Button>
              
              <Button 
                onClick={loadSampleProfile}
                variant="outline"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Load Sample Profile
              </Button>
              
              <Button 
                onClick={() => setCurrentView('dashboard')}
                variant={currentView === 'dashboard' ? 'default' : 'outline'}
                disabled={!isProfileComplete}
              >
                <FileText className="h-4 w-4 mr-2" />
                Readiness Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Features Overview */}
        <Alert className="mb-8">
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            <strong>🎯 What you're testing:</strong> Complete student profile system with SA ID validation, 
            document upload, academic history tracking, application readiness assessment, and automated 
            eligibility checking for universities, TVET colleges, and bursaries.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        {currentView === 'builder' && (
          <ProfileBuilder
            initialProfile={studentProfile}
            onComplete={handleProfileComplete}
            onSave={handleProfileSave}
          />
        )}

        {currentView === 'dashboard' && isProfileComplete && (
          <ApplicationReadinessDashboard
            profile={studentProfile as StudentProfile}
            onUpdateProfile={handleUpdateProfile}
            onStartApplication={handleStartApplication}
          />
        )}

        {/* Features Showcase */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🚀 System Features Being Tested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">🆔 SA ID Validation</h3>
                <p className="text-sm text-muted-foreground">
                  Validates South African ID numbers with Luhn algorithm and auto-extracts date of birth
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">📄 Document Management</h3>
                <p className="text-sm text-muted-foreground">
                  Secure upload, validation, and verification of all required SA education documents
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">🎓 Academic Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Complete matric results, APS calculation, and eligibility assessment
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">📊 Readiness Scoring</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time assessment of application readiness with personalized recommendations
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">🎯 Smart Matching</h3>
                <p className="text-sm text-muted-foreground">
                  Eligibility checking for universities, TVET colleges, and bursary programs
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">🔒 Security & Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  Encrypted storage, secure uploads, and privacy-compliant data handling
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
