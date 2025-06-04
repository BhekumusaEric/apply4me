import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') // active, inactive, all
    
    const supabaseAdmin = createServerSupabaseAdminClient()
    
    // Get users from auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: limit
    })

    if (authError) {
      console.error('Error fetching auth users:', authError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Get user profiles for additional info
    const userIds = authUsers.users.map(user => user.id)
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .in('user_id', userIds)

    if (profilesError) {
      console.log('Note: Could not fetch profiles:', profilesError.message)
    }

    // Get application counts for each user
    const { data: applications, error: appsError } = await supabaseAdmin
      .from('applications')
      .select('user_id, status, payment_status')
      .in('user_id', userIds)

    if (appsError) {
      console.log('Note: Could not fetch applications:', appsError.message)
    }

    // Get notification counts for each user
    const { data: notifications, error: notifsError } = await supabaseAdmin
      .from('notifications')
      .select('user_id, read')
      .in('user_id', userIds)

    if (notifsError) {
      console.log('Note: Could not fetch notifications:', notifsError.message)
    }

    // Combine user data
    const enrichedUsers = authUsers.users.map(user => {
      const profile = profiles?.find(p => p.user_id === user.id)
      const userApps = applications?.filter(app => app.user_id === user.id) || []
      const userNotifs = notifications?.filter(notif => notif.user_id === user.id) || []
      
      return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
        // Profile info
        profile: profile ? {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          profile_completeness: profile.profile_completeness,
          is_verified: profile.is_verified,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        } : null,
        // Application stats
        applications: {
          total: userApps.length,
          pending: userApps.filter(app => app.status === 'pending').length,
          completed: userApps.filter(app => app.status === 'completed').length,
          paid: userApps.filter(app => app.payment_status === 'paid').length
        },
        // Notification stats
        notifications: {
          total: userNotifs.length,
          unread: userNotifs.filter(notif => !notif.read).length,
          read: userNotifs.filter(notif => notif.read).length
        }
      }
    })

    // Apply filters
    let filteredUsers = enrichedUsers

    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.profile?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.profile?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.id.includes(search)
      )
    }

    if (status === 'active') {
      filteredUsers = filteredUsers.filter(user => user.last_sign_in_at)
    } else if (status === 'inactive') {
      filteredUsers = filteredUsers.filter(user => !user.last_sign_in_at)
    }

    return NextResponse.json({
      success: true,
      data: {
        users: filteredUsers,
        pagination: {
          page,
          limit,
          total: filteredUsers.length,
          hasMore: authUsers.users.length === limit
        },
        summary: {
          totalUsers: enrichedUsers.length,
          activeUsers: enrichedUsers.filter(u => u.last_sign_in_at).length,
          inactiveUsers: enrichedUsers.filter(u => !u.last_sign_in_at).length,
          usersWithProfiles: enrichedUsers.filter(u => u.profile).length,
          usersWithApplications: enrichedUsers.filter(u => u.applications.total > 0).length
        }
      }
    })

  } catch (error) {
    console.error('Error in manage-users API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, user_metadata = {}, send_email = true } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createServerSupabaseAdminClient()

    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata,
      email_confirm: send_email
    })

    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json(
        { error: 'Failed to create user', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: user
    })

  } catch (error) {
    console.error('Error in manage-users POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, action, ...updateData } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createServerSupabaseAdminClient()

    switch (action) {
      case 'update_metadata':
        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          user_id,
          { user_metadata: updateData.user_metadata }
        )

        if (updateError) throw updateError

        return NextResponse.json({
          success: true,
          message: 'User metadata updated successfully',
          data: updatedUser
        })

      case 'reset_password':
        const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
          user_id,
          { password: updateData.new_password }
        )

        if (resetError) throw resetError

        return NextResponse.json({
          success: true,
          message: 'Password reset successfully'
        })

      case 'confirm_email':
        const { data: confirmData, error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          user_id,
          { email_confirm: true }
        )

        if (confirmError) throw confirmError

        return NextResponse.json({
          success: true,
          message: 'Email confirmed successfully'
        })

      case 'ban_user':
        const { data: banData, error: banError } = await supabaseAdmin.auth.admin.updateUserById(
          user_id,
          { ban_duration: updateData.ban_duration || '24h' }
        )

        if (banError) throw banError

        return NextResponse.json({
          success: true,
          message: 'User banned successfully'
        })

      case 'unban_user':
        const { data: unbanData, error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(
          user_id,
          { ban_duration: 'none' }
        )

        if (unbanError) throw unbanError

        return NextResponse.json({
          success: true,
          message: 'User unbanned successfully'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in manage-users PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createServerSupabaseAdminClient()

    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Error in manage-users DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
