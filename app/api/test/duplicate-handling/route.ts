import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing duplicate handling...')
    
    const adminSupabase = createServerSupabaseAdminClient()
    
    // Test 1: Try to create duplicate profile for existing user
    console.log('📝 Test 1: Creating duplicate profile for existing user...')
    
    const testUserId = 'df70993e-739e-4190-b78d-93a9e1002bf7' // Test user
    
    const profileData = {
      user_id: testUserId,
      personal_info: { email: 'test@apply4me.co.za' },
      contact_info: { email: 'test@apply4me.co.za' },
      academic_history: {},
      study_preferences: {},
      profile_completeness: 5,
      readiness_score: 0,
      is_verified: false
    }
    
    const { data: duplicateProfile, error: duplicateError } = await adminSupabase
      .from('student_profiles')
      .insert(profileData)
      .select()
      .single()
    
    let duplicateHandling = {
      attempted: true,
      success: false,
      error: null as string | null,
      handled: false
    }
    
    if (duplicateError) {
      duplicateHandling.error = duplicateError.message || 'Unknown error'
      
      if (duplicateError.code === '23505') {
        console.log('✅ Duplicate key error detected and can be handled gracefully')
        duplicateHandling.handled = true
        duplicateHandling.success = true
      } else {
        console.log('❌ Unexpected error:', duplicateError)
      }
    } else {
      console.log('⚠️ No duplicate error - profile was created (unexpected)')
      duplicateHandling.success = true
    }
    
    // Test 2: Check existing profile count
    console.log('📊 Test 2: Checking profile count for test user...')
    
    const { data: profiles, error: countError } = await adminSupabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', testUserId)
    
    const profileCount = profiles?.length || 0
    
    console.log(`📈 Found ${profileCount} profiles for test user`)
    
    // Test 3: Test graceful fetch of existing profile
    console.log('🔍 Test 3: Testing graceful fetch of existing profile...')
    
    const { data: existingProfile, error: fetchError } = await adminSupabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single()
    
    const fetchTest = {
      success: !fetchError,
      error: fetchError?.message,
      profileExists: !!existingProfile
    }
    
    if (existingProfile) {
      console.log('✅ Successfully fetched existing profile')
    } else {
      console.log('❌ Failed to fetch existing profile:', fetchError)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Duplicate handling tests completed',
      results: {
        duplicateHandling,
        profileCount,
        fetchTest,
        recommendations: [
          duplicateHandling.handled 
            ? '✅ Duplicate profile creation is handled gracefully'
            : '❌ Need to add duplicate handling for profile creation',
          profileCount === 1 
            ? '✅ Exactly one profile exists (correct)'
            : `⚠️ ${profileCount} profiles exist (should be 1)`,
          fetchTest.success 
            ? '✅ Existing profile can be fetched successfully'
            : '❌ Cannot fetch existing profile'
        ]
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Duplicate handling test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Duplicate handling test failed',
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
