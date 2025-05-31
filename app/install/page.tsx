'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Smartphone, Download, Chrome, Monitor, Tablet, CheckCircle, ArrowRight, Globe } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { installPWA, isPWAInstalled, canInstallPWA } from '@/lib/pwa'

export default function InstallPage() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [userAgent, setUserAgent] = useState('')

  useEffect(() => {
    setIsInstalled(isPWAInstalled())
    setCanInstall(canInstallPWA() && !isPWAInstalled())
    setUserAgent(navigator.userAgent)
  }, [])

  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      await installPWA()
      setIsInstalled(true)
      setCanInstall(false)
    } catch (error) {
      console.error('Installation failed:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  const isChrome = userAgent.includes('Chrome')
  const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome')
  const isEdge = userAgent.includes('Edge')
  const isFirefox = userAgent.includes('Firefox')
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  const isSafariMobile = isSafari && isMobile
  const isSafariDesktop = isSafari && !isMobile

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Smartphone className="h-16 w-16 text-sa-green" />
                <Download className="h-6 w-6 text-sa-gold absolute -bottom-1 -right-1 bg-background rounded-full p-1" />
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-4">
              📱 Install Apply4Me App
            </h1>

            <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get the full mobile app experience! Install Apply4Me on your device for faster access,
              offline support, and push notifications.
            </p>

            {isInstalled ? (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">✅ App is already installed!</span>
              </div>
            ) : canInstall ? (
              <Button
                size="lg"
                onClick={handleInstall}
                disabled={isInstalling}
                className="bg-sa-green hover:bg-sa-green/90"
              >
                <Download className="h-5 w-5 mr-2" />
                {isInstalling ? 'Installing...' : 'Install App Now'}
              </Button>
            ) : isSafariDesktop ? (
              <div className="text-center">
                <Badge variant="outline" className="text-sm mb-2 bg-orange-50 text-orange-700 border-orange-200">
                  Safari Desktop: Limited PWA Support
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Use Chrome or Edge for app installation
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Badge variant="outline" className="text-sm mb-2">
                  Install option will appear when available
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Try refreshing the page or use Chrome/Edge browser
                </p>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Monitor className="h-8 w-8 text-sa-green mb-2" />
                <CardTitle className="text-lg">Offline Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Continue working on your applications even without internet connection.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Smartphone className="h-8 w-8 text-sa-green mb-2" />
                <CardTitle className="text-lg">Native Feel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  App-like experience with smooth animations and native mobile features.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-8 w-8 text-sa-green mb-2" />
                <CardTitle className="text-lg">Push Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get instant notifications about application updates and deadlines.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Installation Instructions */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center">How to Install</h2>

            {/* Chrome/Edge Instructions */}
            {(isChrome || isEdge) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Chrome className="h-6 w-6" />
                    <CardTitle>Chrome / Edge Browser</CardTitle>
                  </div>
                  <CardDescription>
                    Install directly from your browser
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Badge className="mt-1">1</Badge>
                    <p>Look for the install button in the address bar or use the button above</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="mt-1">2</Badge>
                    <p>Click "Install" when prompted</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="mt-1">3</Badge>
                    <p>The app will be added to your home screen and app drawer</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Safari Mobile Instructions */}
            {isSafariMobile && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-6 w-6" />
                    <CardTitle>Safari Browser (iOS)</CardTitle>
                  </div>
                  <CardDescription>
                    Add to Home Screen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Badge className="mt-1">1</Badge>
                    <p>Tap the Share button (square with arrow up)</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="mt-1">2</Badge>
                    <p>Scroll down and tap "Add to Home Screen"</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="mt-1">3</Badge>
                    <p>Tap "Add" to confirm</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Safari Desktop Instructions */}
            {isSafariDesktop && (
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-6 w-6 text-orange-600" />
                    <CardTitle className="text-orange-800 dark:text-orange-200">Safari Desktop (macOS)</CardTitle>
                  </div>
                  <CardDescription className="text-orange-700 dark:text-orange-300">
                    Limited PWA support - Use Chrome for best experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                      <strong>⚠️ Safari Desktop Limitation:</strong> macOS Safari doesn't support PWA installation like mobile Safari.
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      <strong>Recommended:</strong> Use Chrome or Edge for the full app experience with installation support.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline" className="mt-1">💡</Badge>
                    <p className="text-sm">You can still bookmark the site for quick access, but it won't install as a standalone app.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Android Instructions */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Tablet className="h-6 w-6" />
                  <CardTitle>Android Devices</CardTitle>
                </div>
                <CardDescription>
                  Multiple installation methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Badge className="mt-1">1</Badge>
                  <p>Use Chrome browser and look for the install prompt</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="mt-1">2</Badge>
                  <p>Or tap the menu (⋮) and select "Add to Home screen"</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="mt-1">3</Badge>
                  <p>The app will appear on your home screen like a native app</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12 p-8 bg-sa-green/5 rounded-lg border border-sa-green/20">
            <h3 className="text-xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Install the Apply4Me app now and start your journey to higher education!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="/">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Go to Home Page
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/how-it-works">
                  Learn How It Works
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
