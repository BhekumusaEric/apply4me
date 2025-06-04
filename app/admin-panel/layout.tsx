import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apply4Me Admin Panel',
  description: 'Comprehensive admin panel for managing Apply4Me platform',
}

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
