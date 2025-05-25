'use client'

import { useAuth } from '@/app/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function AdminTest() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Admin Test Page</h1>
          <p className="text-muted-foreground">
            This is a test admin page to verify deployment
          </p>
          {user ? (
            <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-green-800 dark:text-green-200">
                ✅ User logged in: {user.email}
              </p>
            </div>
          ) : (
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-red-800 dark:text-red-200">
                ❌ No user logged in
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
