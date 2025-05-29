'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserPlus, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  role: string
  permissions: Record<string, any>
  created_at: string
  source?: string
}

export default function AdminTestUsersPage() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('admin')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [fetchingUsers, setFetchingUsers] = useState(false)

  const addAdminUser = async () => {
    if (!email) {
      setResult({ error: 'Email is required' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          role,
          permissions: {
            manage_institutions: true,
            manage_applications: true,
            manage_users: role === 'super_admin'
          }
        })
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        setEmail('')
        fetchAdminUsers() // Refresh the list
      }
    } catch (error) {
      setResult({ 
        error: 'Failed to add admin user', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminUsers = async () => {
    setFetchingUsers(true)
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      if (data.success) {
        setAdminUsers(data.adminUsers || [])
      } else {
        console.warn('Failed to fetch admin users:', data.error)
      }
    } catch (error) {
      console.error('Error fetching admin users:', error)
    } finally {
      setFetchingUsers(false)
    }
  }

  const initializeDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/database/init-notifications', {
        method: 'POST'
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ 
        error: 'Failed to initialize database', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Admin User Management Test</h1>
      </div>

      {/* Database Initialization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Database Initialization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Initialize the database tables for notifications and admin users.
          </p>
          <Button onClick={initializeDatabase} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Initialize Database Tables
          </Button>
        </CardContent>
      </Card>

      {/* Add Admin User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Admin User
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="w-full p-2 border rounded-md"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
          </div>
          
          <Button onClick={addAdminUser} disabled={loading || !email}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
            Add Admin User
          </Button>
        </CardContent>
      </Card>

      {/* Current Admin Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Admin Users
          </CardTitle>
          <Button variant="outline" onClick={fetchAdminUsers} disabled={fetchingUsers}>
            {fetchingUsers ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {adminUsers.length === 0 ? (
            <p className="text-muted-foreground">No admin users found. Click refresh to load.</p>
          ) : (
            <div className="space-y-3">
              {adminUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={user.role === 'super_admin' ? 'destructive' : 'secondary'}>
                        {user.role}
                      </Badge>
                      {user.source && (
                        <Badge variant="outline" className="text-xs">
                          {user.source}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>1.</strong> First, click "Initialize Database Tables" to set up the required tables.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>2.</strong> Then, add admin users by entering their email and selecting a role.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>3.</strong> Click "Refresh" to see the current list of admin users.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> If database tables don't exist, the system will use fallback methods.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
