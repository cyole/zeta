<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const config = useRuntimeConfig()
const { register } = useAuth()
const toast = useToast()

const loading = ref(false)

const schema = z.object({
  name: z.string().min(1, '请输入姓名'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少需要 8 个字符'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// Password strength
const passwordStrength = computed(() => {
  const pwd = form.password
  if (!pwd)
    return 0
  let score = 0
  if (pwd.length >= 8)
    score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd))
    score++
  if (/\d/.test(pwd))
    score++
  if (/[^a-z0-9]/i.test(pwd))
    score++
  return score
})

const strengthColors: Record<number, string> = {
  0: 'bg-slate-300',
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-green-500',
}

const strengthLabels: Record<number, string> = {
  0: '请输入密码',
  1: '弱',
  2: '一般',
  3: '较强',
  4: '强',
}

async function onSubmit() {
  loading.value = true
  try {
    await register({
      name: form.name,
      email: form.email,
      password: form.password,
    })
    toast.add({
      title: '注册成功',
      description: '请查收邮箱完成验证',
      color: 'success',
    })
    navigateTo('/auth/login')
  }
  catch {
    // 错误提示已由 useAuth 统一处理
  }
  finally {
    loading.value = false
  }
}

function registerWithGitHub() {
  window.location.href = `${config.public.apiBase}/oauth/github`
}

function registerWithDingTalk() {
  window.location.href = `${config.public.apiBase}/oauth/dingtalk`
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
        创建账号
      </h2>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        加入 Zeta，开启高效开发之旅
      </p>
    </div>

    <!-- Register form -->
    <UForm :state="form" :schema="schema" class="space-y-4" @submit="onSubmit">
      <UFormField name="name" label="姓名">
        <UInput
          v-model="form.name"
          placeholder="输入您的姓名"
          icon="i-lucide-user"
          size="lg"
          class="w-full"
        />
      </UFormField>

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

      <div class="grid grid-cols-2 gap-4">
        <UFormField name="password" label="密码">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="至少 8 个字符"
            icon="i-lucide-lock"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField name="confirmPassword" label="确认密码">
          <UInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="再次输入密码"
            icon="i-lucide-lock"
            size="lg"
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Password strength indicator -->
      <div v-if="form.password" class="space-y-2">
        <div class="flex items-center gap-1">
          <div
            v-for="i in 4"
            :key="i"
            class="h-1 flex-1 rounded-full transition-colors" :class="[
              i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-slate-200 dark:bg-slate-700',
            ]"
          />
        </div>
        <p class="text-xs" :class="(strengthColors[passwordStrength] || 'bg-slate-300').replace('bg-', 'text-')">
          密码强度：{{ strengthLabels[passwordStrength] }}
        </p>
      </div>

      <UButton type="submit" block size="lg" :loading="loading" class="mt-6">
        <UIcon name="i-lucide-user-plus" class="w-4 h-4 mr-2" />
        创建账号
      </UButton>
    </UForm>

    <!-- Divider -->
    <div class="relative my-8">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-slate-200 dark:border-slate-800" />
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-4 bg-slate-50 dark:bg-slate-950 text-slate-400">或使用以下方式</span>
      </div>
    </div>

    <!-- OAuth buttons -->
    <div class="grid grid-cols-2 gap-3">
      <UButton
        color="neutral"
        variant="outline"
        size="lg"
        class="hover:bg-slate-100 dark:hover:bg-slate-900"
        @click="registerWithGitHub"
      >
        <UIcon name="i-simple-icons-github" class="w-5 h-5 mr-2" />
        GitHub
      </UButton>
      <UButton
        color="neutral"
        variant="outline"
        size="lg"
        class="hover:bg-slate-100 dark:hover:bg-slate-900"
        @click="registerWithDingTalk"
      >
        <UIcon name="i-simple-icons-dingtalk" class="w-5 h-5 mr-2" />
        钉钉
      </UButton>
    </div>

    <!-- Login link -->
    <p class="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
      已有账号？
      <NuxtLink to="/auth/login" class="text-teal-500 hover:text-teal-600 font-medium">
        立即登录
      </NuxtLink>
    </p>
  </div>
</template>
