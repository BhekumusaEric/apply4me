'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface FeedbackItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface FeedbackContextType {
  items: FeedbackItem[]
  addFeedback: (feedback: Omit<FeedbackItem, 'id' | 'timestamp'>) => void
  removeFeedback: (id: string) => void
  clearAll: () => void
}

export function useFeedback(): FeedbackContextType {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const addFeedback = useCallback((feedback: Omit<FeedbackItem, 'id' | 'timestamp'>) => {
    const id = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newItem: FeedbackItem = {
      ...feedback,
      id,
      timestamp: new Date()
    }

    setItems(prev => [newItem, ...prev])

    // Auto-remove after duration (default 5 seconds)
    const duration = feedback.duration ?? 5000
    if (duration > 0) {
      const timeout = setTimeout(() => {
        removeFeedback(id)
      }, duration)
      
      timeoutRefs.current.set(id, timeout)
    }

    return id
  }, [])

  const removeFeedback = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
    
    // Clear timeout if exists
    const timeout = timeoutRefs.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeoutRefs.current.delete(id)
    }
  }, [])

  const clearAll = useCallback(() => {
    setItems([])
    
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
    timeoutRefs.current.clear()
  }, [])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
      timeoutRefs.current.clear()
    }
  }, [])

  return {
    items,
    addFeedback,
    removeFeedback,
    clearAll
  }
}

// Convenience functions for common feedback types
export function useSuccessFeedback() {
  const { addFeedback } = useFeedback()
  
  return useCallback((title: string, message?: string, options?: Partial<FeedbackItem>) => {
    return addFeedback({
      type: 'success',
      title,
      message: message || '',
      ...options
    })
  }, [addFeedback])
}

export function useErrorFeedback() {
  const { addFeedback } = useFeedback()
  
  return useCallback((title: string, message?: string, options?: Partial<FeedbackItem>) => {
    return addFeedback({
      type: 'error',
      title,
      message: message || '',
      duration: 0, // Errors don't auto-dismiss by default
      ...options
    })
  }, [addFeedback])
}

export function useWarningFeedback() {
  const { addFeedback } = useFeedback()
  
  return useCallback((title: string, message?: string, options?: Partial<FeedbackItem>) => {
    return addFeedback({
      type: 'warning',
      title,
      message: message || '',
      duration: 7000, // Warnings stay longer
      ...options
    })
  }, [addFeedback])
}

export function useInfoFeedback() {
  const { addFeedback } = useFeedback()
  
  return useCallback((title: string, message?: string, options?: Partial<FeedbackItem>) => {
    return addFeedback({
      type: 'info',
      title,
      message: message || '',
      ...options
    })
  }, [addFeedback])
}

// Hook for application-specific feedback
export function useApplicationFeedback() {
  const { addFeedback } = useFeedback()
  
  const showApplicationSuccess = useCallback((message: string) => {
    return addFeedback({
      type: 'success',
      title: '🎓 Application Success',
      message,
      duration: 6000
    })
  }, [addFeedback])

  const showPaymentSuccess = useCallback((amount: number, reference: string) => {
    return addFeedback({
      type: 'success',
      title: '💳 Payment Successful',
      message: `Payment of R${amount} completed. Reference: ${reference}`,
      duration: 8000
    })
  }, [addFeedback])

  const showDocumentUpload = useCallback((documentType: string) => {
    return addFeedback({
      type: 'success',
      title: '📄 Document Uploaded',
      message: `${documentType} has been uploaded successfully`,
      duration: 4000
    })
  }, [addFeedback])

  const showProfileUpdate = useCallback(() => {
    return addFeedback({
      type: 'success',
      title: '👤 Profile Updated',
      message: 'Your profile has been updated successfully',
      duration: 4000
    })
  }, [addFeedback])

  return {
    showApplicationSuccess,
    showPaymentSuccess,
    showDocumentUpload,
    showProfileUpdate
  }
}
