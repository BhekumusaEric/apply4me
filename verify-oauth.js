// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🔍 OAuth Configuration Verification');
console.log('=====================================');
console.log('');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('✅ GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set (' + process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...)' : '❌ Not set');
console.log('✅ GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set (' + process.env.GOOGLE_CLIENT_SECRET.substring(0, 10) + '...)' : '❌ Not set');
console.log('✅ NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ Not set');
console.log('✅ NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set' : '❌ Not set');
console.log('');

// Analyze Client ID
const clientId = process.env.GOOGLE_CLIENT_ID;
if (clientId) {
  console.log('🔍 OAuth Client Analysis:');
  console.log('📋 Full Client ID:', clientId);
  console.log('🏗️  Project Number:', clientId.split('-')[0]);
  console.log('🌐 Domain:', clientId.includes('apps.googleusercontent.com') ? '✅ Valid Google OAuth domain' : '❌ Invalid domain');
  console.log('🔗 Expected Redirect URI:', process.env.NEXTAUTH_URL + '/api/auth/callback/google');
} else {
  console.log('❌ No Client ID found');
}

console.log('');
console.log('🎯 Next Steps:');
console.log('1. Verify redirect URI in Google Cloud Console');
console.log('2. Check OAuth consent screen scopes');
console.log('3. Test OAuth flow in browser');
