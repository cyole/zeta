<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { resetPassword } = useAuth()
const toast = useToast()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const isValidToken = ref(true)

const schema = z.object({
  password: z.string().min(6, '密码至少需要 6 个字符'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

const form = reactive({
  token: (route.query.token as string) || '',
  password: '',
  confirmPassword: '',
})

// 检查是否有token
if (!form.token) {
  isValidToken.value = false
}

// Password strength
const passwordStrength = computed(() => {
  const pwd = form.password
  if (!pwd)
    return 0
  let score = 0
  if (pwd.length >= 6)
    score++
  if (pwd.length >= 10)
    score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd))
    score++
  if (/\d/.test(pwd))
    score++
  if (/[^a-z0-9]/i.test(pwd))
    score++
  return Math.min(score, 4)
})

const strengthColors: Record<number, string> = {
  0: 'bg-neutral-300',
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
  if (!form.token) {
    toast.add({
      title: '无效的链接',
      description: '请重新请求密码重置邮件',
      color: 'error',
    })
    return
  }

  loading.value = true
  try {
    await resetPassword(form.token, form.password)
    toast.add({
      title: '密码重置成功',
      description: '请使用新密码登录',
      color: 'success',
    })
    router.push('/auth/login')
  }
  catch {
    // 错误提示已由 useAuth 统一处理
  }
  finally {
    loading.value = false
  }
}

function goToForgotPassword() {
  router.push('/auth/forgot-password')
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">
        重置密码
      </h2>
      <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        请输入您的新密码
      </p>
    </div>

    <!-- Invalid token state -->
    <div v-if="!isValidToken" class="text-center py-8">
      <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-lucide-link-2-off" class="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
        链接无效
      </h3>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        密码重置链接无效或已过期，请重新获取
      </p>
      <UButton color="primary" size="lg" block @click="goToForgotPassword">
        重新发送重置邮件
      </UButton>
    </div>

    <!-- Form -->
    <UForm v-else :state="form" :schema="schema" class="space-y-5" @submit="onSubmit">
      <UFormField name="password" label="新密码">
        <UInput
          v-model="form.password"
          type="password"
          placeholder="至少 6 个字符"
          icon="i-lucide-lock"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <!-- Password strength indicator -->
      <div v-if="form.password" class="space-y-2">
        <div class="flex items-center gap-1">
          <div
            v-for="i in 4"
            :key="i"
            class="h-1 flex-1 rounded-full transition-colors"
            :class="[
              i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-neutral-200 dark:bg-neutral-700',
            ]"
          />
        </div>
        <p class="text-xs" :class="(strengthColors[passwordStrength] || 'bg-neutral-300').replace('bg-', 'text-')">
          密码强度：{{ strengthLabels[passwordStrength] }}
        </p>
      </div>

      <UFormField name="confirmPassword" label="确认新密码">
        <UInput
          v-model="form.confirmPassword"
          type="password"
          placeholder="再次输入新密码"
          icon="i-lucide-lock"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UButton type="submit" block size="lg" :loading="loading" class="mt-6">
        <UIcon name="i-lucide-check" class="w-4 h-4 mr-2" />
        重置密码
      </UButton>
    </UForm>

    <!-- Back to login link -->
    <p v-if="isValidToken" class="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-8">
      记起密码了？
      <NuxtLink to="/auth/login" class="text-primary-500 hover:text-primary-600 font-medium">
        返回登录
      </NuxtLink>
    </p>
  </div>
</template>
