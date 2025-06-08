#!/usr/bin/env node

// Simple authentication test
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

async function testAuth() {
  console.log('🔍 Testing Google Service Account Authentication...');
  
  try {
    // Initialize Google Auth with explicit scopes
    const auth = new GoogleAuth({
      keyFilename: './credentials/service-account-key.json',
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/calendar'
      ]
    });

    console.log('✅ Google Auth initialized');

    // Get authenticated client
    const authClient = await auth.getClient();
    console.log('✅ Auth client obtained');

    // Get project ID
    const projectId = await auth.getProjectId();
    console.log(`✅ Project ID: ${projectId}`);

    // Test if we can get an access token
    const accessToken = await authClient.getAccessToken();
    console.log('✅ Access token obtained:', accessToken.token ? 'Yes' : 'No');

    // Test Drive API with minimal request
    console.log('\n📁 Testing Google Drive API (minimal)...');
    try {
      const drive = google.drive({ version: 'v3', auth: authClient });
      const response = await drive.about.get({ fields: 'user' });
      console.log('✅ Google Drive API working! User:', response.data.user?.displayName || 'Service Account');
    } catch (error) {
      console.log('❌ Google Drive API error:', error.message);
      console.log('   Status:', error.status || 'Unknown');
      console.log('   Code:', error.code || 'Unknown');
    }

    // Test Sheets API with minimal request
    console.log('\n📊 Testing Google Sheets API (minimal)...');
    try {
      const sheets = google.sheets({ version: 'v4', auth: authClient });
      // Just test if we can access the API (this should work with service account)
      console.log('✅ Google Sheets API client created successfully');
      
      // Try to create a simple spreadsheet
      const createResponse = await sheets.spreadsheets.create({
        resource: {
          properties: {
            title: 'Apply4Me Test - ' + new Date().toISOString()
          }
        }
      });
      
      console.log('✅ Google Sheets API working! Created spreadsheet:', createResponse.data.spreadsheetId);
      
      // Clean up - delete the test spreadsheet
      const drive = google.drive({ version: 'v3', auth: authClient });
      await drive.files.delete({ fileId: createResponse.data.spreadsheetId });
      console.log('✅ Test spreadsheet cleaned up');
      
    } catch (error) {
      console.log('❌ Google Sheets API error:', error.message);
      console.log('   Status:', error.status || 'Unknown');
      console.log('   Code:', error.code || 'Unknown');
    }

    console.log('\n🎉 Authentication test completed!');

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    console.error('   Full error:', error);
    process.exit(1);
  }
}

testAuth();
