import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Cleaning up duplicate profiles...')
    
    const adminSupabase = createServerSupabaseAdminClient()
    
    // Find users with multiple profiles
    const { data: allProfiles, error: fetchError } = await adminSupabase
      .from('student_profiles')
      .select('id, user_id, created_at')
      .order('user_id, created_at')
    
    if (fetchError) {
      console.error('❌ Failed to fetch profiles:', fetchError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch profiles',
        details: fetchError,
        timestamp: new Date().toISOString()
      })
    }
    
    // Group profiles by user_id
    const profilesByUser = allProfiles.reduce((acc, profile) => {
      if (!acc[profile.user_id]) {
        acc[profile.user_id] = []
      }
      acc[profile.user_id].push(profile)
      return acc
    }, {} as Record<string, any[]>)
    
    // Find users with duplicates
    const usersWithDuplicates = Object.entries(profilesByUser)
      .filter(([userId, profiles]) => profiles.length > 1)
    
    console.log(`🔍 Found ${usersWithDuplicates.length} users with duplicate profiles`)
    
    const cleanupResults = []
    
    for (const [userId, profiles] of usersWithDuplicates) {
      console.log(`🧹 Cleaning up ${profiles.length} profiles for user: ${userId}`)
      
      // Keep the most recent profile, delete the rest
      const sortedProfiles = profiles.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      
      const keepProfile = sortedProfiles[0]
      const deleteProfiles = sortedProfiles.slice(1)
      
      console.log(`✅ Keeping profile: ${keepProfile.id} (created: ${keepProfile.created_at})`)
      
      for (const deleteProfile of deleteProfiles) {
        console.log(`🗑️ Deleting profile: ${deleteProfile.id} (created: ${deleteProfile.created_at})`)
        
        const { error: deleteError } = await adminSupabase
          .from('student_profiles')
          .delete()
          .eq('id', deleteProfile.id)
        
        if (deleteError) {
          console.error(`❌ Failed to delete profile ${deleteProfile.id}:`, deleteError)
          cleanupResults.push({
            userId,
            profileId: deleteProfile.id,
            action: 'delete_failed',
            error: deleteError.message
          })
        } else {
          console.log(`✅ Successfully deleted profile: ${deleteProfile.id}`)
          cleanupResults.push({
            userId,
            profileId: deleteProfile.id,
            action: 'deleted',
            success: true
          })
        }
      }
      
      cleanupResults.push({
        userId,
        profileId: keepProfile.id,
        action: 'kept',
        success: true
      })
    }
    
    // Summary
    const deletedCount = cleanupResults.filter(r => r.action === 'deleted').length
    const keptCount = cleanupResults.filter(r => r.action === 'kept').length
    const failedCount = cleanupResults.filter(r => r.action === 'delete_failed').length
    
    console.log(`🎉 Cleanup completed: ${deletedCount} deleted, ${keptCount} kept, ${failedCount} failed`)
    
    return NextResponse.json({
      success: true,
      message: 'Duplicate cleanup completed',
      summary: {
        usersWithDuplicates: usersWithDuplicates.length,
        profilesDeleted: deletedCount,
        profilesKept: keptCount,
        deletionsFailed: failedCount
      },
      details: cleanupResults,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Cleanup duplicates error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Cleanup duplicates failed',
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
