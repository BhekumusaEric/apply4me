'use client'

import { useState } from 'react'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

export default function DatabaseSetupPage() {
  const [setupStatus, setSetupStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [setupResult, setSetupResult] = useState<any>(null)
  const [schemaStatus, setSchemaStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDatabaseSetup = async () => {
    try {
      setSetupStatus('running')
      setLoading(true)

      const response = await fetch('/api/database/direct-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()
      setSetupResult(result)

      if (result.success) {
        setSetupStatus('success')
        // Refresh schema status after setup
        await checkSchemaStatus()
      } else {
        setSetupStatus('error')
      }
    } catch (error) {
      console.error('Setup error:', error)
      setSetupStatus('error')
      setSetupResult({ error: 'Failed to run database setup' })
    } finally {
      setLoading(false)
    }
  }

  const checkSchemaStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/database/direct-setup')
      const result = await response.json()
      setSchemaStatus(result)
    } catch (error) {
      console.error('Schema check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <div className="h-5 w-5 bg-yellow-600 rounded-full animate-pulse"></div>
      case 'success':
        return <div className="h-5 w-5 bg-green-600 rounded-full"></div>
      case 'error':
        return <div className="h-5 w-5 bg-red-600 rounded-full"></div>
      default:
        return <div className="h-5 w-5 bg-blue-600 rounded-full"></div>
    }
  }

  const getStatusBadge = (exists: boolean) => {
    return exists ? (
      <span className="px-2 py-1 text-xs rounded border text-green-600 border-green-600">
        ✓ Ready
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded border text-red-600 border-red-600">
        ✗ Missing
      </span>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded"></div>
          Database Setup for Payment System
        </h1>
        <p className="text-gray-600">
          Set up the required database schema for the payment verification system
        </p>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <div className="h-5 w-5 bg-gray-600 rounded"></div>
            Current Database Status
          </h3>
          <p className="text-gray-600 mt-1">
            Check the current state of payment-related database tables and columns
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span>Schema Status Check</span>
            <button
              onClick={checkSchemaStatus}
              disabled={loading}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block animate-spin mr-2">⟳</span>
              ) : (
                <span className="mr-2">⟳</span>
              )}
              Check Status
            </button>
          </div>

          {schemaStatus && (
            <div className="space-y-3">
              <div className="border-t pt-3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Columns</span>
                  {getStatusBadge(schemaStatus.schema_status?.payment_columns_exist)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notifications Table</span>
                  {getStatusBadge(schemaStatus.schema_status?.notifications_table_exists)}
                </div>
              </div>

              {schemaStatus.schema_status?.columns_found?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Found Columns:</p>
                  <div className="flex flex-wrap gap-2">
                    {schemaStatus.schema_status.columns_found.map((column: string) => (
                      <span key={column} className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {column}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Ready for Payments:</span>
                {schemaStatus.schema_status?.ready_for_payments ? (
                  <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                    ✓ Yes
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-600 text-white rounded text-xs">
                    ✗ No - Setup Required
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Setup Action */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {getStatusIcon(setupStatus)}
            Run Database Setup
          </h3>
          <p className="text-gray-600 mt-1">
            This will create all required tables and columns for the payment system
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🔧 What this setup will do:</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Add payment columns to applications table (payment_method, payment_status, etc.)</li>
              <li>• Create notifications table for user notifications</li>
              <li>• Create payment_verification_logs table for audit trail</li>
              <li>• Create performance indexes for faster queries</li>
              <li>• Update existing applications with default payment data</li>
            </ul>
          </div>

          <button
            onClick={runDatabaseSetup}
            disabled={loading || setupStatus === 'running'}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {setupStatus === 'running' ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                Setting up database...
              </>
            ) : (
              <>
                <span className="mr-2">▶</span>
                Run Database Setup
              </>
            )}
          </button>
        </div>
      </div>

      {/* Setup Results */}
      {setupResult && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {setupStatus === 'success' ? (
                <div className="h-5 w-5 bg-green-600 rounded-full"></div>
              ) : (
                <div className="h-5 w-5 bg-red-600 rounded-full"></div>
              )}
              Setup Results
            </h3>
          </div>
          <div className="p-6">
            {setupStatus === 'success' ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">✅ Setup Completed Successfully!</h4>
                  <p className="text-sm text-green-700 mb-3">{setupResult.message}</p>

                  {setupResult.steps && (
                    <div>
                      <p className="text-sm font-medium text-green-800 mb-2">Completed Steps:</p>
                      <ul className="text-sm text-green-700 space-y-1">
                        {setupResult.steps.map((step: string, index: number) => (
                          <li key={index}>• {step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">🎉 What's Next:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Payment verification system is now ready to use</li>
                    <li>• Admin can verify payments at /admin/payments</li>
                    <li>• Users will receive notifications for payment status</li>
                    <li>• All payment data will be properly tracked</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">❌ Manual Setup Required</h4>
                  <p className="text-sm text-red-700 mb-3">{setupResult.message}</p>

                  {setupResult.setupInstructions && (
                    <div className="mt-4">
                      <h5 className="font-medium text-red-800 mb-2">📋 {setupResult.setupInstructions.title}</h5>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto">
                        {setupResult.setupInstructions.commands.map((command: string, index: number) => (
                          <div key={index} className="mb-1">
                            {command}
                          </div>
                        ))}
                      </div>

                      <div className="mt-3">
                        <h5 className="font-medium text-red-800 mb-2">📝 Instructions:</h5>
                        <ol className="text-sm text-red-700 space-y-1">
                          {setupResult.setupInstructions.steps?.map((instruction: string, index: number) => (
                            <li key={index}>{instruction}</li>
                          ))}
                        </ol>
                      </div>

                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                          <strong>💡 Tip:</strong> Copy all the SQL commands above and paste them into your Supabase SQL Editor.
                          Run them all at once, then refresh this page to verify the setup.
                        </p>
                      </div>

                      <div className="mt-3">
                        <button
                          onClick={() => navigator.clipboard.writeText(setupResult.setupInstructions.commands.join('\n'))}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          📋 Copy SQL Commands
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
