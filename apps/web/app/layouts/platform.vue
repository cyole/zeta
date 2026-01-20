<script setup lang="ts">
const { user, logout } = useAuth()
const router = useRouter()
const route = useRoute()
const colorMode = useColorMode()

// Color mode
const isDark = computed(() => {
  if (colorMode.preference === 'system') {
    if (import.meta.client) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  }
  return colorMode.preference === 'dark'
})
function toggleColorMode() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

// Module navigation
const moduleNavItems = [
  { label: '设计转代码', icon: 'i-lucide-figma', to: '/platform/d2c' },
  { label: '编码助手', icon: 'i-lucide-code-2', to: '/platform/coding' },
  { label: '文档管理', icon: 'i-lucide-book-open', to: '/platform/docs' },
  { label: '接口协作', icon: 'i-lucide-plug', to: '/platform/api' },
  { label: '测试优化', icon: 'i-lucide-test-tube', to: '/platform/testing' },
  { label: '工程化', icon: 'i-lucide-settings-2', to: '/platform/engineering' },
]

// Sidebar state
const sidebarCollapsed = ref(false)
const showSidebar = computed(() => {
  // Show sidebar only on module sub-pages
  return route.path !== '/platform' && moduleNavItems.some(item => route.path.startsWith(item.to))
})

// Current module title
const currentModuleTitle = computed(() => {
  const currentModule = moduleNavItems.find(item => route.path.startsWith(item.to))
  return currentModule?.label || ''
})

// Check active module
function isActiveModule(path: string) {
  return route.path.startsWith(path)
}

// Check active sidebar item
function isActiveSidebarItem(path: string) {
  return route.path === path
}

// Sidebar items for each module
const moduleSidebarItems: Record<string, { label: string, icon: string, to: string }[]> = {
  '/platform/d2c': [
    { label: '设计稿转换', icon: 'i-lucide-wand-2', to: '/platform/d2c' },
    { label: '组件识别', icon: 'i-lucide-scan', to: '/platform/d2c/components' },
    { label: '转换记录', icon: 'i-lucide-history', to: '/platform/d2c/history' },
    { label: '设置', icon: 'i-lucide-settings', to: '/platform/d2c/settings' },
  ],
  '/platform/coding': [
    { label: '对话', icon: 'i-lucide-message-square', to: '/platform/coding' },
    { label: '代码片段', icon: 'i-lucide-code', to: '/platform/coding/snippets' },
    { label: '历史记录', icon: 'i-lucide-history', to: '/platform/coding/history' },
    { label: '收藏', icon: 'i-lucide-star', to: '/platform/coding/favorites' },
  ],
  '/platform/docs': [
    { label: '文档检索', icon: 'i-lucide-search', to: '/platform/docs' },
    { label: '组件文档', icon: 'i-lucide-component', to: '/platform/docs/components' },
    { label: '接口文档', icon: 'i-lucide-plug', to: '/platform/docs/api' },
    { label: '上传管理', icon: 'i-lucide-upload', to: '/platform/docs/upload' },
  ],
  '/platform/api': [
    { label: '接口管理', icon: 'i-lucide-folder', to: '/platform/api' },
    { label: 'Mock 数据', icon: 'i-lucide-database', to: '/platform/api/mock' },
    { label: '接口调试', icon: 'i-lucide-play', to: '/platform/api/debug' },
    { label: '设置', icon: 'i-lucide-settings', to: '/platform/api/settings' },
  ],
  '/platform/testing': [
    { label: '测试用例', icon: 'i-lucide-list-checks', to: '/platform/testing' },
    { label: '覆盖率', icon: 'i-lucide-pie-chart', to: '/platform/testing/coverage' },
    { label: '性能测试', icon: 'i-lucide-gauge', to: '/platform/testing/performance' },
    { label: '报告', icon: 'i-lucide-file-text', to: '/platform/testing/reports' },
  ],
  '/platform/engineering': [
    { label: '项目脚手架', icon: 'i-lucide-folder-plus', to: '/platform/engineering' },
    { label: '代码规范', icon: 'i-lucide-shield-check', to: '/platform/engineering/lint' },
    { label: 'CI/CD', icon: 'i-lucide-git-branch', to: '/platform/engineering/cicd' },
    { label: '依赖管理', icon: 'i-lucide-package', to: '/platform/engineering/deps' },
  ],
}

// Current sidebar items based on route
const currentSidebarItems = computed(() => {
  const moduleKey = Object.keys(moduleSidebarItems).find(key => route.path.startsWith(key))
  return moduleKey ? moduleSidebarItems[moduleKey] : []
})

// User menu
const userMenuItems = computed(() => [
  [
    {
      label: '个人设置',
      icon: 'i-lucide-user',
      click: () => router.push('/dashboard/profile'),
    },
    {
      label: '系统管理',
      icon: 'i-lucide-settings',
      click: () => router.push('/dashboard'),
    },
  ],
  [
    {
      label: '退出登录',
      icon: 'i-lucide-log-out',
      click: () => logout(),
    },
  ],
])

// Provide sidebar state to child components
provide('sidebarCollapsed', sidebarCollapsed)
</script>

<template>
  <div class="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
    <!-- Top Navigation -->
    <header class="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 shrink-0 z-50">
      <!-- Logo -->
      <NuxtLink to="/platform" class="flex items-center gap-2.5 mr-8">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <UIcon name="i-lucide-zap" class="w-4 h-4 text-white" />
        </div>
        <span class="font-bold text-slate-900 dark:text-white">Zeta</span>
      </NuxtLink>

      <!-- Module Navigation -->
      <nav class="flex items-center gap-1 flex-1">
        <NuxtLink
          v-for="item in moduleNavItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all" :class="[
            isActiveModule(item.to)
              ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800',
          ]"
        >
          <UIcon :name="item.icon" class="w-4 h-4" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Right Actions -->
      <div class="flex items-center gap-3">
        <!-- Search -->
        <UButton
          icon="i-lucide-search"
          color="neutral"
          variant="ghost"
          size="sm"
          class="hidden sm:flex"
        />

        <!-- Notifications -->
        <div class="relative">
          <UButton icon="i-lucide-bell" color="neutral" variant="ghost" size="sm" />
          <span class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </div>

        <!-- Dark mode toggle -->
        <UButton
          :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="toggleColorMode"
        />

        <!-- User dropdown -->
        <UDropdownMenu :items="userMenuItems">
          <button class="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-2 py-1.5 transition-colors">
            <UAvatar :src="user?.avatar || undefined" :alt="user?.name" size="sm" />
            <span class="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200">{{ user?.name }}</span>
            <UIcon name="i-lucide-chevron-down" class="w-4 h-4 text-slate-400" />
          </button>
        </UDropdownMenu>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar (optional, controlled by page) -->
      <aside
        v-if="showSidebar"
        class="shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 overflow-y-auto" :class="[
          sidebarCollapsed ? 'w-16' : 'w-60',
        ]"
      >
        <!-- Sidebar Header -->
        <div class="sticky top-0 bg-white dark:bg-slate-900 z-10 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between">
            <span v-if="!sidebarCollapsed" class="text-sm font-semibold text-slate-900 dark:text-white">
              {{ currentModuleTitle }}
            </span>
            <UButton
              :icon="sidebarCollapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="sidebarCollapsed = !sidebarCollapsed"
            />
          </div>
        </div>

        <!-- Sidebar Navigation -->
        <nav class="p-2">
          <div class="space-y-1">
            <NuxtLink
              v-for="item in currentSidebarItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors" :class="[
                isActiveSidebarItem(item.to)
                  ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
              ]"
            >
              <UIcon :name="item.icon" class="w-4 h-4" />
              <span v-if="!sidebarCollapsed">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </nav>
      </aside>

      <!-- Page Content -->
      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
