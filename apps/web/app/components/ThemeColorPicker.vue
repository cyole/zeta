<script setup lang="ts">
const { themeColors, primaryColor, setPrimaryColor, initTheme } = useTheme()

// Initialize theme on mount
onMounted(() => {
  initTheme()
})

const items = computed(() => [
  themeColors.map(color => ({
    label: color.label,
    active: primaryColor.value === color.value,
    onSelect: () => setPrimaryColor(color.value),
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
