<script setup lang="ts">
const { user, logout } = useAuth()
const { isAdmin } = usePermissions()
const router = useRouter()
const route = useRoute()

const sidebarCollapsed = ref(false)
const sidebarHovered = ref(false)

// Effective sidebar state (collapsed but expanded on hover)
const isExpanded = computed(() => !sidebarCollapsed.value || sidebarHovered.value)

// Navigation items
const generalNavItems = [
  { label: '仪表盘', icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
  { label: '应用管理', icon: 'i-lucide-layout-grid', to: '/dashboard/applications' },
]

const adminNavItems = [
  { label: '用户管理', icon: 'i-lucide-users', to: '/admin/users' },
  { label: '角色管理', icon: 'i-lucide-shield', to: '/admin/roles' },
]

const settingsNavItems = [
  { label: '个人设置', icon: 'i-lucide-settings', to: '/dashboard/profile' },
]

// Check active route
function isActiveRoute(path: string) {
  if (path === '/dashboard') {
    return route.path === '/dashboard'
  }
  return route.path === path || route.path.startsWith(`${path}/`)
}

// User menu items
const userMenuItems = computed(() => [
  [
    {
      label: '个人设置',
      icon: 'i-lucide-user',
      onSelect: () => router.push('/dashboard/profile'),
    },
  ],
  [
    {
      label: '退出登录',
      icon: 'i-lucide-log-out',
      onSelect: () => logout(),
    },
  ],
])
</script>

<template>
  <div class="flex h-screen bg-neutral-50 dark:bg-neutral-950">
    <!-- Sidebar -->
    <aside
      class="sidebar-wrapper flex flex-col transition-all duration-300 overflow-hidden"
      :class="[sidebarCollapsed && !sidebarHovered ? 'w-[68px]' : 'w-[240px]']"
      @mouseenter="sidebarHovered = true"
      @mouseleave="sidebarHovered = false"
    >
      <!-- Logo & Back to Platform -->
      <div class="flex flex-col border-b border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center gap-3 h-14 px-4">
          <div class="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-zap" class="w-4 h-4 text-white dark:text-neutral-900" />
          </div>
          <Transition name="fade">
            <div v-if="isExpanded" class="flex flex-col overflow-hidden">
              <span class="font-semibold text-neutral-900 dark:text-white truncate">Zeta</span>
              <span class="text-xs text-neutral-500 truncate">管理后台</span>
            </div>
          </Transition>
        </div>
        <!-- Back to Platform Button -->
        <NuxtLink
          to="/workspace"
          class="flex items-center gap-3 m-3 px-3 py-2.5 rounded-lg bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-950 transition-colors"
        >
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4 shrink-0" />
          <Transition name="fade">
            <span v-if="isExpanded" class="text-sm font-medium truncate">返回工作台</span>
          </Transition>
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-3 py-4">
        <!-- General -->
        <div class="mb-6">
          <div v-if="isExpanded" class="sidebar-section-label">
            通用
          </div>
          <div class="space-y-1">
            <NuxtLink
              v-for="item in generalNavItems"
              :key="item.to"
              :to="item.to"
              class="sidebar-nav-item"
              :class="[{ active: isActiveRoute(item.to) }]"
              :title="item.label"
            >
              <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
              <Transition name="fade">
                <span v-if="isExpanded" class="truncate">{{ item.label }}</span>
              </Transition>
            </NuxtLink>
          </div>
        </div>

        <!-- Admin section -->
        <div v-if="isAdmin" class="mb-6">
          <div v-if="isExpanded" class="sidebar-section-label">
            管理
          </div>
          <div v-else class="my-2 border-t border-neutral-200 dark:border-neutral-800" />
          <div class="space-y-1">
            <NuxtLink
              v-for="item in adminNavItems"
              :key="item.to"
              :to="item.to"
              class="sidebar-nav-item"
              :class="[{ active: isActiveRoute(item.to) }]"
              :title="item.label"
            >
              <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
              <Transition name="fade">
                <span v-if="isExpanded" class="truncate">{{ item.label }}</span>
              </Transition>
            </NuxtLink>
          </div>
        </div>

        <!-- Settings -->
        <div class="mb-6">
          <div v-if="isExpanded" class="sidebar-section-label">
            设置
          </div>
          <div v-else class="my-2 border-t border-neutral-200 dark:border-neutral-800" />
          <div class="space-y-1">
            <NuxtLink
              v-for="item in settingsNavItems"
              :key="item.to"
              :to="item.to"
              class="sidebar-nav-item"
              :class="[{ active: isActiveRoute(item.to) }]"
              :title="item.label"
            >
              <UIcon :name="item.icon" class="w-5 h-5 shrink-0" />
              <Transition name="fade">
                <span v-if="isExpanded" class="truncate">{{ item.label }}</span>
              </Transition>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <!-- Footer with user info -->
      <div class="border-t border-neutral-200 dark:border-neutral-800 p-3">
        <UDropdownMenu :items="userMenuItems" :content="{ align: 'start', side: 'top' }">
          <button
            class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
          >
            <UAvatar :src="user?.avatar || undefined" :alt="user?.name" class="shrink-0" />
            <Transition name="fade">
              <div v-if="isExpanded" class="flex-1 overflow-hidden">
                <p class="text-sm font-medium text-neutral-900 dark:text-white truncate">
                  {{ user?.name }}
                </p>
                <p class="text-xs text-neutral-500 truncate">
                  {{ user?.email }}
                </p>
              </div>
            </Transition>
            <Transition name="fade">
              <UIcon v-if="isExpanded" name="i-lucide-chevrons-up-down" class="w-4 h-4 text-neutral-400 shrink-0" />
            </Transition>
          </button>
        </UDropdownMenu>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top navbar -->
      <header class="h-14 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 shrink-0">
        <div class="flex items-center gap-3">
          <!-- Sidebar toggle -->
          <button
            class="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            @click="sidebarCollapsed = !sidebarCollapsed"
          >
            <UIcon :name="sidebarCollapsed ? 'i-lucide-panel-left' : 'i-lucide-panel-left-close'" class="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>

          <div class="h-5 w-px bg-neutral-200 dark:bg-neutral-700" />

          <!-- Search (placeholder) -->
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-500 bg-neutral-100 dark:bg-neutral-800 rounded-md">
            <UIcon name="i-lucide-search" class="w-4 h-4" />
            <span>搜索...</span>
            <kbd class="ml-4 px-1.5 py-0.5 text-xs bg-white dark:bg-neutral-700 rounded border border-neutral-200 dark:border-neutral-600">⌘K</kbd>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Notifications -->
          <div class="relative">
            <UButton icon="i-lucide-bell" color="neutral" variant="ghost" />
            <span class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </div>

          <!-- Theme panel -->
          <ThemePanel />

          <UColorModeButton />

          <div class="h-5 w-px bg-neutral-200 dark:bg-neutral-700" />

          <!-- User dropdown (compact) -->
          <UDropdownMenu :items="userMenuItems" :content="{ align: 'end' }">
            <button class="flex items-center gap-2 p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <UAvatar :src="user?.avatar || undefined" :alt="user?.name" size="xs" />
              <span class="hidden sm:block text-sm font-medium text-neutral-700 dark:text-neutral-300">{{ user?.name }}</span>
              <UIcon name="i-lucide-chevron-down" class="w-4 h-4 text-neutral-400" />
            </button>
          </UDropdownMenu>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-auto p-6 bg-neutral-50 dark:bg-neutral-950">
        <slot />
      </main>
    </div>
  </div>
</template>
