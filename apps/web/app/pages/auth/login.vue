<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { login } = useAuth()
const toast = useToast()
const route = useRoute()

const loading = ref(false)
const rememberMe = ref(true)

const schema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

const form = reactive({
  email: '',
  password: '',
})

// 页面加载时恢复保存的邮箱和记住登录状态选项
onMounted(() => {
  const savedEmail = localStorage.getItem('login_email')
  if (savedEmail) {
    form.email = savedEmail
  }
  const savedRememberMe = localStorage.getItem('login_remember_me')
  rememberMe.value = savedRememberMe !== 'false'
})

async function onSubmit() {
  loading.value = true
  try {
    await login(form, rememberMe.value)

    // 保存邮箱以便下次自动填充
    localStorage.setItem('login_email', form.email)
    localStorage.setItem('login_remember_me', String(rememberMe.value))

    toast.add({
      title: '登录成功',
      description: '欢迎回来！',
      color: 'success',
    })
    const redirect = (route.query.redirect as string) || '/workspace'
    navigateTo(redirect)
  }
  catch {
    // 错误提示已由 useAuth 统一处理
  }
  finally {
    loading.value = false
  }
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
        <UInput
          v-model="form.password"
          type="password"
          placeholder="输入您的密码"
          icon="i-lucide-lock"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <UCheckbox id="remember" v-model="rememberMe" />
          <label for="remember" class="text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer">
            记住登录状态
          </label>
        </div>
        <NuxtLink to="/auth/forgot-password" class="text-sm text-primary-500 hover:text-primary-600">
          忘记密码？
        </NuxtLink>
      </div>

      <UButton type="submit" block size="lg" :loading="loading" class="mt-6" icon="i-lucide-log-in">
        登录
      </UButton>
    </UForm>

    <AuthOAuthButtons />

    <!-- Register link -->
    <p class="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-8">
      还没有账号？
      <NuxtLink to="/auth/register" class="text-primary-500 hover:text-primary-600 font-medium">
        立即注册
      </NuxtLink>
    </p>
  </div>
</template>
