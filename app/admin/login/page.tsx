'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { ButtonLoading } from '@/components/ui/loading'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const adminCredentials = [
    {
      email: 'bhntshwcjc025@student.wethinkcode.co.za',
      role: 'Super Admin'
    },
    {
      email: 'admin@apply4me.co.za',
      role: 'Admin'
    },
    {
      email: 'bhekumusa@apply4me.co.za',
      role: 'Owner'
    }
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
        return
      }

      // Check if user is admin
      const adminEmails = adminCredentials.map(admin => admin.email)
      if (!adminEmails.includes(email)) {
        setError('Access denied. Admin privileges required.')
        await supabase.auth.signOut()
        return
      }

      // Redirect to admin dashboard
      router.push('/admin')
      
    } catch (error) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (adminEmail: string) => {
    setEmail(adminEmail)
    // For demo purposes, you can set a default password or handle differently
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sa-green/10 via-background to-sa-gold/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <p className="text-muted-foreground">
            Access Apply4Me administration panel
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@apply4me.co.za"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              <ButtonLoading loading={loading}>
                {loading ? 'Signing in...' : 'Sign In to Admin'}
              </ButtonLoading>
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3 text-center">
              Quick Access (Demo)
            </p>
            <div className="space-y-2">
              {adminCredentials.map((admin, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => handleQuickLogin(admin.email)}
                >
                  <div>
                    <div className="font-medium">{admin.role}</div>
                    <div className="text-xs text-muted-foreground">{admin.email}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              ← Back to Apply4Me
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
