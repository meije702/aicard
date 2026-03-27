// Theme hook — manages light/dark theme with localStorage persistence.
// Uses useLayoutEffect to apply the theme attribute before paint, preventing flash.

import { useState, useLayoutEffect } from 'react'

function getInitialTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('aicard:theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  // useLayoutEffect runs synchronously before paint, preventing a theme flash
  // on initial load. useEffect would apply after paint, briefly showing the
  // wrong theme on first render.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    try { localStorage.setItem('aicard:theme', next) } catch { /* cosmetic — safe to swallow */ }
  }

  return { theme, toggleTheme }
}
