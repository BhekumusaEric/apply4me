import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Download, 
  QrCode, 
  Globe, 
  CheckCircle,
  ArrowRight,
  Users,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function MobilePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-br from-green-600 to-green-800">
        <div className="container mx-auto max-w-4xl">
          <Badge className="mb-6 bg-white/20 text-white border-white/30">
            📱 100% Free Mobile App
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Apply4Me Mobile App
            <span className="block text-yellow-300">Download Now - Free!</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get instant access to Apply4Me on your mobile device. No app store required - 
            multiple free download options available!
          </p>
        </div>
      </section>

      {/* Download Options */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Download Method</h2>
            <p className="text-xl text-muted-foreground">
              Multiple ways to get Apply4Me on your phone - all completely free!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Option 1: Expo Go */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500">Recommended</Badge>
              </div>
              <CardHeader className="text-center">
                <QrCode className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <CardTitle>Expo Go App</CardTitle>
                <CardDescription>Instant access via QR code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">100% Free</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Instant access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Live updates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Easy sharing</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    1. Download "Expo Go" from your app store
                  </p>
                  <p className="text-sm text-muted-foreground">
                    2. Scan QR code below
                  </p>
                  <p className="text-sm text-muted-foreground">
                    3. Apply4Me loads instantly!
                  </p>
                </div>

                <Button className="w-full" asChild>
                  <Link href="#qr-code">
                    <QrCode className="w-4 h-4 mr-2" />
                    Get QR Code
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Option 2: PWA */}
            <Card>
              <CardHeader className="text-center">
                <Globe className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <CardTitle>Web App (PWA)</CardTitle>
                <CardDescription>Add to home screen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Works like native app</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">No installation needed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Automatic updates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Full features</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    1. Visit apply4me-eta.vercel.app on mobile
                  </p>
                  <p className="text-sm text-muted-foreground">
                    2. Tap "Add to Home Screen"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    3. Use like a native app!
                  </p>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="https://apply4me-eta.vercel.app" target="_blank">
                    <Globe className="w-4 h-4 mr-2" />
                    Open Web App
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Option 3: Direct APK */}
            <Card>
              <CardHeader className="text-center">
                <Download className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                <CardTitle>Direct APK</CardTitle>
                <CardDescription>Download & install file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Native Android app</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Offline capable</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Full performance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">No app store needed</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    1. Download APK file
                  </p>
                  <p className="text-sm text-muted-foreground">
                    2. Enable "Unknown sources"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    3. Install and enjoy!
                  </p>
                </div>

                <Button variant="outline" className="w-full" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  APK Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* QR Code Section */}
      <section id="qr-code" className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-8">📱 Scan QR Code for Instant Access</h2>
          
          <div className="bg-white p-8 rounded-lg shadow-lg inline-block mb-8">
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-500">
                  QR Code will appear here when<br />
                  mobile app server is running
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">How to use QR Code:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="text-left">
                <h4 className="font-semibold mb-2">📱 Android:</h4>
                <ol className="text-sm space-y-1 text-muted-foreground">
                  <li>1. Download "Expo Go" from Google Play</li>
                  <li>2. Open Expo Go app</li>
                  <li>3. Tap "Scan QR Code"</li>
                  <li>4. Point camera at QR code above</li>
                  <li>5. Apply4Me loads instantly!</li>
                </ol>
              </div>
              <div className="text-left">
                <h4 className="font-semibold mb-2">🍎 iOS:</h4>
                <ol className="text-sm space-y-1 text-muted-foreground">
                  <li>1. Download "Expo Go" from App Store</li>
                  <li>2. Open Camera app</li>
                  <li>3. Point at QR code above</li>
                  <li>4. Tap "Open in Expo Go"</li>
                  <li>5. Apply4Me loads instantly!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What You'll Get</h2>
            <p className="text-xl text-muted-foreground">
              Full Apply4Me experience optimized for mobile
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">150+ Institutions</h3>
              <p className="text-sm text-muted-foreground">
                Universities, colleges, and TVET institutions
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">75+ Bursaries</h3>
              <p className="text-sm text-muted-foreground">
                Funding opportunities and scholarships
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Mobile Optimized</h3>
              <p className="text-sm text-muted-foreground">
                Perfect experience on any device
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Application Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Manage and track your applications
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-green-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Educational Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Get Apply4Me on your mobile device now - completely free!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" asChild>
              <Link href="#qr-code">
                <QrCode className="w-5 h-5 mr-2" />
                Scan QR Code
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="https://apply4me-eta.vercel.app">
                <Globe className="w-5 h-5 mr-2" />
                Use Web App
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
