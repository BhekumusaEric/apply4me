import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('👑 Admin: Fetching all applications...')
    
    const adminSupabase = createServerSupabaseAdminClient()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') || 'all' // all, draft, submitted, paid, processing, accepted, rejected
    const institution = searchParams.get('institution') || ''
    const search = searchParams.get('search') || ''
    
    const offset = (page - 1) * limit
    
    // Build applications query - for now we'll create mock data structure
    // In production, this would query a real applications table
    
    // Get all student profiles first
    const { data: profiles, error: profilesError } = await adminSupabase
      .from('student_profiles')
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        email,
        phone,
        id_number,
        profile_completeness,
        readiness_score,
        created_at,
        updated_at,
        personal_info,
        contact_info,
        academic_history,
        study_preferences
      `)
      .order('created_at', { ascending: false })
    
    if (profilesError) {
      console.error('❌ Failed to fetch profiles:', profilesError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch applications',
        details: profilesError
      }, { status: 500 })
    }
    
    // Transform profiles into mock applications for now
    // TODO: Replace with real applications table
    const mockApplications = profiles.map((profile, index) => {
      const statuses = ['draft', 'submitted', 'paid', 'processing', 'accepted', 'rejected']
      const institutions = ['University of Cape Town', 'University of the Witwatersrand', 'Stellenbosch University', 'University of Pretoria', 'Rhodes University']
      const courses = ['Computer Science', 'Engineering', 'Medicine', 'Law', 'Business Administration', 'Psychology']
      
      // Create realistic application data
      const applicationStatus = profile.profile_completeness >= 80 ? 
        (profile.readiness_score >= 80 ? statuses[Math.floor(Math.random() * 6)] : 'draft') : 'draft'
      
      const hasPayment = ['paid', 'processing', 'accepted', 'rejected'].includes(applicationStatus)
      
      return {
        id: `app_${profile.id}`,
        userId: profile.user_id,
        studentName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'No name',
        studentEmail: profile.email || profile.personal_info?.email || 'No email',
        studentPhone: profile.phone || profile.contact_info?.phone || 'No phone',
        studentIdNumber: profile.id_number || profile.personal_info?.idNumber || 'No ID',
        institution: institutions[index % institutions.length],
        course: courses[index % courses.length],
        applicationStatus,
        submittedAt: applicationStatus !== 'draft' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        deadline: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        applicationFee: 150 + (index * 50),
        paymentStatus: hasPayment ? (Math.random() > 0.2 ? 'completed' : 'pending') : 'not_required',
        paymentReference: hasPayment ? `PAY_${Date.now()}_${index}` : null,
        paymentDate: hasPayment ? new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString() : null,
        documentsSubmitted: profile.profile_completeness >= 70,
        profileCompleteness: profile.profile_completeness,
        readinessScore: profile.readiness_score,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        notes: applicationStatus === 'rejected' ? 'Application did not meet minimum requirements' : 
               applicationStatus === 'accepted' ? 'Congratulations! Application successful' : '',
        requirements: {
          minimumAps: 30,
          requiredSubjects: ['Mathematics', 'English'],
          documentsRequired: ['ID Document', 'Matric Certificate', 'Passport Photo'],
          applicationFeeRequired: true
        }
      }
    })
    
    // Apply filters
    let filteredApplications = mockApplications
    
    if (status !== 'all') {
      filteredApplications = filteredApplications.filter(app => app.applicationStatus === status)
    }
    
    if (institution) {
      filteredApplications = filteredApplications.filter(app => 
        app.institution.toLowerCase().includes(institution.toLowerCase())
      )
    }
    
    if (search) {
      filteredApplications = filteredApplications.filter(app => 
        app.studentName.toLowerCase().includes(search.toLowerCase()) ||
        app.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
        app.studentIdNumber.includes(search) ||
        app.institution.toLowerCase().includes(search.toLowerCase()) ||
        app.course.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Pagination
    const total = filteredApplications.length
    const paginatedApplications = filteredApplications.slice(offset, offset + limit)
    
    // Calculate summary statistics
    const summary = {
      totalApplications: mockApplications.length,
      draftApplications: mockApplications.filter(app => app.applicationStatus === 'draft').length,
      submittedApplications: mockApplications.filter(app => app.applicationStatus === 'submitted').length,
      paidApplications: mockApplications.filter(app => app.paymentStatus === 'completed').length,
      processingApplications: mockApplications.filter(app => app.applicationStatus === 'processing').length,
      acceptedApplications: mockApplications.filter(app => app.applicationStatus === 'accepted').length,
      rejectedApplications: mockApplications.filter(app => app.applicationStatus === 'rejected').length,
      pendingPayments: mockApplications.filter(app => app.paymentStatus === 'pending').length,
      totalRevenue: mockApplications
        .filter(app => app.paymentStatus === 'completed')
        .reduce((sum, app) => sum + app.applicationFee, 0)
    }
    
    console.log(`✅ Found ${paginatedApplications.length} applications (page ${page})`)
    
    return NextResponse.json({
      success: true,
      data: {
        applications: paginatedApplications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: offset + limit < total,
          hasPrev: page > 1
        },
        filters: {
          status,
          institution,
          search
        },
        summary
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Admin applications fetch error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch applications',
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
