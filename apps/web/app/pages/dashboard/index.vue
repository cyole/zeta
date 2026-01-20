<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { user } = useAuth()
const { isAdmin } = usePermissions()
const api = useApi()
const toast = useToast()

const resending = ref(false)

const stats = computed(() => [
  {
    title: '我的角色',
    value: user.value?.roles?.length || 0,
    icon: 'i-lucide-shield',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    title: '邮箱状态',
    value: user.value?.emailVerified ? '已验证' : '未验证',
    icon: 'i-lucide-mail',
    bgColor: user.value?.emailVerified ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: user.value?.emailVerified ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400',
  },
  {
    title: '账号状态',
    value: user.value?.status === 'ACTIVE' ? '正常' : '异常',
    icon: 'i-lucide-user-check',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    title: '管理员',
    value: isAdmin.value ? '是' : '否',
    icon: 'i-lucide-crown',
    bgColor: isAdmin.value ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-neutral-100 dark:bg-neutral-900/30',
    iconColor: isAdmin.value ? 'text-purple-600 dark:text-purple-400' : 'text-neutral-500',
  },
])

const quickActions = computed(() => {
  const actions = [
    { label: '个人设置', to: '/dashboard/profile', icon: 'i-lucide-settings' },
  ]

  if (isAdmin.value) {
    actions.push(
      { label: '用户管理', to: '/admin/users', icon: 'i-lucide-users' },
      { label: '角色管理', to: '/admin/roles', icon: 'i-lucide-shield' },
    )
  }

  return actions
})

async function resendVerification() {
  resending.value = true
  try {
    await api.post('/auth/resend-verification')
    toast.add({
      title: '发送成功',
      description: '验证邮件已发送，请查收',
      color: 'success',
    })
  }
  catch (error: any) {
    toast.add({
      title: '发送失败',
      description: error.message,
      color: 'error',
    })
  }
  finally {
    resending.value = false
  }
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">
        控制台
      </h1>
      <p class="mt-1 text-neutral-500 dark:text-neutral-400">
        欢迎回来，{{ user?.name }}
      </p>
    </div>

    <!-- Stats cards -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <UCard v-for="stat in stats" :key="stat.title">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center" :class="[
              stat.bgColor,
            ]"
          >
            <UIcon :name="stat.icon" class="w-6 h-6" :class="[stat.iconColor]" />
          </div>
          <div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              {{ stat.title }}
            </p>
            <p class="text-2xl font-semibold text-neutral-900 dark:text-white">
              {{ stat.value }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Quick actions -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <UCard>
        <template #header>
          <h3 class="font-semibold">
            快速入口
          </h3>
        </template>
        <div class="space-y-2">
          <UButton
            v-for="action in quickActions"
            :key="action.label"
            :to="action.to"
            :icon="action.icon"
            color="neutral"
            variant="ghost"
            block
            class="justify-start"
          >
            {{ action.label }}
          </UButton>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-semibold">
            账号信息
          </h3>
        </template>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <UAvatar :src="user?.avatar || undefined" :alt="user?.name" size="lg" />
            <div>
              <p class="font-medium text-neutral-900 dark:text-white">
                {{ user?.name }}
              </p>
              <p class="text-sm text-neutral-500">
                {{ user?.email }}
              </p>
            </div>
          </div>
          <div class="flex gap-2 flex-wrap">
            <UBadge
              v-for="role in user?.roles"
              :key="role.name"
              color="primary"
              variant="subtle"
            >
              {{ role.displayName }}
            </UBadge>
          </div>
          <UButton to="/dashboard/profile" variant="outline" size="sm">
            编辑个人资料
          </UButton>
        </div>
      </UCard>

      <UCard v-if="!user?.emailVerified">
        <template #header>
          <h3 class="font-semibold text-amber-600">
            邮箱未验证
          </h3>
        </template>
        <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          请验证您的邮箱以获得完整功能访问
        </p>
        <UButton :loading="resending" size="sm" @click="resendVerification">
          重新发送验证邮件
        </UButton>
      </UCard>
    </div>
  </div>
</template>
