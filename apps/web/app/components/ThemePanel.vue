<script setup lang="ts">
import type { NeutralColor, PrimaryColor, RadiusValue } from '~/composables/useTheme'

const {
  primaryColor,
  neutralColor,
  radius,
  blackAsPrimary,
  primaryColors,
  neutralColors,
  radiusOptions,
  setPrimaryColor,
  setNeutralColor,
  setRadius,
  setBlackAsPrimary,
  resetTheme,
  hasCSSChanges,
  hasAppConfigChanges,
  exportCSS,
  exportAppConfig,
  initTheme,
} = useTheme()

const colorMode = useColorMode()
const toast = useToast()

// Panel open state
const isOpen = ref(false)

// Initialize theme on mount
onMounted(() => {
  initTheme()
})

// Color mode options
const colorModeOptions = [
  { label: 'Light', value: 'light', icon: 'i-lucide-sun' },
  { label: 'Dark', value: 'dark', icon: 'i-lucide-moon' },
  { label: 'System', value: 'system', icon: 'i-lucide-monitor' },
]

// Copy CSS to clipboard
async function copyCSSConfig() {
  const config = exportCSS()
  await navigator.clipboard.writeText(config)
  toast.add({
    title: 'CSS copied to clipboard',
    icon: 'i-lucide-check',
    color: 'primary',
  })
}

// Copy app.config.ts to clipboard
async function copyAppConfig() {
  const config = exportAppConfig()
  await navigator.clipboard.writeText(config)
  toast.add({
    title: 'Config copied to clipboard',
    icon: 'i-lucide-check',
    color: 'primary',
  })
}
</script>

<template>
  <UPopover v-model:open="isOpen">
    <UButton
      variant="ghost"
      color="neutral"
      icon="i-lucide-palette"
      aria-label="Theme settings"
    />

    <template #content>
      <div class="w-72 p-4 space-y-5">
        <!-- Primary Color -->
        <div>
          <div class="flex items-center gap-1.5 mb-2.5">
            <span class="text-sm font-medium text-neutral-900 dark:text-white">Primary</span>
          </div>
          <div class="grid grid-cols-3 gap-1.5">
            <!-- Black option (special handling) -->
            <button
              type="button"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
              :class="[
                blackAsPrimary
                  ? 'bg-neutral-100 dark:bg-neutral-800 ring-1 ring-neutral-300 dark:ring-neutral-600'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
              ]"
              @click="setBlackAsPrimary(true)"
            >
              <span class="w-3 h-3 rounded-full shrink-0 bg-black dark:bg-white" />
              <span class="text-neutral-700 dark:text-neutral-300 truncate">Black</span>
            </button>
            <!-- Other colors -->
            <button
              v-for="color in primaryColors"
              :key="color.value"
              type="button"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
              :class="[
                !blackAsPrimary && primaryColor === color.value
                  ? 'bg-neutral-100 dark:bg-neutral-800 ring-1 ring-neutral-300 dark:ring-neutral-600'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
              ]"
              @click="setPrimaryColor(color.value as PrimaryColor)"
            >
              <span class="w-3 h-3 rounded-full shrink-0" :class="color.class" />
              <span class="text-neutral-700 dark:text-neutral-300 truncate">{{ color.label }}</span>
            </button>
          </div>
        </div>

        <!-- Neutral Color -->
        <div>
          <div class="flex items-center gap-1.5 mb-2.5">
            <span class="text-sm font-medium text-neutral-900 dark:text-white">Neutral</span>
          </div>
          <div class="grid grid-cols-3 gap-1.5">
            <button
              v-for="color in neutralColors"
              :key="color.value"
              type="button"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
              :class="[
                neutralColor === color.value
                  ? 'bg-neutral-100 dark:bg-neutral-800 ring-1 ring-neutral-300 dark:ring-neutral-600'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
              ]"
              @click="setNeutralColor(color.value as NeutralColor)"
            >
              <span class="w-3 h-3 rounded-full shrink-0" :class="color.class" />
              <span class="text-neutral-700 dark:text-neutral-300 truncate">{{ color.label }}</span>
            </button>
          </div>
        </div>

        <!-- Radius -->
        <div>
          <div class="flex items-center gap-1.5 mb-2.5">
            <span class="text-sm font-medium text-neutral-900 dark:text-white">Radius</span>
          </div>
          <div class="flex gap-1.5">
            <button
              v-for="option in radiusOptions"
              :key="option.value"
              type="button"
              class="flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors"
              :class="[
                radius === option.value
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700',
              ]"
              @click="setRadius(option.value as RadiusValue)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Color Mode -->
        <div>
          <div class="flex items-center gap-1.5 mb-2.5">
            <span class="text-sm font-medium text-neutral-900 dark:text-white">Color Mode</span>
          </div>
          <div class="flex gap-1.5">
            <button
              v-for="option in colorModeOptions"
              :key="option.value"
              type="button"
              class="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors"
              :class="[
                colorMode.preference === option.value
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700',
              ]"
              @click="colorMode.preference = option.value"
            >
              <UIcon :name="option.icon" class="w-3.5 h-3.5" />
              <span>{{ option.label }}</span>
            </button>
          </div>
        </div>

        <!-- Export -->
        <div>
          <div class="flex items-center justify-between mb-2.5">
            <span class="text-sm font-medium text-neutral-900 dark:text-white">Export</span>
            <button
              type="button"
              class="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Reset to defaults"
              @click="resetTheme"
            >
              <UIcon name="i-lucide-rotate-ccw" class="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>
          <div class="space-y-2">
            <!-- CSS Export (shown when CSS changes exist) -->
            <button
              v-if="hasCSSChanges"
              type="button"
              class="w-full flex items-center justify-between px-3 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              @click="copyCSSConfig"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-file-code" class="w-4 h-4 text-neutral-500" />
                <span class="text-sm text-neutral-700 dark:text-neutral-300">main.css</span>
              </div>
              <UIcon name="i-lucide-copy" class="w-4 h-4 text-neutral-400" />
            </button>
            <!-- App Config Export (shown when app config changes exist) -->
            <button
              v-if="hasAppConfigChanges"
              type="button"
              class="w-full flex items-center justify-between px-3 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              @click="copyAppConfig"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-file-code" class="w-4 h-4 text-neutral-500" />
                <span class="text-sm text-neutral-700 dark:text-neutral-300">app.config.ts</span>
              </div>
              <UIcon name="i-lucide-copy" class="w-4 h-4 text-neutral-400" />
            </button>
            <!-- No changes message -->
            <div
              v-if="!hasCSSChanges && !hasAppConfigChanges"
              class="text-xs text-neutral-500 text-center py-2"
            >
              Using default theme settings
            </div>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>
