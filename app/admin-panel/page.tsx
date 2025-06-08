'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/loading'
import {
  Users,
  GraduationCap,
  Award,
  FileText,
  Bell,
  Shield,
  RefreshCw,
  Send,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'
import { UserManagement } from '@/components/admin/user-management'
import { ApplicationManagement } from '@/components/admin/application-management'
import { InstitutionManagement } from '@/components/admin/institution-management'
import { ProgramManagement } from '@/components/admin/program-management'

interface AdminStats {
  totalUsers: number
  totalInstitutions: number
  totalBursaries: number
  totalApplications: number
  pendingApplications: number
  completedProfiles: number
  totalRevenue: number
  activeNotifications: number
}

interface User {
  id: string
  email: string
  phone?: string
  created_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string
  user_metadata?: any
  app_metadata?: any
  profile?: {
    id: string
    first_name: string
    last_name: string
    profile_completeness: number
    is_verified: boolean
    created_at: string
    updated_at: string
  } | null
  applications: {
    total: number
    pending: number
    completed: number
    paid: number
  }
  notifications: {
    total: number
    unread: number
    read: number
  }
}

interface Institution {
  id: string
  name: string
  type: string
  province: string
  is_featured: boolean
  application_fee: number
  created_at: string
}

interface Bursary {
  id: string
  name: string
  provider: string
  amount: number
  type: string
  is_active: boolean
  application_deadline: string
}

interface Application {
  id: string
  user_id: string
  institution_name: string
  status: string
  payment_status: string
  created_at: string
  service_type: string
}

interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
}

export default function AdminPanel() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalInstitutions: 0,
    totalBursaries: 0,
    totalApplications: 0,
    pendingApplications: 0,
    completedProfiles: 0,
    totalRevenue: 0,
    activeNotifications: 0
  })

  // Data states
  const [users, setUsers] = useState<User[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [bursaries, setBursaries] = useState<Bursary[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  // UI states
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info'
  })

  // Admin authentication check
  useEffect(() => {
    const adminEmails = [
      'bhntshwcjc025@student.wethinkcode.co.za',
      'admin@apply4me.co.za',
      'bhekumusa@apply4me.co.za'
    ]

    // For development, allow access without strict authentication
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!isDevelopment && (!user || !adminEmails.includes(user.email || ''))) {
      router.push('/auth/signin')
      return
    }

    fetchAllData()
  }, [user, router])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      // Fetch all data using the new admin APIs
      const [
        usersRes,
        institutionsRes,
        bursariesRes,
        applicationsRes,
        notificationsRes
      ] = await Promise.all([
        fetch('/api/admin/manage-users').then(res => res.json()),
        fetch('/api/institutions').then(res => res.json()),
        fetch('/api/bursaries').then(res => res.json()),
        fetch('/api/admin/applications').then(res => res.json()),
        fetch('/api/admin/user-notifications').then(res => res.json())
      ])

      // Set data
      setUsers(usersRes.success ? usersRes.data.users : [])
      setInstitutions(institutionsRes.data || [])
      setBursaries(bursariesRes.data || [])
      setApplications(applicationsRes.success ? applicationsRes.data.applications : [])
      setNotifications(notificationsRes.success ? notificationsRes.data : [])

      // Calculate stats
      const userData = usersRes.success ? usersRes.data : { users: [], summary: {} }
      const applicationsData = applicationsRes.success ? applicationsRes.data.applications : []
      const pendingApps = applicationsData.filter((app: any) => app.status === 'pending').length || 0
      const totalRevenue = applicationsData.reduce((sum: number, app: any) => {
        return sum + (app.payment_status === 'paid' ? (app.total_amount || 250) : 0)
      }, 0) || 0

      setStats({
        totalUsers: userData.users.length,
        totalInstitutions: institutionsRes.data?.length || 0,
        totalBursaries: bursariesRes.data?.length || 0,
        totalApplications: applicationsData.length,
        pendingApplications: pendingApps,
        completedProfiles: userData.summary?.usersWithProfiles || 0,
        totalRevenue,
        activeNotifications: notificationsRes.success ? notificationsRes.data.filter((n: any) => !n.read).length : 0
      })

      toast({
        title: "Data Loaded",
        description: "All admin data has been successfully loaded.",
      })

    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast({
        title: "Error",
        description: "Failed to load admin data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all notification fields.",
        variant: "destructive",
      })
      return
    }

    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user to send notification to.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/admin/user-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_ids: selectedUsers,
          title: notificationForm.title,
          message: notificationForm.message,
          type: notificationForm.type
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send notification')
      }

      toast({
        title: "Success",
        description: result.message,
      })

      // Reset form
      setNotificationForm({ title: '', message: '', type: 'info' })
      setSelectedUsers([])

      // Refresh data
      fetchAllData()

    } catch (error) {
      console.error('Error sending notification:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send notification. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Apply4Me Admin Panel
              </h1>
              <p className="text-muted-foreground">Complete platform management and user communication</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={fetchAllData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Badge variant="secondary">
                {user?.email}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="institutions">Institutions</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="bursaries">Bursaries</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Institutions</p>
                      <p className="text-2xl font-bold">{stats.totalInstitutions}</p>
                    </div>
                    <GraduationCap className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bursaries</p>
                      <p className="text-2xl font-bold">{stats.totalBursaries}</p>
                    </div>
                    <Award className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Applications</p>
                      <p className="text-2xl font-bold">{stats.totalApplications}</p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => setActiveTab('users')} className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users ({stats.totalUsers})
                  </Button>
                  <Button onClick={() => setActiveTab('institutions')} className="w-full justify-start" variant="outline">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Manage Institutions ({stats.totalInstitutions})
                  </Button>
                  <Button onClick={() => setActiveTab('notifications')} className="w-full justify-start" variant="outline">
                    <Bell className="h-4 w-4 mr-2" />
                    Send Notifications
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pending Applications</span>
                    <Badge variant="secondary">{stats.pendingApplications}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                    <Badge variant="secondary">R{stats.totalRevenue.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Notifications</span>
                    <Badge variant="secondary">{stats.activeNotifications}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserManagement
              users={users}
              onRefresh={fetchAllData}
              onUserSelect={setSelectedUsers}
              selectedUsers={selectedUsers}
              onSwitchToNotifications={() => setActiveTab('notifications')}
            />
          </TabsContent>

          {/* Institutions Tab */}
          <TabsContent value="institutions" className="space-y-6">
            <InstitutionManagement
              institutions={institutions}
              onRefresh={fetchAllData}
            />
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6">
            <ProgramManagement
              institutions={institutions}
              onRefresh={fetchAllData}
            />
          </TabsContent>

          {/* Bursaries Tab */}
          <TabsContent value="bursaries" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Bursary Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Bursary
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Bursaries ({bursaries.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bursaries.map((bursary) => (
                    <div key={bursary.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{bursary.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {bursary.provider} • R{bursary.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Deadline: {new Date(bursary.application_deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={bursary.is_active ? "default" : "secondary"}>
                          {bursary.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <ApplicationManagement
              applications={applications}
              onRefresh={fetchAllData}
            />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Send Notification */}
              <Card>
                <CardHeader>
                  <CardTitle>Send Notification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                      placeholder="Notification title..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                      placeholder="Notification message..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      value={notificationForm.type}
                      onChange={(e) => setNotificationForm({...notificationForm, type: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  {/* Recipients Selection */}
                  <div>
                    <Label>Select Recipients</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded-md">
                        <span className="text-sm font-medium">
                          {selectedUsers.length} user(s) selected
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUsers(users.map(u => u.id))}
                          >
                            Select All
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUsers([])}
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>

                      {/* User Selection List */}
                      <div className="max-h-64 overflow-y-auto border rounded-md p-2 space-y-2">
                        {users.map((user) => (
                          <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, user.id])
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                                }
                              }}
                              className="rounded"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{user.email}</p>
                              <p className="text-xs text-muted-foreground">
                                {user.profile?.first_name && user.profile?.last_name
                                  ? `${user.profile.first_name} ${user.profile.last_name}`
                                  : 'No profile name'
                                }
                              </p>
                            </div>
                            <Badge variant={user.last_sign_in_at ? "default" : "secondary"} className="text-xs">
                              {user.last_sign_in_at ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        ))}

                        {users.length === 0 && (
                          <div className="text-center py-4 text-muted-foreground">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No users available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={sendNotification}
                    className="w-full"
                    disabled={selectedUsers.length === 0 || !notificationForm.title || !notificationForm.message}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification to {selectedUsers.length} User(s)
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.slice(0, 5).map((notification) => (
                      <div key={notification.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <Badge variant={notification.read ? "secondary" : "default"}>
                            {notification.read ? "Read" : "Unread"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
