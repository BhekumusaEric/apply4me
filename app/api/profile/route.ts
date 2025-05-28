import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { StudentProfile, DocumentType, DocumentInfo, DocumentCollection } from '@/lib/types/student-profile'
import { ProfileValidator } from '@/lib/services/profile-validator'

// GET - Fetch user's profile
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select(`
        *,
        student_documents (*)
      `)
      .eq('user_id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    // If no profile exists, return null
    if (!profile) {
      return NextResponse.json({ profile: null })
    }

    // Transform database record to StudentProfile format
    const studentProfile: StudentProfile = {
      personalInfo: profile.personal_info || {},
      contactInfo: profile.contact_info || {},
      academicHistory: profile.academic_history || {},
      preferences: profile.study_preferences || {},
      documents: transformDocuments(profile.student_documents || []),
      applicationReadiness: {
        profileComplete: profile.profile_completeness >= 90,
        documentsComplete: profile.profile_completeness >= 100,
        academicInfoComplete: !!profile.academic_history,
        contactInfoComplete: !!profile.contact_info,
        identityVerified: profile.is_verified,
        academicRecordsVerified: profile.is_verified,
        documentsVerified: profile.is_verified,
        eligibleForUniversity: true, // Calculate based on academic info
        eligibleForTVET: true,
        eligibleForBursaries: true,
        missingDocuments: [],
        missingInformation: [],
        readinessScore: profile.readiness_score || 0,
        lastAssessment: profile.updated_at
      },
      profileCompleteness: profile.profile_completeness || 0,
      lastUpdated: profile.updated_at,
      isVerified: profile.is_verified,
      createdAt: profile.created_at
    }

    return NextResponse.json({ profile: studentProfile })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create or update profile
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { profile }: { profile: Partial<StudentProfile> } = body

    // Validate profile data
    const validator = new ProfileValidator()
    const validation = validator.validateProfile(profile as StudentProfile)

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const profileData = {
      user_id: user.id,
      personal_info: profile.personalInfo || {},
      contact_info: profile.contactInfo || {},
      academic_history: profile.academicHistory || {},
      study_preferences: profile.preferences || {},
      profile_completeness: validation.completenessScore,
      readiness_score: validation.completenessScore,
      first_name: profile.personalInfo?.firstName,
      last_name: profile.personalInfo?.lastName,
      email: profile.contactInfo?.email,
      phone: profile.contactInfo?.phone,
      id_number: profile.personalInfo?.idNumber,
      updated_at: new Date().toISOString()
    }

    let result
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('student_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single()

      result = { data, error }
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('student_profiles')
        .insert(profileData)
        .select()
        .single()

      result = { data, error }
    }

    if (result.error) {
      console.error('Profile save error:', result.error)
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile: result.data,
      validation: {
        isValid: validation.isValid,
        completenessScore: validation.completenessScore,
        errors: validation.errors,
        warnings: validation.warnings
      }
    })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to transform documents
function transformDocuments(documents: any[]) {
  const emptyDocumentInfo = {
    id: '',
    name: '',
    type: 'OTHER' as DocumentType,
    fileUrl: '',
    uploadDate: '',
    fileSize: 0,
    mimeType: '',
    isVerified: false,
    verificationDate: undefined,
    expiryDate: undefined,
    notes: undefined
  }

  const documentCollection: DocumentCollection = {
    identityDocument: { ...emptyDocumentInfo },
    passportPhoto: { ...emptyDocumentInfo },
    matricCertificate: { ...emptyDocumentInfo },
    matricResults: { ...emptyDocumentInfo },
    academicTranscripts: [] as DocumentInfo[],
    parentIncomeStatements: [] as DocumentInfo[],
    bankStatements: [] as DocumentInfo[],
    portfolioDocuments: [] as DocumentInfo[],
    affidavits: [] as DocumentInfo[],
    certifiedCopies: [] as DocumentInfo[]
  }

  documents.forEach(doc => {
    const documentInfo = {
      id: doc.id,
      name: doc.document_name,
      type: doc.document_type as DocumentType,
      fileUrl: doc.file_url,
      uploadDate: doc.uploaded_at,
      fileSize: doc.file_size,
      mimeType: doc.mime_type,
      isVerified: doc.is_verified,
      verificationDate: doc.verification_date,
      expiryDate: doc.expiry_date,
      notes: doc.notes
    }

    switch (doc.document_type) {
      case 'ID_DOCUMENT':
        documentCollection.identityDocument = documentInfo
        break
      case 'PASSPORT_PHOTO':
        documentCollection.passportPhoto = documentInfo
        break
      case 'MATRIC_CERTIFICATE':
        documentCollection.matricCertificate = documentInfo
        break
      case 'MATRIC_RESULTS':
        documentCollection.matricResults = documentInfo
        break
      case 'INCOME_STATEMENT':
        documentCollection.parentIncomeStatements.push(documentInfo)
        break
      case 'BANK_STATEMENT':
        documentCollection.bankStatements.push(documentInfo)
        break
      case 'ACADEMIC_TRANSCRIPT':
        documentCollection.academicTranscripts.push(documentInfo)
        break
      default:
        documentCollection.portfolioDocuments.push(documentInfo)
    }
  })

  return documentCollection
}
