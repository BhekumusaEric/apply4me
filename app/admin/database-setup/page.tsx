'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Database,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Settings
} from 'lucide-react'

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
        return <Clock className="h-5 w-5 text-yellow-600 animate-spin" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Database className="h-5 w-5 text-blue-600" />
    }
  }

  const getStatusBadge = (exists: boolean) => {
    return exists ? (
      <Badge variant="outline" className="text-green-600 border-green-600">
        <CheckCircle className="h-3 w-3 mr-1" />
        Ready
      </Badge>
    ) : (
      <Badge variant="outline" className="text-red-600 border-red-600">
        <XCircle className="h-3 w-3 mr-1" />
        Missing
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Database className="h-8 w-8 text-blue-600" />
          Database Setup for Payment System
        </h1>
        <p className="text-muted-foreground">
          Set up the required database schema for the payment verification system
        </p>
      </div>

      {/* Current Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Current Database Status
          </CardTitle>
          <CardDescription>
            Check the current state of payment-related database tables and columns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Schema Status Check</span>
            <Button
              onClick={checkSchemaStatus}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Check Status
            </Button>
          </div>

          {schemaStatus && (
            <div className="space-y-3">
              <Separator />
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
                      <Badge key={column} variant="secondary" className="text-xs">
                        {column}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Ready for Payments:</span>
                {schemaStatus.schema_status?.ready_for_payments ? (
                  <Badge className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    No - Setup Required
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Action */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(setupStatus)}
            Run Database Setup
          </CardTitle>
          <CardDescription>
            This will create all required tables and columns for the payment system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <Button
            onClick={runDatabaseSetup}
            disabled={loading || setupStatus === 'running'}
            className="w-full"
            size="lg"
          >
            {setupStatus === 'running' ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Setting up database...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Run Database Setup
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Setup Results */}
      {setupResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {setupStatus === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Setup Results
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
