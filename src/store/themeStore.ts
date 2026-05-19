import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const getSystemTheme = (): 'light' | 'dark' =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const getResolved = (theme: Theme): 'light' | 'dark' =>
  theme === 'system' ? getSystemTheme() : theme

const applyTheme = (resolved: 'light' | 'dark') => {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

// Load persisted theme or default to system
const initialTheme = (localStorage.getItem('theme') as Theme) || 'system'
const initialResolved = getResolved(initialTheme)
applyTheme(initialResolved)

export const useThemeStore = create<ThemeState>((set) => {
  // Listen for system theme changes when in system mode
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', (e) => {
    const state = useThemeStore.getState()
    if (state.theme === 'system') {
      const next = e.matches ? 'dark' : 'light'
      applyTheme(next)
      set({ resolved: next })
    }
  })

  return {
    theme: initialTheme,
    resolved: initialResolved,
    setTheme: (theme) => {
      localStorage.setItem('theme', theme)
      const resolved = getResolved(theme)
      applyTheme(resolved)
      set({ theme, resolved })
    },
  }
})
