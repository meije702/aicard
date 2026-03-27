// Toast manager hook — manages notification toasts with auto-dismiss and exit animations.
// Exposes addToast to window.__aicard_toast for the recipe runner to surface notifications.

import { useState, useEffect } from 'react'

export interface Toast {
  id: number
  message: string
  type: 'info' | 'warning' | 'error'
  persistent?: boolean
  exiting?: boolean
}

let toastCounter = 0

export function useToastManager() {
  const [toasts, setToasts] = useState<Toast[]>([])

  function addToast(message: string, type: Toast['type'] = 'info') {
    const id = ++toastCounter
    const persistent = type === 'error'
    setToasts(prev => [...prev, { id, message, type, persistent }])
    if (!persistent) {
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
      }, 5500)
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 6000)
    }
  }

  function dismissToast(id: number) {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 400)
  }

  // Expose addToast for the recipe runner
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__aicard_toast = addToast
  }, [])

  return { toasts, addToast, dismissToast }
}
