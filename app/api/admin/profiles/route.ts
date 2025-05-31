import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('👑 Admin: Fetching all user profiles...')
    
    const adminSupabase = createServerSupabaseAdminClient()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all' // all, complete, incomplete, verified
    
    const offset = (page - 1) * limit
    
    // Build query
    let query = adminSupabase
      .from('student_profiles')
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        email,
        phone,
        id_number,
        personal_info,
        contact_info,
        academic_history,
        study_preferences,
        profile_completeness,
        readiness_score,
        is_verified,
        verification_date,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,id_number.ilike.%${search}%`)
    }
    
    if (status === 'complete') {
      query = query.gte('profile_completeness', 90)
    } else if (status === 'incomplete') {
      query = query.lt('profile_completeness', 90)
    } else if (status === 'verified') {
      query = query.eq('is_verified', true)
    }
    
    // Get total count
    const { count } = await adminSupabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true })
    
    // Get paginated results
    const { data: profiles, error } = await query
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('❌ Failed to fetch profiles:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch profiles',
        details: error
      }, { status: 500 })
    }
    
    // Transform profiles for admin view
    const transformedProfiles = profiles.map(profile => ({
      id: profile.id,
      userId: profile.user_id,
      fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'No name provided',
      email: profile.email || profile.personal_info?.email || profile.contact_info?.email || 'No email',
      phone: profile.phone || profile.contact_info?.phone || 'No phone',
      idNumber: profile.id_number || profile.personal_info?.idNumber || 'No ID number',
      profileCompleteness: profile.profile_completeness || 0,
      readinessScore: profile.readiness_score || 0,
      isVerified: profile.is_verified || false,
      verificationDate: profile.verification_date,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      personalInfo: profile.personal_info || {},
      contactInfo: profile.contact_info || {},
      academicHistory: profile.academic_history || {},
      studyPreferences: profile.study_preferences || {},
      status: profile.profile_completeness >= 90 ? 'Complete' : 'Incomplete',
      applicationReadiness: profile.readiness_score >= 80 ? 'Ready' : 'Not Ready'
    }))
    
    console.log(`✅ Found ${profiles.length} profiles (page ${page})`)
    
    return NextResponse.json({
      success: true,
      data: {
        profiles: transformedProfiles,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: offset + limit < (count || 0),
          hasPrev: page > 1
        },
        filters: {
          search,
          status
        },
        summary: {
          totalProfiles: count || 0,
          completeProfiles: transformedProfiles.filter(p => p.profileCompleteness >= 90).length,
          verifiedProfiles: transformedProfiles.filter(p => p.isVerified).length,
          readyForApplication: transformedProfiles.filter(p => p.readinessScore >= 80).length
        }
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Admin profiles fetch error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch admin profiles',
      details: error
    }, { status: 500 })
  }
}
