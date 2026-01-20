<template>
  <div>
    <!-- Header -->
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">欢迎回来</h2>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        登录您的账号，继续高效开发
      </p>
    </div>

    <!-- Login form -->
    <UForm :state="form" :schema="schema" @submit="onSubmit" class="space-y-5">
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
          <a href="#" class="text-xs text-teal-500 hover:text-teal-600">忘记密码？</a>
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
        <UCheckbox v-model="rememberMe" id="remember" />
        <label for="remember" class="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
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
        @click="loginWithGitHub"
        class="hover:bg-slate-100 dark:hover:bg-slate-900"
      >
        <UIcon name="i-simple-icons-github" class="w-5 h-5 mr-2" />
        GitHub
      </UButton>
      <UButton
        color="neutral"
        variant="outline"
        size="lg"
        @click="loginWithDingTalk"
        class="hover:bg-slate-100 dark:hover:bg-slate-900"
      >
        <UIcon name="i-simple-icons-dingtalk" class="w-5 h-5 mr-2" />
        钉钉
      </UButton>
    </div>

    <!-- Register link -->
    <p class="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
      还没有账号？
      <NuxtLink to="/auth/register" class="text-teal-500 hover:text-teal-600 font-medium">
        立即注册
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
});

const config = useRuntimeConfig();
const { login } = useAuth();
const toast = useToast();
const route = useRoute();

const loading = ref(false);
const rememberMe = ref(false);

const schema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

const form = reactive({
  email: '',
  password: '',
});

const onSubmit = async () => {
  loading.value = true;
  try {
    await login(form);
    toast.add({
      title: '登录成功',
      description: '欢迎回来！',
      color: 'success',
    });
    const redirect = (route.query.redirect as string) || '/platform';
    navigateTo(redirect);
  } catch (error: any) {
    toast.add({
      title: '登录失败',
      description: error.message || '请检查邮箱和密码',
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
};

const loginWithGitHub = () => {
  window.location.href = `${config.public.apiBase}/oauth/github`;
};

const loginWithDingTalk = () => {
  window.location.href = `${config.public.apiBase}/oauth/dingtalk`;
};
</script>
