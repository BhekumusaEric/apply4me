import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    console.log(`👑 Admin: Fetching documents for user: ${userId}`)

    const adminSupabase = createServerSupabaseAdminClient()

    // Get user profile first (handle multiple profiles gracefully)
    const { data: profiles, error: profileError } = await adminSupabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)

    let profile = null
    if (profiles && profiles.length > 0) {
      // Use the most recent profile if multiple exist
      profile = profiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

      if (profiles.length > 1) {
        console.log(`⚠️ Found ${profiles.length} profiles for user ${userId}, using most recent one`)
      }
    }

    if (profileError) {
      console.error('❌ Failed to fetch user profile:', profileError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch user profile',
        details: profileError
      }, { status: 500 })
    }

    if (!profile) {
      console.error('❌ No profile found for user:', userId)
      return NextResponse.json({
        success: false,
        error: 'User profile not found',
        message: 'No profile exists for this user'
      }, { status: 404 })
    }

    // Get documents from student_documents table
    const { data: documents, error: documentsError } = await adminSupabase
      .from('student_documents')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })

    if (documentsError) {
      console.error('❌ Failed to fetch documents:', documentsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch documents',
        details: documentsError
      }, { status: 500 })
    }

    // Transform documents for admin view
    const transformedDocuments = (documents || []).map(doc => ({
      id: doc.id,
      name: doc.document_name,
      type: doc.document_type,
      fileUrl: doc.file_url,
      fileName: doc.file_name,
      fileSize: doc.file_size,
      mimeType: doc.mime_type,
      uploadedAt: doc.uploaded_at,
      isVerified: doc.is_verified,
      verificationDate: doc.verification_date,
      verifiedBy: doc.verified_by,
      notes: doc.notes,
      expiryDate: doc.expiry_date,
      status: doc.is_verified ? 'Verified' : 'Pending Verification'
    }))

    // Group documents by type for easier admin review
    const documentsByType = {
      identity: transformedDocuments.filter(d => d.type === 'ID_DOCUMENT'),
      passport_photos: transformedDocuments.filter(d => d.type === 'PASSPORT_PHOTO'),
      academic: transformedDocuments.filter(d =>
        ['MATRIC_CERTIFICATE', 'MATRIC_RESULTS', 'ACADEMIC_TRANSCRIPT'].includes(d.type)
      ),
      financial: transformedDocuments.filter(d =>
        ['INCOME_STATEMENT', 'BANK_STATEMENT'].includes(d.type)
      ),
      other: transformedDocuments.filter(d =>
        !['ID_DOCUMENT', 'PASSPORT_PHOTO', 'MATRIC_CERTIFICATE', 'MATRIC_RESULTS',
          'ACADEMIC_TRANSCRIPT', 'INCOME_STATEMENT', 'BANK_STATEMENT'].includes(d.type)
      )
    }

    // Calculate document completeness
    const requiredDocuments = ['ID_DOCUMENT', 'PASSPORT_PHOTO', 'MATRIC_CERTIFICATE', 'MATRIC_RESULTS']
    const uploadedRequiredDocs = requiredDocuments.filter(type =>
      transformedDocuments.some(doc => doc.type === type)
    )

    const documentCompleteness = (uploadedRequiredDocs.length / requiredDocuments.length) * 100

    console.log(`✅ Found ${transformedDocuments.length} documents for user ${userId}`)

    return NextResponse.json({
      success: true,
      data: {
        userProfile: {
          id: profile.id,
          userId: profile.user_id,
          fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          email: profile.email || profile.contact_info?.email,
          phone: profile.phone || profile.contact_info?.phone,
          idNumber: profile.id_number || profile.personal_info?.idNumber,
          profileCompleteness: profile.profile_completeness || 0,
          readinessScore: profile.readiness_score || 0,
          isVerified: profile.is_verified || false,
          verificationDate: profile.verification_date,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
          personalInfo: profile.personal_info || {},
          contactInfo: profile.contact_info || {},
          academicHistory: profile.academic_history || {},
          studyPreferences: profile.study_preferences || {}
        },
        documents: {
          all: transformedDocuments,
          byType: documentsByType,
          summary: {
            total: transformedDocuments.length,
            verified: transformedDocuments.filter(d => d.isVerified).length,
            pending: transformedDocuments.filter(d => !d.isVerified).length,
            completeness: documentCompleteness,
            requiredDocuments: requiredDocuments,
            uploadedRequired: uploadedRequiredDocs,
            missingRequired: requiredDocuments.filter(type =>
              !transformedDocuments.some(doc => doc.type === type)
            )
          }
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Admin documents fetch error:', error)

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user documents',
      details: error
    }, { status: 500 })
  }
}
