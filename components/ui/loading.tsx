'use client'

import { cn } from '@/lib/utils'
import { GraduationCap, Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-primary border-t-transparent',
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn('flex space-x-1', className)}>
      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
    </div>
  )
}

interface LoadingBarProps {
  progress?: number
  className?: string
}

export function LoadingBar({ progress = 0, className }: LoadingBarProps) {
  return (
    <div className={cn('w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700', className)}>
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}

interface LoadingCardProps {
  className?: string
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 space-y-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
        </div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
      </div>
    </div>
  )
}

interface LoadingPageProps {
  message?: string
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sa-green to-sa-blue opacity-20 animate-ping"></div>
          <div className="relative h-16 w-16 rounded-full bg-gradient-to-r from-sa-green to-sa-blue flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium gradient-text">{message}</p>
          <LoadingDots />
        </div>
      </div>
    </div>
  )
}

interface ButtonLoadingProps {
  loading: boolean
  children: React.ReactNode
  className?: string
}

export function ButtonLoading({ loading, children, className }: ButtonLoadingProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      <span>{children}</span>
    </div>
  )
}

// Enhanced Apply4Me Loading Component
export function Apply4MeLoading({ message = 'Loading Apply4Me...', size = 'md' }: { message?: string, size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sa-green to-sa-blue opacity-20 animate-ping"></div>
        <div className={cn('relative rounded-full bg-gradient-to-r from-sa-green to-sa-blue flex items-center justify-center', sizeClasses[size])}>
          <GraduationCap className={cn('text-white', iconSizes[size])} />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="font-medium gradient-text">{message}</p>
        <LoadingDots />
      </div>
    </div>
  )
}

// Skeleton Components
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-muted shimmer', className)} />
  )
}

export function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start space-x-3 p-3 border rounded-lg">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-[60px]" />
          </div>
        </div>
      ))}
    </div>
  )
}
