<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { login } = useAuth()
const { get } = useApi()
const toast = useToast()
const route = useRoute()

const loading = ref(false)
const rememberMe = ref(false)

const schema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

const form = reactive({
  email: '',
  password: '',
})

async function onSubmit() {
  loading.value = true
  try {
    await login(form)
    toast.add({
      title: '登录成功',
      description: '欢迎回来！',
      color: 'success',
    })
    const redirect = (route.query.redirect as string) || '/platform'
    navigateTo(redirect)
  }
  catch {
    // 错误提示已由 useAuth 统一处理
  }
  finally {
    loading.value = false
  }
}

async function loginWithGitHub() {
  const oauthConfig = await get<{ clientId: string, redirectUri: string, scope: string, authUrl: string }>('/oauth/github/config')
  const state = crypto.randomUUID()
  const params = new URLSearchParams({
    client_id: oauthConfig.clientId,
    redirect_uri: oauthConfig.redirectUri,
    scope: oauthConfig.scope,
    state,
  })
  window.location.href = `${oauthConfig.authUrl}?${params.toString()}`
}

async function loginWithDingTalk() {
  const oauthConfig = await get<{ clientId: string, redirectUri: string, scope: string, authUrl: string }>('/oauth/dingtalk/config')
  const state = crypto.randomUUID()
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: oauthConfig.clientId,
    redirect_uri: oauthConfig.redirectUri,
    scope: oauthConfig.scope,
    state,
    prompt: 'consent',
  })
  window.location.href = `${oauthConfig.authUrl}?${params.toString()}`
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">
        欢迎回来
      </h2>
      <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        登录您的账号，继续高效开发
      </p>
    </div>

    <!-- Login form -->
    <UForm :state="form" :schema="schema" class="space-y-5" @submit="onSubmit">
      <UFormField name="email" label="邮箱地址">
        <UInput
          v-model="form.email"
          type="email"
          placeholder="name@company.com"
          icon="i-lucide-mail"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UFormField name="password" label="密码">
        <template #hint>
          <a href="#" class="text-xs text-primary-500 hover:text-primary-600">忘记密码？</a>
        </template>
        <UInput
          v-model="form.password"
          type="password"
          placeholder="输入您的密码"
          icon="i-lucide-lock"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <!-- Remember me -->
      <div class="flex items-center gap-2">
        <UCheckbox id="remember" v-model="rememberMe" />
        <label for="remember" class="text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer">
          记住登录状态
        </label>
      </div>

      <UButton type="submit" block size="lg" :loading="loading" class="mt-6">
        <UIcon name="i-lucide-log-in" class="w-4 h-4 mr-2" />
        登录
      </UButton>
    </UForm>

    <!-- Divider -->
    <div class="relative my-8">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-neutral-200 dark:border-neutral-800" />
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-4 bg-neutral-50 dark:bg-neutral-950 text-neutral-400">或使用以下方式</span>
      </div>
    </div>

    <!-- OAuth buttons -->
    <div class="grid grid-cols-2 gap-3">
      <UButton
        color="neutral"
        variant="outline"
        size="lg"
        class="hover:bg-neutral-100 dark:hover:bg-neutral-900"
        @click="loginWithGitHub"
      >
        <UIcon name="i-simple-icons-github" class="w-5 h-5 mr-2" />
        GitHub
      </UButton>
      <UButton
        color="neutral"
        variant="outline"
        size="lg"
        class="hover:bg-neutral-100 dark:hover:bg-neutral-900"
        @click="loginWithDingTalk"
      >
        <UIcon name="i-simple-icons-dingtalk" class="w-5 h-5 mr-2" />
        钉钉
      </UButton>
    </div>

    <!-- Register link -->
    <p class="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-8">
      还没有账号？
      <NuxtLink to="/auth/register" class="text-primary-500 hover:text-primary-600 font-medium">
        立即注册
      </NuxtLink>
    </p>
  </div>
</template>
