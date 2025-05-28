'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered successfully:', registration.scope)

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, prompt user to refresh
                  if (confirm('New version available! Refresh to update?')) {
                    window.location.reload()
                  }
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error)
        })

      // Handle PWA install prompt
      let deferredPrompt: any

      const hideInstallBanner = () => {
        const banner = document.getElementById('pwa-install-banner')
        if (banner) {
          banner.remove()
        }
      }

      const showInstallBanner = () => {
        // Create install banner if it doesn't exist
        if (!document.getElementById('pwa-install-banner')) {
          const banner = document.createElement('div')
          banner.id = 'pwa-install-banner'
          banner.innerHTML = `
            <div style="
              position: fixed;
              bottom: 20px;
              left: 20px;
              right: 20px;
              background: #007A4D;
              color: white;
              padding: 16px;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              z-index: 1000;
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-family: system-ui, -apple-system, sans-serif;
            ">
              <div>
                <div style="font-weight: 600; margin-bottom: 4px;">📱 Install Apply4Me</div>
                <div style="font-size: 14px; opacity: 0.9;">Get the full app experience!</div>
              </div>
              <div>
                <button id="pwa-install-btn" style="
                  background: white;
                  color: #007A4D;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 6px;
                  font-weight: 600;
                  margin-right: 8px;
                  cursor: pointer;
                ">Install</button>
                <button id="pwa-dismiss-btn" style="
                  background: transparent;
                  color: white;
                  border: 1px solid rgba(255,255,255,0.3);
                  padding: 8px 12px;
                  border-radius: 6px;
                  cursor: pointer;
                ">×</button>
              </div>
            </div>
          `
          document.body.appendChild(banner)

          // Add event listeners
          document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
            if (deferredPrompt) {
              deferredPrompt.prompt()
              const { outcome } = await deferredPrompt.userChoice
              console.log(`PWA install outcome: ${outcome}`)
              deferredPrompt = null
              hideInstallBanner()
            }
          })

          document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
            hideInstallBanner()
          })
        }
      }

      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault()
        // Stash the event so it can be triggered later
        deferredPrompt = e

        // Show install button or banner
        console.log('💾 PWA install prompt available')

        // You can show a custom install button here
        showInstallBanner()
      })

      window.addEventListener('appinstalled', () => {
        console.log('🎉 PWA was installed successfully')
        // Hide install banner
        hideInstallBanner()
      })
    }
  }, [])

  return null // This component doesn't render anything
}
