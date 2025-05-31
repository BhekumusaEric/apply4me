"use client"

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface FeedbackOptions {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface LoadingState {
  [key: string]: boolean
}

export function useFeedback() {
  const [loading, setLoading] = useState<LoadingState>({})

  const showSuccess = useCallback((message: string, options?: FeedbackOptions) => {
    toast.success(options?.title || "Success!", {
      description: options?.description || message,
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  }, [])

  const showError = useCallback((message: string, options?: FeedbackOptions) => {
    toast.error(options?.title || "Error", {
      description: options?.description || message,
      duration: options?.duration || 5000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  }, [])

  const showWarning = useCallback((message: string, options?: FeedbackOptions) => {
    toast.warning(options?.title || "Warning", {
      description: options?.description || message,
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  }, [])

  const showInfo = useCallback((message: string, options?: FeedbackOptions) => {
    toast.info(options?.title || "Info", {
      description: options?.description || message,
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  }, [])

  const showLoading = useCallback((message: string, key?: string) => {
    const loadingKey = key || 'default'
    setLoading(prev => ({ ...prev, [loadingKey]: true }))
    
    return toast.loading(message, {
      duration: Infinity,
    })
  }, [])

  const hideLoading = useCallback((key?: string) => {
    const loadingKey = key || 'default'
    setLoading(prev => ({ ...prev, [loadingKey]: false }))
  }, [])

  const isLoading = useCallback((key?: string) => {
    const loadingKey = key || 'default'
    return loading[loadingKey] || false
  }, [loading])

  // Enhanced feedback for common Apply4Me scenarios
  const profileFeedback = {
    saved: () => showSuccess("Profile saved successfully!", {
      title: "✅ Profile Updated",
      description: "Your profile information has been saved and updated.",
    }),
    
    incomplete: () => showWarning("Profile incomplete", {
      title: "📋 Complete Your Profile",
      description: "Some required information is missing. Complete your profile to unlock all features.",
      action: {
        label: "Complete Now",
        onClick: () => window.location.href = '/profile/setup'
      }
    }),
    
    verified: () => showSuccess("Profile verified!", {
      title: "🎉 Profile Verified",
      description: "Your profile has been successfully verified. You can now apply to institutions.",
    }),
  }

  const applicationFeedback = {
    submitted: () => showSuccess("Application submitted!", {
      title: "🎓 Application Submitted",
      description: "Your application has been successfully submitted. You'll receive updates via notifications.",
    }),
    
    saved: () => showInfo("Application saved as draft", {
      title: "💾 Draft Saved",
      description: "Your application progress has been saved. You can continue later.",
    }),
    
    paymentRequired: () => showWarning("Payment required", {
      title: "💳 Payment Required",
      description: "Complete payment to submit your application.",
      action: {
        label: "Pay Now",
        onClick: () => window.location.href = '/payment'
      }
    }),
  }

  const documentFeedback = {
    uploaded: (fileName: string) => showSuccess(`${fileName} uploaded successfully!`, {
      title: "📄 Document Uploaded",
      description: "Your document has been uploaded and is being processed.",
    }),
    
    rejected: (reason: string) => showError("Document rejected", {
      title: "❌ Document Rejected",
      description: reason,
      action: {
        label: "Upload Again",
        onClick: () => window.location.href = '/documents'
      }
    }),
    
    verified: (fileName: string) => showSuccess(`${fileName} verified!`, {
      title: "✅ Document Verified",
      description: "Your document has been successfully verified.",
    }),
  }

  const paymentFeedback = {
    success: () => showSuccess("Payment successful!", {
      title: "💳 Payment Confirmed",
      description: "Your payment has been processed successfully. Your application is now submitted.",
    }),
    
    failed: (reason?: string) => showError("Payment failed", {
      title: "❌ Payment Failed",
      description: reason || "There was an issue processing your payment. Please try again.",
      action: {
        label: "Try Again",
        onClick: () => window.location.reload()
      }
    }),
    
    pending: () => showInfo("Payment pending", {
      title: "⏳ Payment Processing",
      description: "Your payment is being processed. You'll receive a confirmation shortly.",
    }),
  }

  const notificationFeedback = {
    sent: () => showSuccess("Notification sent!", {
      title: "🔔 Notification Sent",
      description: "Your notification has been sent to all selected recipients.",
    }),
    
    received: (title: string) => showInfo(`New notification: ${title}`, {
      title: "🔔 New Notification",
      description: "You have received a new notification.",
      action: {
        label: "View",
        onClick: () => {
          // Trigger notification center
          const event = new CustomEvent('open-notifications')
          window.dispatchEvent(event)
        }
      }
    }),
  }

  return {
    // Basic feedback
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    hideLoading,
    isLoading,
    
    // Contextual feedback
    profileFeedback,
    applicationFeedback,
    documentFeedback,
    paymentFeedback,
    notificationFeedback,
  }
}
