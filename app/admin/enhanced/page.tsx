'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Upload,
  Download,
  Eye,
  RefreshCw,
  Award,
  Clock,
  FileText,
  Database,
  CheckCircle,
  BarChart3,
  Search,
  Filter,
  MoreHorizontal,
  Settings,
  Save,
  X,
  BookOpen,
  UserCheck,
  Building,
  CreditCard
} from 'lucide-react'
import { useAuth } from '@/app/providers'
import { createClient } from '@/lib/supabase'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LoadingSpinner, LoadingCard } from '@/components/ui/loading'
import { useToast } from '@/hooks/use-toast'
import {
  InstitutionsManager,
  BursariesManager,
  UsersManager,
  ProgramsManager,
  ApplicationsManager,
  AutomationManager,
  AnalyticsManager
} from '@/components/admin/manager-components'

// Types
interface Institution {
  id: string
  name: string
  type: 'university' | 'college' | 'tvet'
  province: string
  logo_url?: string
  description: string
  application_deadline?: string
  application_fee?: number
  required_documents: string[]
  contact_email?: string
  contact_phone?: string
  website_url?: string
  is_featured: boolean
  created_at: string
  updated_at: string
}

interface Bursary {
  id: string
  name: string
  provider: string
  type: 'national' | 'provincial' | 'sector' | 'institutional'
  field_of_study: string[]
  eligibility_criteria: string[]
  amount?: number
  application_deadline?: string
  application_url?: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  id_number?: string
  province?: string
  role: 'student' | 'admin'
  created_at: string
  updated_at: string
}

interface Program {
  id: string
  institution_id: string
  name: string
  field_of_study: string
  qualification_level: string
  duration_years: number
  requirements: string[]
  career_outcomes: string[]
  is_available: boolean
  created_at: string
  updated_at: string
}

interface Application {
  id: string
  user_id: string
  institution_id: string
  program_id?: string
  status: 'draft' | 'submitted' | 'processing' | 'completed'
  personal_details: any
  academic_records: any
  documents: any
  payment_status: 'pending' | 'paid' | 'failed'
  payment_reference?: string
  service_type: 'standard' | 'express'
  created_at: string
  updated_at: string
}

export default function EnhancedAdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Data states
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [bursaries, setBursaries] = useState<Bursary[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [applications, setApplications] = useState<Application[]>([])

  // UI states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEntity, setSelectedEntity] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [entityToDelete, setEntityToDelete] = useState<any>(null)

  // Stats
  const [stats, setStats] = useState({
    totalInstitutions: 0,
    totalBursaries: 0,
    totalUsers: 0,
    totalApplications: 0,
    totalRevenue: 0,
    successRate: 0
  })

  // Check if user is admin
  useEffect(() => {
    console.log('🔍 Admin access check:', { user: user?.email, hasUser: !!user })

    // For testing purposes, allow access without authentication
    // TODO: Re-enable authentication in production
    const allowTestAccess = true

    if (allowTestAccess) {
      console.log('🧪 Test mode: Allowing access without authentication')
      fetchAllData()
      return
    }

    if (!user) {
      console.log('❌ No user found, redirecting to signin')
      router.push('/auth/signin')
      return
    }

    const adminEmails = [
      'bhntshwcjc025@student.wethinkcode.co.za',
      'admin@apply4me.co.za',
      'bhekumusa@apply4me.co.za'
    ]

    console.log('📧 Checking admin access for:', user.email)
    console.log('✅ Allowed admin emails:', adminEmails)

    // For development, allow any authenticated user to access admin
    // In production, you can uncomment the strict check below
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isAdminEmail = adminEmails.includes(user.email || '')

    if (!isDevelopment && !isAdminEmail) {
      console.log('❌ Access denied - not an admin email')
      router.push('/')
      return
    }

    if (isDevelopment && !isAdminEmail) {
      console.log('⚠️ Development mode: Allowing access for non-admin user')
    }

    if (isAdminEmail) {
      console.log('✅ Admin access granted')
    }

    fetchAllData()
  }, [user, router])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Fetch all data in parallel
      const [
        institutionsRes,
        bursariesRes,
        usersRes,
        programsRes,
        applicationsRes
      ] = await Promise.all([
        supabase.from('institutions').select('*').order('created_at', { ascending: false }),
        supabase.from('bursaries').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('programs').select('*').order('created_at', { ascending: false }),
        supabase.from('applications').select('*').order('created_at', { ascending: false })
      ])

      setInstitutions(institutionsRes.data || [])
      setBursaries(bursariesRes.data || [])
      setUsers(usersRes.data || [])
      setPrograms(programsRes.data || [])
      setApplications(applicationsRes.data || [])

      // Calculate stats
      const totalRevenue = (applicationsRes.data || []).reduce((sum, app) => sum + (app.total_amount || 0), 0)
      const successfulApps = (applicationsRes.data || []).filter(app => app.status === 'completed').length
      const successRate = applicationsRes.data?.length ? (successfulApps / applicationsRes.data.length) * 100 : 0

      setStats({
        totalInstitutions: institutionsRes.data?.length || 0,
        totalBursaries: bursariesRes.data?.length || 0,
        totalUsers: usersRes.data?.length || 0,
        totalApplications: applicationsRes.data?.length || 0,
        totalRevenue,
        successRate: Math.round(successRate)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Loading enhanced admin dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🚀 Unified Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete database management with automation, analytics, and full CRUD operations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Institutions</p>
                  <p className="text-2xl font-bold">{stats.totalInstitutions}</p>
                </div>
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bursaries</p>
                  <p className="text-2xl font-bold">{stats.totalBursaries}</p>
                </div>
                <Award className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                </div>
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">R{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.successRate}%</p>
                </div>
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">💳 Payments</TabsTrigger>
            <TabsTrigger value="institutions">Institutions</TabsTrigger>
            <TabsTrigger value="bursaries">Bursaries</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  💳 Payment Verification Center
                </CardTitle>
                <CardDescription>
                  Verify student payments and manage payment-related tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => router.push('/admin/payments')}
                    className="h-20 flex-col bg-green-600 hover:bg-green-700"
                  >
                    <CreditCard className="h-6 w-6 mb-2" />
                    <span className="font-medium">Verify Payments</span>
                    <span className="text-xs opacity-90">Review pending payments</span>
                  </Button>

                  <Button
                    onClick={() => window.open('/admin/payments?status=completed', '_blank')}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <CheckCircle className="h-6 w-6 mb-2" />
                    <span className="font-medium">Verified Payments</span>
                    <span className="text-xs opacity-70">View completed verifications</span>
                  </Button>

                  <Button
                    onClick={() => window.open('/admin/payments?status=failed', '_blank')}
                    variant="outline"
                    className="h-20 flex-col"
                  >
                    <X className="h-6 w-6 mb-2" />
                    <span className="font-medium">Failed Payments</span>
                    <span className="text-xs opacity-70">Review rejected payments</span>
                  </Button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🔧 Payment Verification Process:</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• <strong>Step 1:</strong> Review pending payment details and student information</li>
                    <li>• <strong>Step 2:</strong> Verify payment method and reference number</li>
                    <li>• <strong>Step 3:</strong> Add verification notes (optional) and approve/reject</li>
                    <li>• <strong>Step 4:</strong> User gets automatically notified of verification status</li>
                    <li>• <strong>Step 5:</strong> Application status updates automatically upon verification</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">✅ Features Available:</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Real-time payment verification with instant user notifications</li>
                    <li>• Support for card payments (Yoco), EFT, TymeBank Pay, and mobile payments</li>
                    <li>• Comprehensive audit trail for all verification actions</li>
                    <li>• Bulk verification capabilities for efficient processing</li>
                    <li>• Integration with student notification system</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => router.push('/admin/payments')} className="w-full justify-start bg-green-600 hover:bg-green-700">
                    <CreditCard className="h-4 w-4 mr-2" />
                    💳 Verify Payments
                  </Button>
                  <Button onClick={() => setActiveTab('institutions')} className="w-full justify-start" variant="outline">
                    <Building className="h-4 w-4 mr-2" />
                    Manage Institutions
                  </Button>
                  <Button onClick={() => setActiveTab('bursaries')} className="w-full justify-start" variant="outline">
                    <Award className="h-4 w-4 mr-2" />
                    Manage Bursaries
                  </Button>
                  <Button onClick={() => setActiveTab('users')} className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button onClick={() => setActiveTab('automation')} className="w-full justify-start" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Database & Automation
                  </Button>
                  <Button onClick={() => setActiveTab('analytics')} className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button onClick={fetchAllData} className="w-full justify-start" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh All Data
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📊 Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Enhanced admin interface merged</p>
                        <p className="text-xs text-muted-foreground">Just now</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Automation tools integrated</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Analytics dashboard added</p>
                        <p className="text-xs text-muted-foreground">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Full CRUD operations enabled</p>
                        <p className="text-xs text-muted-foreground">10 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="institutions">
            <InstitutionsManager
              institutions={institutions}
              onRefresh={fetchAllData}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </TabsContent>

          <TabsContent value="bursaries">
            <BursariesManager
              bursaries={bursaries}
              onRefresh={fetchAllData}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </TabsContent>

          <TabsContent value="users">
            <UsersManager
              users={users}
              onRefresh={fetchAllData}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </TabsContent>

          <TabsContent value="programs">
            <ProgramsManager
              programs={programs}
              institutions={institutions}
              onRefresh={fetchAllData}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </TabsContent>

          <TabsContent value="applications">
            <ApplicationsManager
              applications={applications}
              onRefresh={fetchAllData}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </TabsContent>

          <TabsContent value="automation">
            <AutomationManager onRefresh={fetchAllData} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsManager stats={stats} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
