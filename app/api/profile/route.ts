import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClientWithCookies, createServerSupabaseAdminClient } from '@/lib/supabase-server'
import { StudentProfile, DocumentType, DocumentInfo, DocumentCollection } from '@/lib/types/student-profile'
import { ProfileValidator } from '@/lib/services/profile-validator'

// GET - Fetch user's profile (REAL DATABASE ONLY)
export async function GET(request: NextRequest) {
  try {
    // Create server-side Supabase client with cookies
    const supabase = createServerSupabaseClientWithCookies()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('🔍 Authentication check:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    })

    if (authError || !user) {
      console.log('❌ Authentication required for profile access')
      console.log('Auth error:', authError)
      console.log('User:', user)

      // Return authentication required error
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'Please sign in to access your profile',
          redirectTo: '/auth/simple-signin'
        },
        { status: 401 }
      )
    }

    // Skip database connection test - go directly to profile fetch

    // Fetch profile with graceful handling of multiple profiles
    console.log('🔍 Fetching profile for user:', user.id)
    let { data: profiles, error: profileError } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)

    let profile = null

    if (profiles && profiles.length > 0) {
      // Use the most recent profile if multiple exist
      profile = profiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

      if (profiles.length > 1) {
        console.log(`⚠️ Found ${profiles.length} profiles for user, using most recent one`)
      }
    }

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    // If no profile exists, create one automatically
    if (!profile) {
      console.log('📝 No profile found, creating one for user:', user.id)

      // Use admin client to create profile
      const adminSupabase = createServerSupabaseAdminClient()

      const newProfileData = {
        user_id: user.id,
        personal_info: {
          email: user.email
        },
        contact_info: {
          email: user.email
        },
        academic_history: {},
        study_preferences: {},
        profile_completeness: 5,
        readiness_score: 0,
        is_verified: false
      }

      const { data: newProfile, error: createError } = await adminSupabase
        .from('student_profiles')
        .insert(newProfileData)
        .select()
        .single()

      if (createError) {
        // Check if it's a duplicate key error (profile already exists)
        if (createError.code === '23505') {
          console.log('⚠️ Profile already exists for user, fetching existing profile...')

          // Fetch the existing profile
          const { data: existingProfile, error: fetchError } = await adminSupabase
            .from('student_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (fetchError) {
            console.error('❌ Failed to fetch existing profile:', fetchError)
            return NextResponse.json({ error: 'Failed to access profile' }, { status: 500 })
          }

          console.log('✅ Using existing profile')
          profile = existingProfile
        } else {
          console.error('❌ Failed to create profile:', createError)
          return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
        }
      } else {
        console.log('✅ Profile created successfully')
        profile = newProfile
      }
    }

    // Transform database record to StudentProfile format
    const studentProfile: StudentProfile = {
      personalInfo: profile.personal_info || {},
      contactInfo: profile.contact_info || {},
      academicHistory: profile.academic_history || {},
      preferences: profile.study_preferences || {},
      documents: {
        identityDocument: { id: '', name: '', type: 'ID_DOCUMENT', fileUrl: '', uploadDate: '', fileSize: 0, mimeType: '', isVerified: false },
        passportPhoto: { id: '', name: '', type: 'PASSPORT_PHOTO', fileUrl: '', uploadDate: '', fileSize: 0, mimeType: '', isVerified: false },
        matricCertificate: { id: '', name: '', type: 'MATRIC_CERTIFICATE', fileUrl: '', uploadDate: '', fileSize: 0, mimeType: '', isVerified: false },
        matricResults: { id: '', name: '', type: 'MATRIC_RESULTS', fileUrl: '', uploadDate: '', fileSize: 0, mimeType: '', isVerified: false },
        academicTranscripts: [],
        parentIncomeStatements: [],
        bankStatements: [],
        portfolioDocuments: [],
        affidavits: [],
        certifiedCopies: []
      },
      applicationReadiness: {
        profileComplete: (profile.profile_completeness || 0) >= 90,
        documentsComplete: (profile.profile_completeness || 0) >= 100,
        academicInfoComplete: !!profile.academic_history && Object.keys(profile.academic_history).length > 0,
        contactInfoComplete: !!profile.contact_info && Object.keys(profile.contact_info).length > 0,
        identityVerified: profile.is_verified || false,
        academicRecordsVerified: profile.is_verified || false,
        documentsVerified: profile.is_verified || false,
        eligibleForUniversity: true,
        eligibleForTVET: true,
        eligibleForBursaries: true,
        missingDocuments: [],
        missingInformation: [],
        readinessScore: profile.readiness_score || 0,
        lastAssessment: profile.updated_at || new Date().toISOString()
      },
      profileCompleteness: profile.profile_completeness || 0,
      lastUpdated: profile.updated_at || new Date().toISOString(),
      isVerified: profile.is_verified || false,
      createdAt: profile.created_at || new Date().toISOString()
    }

    return NextResponse.json({ profile: studentProfile })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create or update profile (REAL DATABASE ONLY)
export async function POST(request: NextRequest) {
  try {
    // Create server-side Supabase client with cookies
    const supabase = createServerSupabaseClientWithCookies()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('🔍 Profile save authentication check:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    })

    if (authError || !user) {
      console.log('❌ Authentication required for profile save')

      // Return authentication required error
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'Please sign in to save your profile',
          redirectTo: '/auth/simple-signin'
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { profile }: { profile: Partial<StudentProfile> } = body

    // Validate profile data
    const validator = new ProfileValidator()
    const validation = validator.validateProfile(profile as StudentProfile)

    // Use admin client for database operations
    const adminSupabase = createServerSupabaseAdminClient()

    // Check if profile exists
    const { data: existingProfile } = await adminSupabase
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
      const { data, error } = await adminSupabase
        .from('student_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single()

      result = { data, error }
    } else {
      // Create new profile
      const { data, error } = await adminSupabase
        .from('student_profiles')
        .insert(profileData)
        .select()
        .single()

      result = { data, error }
    }

    if (result.error) {
      console.error('Profile save error:', result.error)

      // Handle specific duplicate errors gracefully
      if (result.error.code === '23505') {
        if (result.error.message?.includes('id_number')) {
          return NextResponse.json({
            error: 'ID number already exists',
            message: 'This ID number is already registered with another profile. Please check your ID number or contact support.',
            field: 'idNumber'
          }, { status: 409 })
        } else if (result.error.message?.includes('user_id')) {
          return NextResponse.json({
            error: 'Profile already exists',
            message: 'A profile already exists for this user.',
            field: 'user_id'
          }, { status: 409 })
        } else {
          return NextResponse.json({
            error: 'Duplicate data',
            message: 'Some of the information you entered already exists in our system.',
            details: result.error.message
          }, { status: 409 })
        }
      }

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
