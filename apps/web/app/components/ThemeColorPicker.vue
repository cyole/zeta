<script setup lang="ts">
import type { PrimaryColor } from '~/composables/useTheme'

const { primaryColors, primaryColor, setPrimaryColor } = useTheme()

const items = computed(() => [
  primaryColors.map(color => ({
    label: color.label,
    active: primaryColor.value === color.value,
    onSelect: () => setPrimaryColor(color.value as PrimaryColor),
    slots: {
      leading: () => h('span', {
        class: `w-3 h-3 rounded-full ${color.class}`,
      }),
    },
  })),
])
</script>

<template>
  <UDropdownMenu :items="items">
    <UButton variant="ghost" color="neutral" icon="i-lucide-palette" />
  </UDropdownMenu>
</template>
