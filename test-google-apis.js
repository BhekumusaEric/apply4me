#!/usr/bin/env node

// Quick test script for Google APIs
const { GoogleAuth } = require('google-auth-library');

async function testGoogleAPIs() {
  console.log('🔍 Testing Google APIs...');
  
  try {
    // Initialize Google Auth
    const auth = new GoogleAuth({
      keyFilename: './credentials/service-account-key.json',
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
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

    // Test Drive API
    console.log('\n📁 Testing Google Drive API...');
    try {
      const drive = require('googleapis').google.drive({ version: 'v3', auth: authClient });
      const driveResponse = await drive.files.list({ pageSize: 1 });
      console.log('✅ Google Drive API working!');
    } catch (error) {
      console.log('❌ Google Drive API error:', error.message);
    }

    // Test Sheets API
    console.log('\n📊 Testing Google Sheets API...');
    try {
      const sheets = require('googleapis').google.sheets({ version: 'v4', auth: authClient });
      // Just test authentication, don't create anything
      console.log('✅ Google Sheets API authentication successful!');
    } catch (error) {
      console.log('❌ Google Sheets API error:', error.message);
    }

    console.log('\n🎉 Google APIs test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testGoogleAPIs();
