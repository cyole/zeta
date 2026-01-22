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
    description: '已分配角色数',
    icon: 'i-lucide-shield',
  },
  {
    title: '邮箱状态',
    value: user.value?.emailVerified ? '已验证' : '未验证',
    description: user.value?.emailVerified ? '邮箱已确认' : '请验证邮箱',
    icon: 'i-lucide-mail',
    variant: user.value?.emailVerified ? 'success' : 'warning',
  },
  {
    title: '账号状态',
    value: user.value?.status === 'ACTIVE' ? '正常' : '异常',
    description: '当前账号状态',
    icon: 'i-lucide-user-check',
    variant: user.value?.status === 'ACTIVE' ? 'success' : 'error',
  },
  {
    title: '管理员',
    value: isAdmin.value ? '是' : '否',
    description: isAdmin.value ? '拥有管理权限' : '普通用户',
    icon: 'i-lucide-crown',
  },
])

const quickActions = computed(() => {
  const actions = [
    { label: '个人设置', description: '管理账号信息', to: '/dashboard/profile', icon: 'i-lucide-settings' },
  ]

  if (isAdmin.value) {
    actions.push(
      { label: '用户管理', description: '管理用户账户', to: '/admin/users', icon: 'i-lucide-users' },
      { label: '角色管理', description: '管理角色权限', to: '/admin/roles', icon: 'i-lucide-shield' },
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
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
        控制台
      </h1>
      <p class="text-neutral-500">
        欢迎回来，{{ user?.name }}
      </p>
    </div>

    <!-- Email verification alert -->
    <UCard v-if="!user?.emailVerified" class="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
      <div class="flex items-start gap-4">
        <div class="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
          <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-amber-800 dark:text-amber-200">
            邮箱未验证
          </h3>
          <p class="text-sm text-amber-700 dark:text-amber-300 mt-1">
            请验证您的邮箱以获得完整功能访问
          </p>
          <UButton
            :loading="resending"
            size="sm"
            variant="outline"
            class="mt-3"
            @click="resendVerification"
          >
            重新发送验证邮件
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Stats cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <UCard v-for="stat in stats" :key="stat.title">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-neutral-500">
              {{ stat.title }}
            </p>
            <p class="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
              {{ stat.value }}
            </p>
            <p class="text-xs text-neutral-400 mt-1">
              {{ stat.description }}
            </p>
          </div>
          <div class="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <UIcon :name="stat.icon" class="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Main content grid -->
    <div class="grid gap-6 lg:grid-cols-7">
      <!-- Quick actions -->
      <UCard class="lg:col-span-4">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-neutral-900 dark:text-white">
              快速入口
            </h3>
          </div>
        </template>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.label"
            :to="action.to"
            class="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
          >
            <div class="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <UIcon :name="action.icon" class="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div>
              <p class="font-medium text-neutral-900 dark:text-white">
                {{ action.label }}
              </p>
              <p class="text-xs text-neutral-500">
                {{ action.description }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </UCard>

      <!-- Account info -->
      <UCard class="lg:col-span-3">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-neutral-900 dark:text-white">
              账号信息
            </h3>
            <UButton to="/dashboard/profile" variant="ghost" size="xs">
              编辑
            </UButton>
          </div>
        </template>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <UAvatar :src="user?.avatar || undefined" :alt="user?.name" size="lg" />
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-neutral-900 dark:text-white truncate">
                {{ user?.name }}
              </p>
              <p class="text-sm text-neutral-500 truncate">
                {{ user?.email }}
              </p>
            </div>
          </div>
          <div class="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <p class="text-sm text-neutral-500 mb-2">
              角色
            </p>
            <div class="flex gap-2 flex-wrap">
              <UBadge
                v-for="role in user?.roles"
                :key="role.name"
                color="neutral"
                variant="subtle"
              >
                {{ role.displayName }}
              </UBadge>
              <UBadge v-if="!user?.roles?.length" color="neutral" variant="subtle">
                暂无角色
              </UBadge>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
