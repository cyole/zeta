<script setup lang="ts">
const colorMode = useColorMode()

const currentIcon = computed(() => {
  if (colorMode.preference === 'dark')
    return 'i-lucide-moon'
  if (colorMode.preference === 'light')
    return 'i-lucide-sun'
  return 'i-lucide-monitor'
})

const items = computed(() => [
  [
    {
      label: '浅色',
      icon: 'i-lucide-sun',
      active: colorMode.preference === 'light',
      onSelect: () => {
        colorMode.preference = 'light'
      },
    },
    {
      label: '深色',
      icon: 'i-lucide-moon',
      active: colorMode.preference === 'dark',
      onSelect: () => {
        colorMode.preference = 'dark'
      },
    },
    {
      label: '跟随系统',
      icon: 'i-lucide-monitor',
      active: colorMode.preference === 'system',
      onSelect: () => {
        colorMode.preference = 'system'
      },
    },
  ],
])
</script>

<template>
  <UDropdownMenu :items="items">
    <UButton variant="ghost" color="neutral" :icon="currentIcon" />
  </UDropdownMenu>
</template>
