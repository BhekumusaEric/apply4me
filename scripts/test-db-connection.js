const { createClient } = require('@supabase/supabase-js')

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing environment variables:')
      console.error('  NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
      console.error('  SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey)
      process.exit(1)
    }
    
    console.log('✅ Environment variables found')
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test basic connection
    console.log('🔗 Testing basic connection...')
    const { data, error } = await supabase
      .from('institutions')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      process.exit(1)
    }
    
    console.log('✅ Database connection successful')
    
    // Test admin tables
    console.log('🔍 Checking admin tables...')
    const adminTables = ['admin_users', 'notifications', 'in_app_notifications']
    
    for (const table of adminTables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('id')
          .limit(1)
        
        if (tableError) {
          console.log(`⚠️  Table '${table}' not found or not accessible`)
        } else {
          console.log(`✅ Table '${table}' exists and accessible`)
        }
      } catch (err) {
        console.log(`⚠️  Table '${table}' check failed:`, err.message)
      }
    }
    
    console.log('🎉 Database connection test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
testDatabaseConnection()
