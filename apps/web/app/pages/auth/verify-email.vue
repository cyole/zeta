<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const route = useRoute()
const { post } = useApi()

const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    status.value = 'error'
    errorMessage.value = '验证链接无效，缺少验证令牌'
    return
  }

  try {
    await post('/auth/verify-email', { token }, { showError: false })
    status.value = 'success'
  }
  catch (error) {
    status.value = 'error'
    errorMessage.value = error instanceof Error ? error.message : '验证失败，请重试'
  }
})
</script>

<template>
  <div class="text-center">
    <!-- Loading -->
    <template v-if="status === 'loading'">
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </div>
      <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
        正在验证邮箱
      </h2>
      <p class="text-neutral-500 dark:text-neutral-400">
        请稍候...
      </p>
    </template>

    <!-- Success -->
    <template v-else-if="status === 'success'">
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <UIcon name="i-lucide-check-circle" class="w-8 h-8 text-green-500" />
        </div>
      </div>
      <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
        邮箱验证成功
      </h2>
      <p class="text-neutral-500 dark:text-neutral-400 mb-8">
        您的邮箱已验证，现在可以登录账号了
      </p>
      <UButton to="/auth/login" size="lg" icon="i-lucide-log-in">
        前往登录
      </UButton>
    </template>

    <!-- Error -->
    <template v-else>
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <UIcon name="i-lucide-x-circle" class="w-8 h-8 text-red-500" />
        </div>
      </div>
      <h2 class="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
        验证失败
      </h2>
      <p class="text-neutral-500 dark:text-neutral-400 mb-8">
        {{ errorMessage }}
      </p>
      <div class="space-y-3">
        <UButton to="/auth/login" size="lg" block icon="i-lucide-log-in">
          前往登录
        </UButton>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          如果链接已过期，请登录后重新发送验证邮件
        </p>
      </div>
    </template>
  </div>
</template>
