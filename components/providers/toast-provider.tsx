"use client"

import { Toaster } from "sonner"
import { useTheme } from "next-themes"

export function ToastProvider() {
  const { theme } = useTheme()

  return (
    <Toaster
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      position="top-right"
      richColors
      expand={true}
      duration={4000}
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          fontSize: '14px',
          padding: '12px 16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        className: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
        descriptionClassName: 'group-[.toast]:text-muted-foreground',

      }}
    />
  )
}
