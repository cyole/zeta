<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { forgotPassword } = useAuth()
const toast = useToast()
const router = useRouter()

const loading = ref(false)
const submitted = ref(false)

const schema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
})

const form = reactive({
  email: '',
})

async function onSubmit() {
  loading.value = true
  try {
    await forgotPassword(form.email)
    submitted.value = true
    toast.add({
      title: '邮件已发送',
      description: '请查收您的邮箱，按照邮件中的说明重置密码',
      color: 'success',
    })
  }
  catch {
    // 错误提示已由 useAuth 统一处理
  }
  finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push('/auth/login')
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">
        忘记密码
      </h2>
      <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        输入您的邮箱地址，我们将发送重置密码的链接
      </p>
    </div>

    <!-- Success state -->
    <div v-if="submitted" class="text-center py-8">
      <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-lucide-mail-check" class="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
        邮件已发送
      </h3>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        我们已向 <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ form.email }}</span> 发送了密码重置邮件
      </p>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        请查收邮箱并按照邮件中的说明重置密码
      </p>
      <div class="flex flex-col gap-3">
        <UButton variant="outline" size="lg" block icon="i-lucide-rotate-cw" @click="onSubmit">
          重新发送
        </UButton>
        <UButton color="neutral" variant="ghost" size="lg" block @click="goToLogin">
          返回登录
        </UButton>
      </div>
    </div>

    <!-- Form -->
    <UForm v-else :state="form" :schema="schema" class="space-y-5" @submit="onSubmit">
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

      <UButton type="submit" block size="lg" :loading="loading" class="mt-6" icon="i-lucide-send">
        发送重置邮件
      </UButton>
    </UForm>

    <!-- Back to login link -->
    <p v-if="!submitted" class="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-8">
      记起密码了？
      <NuxtLink to="/auth/login" class="text-primary-500 hover:text-primary-600 font-medium">
        返回登录
      </NuxtLink>
    </p>
  </div>
</template>
