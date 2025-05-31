'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  Menu,
  X,
  GraduationCap,
  User,
  LogOut,
  Home,
  Users,
  FileText,
  CreditCard,
  Bell,
  Settings,
  BarChart3,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/app/providers'
import { createClient } from '@/lib/supabase'
import RealTimeNotificationCenter from '@/components/notifications/RealTimeNotificationCenter'

export function AdminNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin/enhanced', icon: BarChart3 },
    { name: 'Student Profiles', href: '/admin/profiles', icon: Users },
    { name: 'Applications', href: '/admin/applications', icon: FileText },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo & Back Button */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <Link href="/admin/enhanced" className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-sa-green" />
            <span className="text-lg font-bold text-sa-green">Apply4Me</span>
            <span className="text-sm text-muted-foreground">Admin</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {adminNavigation.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.name}
                variant={isActive(item.href) ? "default" : "ghost"}
                size="sm"
                asChild
                className={isActive(item.href) ? "bg-primary text-primary-foreground" : ""}
              >
                <Link href={item.href} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              </Button>
            )
          })}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />

          {/* Admin Notification Bell */}
          {user && <RealTimeNotificationCenter userId={user.id} />}

          {/* Main Site Link */}
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Main Site
            </Link>
          </Button>

          {user ? (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-2">
            {/* Admin Navigation */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground px-2 py-1">Admin Navigation</p>
              {adminNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.name}
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href={item.href} onClick={() => setIsMenuOpen(false)}>
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  </Button>
                )
              })}
            </div>

            {/* Divider */}
            <div className="border-t pt-4 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                  <Home className="h-4 w-4 mr-2" />
                  Main Site
                </Link>
              </Button>

              {user ? (
                <>
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

// Breadcrumb component for admin pages
export function AdminBreadcrumb({
  items
}: {
  items: { name: string; href?: string }[]
}) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Link href="/admin/enhanced" className="hover:text-primary">
        Admin
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <span>/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-primary">
              {item.name}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.name}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

// Layout wrapper for admin pages
export function AdminLayout({
  children,
  title,
  description,
  breadcrumb
}: {
  children: React.ReactNode
  title?: string
  description?: string
  breadcrumb?: { name: string; href?: string }[]
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="container py-6">
        {breadcrumb && <AdminBreadcrumb items={breadcrumb} />}
        {(title || description) && (
          <div className="mb-6">
            {title && <h1 className="text-3xl font-bold mb-2">{title}</h1>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
