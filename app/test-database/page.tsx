'use client'

import { useState } from 'react'

export default function TestDatabasePage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDatabaseSetup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/database/setup-profiles', {
        method: 'POST'
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to test database setup', details: error })
    } finally {
      setLoading(false)
    }
  }

  const checkDatabaseStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/database/setup-profiles')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to check database status', details: error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Setup Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Database Operations</h2>
          
          <div className="space-x-4 mb-6">
            <button
              onClick={checkDatabaseStatus}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Check Database Status'}
            </button>
            
            <button
              onClick={testDatabaseSetup}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Generate Setup SQL'}
            </button>
          </div>
          
          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Result:</h3>
              <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              
              {result.manualSQL && (
                <div className="mt-4">
                  <h4 className="text-md font-semibold mb-2">SQL to run in Supabase:</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-64">
                    <pre className="text-sm whitespace-pre-wrap">
                      {result.manualSQL}
                    </pre>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.manualSQL)}
                    className="mt-2 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                  >
                    Copy SQL
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
