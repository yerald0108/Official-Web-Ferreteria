import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  isDark: boolean
  toggle: () => void
}

function applyTheme(isDark: boolean) {
  if (isDark) document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      isDark: false,
      toggle: () => {
        const next = !get().isDark
        set({ isDark: next })
        applyTheme(next)
      },
    }),
    {
      name: 'ferreteria-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.isDark)
      },
    }
  )
)