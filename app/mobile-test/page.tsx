'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Smartphone, Tablet, Monitor, CheckCircle } from 'lucide-react'

export default function MobileTestPage() {
  const testData = [
    { id: 1, name: 'University of Cape Town', type: 'University', province: 'Western Cape', fee: 'R150', status: 'Active' },
    { id: 2, name: 'University of the Witwatersrand', type: 'University', province: 'Gauteng', fee: 'R200', status: 'Active' },
    { id: 3, name: 'Stellenbosch University', type: 'University', province: 'Western Cape', fee: 'R175', status: 'Active' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold gradient-text">📱 Mobile Responsiveness Test</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            This page tests all components for mobile responsiveness. Resize your browser or view on different devices.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Device Breakpoints
            </CardTitle>
            <CardDescription>
              Visual indicators for different screen sizes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 sm:hidden">
                <Smartphone className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800 dark:text-red-200">Mobile (&lt; 640px)</span>
              </div>
              <div className="hidden sm:flex lg:hidden items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                <Tablet className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">Tablet (640px - 1024px)</span>
              </div>
              <div className="hidden lg:flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950">
                <Monitor className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">Desktop (≥ 1024px)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Responsive Table Test</CardTitle>
            <CardDescription>
              Table with responsive columns that hide/show based on screen size
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Institution Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Province</TableHead>
                    <TableHead className="hidden sm:table-cell">Fee</TableHead>
                    <TableHead className="hidden lg:table-cell">Status</TableHead>
                    <TableHead className="min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">
                            {item.type} • {item.province} • {item.fee}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{item.province}</TableCell>
                      <TableCell className="hidden sm:table-cell">{item.fee}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="default">{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Grid Responsiveness Test</CardTitle>
            <CardDescription>
              Grid that adapts from 1 column (mobile) to 4 columns (desktop)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <Card key={num} className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-sa-green">{num}</div>
                    <div className="text-sm text-muted-foreground">Grid Item</div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔘 Button Responsiveness Test</CardTitle>
            <CardDescription>
              Buttons that stack on mobile and align horizontally on larger screens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button>Primary Action</Button>
                <Button variant="outline">Secondary Action</Button>
                <Button variant="ghost">Tertiary Action</Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="destructive" size="sm">Delete</Button>
                <Button variant="secondary" size="sm">Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="h-5 w-5" />
              ✅ Mobile Responsiveness Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Responsive Tables</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Adaptive Grids</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Mobile Navigation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Touch-Friendly Buttons</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Responsive Dialogs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Overflow Protection</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}