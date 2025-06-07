import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClientWithCookies } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

// POST - Upload document
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClientWithCookies()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('🔍 Document upload authentication check:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    })

    if (authError || !user) {
      console.log('❌ Authentication required for document upload')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile - try user_id first, then userid
    let { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    // If user_id column doesn't exist, try userid
    if (profileError && profileError.message?.includes('user_id does not exist')) {
      console.log('🔄 Trying userid column for profile lookup...')
      const { data: profileAlt, error: profileErrorAlt } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('userid', user.id)
        .single()

      profile = profileAlt
      profileError = profileErrorAlt
    }

    if (profileError || !profile) {
      console.error('❌ Profile not found:', profileError)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    console.log('✅ Profile found for document upload:', profile.id)
    console.log('📄 Starting file upload process...')

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string

    if (!file || !documentType) {
      return NextResponse.json({ error: 'File and document type required' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF, JPEG, and PNG files are allowed' }, { status: 400 })
    }

    // Create unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${user.id}/${documentType}/${timestamp}.${fileExtension}`

    // Upload file to Supabase Storage using service role for admin access
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('📤 Uploading file to storage...')
    const { data: uploadData, error: uploadError } = await serviceSupabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ File upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    console.log('✅ File uploaded successfully')

    // Get public URL using service role
    const { data: { publicUrl } } = serviceSupabase.storage
      .from('documents')
      .getPublicUrl(fileName)

    // Save document record to database
    console.log('💾 Attempting to save document record to database...')
    console.log('📋 Document data:', {
      student_profile_id: profile.id,
      user_id: user.id,
      document_type: documentType,
      document_name: file.name,
      file_url: publicUrl,
      file_size: file.size,
      mime_type: file.type
    })

    const { data: documentData, error: documentError } = await serviceSupabase
      .from('student_documents')
      .insert({
        student_profile_id: profile.id,
        user_id: user.id,
        document_type: documentType,
        document_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single()

    if (documentError) {
      console.error('❌ Document save error:', documentError)
      // Clean up uploaded file
      await serviceSupabase.storage.from('documents').remove([fileName])
      return NextResponse.json({ error: 'Failed to save document record' }, { status: 500 })
    }

    console.log('✅ Document record saved successfully:', documentData.id)

    // Update profile completeness (temporarily disabled due to permissions)
    // await updateProfileCompleteness(supabase, profile.id)

    return NextResponse.json({
      success: true,
      document: {
        id: documentData.id,
        name: documentData.document_name,
        type: documentData.document_type,
        fileUrl: documentData.file_url,
        uploadDate: documentData.uploaded_at,
        fileSize: documentData.file_size,
        mimeType: documentData.mime_type,
        isVerified: documentData.is_verified
      }
    })
  } catch (error) {
    console.error('Document upload API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove document
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClientWithCookies()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    // Get document details
    const { data: document, error: fetchError } = await supabase
      .from('student_documents')
      .select(`
        *,
        student_profiles!inner(user_id)
      `)
      .eq('id', documentId)
      .single()

    if (fetchError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check ownership
    if (document.student_profiles.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Extract filename from URL
    const urlParts = document.file_url.split('/')
    const fileName = urlParts.slice(-3).join('/') // user_id/document_type/filename

    // Delete file from storage using service role
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { error: storageError } = await serviceSupabase.storage
      .from('documents')
      .remove([fileName])

    if (storageError) {
      console.error('Storage delete error:', storageError)
    }

    // Delete document record
    const { error: deleteError } = await supabase
      .from('student_documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      console.error('Document delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
    }

    // Update profile completeness (temporarily disabled due to permissions)
    // await updateProfileCompleteness(supabase, document.student_profile_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Document delete API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to update profile completeness (disabled)
// async function updateProfileCompleteness(supabase: any, profileId: string) {
//   try {
//     // This would call the database function we created
//     const { data, error } = await supabase
//       .rpc('calculate_profile_completeness', { profile_id: profileId })

//     if (!error && data !== null) {
//       await supabase
//         .from('student_profiles')
//         .update({
//           profile_completeness: data,
//           readiness_score: data,
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', profileId)
//     }
//   } catch (error) {
//     console.error('Failed to update profile completeness:', error)
//   }
// }
