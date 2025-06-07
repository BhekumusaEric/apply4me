import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Use service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if documents bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return NextResponse.json({ error: 'Failed to check storage buckets' }, { status: 500 })
    }

    const documentsBucket = buckets?.find(bucket => bucket.name === 'documents')

    if (!documentsBucket) {
      // Create documents bucket
      const { data: createData, error: createError } = await supabase.storage.createBucket('documents', {
        public: true,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
        fileSizeLimit: 10485760 // 10MB
      })

      if (createError) {
        console.error('Error creating documents bucket:', createError)
        return NextResponse.json({ error: 'Failed to create documents bucket' }, { status: 500 })
      }

      console.log('Documents bucket created successfully')
    }

    // Set up storage policies (these need to be done via SQL in Supabase dashboard)
    const policies = [
      {
        name: 'Users can upload their own documents',
        definition: `
          CREATE POLICY "Users can upload their own documents" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'documents' AND 
            auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      },
      {
        name: 'Users can view their own documents',
        definition: `
          CREATE POLICY "Users can view their own documents" ON storage.objects
          FOR SELECT USING (
            bucket_id = 'documents' AND 
            auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      },
      {
        name: 'Users can delete their own documents',
        definition: `
          CREATE POLICY "Users can delete their own documents" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'documents' AND 
            auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      }
    ]

    return NextResponse.json({
      success: true,
      message: 'Storage setup completed',
      bucketExists: !!documentsBucket,
      bucketCreated: !documentsBucket,
      policies: policies.map(p => p.name),
      note: 'Storage policies need to be created manually in Supabase dashboard SQL editor'
    })

  } catch (error) {
    console.error('Storage setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to check storage status
export async function GET(request: NextRequest) {
  try {
    // Use service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if documents bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      return NextResponse.json({ error: 'Failed to check storage buckets' }, { status: 500 })
    }

    const documentsBucket = buckets?.find(bucket => bucket.name === 'documents')

    return NextResponse.json({
      bucketExists: !!documentsBucket,
      buckets: buckets?.map(b => ({ name: b.name, public: b.public })) || [],
      storageUrl: process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/documents/'
    })

  } catch (error) {
    console.error('Storage check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
