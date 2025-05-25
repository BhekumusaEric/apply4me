// PWA installation and management utilities

export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

export const canInstallPWA = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered successfully:', registration)

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
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }
}

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    return permission
  }
  return 'denied'
}

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-192x192.svg',
      ...options
    })
  }
}

export const installPWA = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    let deferredPrompt: any = null

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
    })

    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt')
          resolve()
        } else {
          console.log('User dismissed the install prompt')
          reject(new Error('User dismissed install prompt'))
        }
        deferredPrompt = null
      })
    } else {
      reject(new Error('Install prompt not available'))
    }
  })
}

export const checkForUpdates = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      await registration.update()
      return registration.waiting !== null
    }
  }
  return false
}

export const skipWaiting = (): void => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' })
  }
}

// Offline detection
export const isOnline = (): boolean => {
  return navigator.onLine
}

export const onOnlineStatusChange = (callback: (isOnline: boolean) => void): (() => void) => {
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

// Background sync for offline forms
export const scheduleBackgroundSync = (tag: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        return (registration as any).sync.register(tag)
      }).then(() => {
        console.log('Background sync registered')
        resolve()
      }).catch((error) => {
        console.error('Background sync registration failed:', error)
        reject(error)
      })
    } else {
      reject(new Error('Background sync not supported'))
    }
  })
}

// Store data for offline use
export const storeOfflineData = (key: string, data: any): void => {
  try {
    localStorage.setItem(`offline_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (error) {
    console.error('Failed to store offline data:', error)
  }
}

export const getOfflineData = (key: string): any => {
  try {
    const stored = localStorage.getItem(`offline_${key}`)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Check if data is less than 24 hours old
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed.data
      } else {
        // Remove expired data
        localStorage.removeItem(`offline_${key}`)
      }
    }
  } catch (error) {
    console.error('Failed to retrieve offline data:', error)
  }
  return null
}

export const clearOfflineData = (key?: string): void => {
  if (key) {
    localStorage.removeItem(`offline_${key}`)
  } else {
    // Clear all offline data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('offline_')) {
        localStorage.removeItem(key)
      }
    })
  }
}
