'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, Download, X } from 'lucide-react'
import { installPWA, isPWAInstalled, canInstallPWA } from '@/lib/pwa'

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Check if PWA can be installed
    if (!canInstallPWA() || isPWAInstalled()) {
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show install prompt after a delay (don't be too aggressive)
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen')
        if (!hasSeenPrompt) {
          setShowPrompt(true)
        }
      }, 10000) // Show after 10 seconds
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    setIsInstalling(true)
    
    try {
      // Show the install prompt
      deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setShowPrompt(false)
        localStorage.setItem('pwa-install-prompt-seen', 'true')
      } else {
        console.log('User dismissed the install prompt')
      }
    } catch (error) {
      console.error('Error during PWA installation:', error)
    } finally {
      setIsInstalling(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-prompt-seen', 'true')
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm">Install Apply4Me</CardTitle>
                <CardDescription className="text-xs">
                  Get the app experience
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-3">
            Install Apply4Me on your device for faster access, offline support, and a native app experience.
          </p>
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1"
            >
              <Download className="h-3 w-3 mr-1" />
              {isInstalling ? 'Installing...' : 'Install'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="flex-1"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Alternative install button for header or other locations
export function InstallButton() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    setCanInstall(canInstallPWA() && !isPWAInstalled())
  }, [])

  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      await installPWA()
      setCanInstall(false)
    } catch (error) {
      console.error('Installation failed:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  if (!canInstall) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleInstall}
      disabled={isInstalling}
      className="hidden md:flex"
    >
      <Download className="h-4 w-4 mr-2" />
      {isInstalling ? 'Installing...' : 'Install App'}
    </Button>
  )
}
