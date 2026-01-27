<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
})

const router = useRouter()

onMounted(() => {
  router.push('/dashboard/applications')
})
</script>

<template>
  <div />
</template>
