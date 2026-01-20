<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const config = useRuntimeConfig()
const { user, fetchUser } = useAuth()
const api = useApi()
const toast = useToast()

const saving = ref(false)

const schema = z.object({
  name: z.string().min(1, '请输入姓名'),
})

const form = reactive({
  name: user.value?.name || '',
})

// Watch for user changes
watch(() => user.value?.name, (name) => {
  if (name)
    form.name = name
}, { immediate: true })

const hasGitHub = computed(() =>
  user.value?.oauthAccounts?.some((a: any) => a.provider === 'GITHUB'),
)

const hasDingTalk = computed(() =>
  user.value?.oauthAccounts?.some((a: any) => a.provider === 'DINGTALK'),
)

async function onSubmit() {
  saving.value = true
  try {
    await api.patch(`/users/${user.value?.id}`, { name: form.name })
    await fetchUser()
    toast.add({
      title: '保存成功',
      color: 'success',
    })
  }
  catch (error: any) {
    toast.add({
      title: '保存失败',
      description: error.message,
      color: 'error',
    })
  }
  finally {
    saving.value = false
  }
}

function linkGitHub() {
  window.location.href = `${config.public.apiBase}/oauth/github`
}

function linkDingTalk() {
  window.location.href = `${config.public.apiBase}/oauth/dingtalk`
}

function formatDate(date?: string | null) {
  if (!date)
    return '-'
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
        个人设置
      </h1>
      <p class="mt-1 text-neutral-500 dark:text-neutral-400">
        管理您的账号信息和偏好设置
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Profile card -->
      <UCard class="lg:col-span-2">
        <template #header>
          <h3 class="font-semibold">
            基本信息
          </h3>
        </template>

        <UForm :state="form" :schema="schema" class="space-y-6" @submit="onSubmit">
          <!-- Avatar -->
          <div class="flex items-center gap-4">
            <UAvatar :src="user?.avatar || undefined" :alt="user?.name" size="xl" />
            <div>
              <UButton variant="outline" size="sm" disabled>
                更换头像
              </UButton>
              <p class="mt-1 text-xs text-neutral-500">
                暂不支持上传
              </p>
            </div>
          </div>

          <UFormField name="name" label="姓名">
            <UInput v-model="form.name" placeholder="请输入姓名" size="lg" />
          </UFormField>

          <UFormField name="email" label="邮箱">
            <UInput :model-value="user?.email" disabled size="lg" />
            <template #hint>
              <span v-if="user?.emailVerified" class="text-green-600 dark:text-green-400">
                ✓ 已验证
              </span>
              <span v-else class="text-amber-600 dark:text-amber-400">
                未验证
              </span>
            </template>
          </UFormField>

          <UButton type="submit" :loading="saving">
            保存修改
          </UButton>
        </UForm>
      </UCard>

      <!-- Info cards -->
      <div class="space-y-6">
        <!-- Roles -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">
              我的角色
            </h3>
          </template>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="role in user?.roles"
              :key="role.name"
              color="primary"
              variant="subtle"
              size="lg"
            >
              {{ role.displayName }}
            </UBadge>
          </div>
        </UCard>

        <!-- OAuth accounts -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">
              关联账号
            </h3>
          </template>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-simple-icons-github" class="w-5 h-5" />
                <span>GitHub</span>
              </div>
              <UBadge v-if="hasGitHub" color="success" variant="subtle">
                已关联
              </UBadge>
              <UButton v-else size="xs" variant="outline" @click="linkGitHub">
                关联
              </UButton>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-simple-icons-dingtalk" class="w-5 h-5" />
                <span>钉钉</span>
              </div>
              <UBadge v-if="hasDingTalk" color="success" variant="subtle">
                已关联
              </UBadge>
              <UButton v-else size="xs" variant="outline" @click="linkDingTalk">
                关联
              </UButton>
            </div>
          </div>
        </UCard>

        <!-- Account info -->
        <UCard>
          <template #header>
            <h3 class="font-semibold">
              账号信息
            </h3>
          </template>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-neutral-500">
                账号状态
              </dt>
              <dd>
                <UBadge :color="user?.status === 'ACTIVE' ? 'success' : 'error'" variant="subtle">
                  {{ user?.status === 'ACTIVE' ? '正常' : '异常' }}
                </UBadge>
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-neutral-500">
                注册时间
              </dt>
              <dd>{{ formatDate(user?.createdAt) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-neutral-500">
                最后登录
              </dt>
              <dd>{{ formatDate(user?.lastLoginAt) }}</dd>
            </div>
          </dl>
        </UCard>
      </div>
    </div>
  </div>
</template>
