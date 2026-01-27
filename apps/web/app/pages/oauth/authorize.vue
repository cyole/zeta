<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['auth'],
})

const route = useRoute()
const { getAuthorizeInfo, authorize } = useApplication()
const { user } = useAuth()

interface AuthorizeApplication {
  id: string
  name: string
  logo?: string
  homepage?: string
}

// 查询参数
const clientId = ref((route.query.clientId as string) || '')
const redirectUri = ref((route.query.redirectUri as string) || '')
const responseType = ref((route.query.responseType as string) || 'code')
const state = ref((route.query.state as string) || '')

// 加载状态
const loading = ref(true)
const authorizing = ref(false)

// 应用信息
const application = ref<AuthorizeApplication | null>(null)

// 获取应用首页的 hostname
function getHostname(url?: string) {
  if (!url)
    return ''
  try {
    return new URL(url).hostname
  }
  catch {
    return url
  }
}
const error = ref<string | null>(null)

// 验证参数
if (!clientId.value || !redirectUri.value || responseType.value !== 'code') {
  error.value = '无效的授权请求参数'
}

// 获取应用信息
onMounted(async () => {
  if (error.value)
    return

  try {
    const data = await getAuthorizeInfo({
      clientId: clientId.value,
      redirectUri: redirectUri.value,
      responseType: responseType.value,
      state: state.value,
    })
    application.value = data.application
  }
  catch (e: any) {
    error.value = e.message || '获取应用信息失败'
  }
  finally {
    loading.value = false
  }
})

// 取消授权
function handleCancel() {
  const params = new URLSearchParams({
    error: 'access_denied',
  })
  if (state.value) {
    params.append('state', state.value)
  }
  window.location.href = `${redirectUri.value}?${params.toString()}`
}

// 确认授权
async function handleAuthorize() {
  if (!user.value)
    return

  authorizing.value = true
  try {
    const result = await authorize({
      clientId: clientId.value,
      redirectUri: redirectUri.value,
      state: state.value,
    })
    window.location.href = result.redirectUrl
  }
  catch (e: any) {
    error.value = e.message || '授权失败'
    authorizing.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md">
    <!-- Error State -->
    <div v-if="error" class="text-center">
      <div class="mb-6 flex justify-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <UIcon name="i-lucide-alert-circle" class="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
      </div>
      <h2 class="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">
        授权失败
      </h2>
      <p class="mb-6 text-neutral-600 dark:text-neutral-400">
        {{ error }}
      </p>
      <UButton to="/" variant="soft" block>
        返回首页
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="flex flex-col items-center py-12">
      <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-primary-600" />
      <p class="mt-4 text-neutral-600 dark:text-neutral-400">
        加载中...
      </p>
    </div>

    <!-- Authorization Form -->
    <div v-else-if="application" class="w-full">
      <!-- Application Info -->
      <div class="mb-8 text-center">
        <div class="mb-4 flex justify-center">
          <div
            class="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-400 shadow-lg"
          >
            <img
              v-if="application.logo"
              :src="application.logo"
              :alt="application.name"
              class="h-14 w-14 rounded-xl object-cover"
            >
            <UIcon v-else name="i-lucide-apps" class="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 class="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">
          授权登录
        </h2>
        <p class="text-neutral-600 dark:text-neutral-400">
          <span class="font-medium text-neutral-900 dark:text-white">{{ application.name }}</span>
          <span v-if="application.homepage" class="text-xs text-neutral-500">
            ({{ getHostname(application.homepage) }})
          </span>
          请求使用您的 Zeta 账号登录
        </p>
      </div>

      <!-- Permissions -->
      <div class="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
        <h3 class="mb-3 font-medium text-neutral-900 dark:text-white">
          该应用将获取以下信息：
        </h3>
        <ul class="space-y-2">
          <li class="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
            <UIcon name="i-lucide-check" class="h-4 w-4 text-primary-600" />
            <span class="text-sm">公开信息（昵称、头像）</span>
          </li>
        </ul>
      </div>

      <!-- Notice -->
      <div class="mb-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
        <UIcon name="i-lucide-info" class="mr-1 inline-block h-4 w-4 align-middle" />
        授权后，该应用将能够访问您的账号信息。您可以在"账号设置-已授权应用"中随时撤销授权。
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <UButton
          size="lg"
          color="primary"
          variant="solid"
          block
          :loading="authorizing"
          :disabled="authorizing"
          @click="handleAuthorize"
        >
          确认授权
        </UButton>
        <UButton
          size="lg"
          variant="ghost"
          block
          color="neutral"
          :disabled="authorizing"
          @click="handleCancel"
        >
          取消
        </UButton>
      </div>

      <!-- User Info -->
      <div class="mt-6 flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <img
          v-if="user?.avatar"
          :src="user.avatar"
          :alt="user.name"
          class="h-5 w-5 rounded-full"
        >
        <span v-if="user">{{ user.name }}</span>
        <span>·</span>
        <NuxtLink to="/logout" class="text-primary-600 hover:underline">
          切换账号
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
