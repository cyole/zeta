/**
 * Theme management composable
 * Provides primary color, neutral color, and radius switching functionality
 */

// Primary colors - Tailwind CSS full palette (17 colors)
export type PrimaryColor =
  | 'red' | 'orange' | 'amber' | 'yellow' | 'lime'
  | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue'
  | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose'

// Neutral colors (5 colors)
export type NeutralColor = 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone'

// Radius values
export type RadiusValue = 0 | 0.125 | 0.25 | 0.375 | 0.5

export interface ColorOption {
  label: string
  value: string
  class: string
}

// Primary color options
export const primaryColors: ColorOption[] = [
  { label: 'Red', value: 'red', class: 'bg-red-500' },
  { label: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { label: 'Amber', value: 'amber', class: 'bg-amber-500' },
  { label: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
  { label: 'Lime', value: 'lime', class: 'bg-lime-500' },
  { label: 'Green', value: 'green', class: 'bg-green-500' },
  { label: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
  { label: 'Teal', value: 'teal', class: 'bg-teal-500' },
  { label: 'Cyan', value: 'cyan', class: 'bg-cyan-500' },
  { label: 'Sky', value: 'sky', class: 'bg-sky-500' },
  { label: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { label: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
  { label: 'Violet', value: 'violet', class: 'bg-violet-500' },
  { label: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { label: 'Fuchsia', value: 'fuchsia', class: 'bg-fuchsia-500' },
  { label: 'Pink', value: 'pink', class: 'bg-pink-500' },
  { label: 'Rose', value: 'rose', class: 'bg-rose-500' },
]

// Neutral color options
export const neutralColors: ColorOption[] = [
  { label: 'Slate', value: 'slate', class: 'bg-slate-500' },
  { label: 'Gray', value: 'gray', class: 'bg-gray-500' },
  { label: 'Zinc', value: 'zinc', class: 'bg-zinc-500' },
  { label: 'Neutral', value: 'neutral', class: 'bg-neutral-500' },
  { label: 'Stone', value: 'stone', class: 'bg-stone-500' },
]

// Radius options
export const radiusOptions: { label: string, value: RadiusValue }[] = [
  { label: '0', value: 0 },
  { label: '0.125', value: 0.125 },
  { label: '0.25', value: 0.25 },
  { label: '0.375', value: 0.375 },
  { label: '0.5', value: 0.5 },
]

const STORAGE_KEYS = {
  primary: 'zeta-theme-primary',
  neutral: 'zeta-theme-neutral',
  radius: 'zeta-theme-radius',
}

export function useTheme() {
  const appConfig = useAppConfig()

  // Current primary color
  const primaryColor = computed({
    get: () => appConfig.ui.colors.primary as PrimaryColor,
    set: (value: PrimaryColor) => {
      appConfig.ui.colors.primary = value
    },
  })

  // Current neutral color
  const neutralColor = computed({
    get: () => appConfig.ui.colors.neutral as NeutralColor,
    set: (value: NeutralColor) => {
      appConfig.ui.colors.neutral = value
    },
  })

  // Current radius (use type assertion for dynamic property)
  const radius = computed({
    get: () => ((appConfig.ui as Record<string, unknown>).radius ?? 0.25) as RadiusValue,
    set: (value: RadiusValue) => {
      (appConfig.ui as Record<string, unknown>).radius = value
      // Apply radius CSS variable
      if (import.meta.client) {
        document.documentElement.style.setProperty('--ui-radius', `${value}rem`)
      }
    },
  })

  // Initialize theme from localStorage
  function initTheme() {
    if (import.meta.client) {
      // Load primary color
      const savedPrimary = localStorage.getItem(STORAGE_KEYS.primary) as PrimaryColor | null
      if (savedPrimary && primaryColors.some(c => c.value === savedPrimary)) {
        primaryColor.value = savedPrimary
      }

      // Load neutral color
      const savedNeutral = localStorage.getItem(STORAGE_KEYS.neutral) as NeutralColor | null
      if (savedNeutral && neutralColors.some(c => c.value === savedNeutral)) {
        neutralColor.value = savedNeutral
      }

      // Load radius
      const savedRadius = localStorage.getItem(STORAGE_KEYS.radius)
      if (savedRadius !== null) {
        const radiusValue = Number.parseFloat(savedRadius) as RadiusValue
        if (radiusOptions.some(r => r.value === radiusValue)) {
          radius.value = radiusValue
        }
      }
      else {
        // Apply default radius
        document.documentElement.style.setProperty('--ui-radius', `${radius.value}rem`)
      }
    }
  }

  // Set primary color and persist
  function setPrimaryColor(color: PrimaryColor) {
    primaryColor.value = color
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEYS.primary, color)
    }
  }

  // Set neutral color and persist
  function setNeutralColor(color: NeutralColor) {
    neutralColor.value = color
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEYS.neutral, color)
    }
  }

  // Set radius and persist
  function setRadius(value: RadiusValue) {
    radius.value = value
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEYS.radius, String(value))
    }
  }

  // Reset to defaults
  function resetTheme() {
    setPrimaryColor('teal')
    setNeutralColor('neutral')
    setRadius(0.25)
  }

  // Generate export config string
  function generateExportConfig(): string {
    return `export default defineAppConfig({
  ui: {
    colors: {
      primary: '${primaryColor.value}',
      neutral: '${neutralColor.value}',
    },
    radius: ${radius.value},
  },
})`
  }

  // Get current primary color option
  const currentPrimaryOption = computed(() => {
    return primaryColors.find(c => c.value === primaryColor.value) || primaryColors[7] // default teal
  })

  // Get current neutral color option
  const currentNeutralOption = computed(() => {
    return neutralColors.find(c => c.value === neutralColor.value) || neutralColors[3] // default neutral
  })

  return {
    // State
    primaryColor,
    neutralColor,
    radius,
    // Options
    primaryColors,
    neutralColors,
    radiusOptions,
    // Current options
    currentPrimaryOption,
    currentNeutralOption,
    // Methods
    initTheme,
    setPrimaryColor,
    setNeutralColor,
    setRadius,
    resetTheme,
    generateExportConfig,
  }
}
