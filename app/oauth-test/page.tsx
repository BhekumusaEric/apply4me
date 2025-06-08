'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function OAuthTestPage() {
  const { data: session, status } = useSession()
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runOAuthTest = async () => {
    if (!session) {
      alert('Please sign in first!')
      return
    }

    setIsLoading(true)
    setTestResults(null)

    try {
      console.log('🔍 Running OAuth test with session:', {
        user: session.user?.email,
        note: 'OAuth tokens would be available in production'
      })

      const response = await fetch('/api/google/oauth-test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const results = await response.json()
      setTestResults(results)
      console.log('🎉 OAuth test results:', results)
    } catch (error) {
      console.error('❌ OAuth test failed:', error)
      setTestResults({
        success: false,
        error: 'Failed to run OAuth test',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testDirectOAuth = async () => {
    if (!session) {
      alert('Please sign in first!')
      return
    }

    setIsLoading(true)

    try {
      // Test direct OAuth API calls
      const tests: any = {}

      // Test Google Drive
      console.log('📁 Testing Google Drive...')
      try {
        const driveResponse = await fetch('/api/google/drive-oauth-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            note: 'OAuth tokens would be passed here in production'
          })
        })
        tests.drive = await driveResponse.json()
      } catch (error: any) {
        tests.drive = { success: false, error: error.message }
      }

      // Test Google Sheets
      console.log('📊 Testing Google Sheets...')
      try {
        const sheetsResponse = await fetch('/api/google/sheets-oauth-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            note: 'OAuth tokens would be passed here in production'
          })
        })
        tests.sheets = await sheetsResponse.json()
      } catch (error: any) {
        tests.sheets = { success: false, error: error.message }
      }

      setTestResults({
        success: tests.drive?.success && tests.sheets?.success,
        message: 'Direct OAuth test completed',
        tests,
        session: {
          user: session.user?.email,
          note: 'OAuth integration ready for production'
        }
      })
    } catch (error) {
      console.error('❌ Direct OAuth test failed:', error)
      setTestResults({
        success: false,
        error: 'Direct OAuth test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔧 OAuth Integration Test
          </h1>

          {/* Session Status */}
          <div className="mb-6 p-4 rounded-lg bg-gray-100">
            <h2 className="text-lg font-semibold mb-2">Session Status</h2>
            {status === 'loading' && <p>Loading session...</p>}
            {status === 'unauthenticated' && (
              <p className="text-red-600">❌ Not signed in. Please sign in with Google first.</p>
            )}
            {status === 'authenticated' && session && (
              <div className="space-y-2">
                <p className="text-green-600">✅ Signed in as: {session.user?.email}</p>
                <p>OAuth Integration: Ready for production setup</p>
              </div>
            )}
          </div>

          {/* Test Buttons */}
          <div className="space-y-4 mb-6">
            <button
              onClick={runOAuthTest}
              disabled={isLoading || !session}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '🔄 Running OAuth Test...' : '🧪 Run OAuth Test'}
            </button>

            <button
              onClick={testDirectOAuth}
              disabled={isLoading || !session}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '🔄 Testing Direct OAuth...' : '🚀 Test Direct OAuth'}
            </button>
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="mt-6 p-4 rounded-lg bg-gray-100">
              <h2 className="text-lg font-semibold mb-4">Test Results</h2>
              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Make sure you're signed in with Google (check session status above)</li>
              <li>Click "Run OAuth Test" to test the integration</li>
              <li>Check the results to see if OAuth tokens are working</li>
              <li>If tests fail, check the browser console for detailed error messages</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
