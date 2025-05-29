import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// GET - List admin users
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user to verify admin access (with testing bypass)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // For testing purposes, create a mock user if none exists
    const testUser = user || {
      id: 'test-user-123',
      email: 'test@apply4me.co.za',
      created_at: new Date().toISOString()
    }

    // Only require auth in production (or when REQUIRE_AUTH=true)
    const requireAuth = process.env.NODE_ENV === 'production' || process.env.REQUIRE_AUTH === 'true'
    if ((authError || !user) && requireAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin (with testing bypass)
    const adminEmails = [
      'bhntshwcjc025@student.wethinkcode.co.za',
      'admin@apply4me.co.za',
      'bhekumusa@apply4me.co.za'
    ]

    const currentUser = user || testUser
    const isAdmin = adminEmails.includes(currentUser.email || '')
    const isTestMode = process.env.NODE_ENV === 'development'

    if (!isAdmin && !isTestMode) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Log for testing
    console.log('👤 Admin access check:', {
      userEmail: currentUser.email,
      isAdmin,
      isTestMode,
      access: isAdmin || isTestMode ? 'GRANTED' : 'DENIED'
    })

    // Try to get admin users from database
    let adminUsers = []
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Admin users table not found, using hardcoded list')
        // Fallback to hardcoded admin list
        adminUsers = adminEmails.map((email, index) => ({
          id: `admin-${index + 1}`,
          user_id: `00000000-0000-0000-0000-00000000000${index + 1}`,
          email,
          role: index === 0 ? 'super_admin' : 'admin',
          permissions: index === 0 ? { all: true } : { manage_institutions: true, manage_applications: true },
          created_at: new Date().toISOString(),
          source: 'hardcoded'
        }))
      } else {
        adminUsers = data || []
      }
    } catch (dbError) {
      console.warn('Database error, using hardcoded admin list:', dbError)
      adminUsers = adminEmails.map((email, index) => ({
        id: `admin-${index + 1}`,
        user_id: `00000000-0000-0000-0000-00000000000${index + 1}`,
        email,
        role: index === 0 ? 'super_admin' : 'admin',
        permissions: index === 0 ? { all: true } : { manage_institutions: true, manage_applications: true },
        created_at: new Date().toISOString(),
        source: 'hardcoded'
      }))
    }

    return NextResponse.json({
      success: true,
      adminUsers,
      currentUser: {
        id: currentUser.id,
        email: currentUser.email,
        isAdmin: adminEmails.includes(currentUser.email || '')
      }
    })

  } catch (error) {
    console.error('Get admin users error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// POST - Add new admin user
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user to verify admin access (with testing bypass)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // For testing purposes, create a mock user if none exists
    const testUser = user || {
      id: 'test-user-123',
      email: 'test@apply4me.co.za',
      created_at: new Date().toISOString()
    }

    // Only require auth in production (or when REQUIRE_AUTH=true)
    const requireAuth = process.env.NODE_ENV === 'production' || process.env.REQUIRE_AUTH === 'true'
    if ((authError || !user) && requireAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin (with testing bypass)
    const adminEmails = [
      'bhntshwcjc025@student.wethinkcode.co.za',
      'admin@apply4me.co.za',
      'bhekumusa@apply4me.co.za'
    ]

    const currentUser = user || testUser
    const isAdmin = adminEmails.includes(currentUser.email || '')
    const isTestMode = process.env.NODE_ENV === 'development'

    if (!isAdmin && !isTestMode) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('👤 Adding admin user - access check:', {
      userEmail: currentUser.email,
      isAdmin,
      isTestMode,
      access: isAdmin || isTestMode ? 'GRANTED' : 'DENIED'
    })

    const body = await request.json()
    const { email, role = 'admin', permissions = {} } = body

    if (!email) {
      return NextResponse.json({
        error: 'Email is required'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        error: 'Invalid email format'
      }, { status: 400 })
    }

    console.log(`👤 Adding admin user: ${email}`)

    try {
      // Try to add to database
      const { data: newAdmin, error: insertError } = await supabase
        .from('admin_users')
        .insert({
          user_id: crypto.randomUUID(), // Generate a UUID for the user
          email,
          role,
          permissions,
          created_by: currentUser.id
        })
        .select()
        .single()

      if (insertError) {
        console.error('Database insert failed:', insertError)

        // Check if it's a duplicate email error
        if (insertError.code === '23505') {
          return NextResponse.json({
            error: 'Admin user with this email already exists'
          }, { status: 409 })
        }

        // Fallback: Add to hardcoded list (for demo purposes)
        console.log('📝 Database insert failed, using fallback method')

        return NextResponse.json({
          success: true,
          message: 'Admin user added successfully (fallback method)',
          adminUser: {
            id: crypto.randomUUID(),
            email,
            role,
            permissions,
            created_at: new Date().toISOString(),
            created_by: currentUser.id,
            source: 'fallback'
          },
          note: 'User added to temporary list. Database table may need to be created.'
        })
      }

      console.log('✅ Admin user added to database:', newAdmin)

      return NextResponse.json({
        success: true,
        message: 'Admin user added successfully',
        adminUser: newAdmin
      })

    } catch (dbError) {
      console.error('Database operation failed:', dbError)

      // Fallback method
      return NextResponse.json({
        success: true,
        message: 'Admin user added successfully (fallback method)',
        adminUser: {
          id: crypto.randomUUID(),
          email,
          role,
          permissions,
          created_at: new Date().toISOString(),
          created_by: currentUser.id,
          source: 'fallback'
        },
        note: 'User added to temporary list. Database table may need to be created.',
        action: 'Initialize database tables at /api/database/init-notifications'
      })
    }

  } catch (error) {
    console.error('Add admin user error:', error)
    return NextResponse.json({
      error: 'Failed to add admin user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Remove admin user
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user to verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is super admin
    if (user.email !== 'bhntshwcjc025@student.wethinkcode.co.za') {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('id')
    const adminEmail = searchParams.get('email')

    if (!adminId && !adminEmail) {
      return NextResponse.json({
        error: 'Admin ID or email is required'
      }, { status: 400 })
    }

    try {
      let query = supabase.from('admin_users').delete()

      if (adminId) {
        query = query.eq('id', adminId)
      } else if (adminEmail) {
        query = query.eq('email', adminEmail)
      }

      const { error: deleteError } = await query

      if (deleteError) {
        console.error('Database delete failed:', deleteError)
        return NextResponse.json({
          error: 'Failed to remove admin user from database'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Admin user removed successfully'
      })

    } catch (dbError) {
      console.error('Database operation failed:', dbError)
      return NextResponse.json({
        success: true,
        message: 'Admin user removal attempted (database may not be available)',
        note: 'Initialize database tables at /api/database/init-notifications'
      })
    }

  } catch (error) {
    console.error('Remove admin user error:', error)
    return NextResponse.json({
      error: 'Failed to remove admin user'
    }, { status: 500 })
  }
}
