/**
 * Theme management composable
 * Provides primary color switching functionality
 */

export type ThemeColor = 'teal' | 'blue' | 'indigo' | 'violet' | 'rose' | 'orange' | 'emerald'

export interface ThemeColorOption {
  label: string
  value: ThemeColor
  class: string
}

export const themeColors: ThemeColorOption[] = [
  { label: '青色', value: 'teal', class: 'bg-teal-500' },
  { label: '蓝色', value: 'blue', class: 'bg-blue-500' },
  { label: '靛蓝', value: 'indigo', class: 'bg-indigo-500' },
  { label: '紫色', value: 'violet', class: 'bg-violet-500' },
  { label: '玫红', value: 'rose', class: 'bg-rose-500' },
  { label: '橙色', value: 'orange', class: 'bg-orange-500' },
  { label: '翠绿', value: 'emerald', class: 'bg-emerald-500' },
]

const THEME_STORAGE_KEY = 'zeta-theme-color'

export function useTheme() {
  const appConfig = useAppConfig()

  // Current primary color
  const primaryColor = computed({
    get: () => appConfig.ui.colors.primary as ThemeColor,
    set: (value: ThemeColor) => {
      appConfig.ui.colors.primary = value
    },
  })

  // Initialize theme from localStorage
  function initTheme() {
    if (import.meta.client) {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeColor | null
      if (saved && themeColors.some(c => c.value === saved)) {
        primaryColor.value = saved
      }
    }
  }

  // Set primary color and persist to localStorage
  function setPrimaryColor(color: ThemeColor) {
    primaryColor.value = color
    if (import.meta.client) {
      localStorage.setItem(THEME_STORAGE_KEY, color)
    }
  }

  // Get current theme option
  const currentTheme = computed(() => {
    return themeColors.find(c => c.value === primaryColor.value) || themeColors[0]
  })

  return {
    primaryColor,
    themeColors,
    currentTheme,
    initTheme,
    setPrimaryColor,
  }
}
