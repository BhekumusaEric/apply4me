"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { CheckCircle, AlertCircle, Info, XCircle, Bell, User, CreditCard, FileText, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFeedback } from '@/hooks/use-feedback'

interface FeedbackSystemProps {
  children: React.ReactNode
}

export function FeedbackSystem({ children }: FeedbackSystemProps) {
  const feedback = useFeedback()

  useEffect(() => {
    // Listen for custom feedback events
    const handleProfileIncomplete = () => {
      feedback.profileFeedback.incomplete()
    }

    const handleProfileSaved = () => {
      feedback.profileFeedback.saved()
    }

    const handleApplicationSubmitted = () => {
      feedback.applicationFeedback.submitted()
    }

    const handlePaymentSuccess = () => {
      feedback.paymentFeedback.success()
    }

    const handleDocumentUploaded = (event: CustomEvent) => {
      feedback.documentFeedback.uploaded(event.detail.fileName)
    }

    const handleNotificationReceived = (event: CustomEvent) => {
      feedback.notificationFeedback.received(event.detail.title)
    }

    // Add event listeners
    window.addEventListener('profile-incomplete', handleProfileIncomplete)
    window.addEventListener('profile-saved', handleProfileSaved)
    window.addEventListener('application-submitted', handleApplicationSubmitted)
    window.addEventListener('payment-success', handlePaymentSuccess)
    window.addEventListener('document-uploaded', handleDocumentUploaded as EventListener)
    window.addEventListener('notification-received', handleNotificationReceived as EventListener)

    return () => {
      // Cleanup event listeners
      window.removeEventListener('profile-incomplete', handleProfileIncomplete)
      window.removeEventListener('profile-saved', handleProfileSaved)
      window.removeEventListener('application-submitted', handleApplicationSubmitted)
      window.removeEventListener('payment-success', handlePaymentSuccess)
      window.removeEventListener('document-uploaded', handleDocumentUploaded as EventListener)
      window.removeEventListener('notification-received', handleNotificationReceived as EventListener)
    }
  }, [feedback])

  return <>{children}</>
}

// Helper functions to trigger feedback events
export const triggerFeedback = {
  profileIncomplete: () => {
    window.dispatchEvent(new CustomEvent('profile-incomplete'))
  },
  
  profileSaved: () => {
    window.dispatchEvent(new CustomEvent('profile-saved'))
  },
  
  applicationSubmitted: () => {
    window.dispatchEvent(new CustomEvent('application-submitted'))
  },
  
  paymentSuccess: () => {
    window.dispatchEvent(new CustomEvent('payment-success'))
  },
  
  documentUploaded: (fileName: string) => {
    window.dispatchEvent(new CustomEvent('document-uploaded', { detail: { fileName } }))
  },
  
  notificationReceived: (title: string) => {
    window.dispatchEvent(new CustomEvent('notification-received', { detail: { title } }))
  },
}

// Enhanced toast notifications with Apply4Me branding
export const showApply4MeToast = {
  success: (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
    toast.success(title, {
      description,
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
      style: {
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        borderLeft: '4px solid #10b981',
      },
    })
  },

  error: (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
    toast.error(title, {
      description,
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
      style: {
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        borderLeft: '4px solid #ef4444',
      },
    })
  },

  warning: (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
    toast.warning(title, {
      description,
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
      style: {
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        borderLeft: '4px solid #f59e0b',
      },
    })
  },

  info: (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
    toast.info(title, {
      description,
      icon: <Info className="h-5 w-5 text-blue-600" />,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
      style: {
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        borderLeft: '4px solid #3b82f6',
      },
    })
  },

  // Apply4Me specific notifications
  profileReminder: () => {
    toast.warning("Complete Your Profile", {
      description: "Unlock all Apply4Me features by completing your student profile.",
      icon: <User className="h-5 w-5 text-orange-600" />,
      action: {
        label: "Complete Now",
        onClick: () => window.location.href = '/profile/setup'
      },
      style: {
        background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
        borderLeft: '4px solid #ea580c',
      },
    })
  },

  applicationSuccess: () => {
    toast.success("Application Submitted! 🎓", {
      description: "Your application has been successfully submitted. You'll receive updates via notifications.",
      icon: <GraduationCap className="h-5 w-5 text-green-600" />,
      style: {
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderLeft: '4px solid #22c55e',
      },
    })
  },

  paymentConfirmed: () => {
    toast.success("Payment Confirmed! 💳", {
      description: "Your payment has been processed successfully.",
      icon: <CreditCard className="h-5 w-5 text-green-600" />,
      style: {
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderLeft: '4px solid #22c55e',
      },
    })
  },

  documentUploaded: (fileName: string) => {
    toast.success("Document Uploaded! 📄", {
      description: `${fileName} has been uploaded successfully.`,
      icon: <FileText className="h-5 w-5 text-green-600" />,
      style: {
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderLeft: '4px solid #22c55e',
      },
    })
  },

  newNotification: (title: string) => {
    toast.info("New Notification 🔔", {
      description: title,
      icon: <Bell className="h-5 w-5 text-blue-600" />,
      action: {
        label: "View",
        onClick: () => {
          const event = new CustomEvent('open-notifications')
          window.dispatchEvent(event)
        }
      },
      style: {
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        borderLeft: '4px solid #3b82f6',
      },
    })
  },
}
