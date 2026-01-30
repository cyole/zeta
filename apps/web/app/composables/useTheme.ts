/**
 * Theme management composable
 * Based on Nuxt UI official implementation
 * @see https://github.com/nuxt/ui/blob/v4/docs/app/composables/useTheme.ts
 */

// Primary colors - Tailwind CSS palette (excludes black, white, transparent, neutrals)
export type PrimaryColor
  = | 'red' | 'orange' | 'amber' | 'yellow' | 'lime'
    | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue'
    | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose'

// Neutral colors
export type NeutralColor = 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone'

// Radius values
export type RadiusValue = 0 | 0.125 | 0.25 | 0.375 | 0.5

export interface ColorOption {
  label: string
  value: string
  class: string
}

// Neutral color options
export const neutralColors: ColorOption[] = [
  { label: 'Slate', value: 'slate', class: 'bg-slate-500' },
  { label: 'Gray', value: 'gray', class: 'bg-gray-500' },
  { label: 'Zinc', value: 'zinc', class: 'bg-zinc-500' },
  { label: 'Neutral', value: 'neutral', class: 'bg-neutral-500' },
  { label: 'Stone', value: 'stone', class: 'bg-stone-500' },
]

// Primary color options (excluding black - handled separately)
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
  blackAsPrimary: 'zeta-theme-black-as-primary',
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

  // Current radius
  const radius = computed({
    get: () => ((appConfig.ui as Record<string, unknown>).radius ?? 0.25) as RadiusValue,
    set: (value: RadiusValue) => {
      (appConfig.ui as Record<string, unknown>).radius = value
      if (import.meta.client) {
        document.documentElement.style.setProperty('--ui-radius', `${value}rem`)
      }
    },
  })

  // Black as primary flag - special handling like Nuxt UI
  const blackAsPrimary = ref(false)

  // Apply black as primary CSS (only use class, let CSS handle light/dark)
  function applyBlackAsPrimary(enabled: boolean) {
    if (!import.meta.client)
      return

    if (enabled) {
      document.documentElement.classList.add('black-as-primary')
    }
    else {
      document.documentElement.classList.remove('black-as-primary')
    }
  }

  // Set black as primary
  function setBlackAsPrimary(value: boolean) {
    blackAsPrimary.value = value
    applyBlackAsPrimary(value)
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEYS.blackAsPrimary, String(value))
    }
  }

  // Initialize theme from localStorage
  function initTheme() {
    if (!import.meta.client)
      return

    // Load primary color, or set default to teal
    const savedPrimary = localStorage.getItem(STORAGE_KEYS.primary) as PrimaryColor | null
    if (savedPrimary && primaryColors.some(c => c.value === savedPrimary)) {
      primaryColor.value = savedPrimary
    }
    else {
      // No saved value - ensure default is teal
      primaryColor.value = 'teal'
    }

    // Load neutral color, or set default to neutral
    const savedNeutral = localStorage.getItem(STORAGE_KEYS.neutral) as NeutralColor | null
    if (savedNeutral && neutralColors.some(c => c.value === savedNeutral)) {
      neutralColor.value = savedNeutral
    }
    else {
      // No saved value - ensure default is neutral
      neutralColor.value = 'neutral'
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

    // Load black as primary
    const savedBlackAsPrimary = localStorage.getItem(STORAGE_KEYS.blackAsPrimary)
    if (savedBlackAsPrimary === 'true') {
      blackAsPrimary.value = true
      applyBlackAsPrimary(true)
    }
  }

  // Set primary color and persist
  function setPrimaryColor(color: PrimaryColor) {
    primaryColor.value = color
    // When selecting a color, disable black as primary
    setBlackAsPrimary(false)
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

  // Check if there are CSS changes (need to export CSS)
  const hasCSSChanges = computed(() => {
    return radius.value !== 0.25 || blackAsPrimary.value
  })

  // Check if there are app config changes
  const hasAppConfigChanges = computed(() => {
    return primaryColor.value !== 'teal' || neutralColor.value !== 'neutral'
  })

  // Reset to defaults
  function resetTheme() {
    setPrimaryColor('teal')
    setNeutralColor('neutral')
    setRadius(0.25)
    setBlackAsPrimary(false)

    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEYS.primary)
      localStorage.removeItem(STORAGE_KEYS.neutral)
      localStorage.removeItem(STORAGE_KEYS.radius)
      localStorage.removeItem(STORAGE_KEYS.blackAsPrimary)
    }
  }

  // Generate CSS export (for radius and black as primary)
  function exportCSS(): string {
    const lines = [
      '@import "tailwindcss";',
      '@import "@nuxt/ui";',
    ]

    const rootLines: string[] = []

    if (radius.value !== 0.25) {
      rootLines.push(`  --ui-radius: ${radius.value}rem;`)
    }

    if (blackAsPrimary.value) {
      rootLines.push('  --ui-primary: var(--color-black);')
    }

    if (rootLines.length) {
      lines.push('', ':root {', ...rootLines, '}')
    }

    if (blackAsPrimary.value) {
      lines.push('', '.dark {', '  --ui-primary: var(--color-white);', '}')
    }

    return lines.join('\n')
  }

  // Generate app.config.ts export
  function exportAppConfig(): string {
    const config: { ui?: { colors: { primary?: string, neutral?: string } } } = {}

    if (primaryColor.value !== 'teal' || neutralColor.value !== 'neutral') {
      config.ui = { colors: {} }
      if (primaryColor.value !== 'teal') {
        config.ui.colors.primary = primaryColor.value
      }
      if (neutralColor.value !== 'neutral') {
        config.ui.colors.neutral = neutralColor.value
      }
    }

    const configString = JSON.stringify(config, null, 2)
      .replace(/"([^"]+)":/g, '$1:')
      .replace(/"/g, '\'')

    return `export default defineAppConfig(${configString})`
  }

  // Get current primary color option
  const currentPrimaryOption = computed(() => {
    if (blackAsPrimary.value) {
      return { label: 'Black', value: 'black', class: 'bg-black' }
    }
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
    blackAsPrimary,
    // Options
    primaryColors,
    neutralColors,
    radiusOptions,
    // Current options
    currentPrimaryOption,
    currentNeutralOption,
    // Computed
    hasCSSChanges,
    hasAppConfigChanges,
    // Methods
    initTheme,
    setPrimaryColor,
    setNeutralColor,
    setRadius,
    setBlackAsPrimary,
    resetTheme,
    exportCSS,
    exportAppConfig,
  }
}
