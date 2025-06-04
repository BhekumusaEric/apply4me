'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  FileText,
  Award,
  Search,
  Filter,
  Download,
  UserPlus
} from 'lucide-react'

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

interface UserManagementProps {
  users: User[]
  onRefresh: () => void
  onUserSelect: (userIds: string[]) => void
  selectedUsers: string[]
  onSwitchToNotifications?: () => void
}

export function UserManagement({ users, onRefresh, onUserSelect, selectedUsers, onSwitchToNotifications }: UserManagementProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  })

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.includes(searchTerm)

    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && user.last_sign_in_at) ||
                         (filterStatus === 'inactive' && !user.last_sign_in_at) ||
                         (filterStatus === 'verified' && user.profile?.is_verified) ||
                         (filterStatus === 'unverified' && !user.profile?.is_verified)

    return matchesSearch && matchesFilter
  })

  const handleUserAction = async (userId: string, action: string, data?: any) => {
    try {
      const response = await fetch('/api/admin/manage-users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          action,
          ...data
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Action failed')
      }

      toast({
        title: "Success",
        description: result.message,
      })

      onRefresh()

    } catch (error) {
      console.error('Error performing user action:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Action failed. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Email and password are required.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/admin/manage-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          user_metadata: {
            first_name: newUser.firstName,
            last_name: newUser.lastName
          }
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user')
      }

      toast({
        title: "Success",
        description: "User created successfully.",
      })

      setNewUser({ email: '', password: '', firstName: '', lastName: '' })
      setShowCreateUser(false)
      onRefresh()

    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/manage-users?user_id=${userId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user')
      }

      toast({
        title: "Success",
        description: "User deleted successfully.",
      })

      onRefresh()

    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      onUserSelect([...selectedUsers, userId])
    } else {
      onUserSelect(selectedUsers.filter(id => id !== userId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onUserSelect(filteredUsers.map(user => user.id))
    } else {
      onUserSelect([])
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">User Management</h2>
        <div className="flex items-center gap-2">
          <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Create a new user account for the Apply4Me platform.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Secure password"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser}>
                    Create User
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Selected Users Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSwitchToNotifications}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
                <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Users ({filteredUsers.length})</span>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.email}</p>
                      {user.profile?.is_verified && (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {!user.email_confirmed_at && (
                        <Badge variant="destructive" className="text-xs">
                          <Mail className="h-3 w-3 mr-1" />
                          Unconfirmed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {user.profile?.first_name && user.profile?.last_name
                          ? `${user.profile.first_name} ${user.profile.last_name}`
                          : 'No profile name'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {user.id.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </div>
                      {user.last_sign_in_at && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3" />
                          Last seen: {new Date(user.last_sign_in_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Stats */}
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      {user.applications.total} apps
                    </Badge>
                    {user.profile && (
                      <Badge variant="outline" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        {user.profile.profile_completeness}% complete
                      </Badge>
                    )}
                    {user.notifications.unread > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {user.notifications.unread} unread
                      </Badge>
                    )}
                  </div>

                  {/* Status */}
                  <Badge variant={user.last_sign_in_at ? "default" : "secondary"}>
                    {user.last_sign_in_at ? "Active" : "Inactive"}
                  </Badge>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => {
                        setSelectedUser(user)
                        setShowUserDetails(true)
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction(user.id, 'confirm_email')}>
                        <Mail className="h-4 w-4 mr-2" />
                        Confirm Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleUserAction(user.id, 'ban_user', { ban_duration: '24h' })}>
                        <Ban className="h-4 w-4 mr-2" />
                        Ban User (24h)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found matching your criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>User ID</Label>
                  <p className="text-sm font-mono">{selectedUser.id}</p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm">{new Date(selectedUser.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Last Sign In</Label>
                  <p className="text-sm">
                    {selectedUser.last_sign_in_at
                      ? new Date(selectedUser.last_sign_in_at).toLocaleString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>

              {selectedUser.profile && (
                <div>
                  <Label>Profile Information</Label>
                  <div className="mt-2 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Name</Label>
                        <p className="text-sm">
                          {selectedUser.profile.first_name} {selectedUser.profile.last_name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs">Completeness</Label>
                        <p className="text-sm">{selectedUser.profile.profile_completeness}%</p>
                      </div>
                      <div>
                        <Label className="text-xs">Verified</Label>
                        <p className="text-sm">{selectedUser.profile.is_verified ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label>Application Statistics</Label>
                <div className="mt-2 grid grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold">{selectedUser.applications.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold">{selectedUser.applications.pending}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold">{selectedUser.applications.completed}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold">{selectedUser.applications.paid}</p>
                    <p className="text-xs text-muted-foreground">Paid</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Notification Statistics</Label>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold">{selectedUser.notifications.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold">{selectedUser.notifications.unread}</p>
                    <p className="text-xs text-muted-foreground">Unread</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold">{selectedUser.notifications.read}</p>
                    <p className="text-xs text-muted-foreground">Read</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
