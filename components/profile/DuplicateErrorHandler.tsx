'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, HelpCircle } from 'lucide-react'

interface DuplicateErrorHandlerProps {
  error: {
    error: string
    message: string
    field?: string
    details?: string
  }
  onRetry?: () => void
  onContactSupport?: () => void
}

export default function DuplicateErrorHandler({ 
  error, 
  onRetry, 
  onContactSupport 
}: DuplicateErrorHandlerProps) {
  const isDuplicateError = error.error?.includes('already exists') || 
                          error.error?.includes('Duplicate') ||
                          error.message?.includes('already registered')

  if (!isDuplicateError) {
    return null
  }

  const getErrorIcon = () => {
    if (error.field === 'idNumber') {
      return <AlertTriangle className="h-4 w-4" />
    }
    return <AlertTriangle className="h-4 w-4" />
  }

  const getErrorTitle = () => {
    if (error.field === 'idNumber') {
      return 'ID Number Already Registered'
    }
    if (error.field === 'user_id') {
      return 'Profile Already Exists'
    }
    return 'Duplicate Information Detected'
  }

  const getErrorSuggestions = () => {
    if (error.field === 'idNumber') {
      return [
        'Double-check that you entered your ID number correctly',
        'If you already have an account, try signing in instead',
        'Contact support if you believe this is an error'
      ]
    }
    if (error.field === 'user_id') {
      return [
        'You already have a profile in our system',
        'Try refreshing the page to load your existing profile',
        'Contact support if you\'re having trouble accessing your profile'
      ]
    }
    return [
      'Some of your information is already in our system',
      'Please review your entries and try again',
      'Contact support if you need assistance'
    ]
  }

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <div className="flex items-start space-x-2">
          {getErrorIcon()}
          <div className="flex-1">
            <h4 className="font-medium">{getErrorTitle()}</h4>
            <AlertDescription className="mt-1">
              {error.message}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h5 className="font-medium text-yellow-800 mb-2">What you can do:</h5>
        <ul className="space-y-1 text-sm text-yellow-700">
          {getErrorSuggestions().map((suggestion, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-yellow-500 mt-0.5">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        )}
        
        {onContactSupport && (
          <Button 
            variant="secondary" 
            onClick={onContactSupport}
            className="flex items-center space-x-2"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Contact Support</span>
          </Button>
        )}
      </div>

      {error.details && (
        <details className="mt-4">
          <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
            Technical Details
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {error.details}
          </pre>
        </details>
      )}
    </div>
  )
}

// Hook for handling duplicate errors in forms
export function useDuplicateErrorHandler() {
  const handleDuplicateError = (error: any) => {
    if (error.status === 409) {
      return {
        isDuplicate: true,
        error: error.data || error
      }
    }
    return {
      isDuplicate: false,
      error: null
    }
  }

  return { handleDuplicateError }
}
