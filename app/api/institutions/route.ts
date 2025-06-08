/**
 * Institutions API endpoint
 * Provides institutions data for frontend consumption
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createServerSupabaseAdminClient()

    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      console.error('Institutions API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch institutions', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Institutions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseAdminClient()

    const body = await request.json()
    const {
      name,
      type,
      province,
      city,
      website_url,
      logo_url,
      description,
      application_fee,
      is_featured = false,
      contact_email,
      contact_phone,
      address,
      application_deadline,
      required_documents
    } = body

    // Combine city with province if city is provided
    const fullProvince = city ? `${city}, ${province}` : province

    // Validate required fields
    if (!name || !type || !province) {
      return NextResponse.json(
        { error: 'Name, type, and province are required' },
        { status: 400 }
      )
    }

    // Create institution
    const { data: institution, error } = await supabase
      .from('institutions')
      .insert({
        name,
        type,
        province: fullProvince,
        website_url: website_url || '',
        logo_url,
        description,
        application_fee: application_fee || 0,
        is_featured,
        contact_email,
        contact_phone,
        application_deadline: application_deadline || null,
        required_documents: required_documents || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Institution creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create institution', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      institution,
      message: 'Institution created successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Institutions POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseAdminClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      )
    }

    // Check if institution has any programs
    const { data: programs, error: programsError } = await supabase
      .from('programs')
      .select('id')
      .eq('institution_id', id)

    if (programsError) {
      console.error('Error checking programs:', programsError)
      return NextResponse.json(
        { error: 'Failed to check institution programs' },
        { status: 500 }
      )
    }

    if (programs && programs.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete institution with existing programs. Please delete all programs first.' },
        { status: 400 }
      )
    }

    // Delete institution
    const { error } = await supabase
      .from('institutions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Institution deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete institution', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Institution deleted successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Institutions DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
