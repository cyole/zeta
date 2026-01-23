<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const { setTokens, fetchUser } = useAuth()
const { post } = useApi()
const toast = useToast()

const provider = route.params.provider as string
const providerNames: Record<string, string> = {
  github: 'GitHub',
  dingtalk: '钉钉',
}
const providerName = providerNames[provider] || provider

const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  // GitHub uses 'code', DingTalk uses 'authCode'
  const code = (route.query.code || route.query.authCode) as string
  const errorMsg = route.query.error as string

  if (errorMsg) {
    error.value = decodeURIComponent(errorMsg)
    loading.value = false
    return
  }

  if (!code) {
    error.value = '未收到授权码'
    loading.value = false
    return
  }

  try {
    const result = await post<{ accessToken: string, refreshToken: string }>(`/oauth/${provider}/login`, { code })
    setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken })
    await fetchUser()
    toast.add({
      title: '登录成功',
      description: '欢迎回来！',
      color: 'success',
    })
    navigateTo('/dashboard')
  }
  catch (e: any) {
    error.value = e.data?.message || e.message || `${providerName}登录失败`
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[400px]">
    <div v-if="loading" class="text-center">
      <UIcon name="i-lucide-loader-2" class="w-12 h-12 animate-spin text-indigo-500" />
      <p class="mt-4 text-neutral-600 dark:text-neutral-400">
        正在处理 {{ providerName }} 登录...
      </p>
    </div>

    <div v-else-if="error" class="text-center">
      <UIcon name="i-lucide-x-circle" class="w-12 h-12 text-red-500" />
      <p class="mt-4 text-red-600 dark:text-red-400">
        {{ error }}
      </p>
      <UButton to="/auth/login" class="mt-4">
        返回登录
      </UButton>
    </div>
  </div>
</template>
